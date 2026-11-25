/** The rollout of this repository's data and Workers, one step at a time: create the shared D1 databases, put their ids in the configs,
 *  apply the migrations, import the dump, upload the raw exports to R2, deploy `catalog` (then its secrets) and `scheduler`, backfill the
 *  listens, audit. Every step first checks whether it is done already and skips if so, so the whole thing can be run again from the top,
 *  or from where it stopped (`--from <step>`). A step that writes to Cloudflare says what it will run and asks first (y/N), unless `--yes`.
 *
 *  D1's free plan writes 100,000 rows a day for the whole account. `quota` reads today's (UTC) count; `import` runs only while there is
 *  room under import-dump's `--max-day` (85,000), `backfill` only with what is left of the 100,000 less a margin of 5,000; a step without
 *  room is skipped and named at the end, to run again after 00:00 UTC.
 *
 *  `catalog` is deployed before its secrets are put: `wrangler secret put` on a Worker that doesn't exist creates an empty draft Worker
 *  instead, and nothing calls `catalog` until `scheduler` (deployed last, as its service binding needs `catalog`) is.
 *
 *  Secrets are never printed: HARDCOVER_TOKEN is read from monorepo/secrets/books-sync.env and GITHUB_TOKEN from the environment or a hidden
 *  prompt, and both go to wrangler on its stdin.
 *
 *  node scripts/rollout.ts [--list] [--from <step> | --only <step>[,<step>…]] [--dry-run] [--yes] [--force] */

import { execFileSync, spawn } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { parseEnvFile } from "@lmfaole/worker/env"

import { parseJsonc, readConfig, type Binding } from "./cf-audit.ts"
import { rowsWrittenToday } from "./import-dump.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ACCOUNT = "5d49b98b68b70cbd1c81be0f18501262"
export const DAILY_LIMIT = 100_000
/** import-dump.ts's own default `--max-day`: it stops there by itself. */
export const MAX_DAY = 85_000
/** What backfill leaves for the crons. */
export const MARGIN = 5_000
/** backfill.ts's own default `--max`. */
export const BACKFILL_CAP = 80_000
/** Migrations only create tables; this is plenty. */
const MIGRATE_ROOM = 1_000
const SHARED_DBS = ["library", "site"]
const ACTIVITY_DBS = ["music", "gameplay", "watching"]
const ACTIVITY = join(ROOT, "workers/activity")
const CATALOG = join(ROOT, "workers/catalog")
const SCHEDULER = join(ROOT, "workers/scheduler")
const R2_DIR = join(ROOT, "scripts/.import-dump/r2")
const BUCKET = "listens-archive"
const BOOKS_ENV = resolve(ROOT, "../monorepo/secrets/books-sync.env")
const CATALOG_SECRETS = ["HARDCOVER_TOKEN", "GITHUB_TOKEN"]

// ---------------------------------------------------------------------------------------------------------------- pure helpers

/** A config's placeholder ids, `"<name>-not-created-yet"`, by name. */
const PLACEHOLDER = /"([A-Za-z0-9_-]+)-not-created-yet"/g

export const placeholders = (text: string): string[] => [...new Set([...text.matchAll(PLACEHOLDER)].map((m) => m[1]!))]

/** `text` with every placeholder whose name has an id replaced by that id; `left` are those without one. */
export function fillIds(text: string, ids: Record<string, string>): { text: string; filled: string[]; left: string[] } {
  const filled = new Set<string>()
  const left = new Set<string>()
  const out = text.replace(PLACEHOLDER, (whole, name: string) => {
    const id = ids[name]
    if (!id) {
      left.add(name)
      return whole
    }
    filled.add(name)
    return JSON.stringify(id)
  })
  return { text: out, filled: [...filled], left: [...left] }
}

export interface Quota {
  used: number
  /** Of the account's 100,000. */
  remaining: number
  /** What import-dump may still write today under its `--max-day`. */
  importRoom: number
  /** The `--max` to give backfill: what remains less the margin, at most backfill's own cap. */
  backfillMax: number
}

export function quota(used: number, limit = DAILY_LIMIT, maxDay = MAX_DAY, margin = MARGIN, cap = BACKFILL_CAP): Quota {
  const remaining = Math.max(0, limit - used)
  return { used, remaining, importRoom: Math.max(0, maxDay - used), backfillMax: Math.max(0, Math.min(cap, remaining - margin)) }
}

/** The days (today first) an import of `need` billed rows takes at `maxDay` a day, today having `used` already (less the crons). */
export const importDays = (need: number, used: number, maxDay = MAX_DAY): number => {
  if (need <= 0) return 0
  const today = Math.max(0, maxDay - used)
  return need <= today ? 1 : (today > 0 ? 1 : 0) + Math.ceil((need - today) / maxDay)
}

/** The steps to run: all, those from `from` on, or the `only` ones (in the steps' own order). */
export function selectSteps(names: readonly string[], o: { from?: string | undefined; only?: string | undefined }): string[] {
  if (o.from && o.only) throw new Error("--from and --only don't go together")
  const known = (name: string): string => {
    if (!names.includes(name)) throw new Error(`no step "${name}"; the steps are ${names.join(", ")}`)
    return name
  }
  if (o.from) return names.slice(names.indexOf(known(o.from)))
  if (o.only) {
    const wanted = new Set(o.only.split(",").map((s) => known(s.trim())))
    return names.filter((n) => wanted.has(n))
  }
  return [...names]
}

/** The names in `wrangler d1 migrations list`'s table of migrations still to apply. */
export const pendingMigrations = (output: string): string[] => [...output.matchAll(/│\s*(\S+\.sql)\s*│/g)].map((m) => m[1]!)

export interface Estimate {
  /** Rows billed, all databases. */
  all: number
  byDb: Record<string, number>
  /** Listens past the worker's cursor, left for a later run. */
  later: number
}

const count = (s: string): number => Number(s.replaceAll(",", ""))

/** The numbers in `import-dump.ts --dry-run`'s output. */
export function importEstimate(output: string): Estimate {
  const all = output.match(/^\s*all\s+([\d,]+) rows billed/m)
  if (!all) throw new Error("no estimate in import-dump's output")
  const byDb: Record<string, number> = {}
  for (const m of output.matchAll(/^ {2}(\w+)\s+[\d,]+ rows,\s+([\d,]+) rows billed/gm)) byDb[m[1]!] = count(m[2]!)
  let later = 0
  for (const m of output.matchAll(/^\w+\/\w+\s+[\d,]+\s+[\d,]+\s+[\d,]+\s+[\d,]+\s+([\d,]+)\s+[\d,]+\s+[\d,]+\s*$/gm)) later += count(m[1]!)
  return { all: count(all[1]!), byDb, later }
}

/** The account's rows written today as import-dump last reported them (`…, N today`). */
export const reportedToday = (output: string): number | undefined => {
  const last = [...output.matchAll(/([\d,]+) today/g)].at(-1)
  return last ? count(last[1]!) : undefined
}

/** KEY=value lines (`export`, quotes and comments allowed), as every script reads them (`@lmfaole/worker/env`). */
export const parseEnv = (text: string): Record<string, string> => Object.fromEntries(parseEnvFile(text))

export interface Obj {
  key: string
  size: number
}

/** The local files that R2 doesn't have with the same size. */
export const toUpload = (local: Obj[], remote: Obj[]): Obj[] => {
  const sizes = new Map(remote.map((o) => [o.key, o.size]))
  return local.filter((o) => sizes.get(o.key) !== o.size)
}

/** The config's D1 and service bindings the deployed Worker lacks or points elsewhere (the settings API's `bindings`). */
export function missingBindings(want: Binding[], deployed: { type: string; name: string; id?: string; service?: string }[]): string[] {
  return want
    .filter((b) => b.type === "d1" || b.type === "service")
    .filter((b) => {
      const d = deployed.find((x) => x.type === b.type && x.name === b.binding)
      return !d || (b.target !== undefined && (b.type === "d1" ? d.id : d.service) !== b.target)
    })
    .map((b) => `${b.binding} (${b.type} → ${b.target ?? "?"})`)
}

// ---------------------------------------------------------------------------------------------------------------- commands

interface Cmd {
  bin: "wrangler" | "npm" | "node"
  args: string[]
  cwd?: string
  /** Given on stdin and never shown: a secret. */
  input?: string
}

const BIN = { wrangler: join(ROOT, "node_modules/.bin/wrangler"), npm: "npm", node: process.execPath }
const quote = (a: string): string => (/^[\w@%+=:,./-]+$/.test(a) ? a : `'${a.replaceAll("'", `'\\''`)}'`)
const rel = (path: string): string => relative(ROOT, path) || "."

export const show = (c: Cmd): string => {
  const line = `${c.bin === "wrangler" ? "npx wrangler" : c.bin} ${c.args.map(quote).join(" ")}${c.input !== undefined ? "  (value on stdin)" : ""}`
  return c.cwd && c.cwd !== ROOT ? `(cd ${rel(c.cwd)} && ${line})` : line
}

/** Runs a read-only command and returns its stdout. */
function capture(c: Cmd): string {
  try {
    return execFileSync(BIN[c.bin], c.args, { cwd: c.cwd ?? ROOT, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] })
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string }
    throw new Error(`${show(c)} failed:\n${`${e.stdout ?? ""}\n${e.stderr ?? ""}`.trim().split("\n").slice(-15).join("\n")}`, { cause: error })
  }
}

/** Runs a command where it can be seen (and answered, unless --yes); with `tee` its stdout is also returned. Rejects on a non-zero exit
 *  unless `allowFail`. */
function run(c: Cmd, o: { yes: boolean; tee?: boolean; allowFail?: boolean }): Promise<{ code: number; out: string }> {
  return new Promise((done, fail) => {
    const stdin = c.input !== undefined ? "pipe" : o.yes ? "ignore" : "inherit"
    const child = spawn(BIN[c.bin], c.args, { cwd: c.cwd ?? ROOT, stdio: [stdin, o.tee ? "pipe" : "inherit", "inherit"] })
    let out = ""
    child.stdout?.on("data", (chunk: Buffer) => {
      process.stdout.write(chunk)
      out += chunk.toString("utf8")
    })
    if (c.input !== undefined) child.stdin!.end(c.input)
    child.on("error", fail)
    child.on("close", (code) => {
      if (code === 0 || o.allowFail) done({ code: code ?? 1, out })
      else fail(new Error(`${show(c)} exited with ${code}`))
    })
  })
}

async function confirm(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) {
    console.log(`${question} [y/N] no (not a terminal: use --yes)`)
    return false
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(`${question} [y/N] `)
  rl.close()
  return /^y(es)?$/i.test(answer.trim())
}

/** A line read without echo. */
function hiddenInput(question: string): Promise<string> {
  const stdin = process.stdin
  if (!stdin.isTTY) return Promise.resolve("")
  process.stdout.write(question)
  return new Promise((done) => {
    let value = ""
    const finish = (): void => {
      stdin.off("data", onData)
      stdin.setRawMode(false)
      stdin.pause()
      process.stdout.write("\n")
    }
    const onData = (chunk: string): void => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") return (finish(), done(value.trim()))
        if (ch === "\u0003") return (finish(), process.exit(130))
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1)
        else value += ch
      }
    }
    stdin.setRawMode(true)
    stdin.setEncoding("utf8")
    stdin.resume()
    stdin.on("data", onData)
  })
}

// ---------------------------------------------------------------------------------------------------------------- Cloudflare

interface Ctx {
  dryRun: boolean
  yes: boolean
  force: boolean
  token?: string
  /** What import-dump said the account had written today, the analytics lagging a few minutes. */
  imported?: { day: string; today: number }
  estimate?: Estimate
  /** Steps skipped for want of room today, with why. */
  blocked: string[]
  notes: string[]
}

const n = (x: number): string => x.toLocaleString("en-US")
const utcDay = (): string => new Date().toISOString().slice(0, 10)

async function api(ctx: Ctx, path: string): Promise<{ status: number; result: any; info?: any }> {
  ctx.token ??= (JSON.parse(capture({ bin: "wrangler", args: ["auth", "token", "--json"] })) as { token: string }).token
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}${path}`, { headers: { authorization: `Bearer ${ctx.token}` } })
  const json = (await response.json().catch(() => ({}))) as { result?: unknown; result_info?: unknown; errors?: { code: number; message: string }[] }
  if (!response.ok && response.status !== 404) throw new Error(`${path}: ${response.status} ${(json.errors ?? []).map((e) => `${e.code} ${e.message}`).join("; ")}`)
  return { status: response.status, result: json.result, info: json.result_info }
}

async function usedToday(ctx: Ctx): Promise<number> {
  const day = utcDay()
  const analytics = await rowsWrittenToday(day)
  return Math.max(analytics, ctx.imported?.day === day ? ctx.imported.today : 0)
}

const d1List = (): Map<string, string> =>
  new Map((JSON.parse(capture({ bin: "wrangler", args: ["d1", "list", "--json"] })) as { uuid: string; name: string }[]).map((d) => [d.name, d.uuid]))

const workerSettings = async (ctx: Ctx, name: string): Promise<{ bindings: { type: string; name: string; id?: string; service?: string }[] } | undefined> => {
  const r = await api(ctx, `/workers/scripts/${name}/settings`)
  return r.status === 404 ? undefined : r.result
}

const configOf = (dir: string) => {
  const file = join(dir, "wrangler.jsonc")
  const text = readFileSync(file, "utf8")
  return { text, config: readConfig(rel(file), parseJsonc(text) as Record<string, unknown>, true) }
}

/** Every wrangler config in the repository, outside node_modules, hidden directories and build output. */
function wranglerFiles(dir = ROOT): string[] {
  const skip = new Set(["node_modules", "dist", "build", "storybook-static"])
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return e.name.startsWith(".") || skip.has(e.name) ? [] : wranglerFiles(join(dir, e.name))
    return /^wrangler\.(jsonc|json|toml)$/.test(e.name) ? [join(dir, e.name)] : []
  })
}

const importDump = (...args: string[]): Cmd => ({ bin: "node", args: ["scripts/import-dump.ts", ...args] })

/** What import-dump has left to write, by its dry run on the saved D1 answers (no D1 reads). */
const estimateNow = (): Estimate => importEstimate(capture(importDump("--dry-run")))

// ---------------------------------------------------------------------------------------------------------------- the steps

const done = (what: string): void => console.log(`✓ already done: ${what}`)

/** Shows the commands; true when they may run (not a dry run, and confirmed or --yes). */
async function approve(ctx: Ctx, cmds: Cmd[], question = "Run this?"): Promise<boolean> {
  for (const c of cmds) console.log(`  $ ${show(c)}`)
  if (ctx.dryRun) {
    console.log("  (dry run: not run)")
    return false
  }
  return ctx.yes || (await confirm(question))
}

async function act(ctx: Ctx, cmds: Cmd[], question?: string): Promise<boolean> {
  if (!(await approve(ctx, cmds, question))) return false
  for (const c of cmds) await run(c, ctx)
  return true
}

interface Step {
  name: string
  title: string
  run(ctx: Ctx): Promise<void>
}

export const STEPS: Step[] = [
  {
    name: "quota",
    title: "D1 rows written today by the account (read-only)",
    async run(ctx) {
      const q = quota(await usedToday(ctx))
      console.log(`${utcDay()} (UTC): ${n(q.used)} of ${n(DAILY_LIMIT)} rows written, ${n(q.remaining)} left`)
      console.log(`  import may write ${n(q.importRoom)} more today (--max-day ${n(MAX_DAY)}); backfill would get --max ${n(q.backfillMax)} (margin ${n(MARGIN)})`)
    },
  },
  {
    name: "create-dbs",
    title: `create the D1 databases ${SHARED_DBS.join(" and ")}`,
    async run(ctx) {
      const have = d1List()
      const missing = SHARED_DBS.filter((db) => !have.has(db))
      if (missing.length === 0 && !ctx.force) return done(SHARED_DBS.map((db) => `${db} ${have.get(db)}`).join(", "))
      if (!(await act(ctx, missing.map((db) => ({ bin: "wrangler", args: ["d1", "create", db] }))))) return
      const now = d1List()
      for (const db of SHARED_DBS) console.log(`  ${db}: ${now.get(db) ?? "still missing!"}`)
    },
  },
  {
    name: "fill-ids",
    title: "put the databases' ids in place of the placeholders in every wrangler config",
    async run(ctx) {
      const files = wranglerFiles().filter((f) => placeholders(readFileSync(f, "utf8")).length > 0)
      if (files.length === 0) return done("no wrangler config here has a `…-not-created-yet` id")
      const have = d1List()
      const ids = Object.fromEntries([...have].filter(([name]) => SHARED_DBS.includes(name)))
      const shown = (name: string): string => ids[name] ?? `<id of ${name}, once created>`
      for (const f of files) {
        const names = placeholders(readFileSync(f, "utf8"))
        console.log(`  ${rel(f)}: ${names.map((name) => `${name}-not-created-yet → ${shown(name)}`).join(", ")}`)
      }
      if (ctx.dryRun) return console.log("  (dry run: not written)")
      for (const f of files) {
        const { text, filled, left } = fillIds(readFileSync(f, "utf8"), ids)
        if (left.length) throw new Error(`${rel(f)}: no database ${left.join(", ")} (run create-dbs first)`)
        writeFileSync(f, text)
        console.log(`  wrote ${rel(f)} (${filled.join(", ")})`)
      }
    },
  },
  {
    name: "migrate",
    title: "apply pending D1 migrations",
    async run(ctx) {
      const have = d1List()
      const targets = [
        ...SHARED_DBS.map((db) => ({ db, cwd: ROOT, config: ["-c", "packages/db/wrangler.jsonc"] })),
        ...ACTIVITY_DBS.map((db) => ({ db, cwd: ACTIVITY, config: [] as string[] })),
      ]
      const apply: Cmd[] = []
      for (const t of targets) {
        const file = t.config.length ? join(ROOT, t.config[1]!) : join(t.cwd, "wrangler.jsonc")
        let pending: string
        if (!have.has(t.db) || placeholders(readFileSync(file, "utf8")).length) {
          if (!ctx.dryRun) throw new Error(`${t.db}: not created, or its id not in ${rel(file)} (run create-dbs and fill-ids first)`)
          pending = "all (after create-dbs and fill-ids)"
        } else {
          const list = pendingMigrations(capture({ bin: "wrangler", args: ["d1", "migrations", "list", t.db, "--remote", ...t.config], cwd: t.cwd }))
          if (list.length === 0) {
            console.log(`  ${t.db}: up to date`)
            continue
          }
          pending = list.join(", ")
        }
        console.log(`  ${t.db}: ${pending}`)
        apply.push({ bin: "wrangler", args: ["d1", "migrations", "apply", t.db, "--remote", ...t.config], cwd: t.cwd })
      }
      if (apply.length === 0) return done("no migrations to apply")
      const q = quota(await usedToday(ctx))
      if (q.remaining < MIGRATE_ROOM) {
        ctx.blocked.push(`migrate: only ${n(q.remaining)} rows left today`)
        return console.log(`  ✗ only ${n(q.remaining)} rows left today: skipped`)
      }
      await act(ctx, apply)
    },
  },
  {
    name: "import-dry",
    title: "what the dump import would write (read-only: asks D1, saves its answers locally)",
    async run(ctx) {
      const cmd = importDump("--dry-run", "--refresh")
      console.log(`  $ ${show(cmd)}`)
      const { out } = await run(cmd, { yes: true, tee: true })
      ctx.estimate = importEstimate(out)
      const q = quota(await usedToday(ctx))
      const days = importDays(ctx.estimate.all, q.used)
      const when = ctx.estimate.all <= q.importRoom ? "fits today" : `about ${days} day(s), ${q.importRoom > 0 ? "today included" : "from tomorrow"}`
      console.log(`\n  needs ${n(ctx.estimate.all)} rows billed; today has room for ${n(q.importRoom)} under --max-day: ${when}`)
    },
  },
  {
    name: "import",
    title: "import the dump into D1 (resumable, stops at --max-day)",
    async run(ctx) {
      const before = ctx.estimate ?? estimateNow()
      if (before.all === 0) return done(`nothing left up to the worker's cursor${before.later ? ` (${n(before.later)} listens wait for it: run import again after backfill)` : ""}`)
      const q = quota(await usedToday(ctx))
      console.log(`  ${n(before.all)} rows billed to write; ${n(q.importRoom)} of room today under --max-day ${n(MAX_DAY)}`)
      if (q.importRoom <= 0) {
        ctx.blocked.push(`import: no room under --max-day today (${n(q.used)} written)`)
        return console.log("  ✗ no room today: skipped")
      }
      if (before.all > q.importRoom) console.log(`  more than today's room: it stops at --max-day, and the rest is for another day (about ${importDays(before.all, q.used)} days)`)
      if (!(await approve(ctx, [importDump()]))) return
      const { out } = await run(importDump(), { yes: ctx.yes, tee: true })
      const today = reportedToday(out)
      if (today !== undefined) ctx.imported = { day: utcDay(), today }
      ctx.estimate = estimateNow()
      if (ctx.estimate.all > 0) ctx.blocked.push(`import: ${n(ctx.estimate.all)} rows billed left for another day`)
    },
  },
  {
    name: "r2",
    title: `upload the raw Apple Music and Spotify exports to R2 ${BUCKET}`,
    async run(ctx) {
      const walk = (dir: string): string[] =>
        existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".ndjson.gz") ? [join(dir, e.name)] : [])) : []
      let files = walk(join(R2_DIR, "raw"))
      if (files.length === 0) {
        console.log("  no exports yet; they are made from the dump (locally):")
        if (!(await act(ctx, [importDump("--export-r2")], "Make them?"))) return
        files = walk(join(R2_DIR, "raw"))
      }
      const local = files.map((f) => ({ key: relative(R2_DIR, f).split("\\").join("/"), size: statSync(f).size, file: f }))
      const remote: Obj[] = []
      for (let cursor: string | undefined, more = true; more; ) {
        const r = await api(ctx, `/r2/buckets/${BUCKET}/objects?prefix=raw/&per_page=1000${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`)
        if (r.status === 404) throw new Error(`no R2 bucket ${BUCKET}`)
        remote.push(...(r.result as Obj[]).map((o) => ({ key: o.key, size: o.size })))
        cursor = r.info?.cursor
        more = Boolean(r.info?.is_truncated && cursor)
      }
      const todo = new Set(toUpload(local, remote).map((o) => o.key))
      for (const o of local) console.log(`  ${o.key} (${n(o.size)} bytes): ${todo.has(o.key) ? "to upload" : "in R2, same size"}`)
      if (todo.size === 0 && !ctx.force) return done("every export is in R2")
      await act(
        ctx,
        local
          .filter((o) => ctx.force || todo.has(o.key))
          .map((o) => ({ bin: "wrangler", args: ["r2", "object", "put", `${BUCKET}/${o.key}`, "--file", rel(o.file), "--content-type", "application/x-ndjson", "--remote"] })),
      )
    },
  },
  {
    name: "deploy-catalog",
    title: "deploy the catalog Worker (its migrations, then the Worker)",
    async run(ctx) {
      const { text, config } = configOf(CATALOG)
      if (placeholders(text).length) {
        if (!ctx.dryRun) throw new Error("workers/catalog/wrangler.jsonc still has placeholder ids (run fill-ids first)")
        console.log("  (its ids come with fill-ids)")
      }
      // Hardcover's sync matches books by their source: the dump's books go in first.
      const left = ctx.estimate ?? estimateNow()
      const first = SHARED_DBS.reduce((sum, db) => sum + (left.byDb[db] ?? 0), 0)
      if (first > 0) {
        if (!ctx.dryRun) {
          ctx.blocked.push(`deploy-catalog: the import of ${SHARED_DBS.join(" and ")} is not finished (${n(first)} rows)`)
          return console.log(`  ✗ ${n(first)} rows of ${SHARED_DBS.join(" and ")} still to import: skipped`)
        }
        console.log(`  (after import: ${n(first)} rows of ${SHARED_DBS.join(" and ")} to import first)`)
      }
      const deployed = await workerSettings(ctx, "catalog")
      const missing = deployed ? missingBindings(config.bindings, deployed.bindings) : ["(not deployed)"]
      if (missing.length === 0 && !ctx.force) return done("catalog is deployed with the config's databases")
      console.log(`  deployed: ${deployed ? `yes, but without ${missing.join(", ")}` : "no"}`)
      await act(ctx, [{ bin: "npm", args: ["run", "deploy", "-w", "workers/catalog"] }])
    },
  },
  {
    name: "catalog-secrets",
    title: `put ${CATALOG_SECRETS.join(" and ")} on the catalog Worker`,
    async run(ctx) {
      const r = await api(ctx, "/workers/scripts/catalog/secrets")
      if (r.status === 404 && !ctx.dryRun) {
        ctx.blocked.push("catalog-secrets: catalog is not deployed yet")
        return console.log("  ✗ catalog is not deployed (deploy-catalog first): skipped")
      }
      const have = new Set(((r.result ?? []) as { name: string }[]).map((s) => s.name))
      const missing = CATALOG_SECRETS.filter((s) => ctx.force || !have.has(s))
      if (missing.length === 0) return done(`catalog has ${CATALOG_SECRETS.join(" and ")}`)
      if (r.status === 404) console.log("  (catalog is put up by deploy-catalog first)")
      const values: Record<string, () => Promise<string>> = {
        HARDCOVER_TOKEN: async () => {
          if (!existsSync(BOOKS_ENV)) throw new Error(`no ${BOOKS_ENV}`)
          const v = parseEnv(readFileSync(BOOKS_ENV, "utf8")).HARDCOVER_TOKEN
          if (!v) throw new Error(`no HARDCOVER_TOKEN in ${BOOKS_ENV}`)
          return v
        },
        GITHUB_TOKEN: async () => process.env.GITHUB_TOKEN || (await hiddenInput("  GITHUB_TOKEN (fine-grained, public repositories read-only; not shown, empty skips): ")),
      }
      if (missing.includes("HARDCOVER_TOKEN")) await values.HARDCOVER_TOKEN!() // fails early if the file lacks it
      console.log(`  HARDCOVER_TOKEN from ${BOOKS_ENV}; GITHUB_TOKEN from ${process.env.GITHUB_TOKEN ? "$GITHUB_TOKEN" : "a hidden prompt"}`)
      const put = (name: string): Cmd => ({ bin: "wrangler", args: ["secret", "put", name], cwd: CATALOG, input: "" })
      if (!(await approve(ctx, missing.map(put)))) return
      for (const name of missing) {
        const value = await values[name]!()
        if (!value) {
          console.log(`  ${name}: no value, skipped`)
          ctx.blocked.push(`catalog-secrets: ${name} not put`)
          continue
        }
        await run({ ...put(name), input: value }, ctx)
      }
    },
  },
  {
    name: "deploy-scheduler",
    title: "deploy the scheduler Worker (its service binding needs catalog)",
    async run(ctx) {
      const { config } = configOf(SCHEDULER)
      const services = config.bindings.filter((b) => b.type === "service").map((b) => b.target!)
      const absent: string[] = []
      for (const s of services) if (!(await workerSettings(ctx, s))) absent.push(s)
      if (absent.length) {
        if (!ctx.dryRun) {
          ctx.blocked.push(`deploy-scheduler: ${absent.join(", ")} not deployed yet`)
          return console.log(`  ✗ ${absent.join(", ")} not deployed (deploy-catalog first): skipped`)
        }
        console.log(`  (after ${absent.join(", ")} ${absent.length === 1 ? "is" : "are"} deployed)`)
      }
      const deployed = await workerSettings(ctx, "scheduler")
      const missing = deployed ? missingBindings(config.bindings, deployed.bindings) : ["(not deployed)"]
      if (missing.length === 0 && !ctx.force) return done("scheduler is deployed with every service binding")
      console.log(`  deployed: ${deployed ? `yes, but without ${missing.join(", ")}` : "no"}`)
      await act(ctx, [{ bin: "npm", args: ["run", "deploy", "-w", "workers/scheduler"] }])
    },
  },
  {
    name: "backfill",
    title: "fill music.listens from ListenBrainz up to now, with what is left of today's quota",
    async run(ctx) {
      const out = JSON.parse(capture({ bin: "wrangler", args: ["d1", "execute", "music", "--remote", "-y", "--json", "--command", "SELECT value FROM state WHERE key = 'cursor'"], cwd: ACTIVITY })) as {
        results?: { value: string }[]
      }[]
      const cursor = Number(out[0]?.results?.[0]?.value ?? 0)
      const response = await fetch(`https://api.listenbrainz.org/1/user/lmfaole/listens?min_ts=${cursor}&count=1`, { headers: { "User-Agent": "listens (lmfaole.party)" } })
      if (!response.ok) throw new Error(`ListenBrainz ${response.status}`)
      const newer = ((await response.json()) as { payload: { listens: unknown[] } }).payload.listens.length
      console.log(`  the worker's cursor: ${new Date(cursor * 1000).toISOString()}`)
      if (newer === 0 && !ctx.force) return done("ListenBrainz has nothing after the cursor")
      const q = quota(await usedToday(ctx))
      console.log(`  ${n(q.remaining)} rows left today: backfill gets --max ${n(q.backfillMax)} (margin ${n(MARGIN)})`)
      if (q.backfillMax < 1_000) {
        ctx.blocked.push(`backfill: no room today (${n(q.used)} written)`)
        return console.log("  ✗ no room today: skipped")
      }
      await act(ctx, [{ bin: "npm", args: ["run", "backfill", "-w", "workers/activity", "--", "--max", String(q.backfillMax)] }])
    },
  },
  {
    name: "audit",
    title: "every Cloudflare resource has an owner here (read-only)",
    async run(ctx) {
      const cmd: Cmd = { bin: "npm", args: ["run", "cf:audit"] }
      console.log(`  $ ${show(cmd)}`)
      const { code } = await run(cmd, { yes: true, allowFail: true })
      if (code !== 0) ctx.notes.push("cf:audit reports something unowned or drifting (above)")
    },
  },
  {
    name: "final",
    title: "what is left to do by hand",
    async run(ctx) {
      const ids = d1List()
      const git = (...args: string[]): string => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      const branch = git("rev-parse", "--abbrev-ref", "HEAD").trim()
      const branches = git("for-each-ref", "--format=%(refname:short)", "refs/heads").split("\n").filter((b) => b && b !== branch)
      for (const b of branches) {
        let hits: string
        try {
          hits = git("grep", "-n", "-E", PLACEHOLDER.source, b, "--", ":(glob)**/wrangler.json*", ":(glob)**/wrangler.toml")
        } catch {
          continue // no match
        }
        // Only the files the branch itself changed: the others take this branch's ids when it is merged.
        const own = new Set(git("diff", "--name-only", git("merge-base", "HEAD", b).trim(), b).split("\n"))
        const lines = hits
          .trim()
          .split("\n")
          .map((l) => l.slice(b.length + 1))
          .filter((l) => own.has(l.split(":")[0]!))
        if (lines.length === 0) continue
        const files = [...new Set(lines.map((l) => l.split(":")[0]!))]
        const names = [...new Set(lines.flatMap((l) => placeholders(l)))]
        console.log(`\nBranch ${b} has placeholder ids of its own (not switched to; do this by hand):`)
        for (const l of lines) console.log(`  ${l.replace(/^(\S+?:\d+):\s*/, "$1  ")}`)
        console.log(`  the ids:`)
        for (const name of names) console.log(`    ${name}-not-created-yet → ${ids.get(name) ?? `<id of ${name}: not created yet>`}`)
        console.log(`  e.g., once the ids filled in here are committed on ${branch}:\n    git switch ${b}`)
        for (const name of names) if (ids.has(name)) console.log(`    sed -i '' 's/${name}-not-created-yet/${ids.get(name)}/' ${files.join(" ")}`)
        console.log(`    git commit -am "D1-id-er" && git switch ${branch} && git merge ${b} && git push   # CI deploys apps/startside on a push to main`)
      }
      if (ctx.estimate?.later) console.log(`\n${n(ctx.estimate.later)} dump listens wait for the worker's cursor: after backfill has moved it, run \`npm run rollout -- --only import-dry,import\` (another day if today is full).`)
      for (const note of ctx.notes) console.log(`\nnote: ${note}`)
      if (ctx.blocked.length) {
        console.log("\nNot done today (run again after 00:00 UTC, `npm run rollout` skips what is done):")
        for (const b of ctx.blocked) console.log(`  - ${b}`)
      }
    },
  },
]

// ---------------------------------------------------------------------------------------------------------------- running it

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      list: { type: "boolean", default: false },
      from: { type: "string" },
      only: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      yes: { type: "boolean", short: "y", default: false },
      force: { type: "boolean", default: false },
    },
  })
  const names = STEPS.map((s) => s.name)
  if (values.list) {
    STEPS.forEach((s, i) => console.log(`${String(i + 1).padStart(2)}. ${s.name.padEnd(17)} ${s.title}`))
    process.exit(0)
  }
  let selected: string[]
  try {
    selected = selectSteps(names, { from: values.from, only: values.only })
  } catch (error) {
    console.error((error as Error).message)
    process.exit(2)
  }
  const ctx: Ctx = { dryRun: values["dry-run"], yes: values.yes, force: values.force, blocked: [], notes: [] }
  if (ctx.dryRun) console.log("dry run: only reads; every command that would write is printed, not run")
  for (const name of selected) {
    const step = STEPS.find((s) => s.name === name)!
    console.log(`\n── ${names.indexOf(name) + 1}/${names.length} ${name}: ${step.title}`)
    try {
      await step.run(ctx)
    } catch (error) {
      console.error(`\n✗ ${name}: ${(error as Error).message}`)
      console.error(`carry on with: npm run rollout -- --from ${name}`)
      process.exit(1)
    }
  }
}
