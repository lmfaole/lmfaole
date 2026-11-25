/** Checks that every resource in the Cloudflare account has an owner in this repository: a `wrangler.jsonc` that declares it, or an entry in
 *  `scripts/cf-audit.allow.json` (resources kept on purpose and owned elsewhere, with the reason). Read-only: it only lists.
 *
 *  ✓ owned (by a wrangler.jsonc, or allow-listed as external), ✗ unowned (in Cloudflare, no owner), ! missing (declared, not in Cloudflare yet),
 *  ≠ drift (Cloudflare differs from the config: a cron outside the scheduler, workers.dev on where the config says off, a route or binding only
 *  on one side), ? not checked (the token may not read it). Exit code 1 when anything is unowned or drifting.
 *
 *  The token is CLOUDFLARE_API_TOKEN when set (CI), else wrangler's own login (`npx wrangler auth token --json`), which cannot read DNS, Access or
 *  AI Gateway. The account is CLOUDFLARE_ACCOUNT_ID when set.
 *
 *  node scripts/cf-audit.ts [--json] */

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "5d49b98b68b70cbd1c81be0f18501262"
/** The only Worker that may have Cron Triggers: it calls the others' `scheduled` (workers/scheduler). */
export const CRON_WORKER = "scheduler"

// ---------------------------------------------------------------------------------------------------------------- the desired state

export interface Route {
  pattern: string
  zone?: string
  customDomain: boolean
}

export interface Binding {
  type: "d1" | "kv" | "r2" | "queue" | "service" | "durable_object" | "hyperdrive" | "vectorize" | "workflow"
  binding: string
  /** What it points at: a D1/KV/Hyperdrive id (absent when wrangler provisions it), a bucket, queue, Worker, index or workflow name, `script.Class` for a Durable Object. */
  target?: string
  /** D1's database_name: the name it gets when created. */
  name?: string
}

export interface Config {
  /** The file, relative to the repository's root. */
  file: string
  name: string
  /** False for a file that only holds resources (packages/db) and is never deployed. */
  worker: boolean
  /** A Pages project (`pages_build_output_dir`) instead of a Worker. */
  pages: boolean
  workersDev: boolean
  previewUrls?: boolean
  routes: Route[]
  crons: string[]
  bindings: Binding[]
  /** Queues it consumes. */
  consumes: string[]
  vars: Record<string, unknown>
}

/** JSON with comments and trailing commas, as wrangler reads it. */
export function parseJsonc(text: string): unknown {
  /** `text` with `step` applied outside strings: it returns what to emit at `i` and how far it read. */
  const outsideStrings = (text: string, step: (i: number) => [string, number]): string => {
    let out = ""
    for (let i = 0; i < text.length; ) {
      if (text[i] === '"') {
        let j = i + 1
        while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1
        out += text.slice(i, j + 1)
        i = j + 1
      } else {
        const [emit, next] = step(i)
        out += emit
        i = next
      }
    }
    return out
  }
  const plain = outsideStrings(text, (i) => {
    if (text.startsWith("//", i)) {
      const end = text.indexOf("\n", i)
      return ["", end < 0 ? text.length : end]
    }
    if (text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i + 2)
      return [" ", end < 0 ? text.length : end + 2]
    }
    return [text[i]!, i + 1]
  })
  return JSON.parse(outsideStrings(plain, (i) => [plain[i] === "," && /^\s*[}\]]/.test(plain.slice(i + 1)) ? "" : plain[i]!, i + 1]))
}

type Raw = Record<string, any>
const list = (x: unknown): Raw[] => (Array.isArray(x) ? x : [])

/** The parts of a parsed wrangler config this audit compares. `deploys`: the directory's package.json has a `deploy` script (an Astro or Next app
 *  whose config names no `main` is still a Worker). */
export function readConfig(file: string, c: Raw, deploys = false): Config {
  const routes: Route[] = [...list(c.routes), ...(c.route ? [c.route] : [])].map((r) =>
    typeof r === "string" ? { pattern: r, customDomain: false } : { pattern: String(r.pattern), zone: r.zone_name ?? r.zone_id, customDomain: Boolean(r.custom_domain) },
  )
  const pages = Boolean(c.pages_build_output_dir)
  const name = String(c.name)
  const bindings: Binding[] = [
    ...list(c.d1_databases).map((d): Binding => ({ type: "d1", binding: d.binding, target: d.database_id, name: d.database_name })),
    ...list(c.kv_namespaces).map((k): Binding => ({ type: "kv", binding: k.binding, target: k.id })),
    ...list(c.r2_buckets).map((r): Binding => ({ type: "r2", binding: r.binding, target: r.bucket_name })),
    ...list(c.queues?.producers).map((q): Binding => ({ type: "queue", binding: q.binding, target: q.queue })),
    ...list(c.services).map((s): Binding => ({ type: "service", binding: s.binding, target: s.service })),
    ...list(c.durable_objects?.bindings).map((d): Binding => ({ type: "durable_object", binding: d.name, target: `${d.script_name ?? name}.${d.class_name}` })),
    ...list(c.hyperdrive).map((h): Binding => ({ type: "hyperdrive", binding: h.binding, target: h.id })),
    ...list(c.vectorize).map((v): Binding => ({ type: "vectorize", binding: v.binding, target: v.index_name })),
    ...list(c.workflows).map((w): Binding => ({ type: "workflow", binding: w.binding, target: w.name })),
  ]
  return {
    file,
    name,
    pages,
    worker: !pages && Boolean(c.main || c.assets || routes.length || deploys),
    // wrangler's default: a workers.dev address only when the Worker has no routes.
    workersDev: c.workers_dev ?? routes.length === 0,
    previewUrls: c.preview_urls,
    routes,
    crons: list(c.triggers?.crons).map(String),
    bindings,
    consumes: list(c.queues?.consumers).map((q) => String(q.queue)),
    vars: c.vars ?? {},
  }
}

const SKIP = new Set(["node_modules", "dist", "build", "storybook-static"])

/** Every wrangler.jsonc in the repository, outside node_modules and build output. */
export function findConfigs(root = ROOT): Config[] {
  const configs: Config[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith(".") && !SKIP.has(entry.name)) walk(join(dir, entry.name))
      else if (entry.isFile() && entry.name === "wrangler.jsonc") {
        const file = join(dir, entry.name)
        const pkg = join(dir, "package.json")
        const deploys = existsSync(pkg) && Boolean(JSON.parse(readFileSync(pkg, "utf8")).scripts?.deploy)
        configs.push(readConfig(relative(root, file), parseJsonc(readFileSync(file, "utf8")) as Raw, deploys))
      }
    }
  }
  walk(root)
  return configs.sort((a, b) => a.file.localeCompare(b.file))
}

export interface AllowEntry {
  kind: Kind
  name: string
  reason: string
}

// ---------------------------------------------------------------------------------------------------------------- the actual state

export type Kind = "zone" | "worker" | "route" | "custom_domain" | "cron" | "workers_dev" | "binding" | "d1" | "kv" | "r2" | "queue" | "pages" | "durable_object" | "hyperdrive" | "vectorize" | "workflow" | "ai_gateway" | "dns" | "access"
export const KINDS: Kind[] = ["zone", "worker", "route", "custom_domain", "cron", "workers_dev", "binding", "d1", "kv", "r2", "queue", "pages", "durable_object", "hyperdrive", "vectorize", "workflow", "ai_gateway", "dns", "access"]

export interface ActualWorker {
  name: string
  /** Undefined where the token could not read it. */
  workersDev?: boolean
  previews?: boolean
  crons?: string[]
  bindings?: Binding[]
}

/** What Cloudflare has. A list left undefined was not read, and `notChecked` says why. */
export interface Actual {
  zones?: { id: string; name: string }[]
  workers?: ActualWorker[]
  routes?: { zone: string; pattern: string; script: string | null }[]
  customDomains?: { hostname: string; zone: string; service: string }[]
  d1?: { id: string; name: string }[]
  kv?: { id: string; title: string }[]
  r2?: string[]
  queues?: string[]
  pages?: string[]
  /** `script.Class`. */
  durableObjects?: string[]
  /** Ids. */
  hyperdrive?: string[]
  vectorize?: string[]
  workflows?: string[]
  aiGateways?: string[]
  dns?: { zone: string; name: string; type: string }[]
  access?: { name: string; aud: string; domains: string[] }[]
  notChecked: Partial<Record<Kind, string>>
}

// ---------------------------------------------------------------------------------------------------------------- the comparison

export type Status = "owned" | "external" | "unowned" | "missing" | "drift" | "not_checked"

export interface Row {
  kind: Kind
  status: Status
  resource: string
  /** The config file(s) that own it, or the allow-list's reason. */
  owner?: string
  detail?: string
}

const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i
const isId = (x: string | undefined): x is string => Boolean(x && UUID.test(x))
const glob = (pattern: string): RegExp => new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`, "i")
const bare = (s: string): string => s.replace(/^https?:\/\//, "")
const hostOf = (pattern: string): string => bare(pattern).split("/")[0]!
/** Whether a route pattern reaches a host or host/path (an Access application's domain). */
const reaches = (pattern: string, target: string): boolean => {
  const re = glob(bare(pattern))
  return re.test(bare(target)) || re.test(`${bare(target)}/`)
}
/** The zone a host is in: the longest zone name it ends with. */
const zoneOf = (host: string, zones: string[]): string | undefined =>
  zones.filter((z) => host === z || host.endsWith(`.${z}`) || (host.startsWith("*.") && host.endsWith(z))).sort((a, b) => b.length - a.length)[0]
const files = (cs: Config[]): string | undefined => [...new Set(cs.map((c) => c.file))].join(", ") || undefined

/** Compares the configs (and the allow-list) with what Cloudflare has. Pure: every row the report shows, grouped by kind, problems first. */
export function audit(configs: Config[], actual: Actual, allow: AllowEntry[] = []): Row[] {
  const rows: Row[] = []
  const add = (row: Row): void => void rows.push(Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined && v !== "")) as unknown as Row)
  const used = new Set<AllowEntry>()
  const allowed = (kind: Kind, ...names: (string | null | undefined)[]): AllowEntry | undefined => {
    const entry = allow.find((a) => a.kind === kind && names.includes(a.name))
    if (entry) used.add(entry)
    return entry
  }
  const workers = configs.filter((c) => c.worker)
  const zoneNames = (actual.zones ?? []).map((z) => z.name)
  const zoneName = (z: string | undefined): string | undefined => actual.zones?.find((x) => x.id === z)?.name ?? z
  const deployed = new Map((actual.workers ?? []).map((w) => [w.name, w]))
  const skip = (kind: Kind): boolean => {
    const reason = actual.notChecked[kind]
    if (reason) add({ kind, status: "not_checked", resource: "*", detail: reason })
    return Boolean(reason)
  }
  /** Something no config owns: external when it (or the zone or Worker it belongs to) is allow-listed, else unowned. */
  const orphan = (kind: Kind, resource: string, detail: string | undefined, entry: AllowEntry | undefined): void =>
    add(entry ? { kind, status: "external", resource, owner: `allow-list: ${entry.reason}` } : { kind, status: "unowned", resource, detail })

  // Zones: owned by the configs with routes or custom domains in them.
  const routeZone = (r: Route): string | undefined => zoneName(r.zone) ?? zoneOf(hostOf(r.pattern), zoneNames)
  if (!skip("zone") && actual.zones) {
    for (const zone of actual.zones) {
      const owner = files(workers.filter((c) => c.routes.some((r) => routeZone(r) === zone.name)))
      if (owner) add({ kind: "zone", status: "owned", resource: zone.name, owner })
      else orphan("zone", zone.name, "no route or custom domain in a config", allowed("zone", zone.name, zone.id))
    }
    for (const c of workers)
      for (const r of c.routes) {
        const zone = routeZone(r)
        if (!zone || !zoneNames.includes(zone)) add({ kind: "zone", status: "missing", resource: zone ?? hostOf(r.pattern), owner: c.file, detail: `${r.pattern}: no such zone in the account` })
      }
  }

  // Workers, and per Worker its crons, workers.dev and bindings.
  if (!skip("worker") && actual.workers) {
    for (const w of actual.workers) {
      const owners = workers.filter((c) => c.name === w.name)
      if (owners.length > 1) add({ kind: "worker", status: "drift", resource: w.name, owner: files(owners), detail: "more than one config deploys it" })
      else if (owners.length) add({ kind: "worker", status: "owned", resource: w.name, owner: owners[0]!.file })
      else orphan("worker", w.name, "no wrangler.jsonc deploys it", allowed("worker", w.name))
    }
    for (const c of workers) if (!deployed.has(c.name)) add({ kind: "worker", status: "missing", resource: c.name, owner: c.file, detail: "not deployed" })
  }

  if (!skip("cron") && actual.workers) {
    for (const w of actual.workers) {
      const config = workers.find((c) => c.name === w.name)
      if (!w.crons) {
        add({ kind: "cron", status: "not_checked", resource: w.name })
        continue
      }
      for (const cron of w.crons) {
        const resource = `${w.name}: ${cron}`
        if (!config) orphan("cron", resource, "on a Worker no config owns", allowed("worker", w.name))
        else if (w.name !== CRON_WORKER) add({ kind: "cron", status: "drift", resource, owner: config.file, detail: `only ${CRON_WORKER} may have a Cron Trigger` })
        else if (!config.crons.includes(cron)) add({ kind: "cron", status: "drift", resource, owner: config.file, detail: "in Cloudflare, not in the config" })
        else add({ kind: "cron", status: "owned", resource, owner: config.file })
      }
    }
    for (const c of workers) {
      const w = deployed.get(c.name)
      for (const cron of c.crons) {
        const resource = `${c.name}: ${cron}`
        if (c.name !== CRON_WORKER) {
          if (!w?.crons?.includes(cron)) add({ kind: "cron", status: "drift", resource, owner: c.file, detail: `in the config, but only ${CRON_WORKER} may have a Cron Trigger` })
        } else if (!w) add({ kind: "cron", status: "missing", resource, owner: c.file, detail: "Worker not deployed" })
        else if (w.crons && !w.crons.includes(cron)) add({ kind: "cron", status: "drift", resource, owner: c.file, detail: "in the config, not in Cloudflare" })
      }
    }
  }

  if (!skip("workers_dev") && actual.workers) {
    for (const c of workers) {
      const w = deployed.get(c.name)
      if (!w) continue
      if (w.workersDev === undefined) {
        add({ kind: "workers_dev", status: "not_checked", resource: c.name, owner: c.file })
        continue
      }
      const onOff = (x: boolean | undefined) => (x ? "on" : "off")
      const problems = [
        w.workersDev !== c.workersDev && `workers.dev is ${onOff(w.workersDev)}, the config says ${onOff(c.workersDev)}`,
        c.previewUrls !== undefined && w.previews !== undefined && w.previews !== c.previewUrls && `preview URLs are ${onOff(w.previews)}, the config says ${onOff(c.previewUrls)}`,
      ].filter(Boolean)
      if (problems.length) add({ kind: "workers_dev", status: "drift", resource: c.name, owner: c.file, detail: problems.join("; ") })
      else add({ kind: "workers_dev", status: "owned", resource: c.name, owner: c.file, detail: `workers.dev ${onOff(w.workersDev)}${w.previews === undefined ? "" : `, previews ${onOff(w.previews)}`}` })
    }
  }

  // A binding's target as deployed, for the ones the config leaves to wrangler to provision (a KV or D1 binding without an id).
  const resolved = (c: Config, b: Binding): string | undefined => b.target ?? deployed.get(c.name)?.bindings?.find((d) => d.type === b.type && d.binding === b.binding)?.target
  if (!skip("binding") && actual.workers) {
    for (const c of workers) {
      const w = deployed.get(c.name)
      if (!w?.bindings) continue
      for (const b of c.bindings) {
        const d = w.bindings.find((x) => x.type === b.type && x.binding === b.binding)
        const resource = `${c.name}.${b.binding} (${b.type})`
        if (!d) add({ kind: "binding", status: "drift", resource, owner: c.file, detail: "in the config, not on the deployed Worker" })
        else if (b.target && d.target && b.target !== d.target) add({ kind: "binding", status: "drift", resource, owner: c.file, detail: `deployed → ${d.target}, the config → ${b.target}` })
        else if (b.type === "service" && !deployed.has(d.target!)) add({ kind: "binding", status: "missing", resource, owner: c.file, detail: `→ ${d.target}, a Worker that is not deployed` })
        else add({ kind: "binding", status: "owned", resource, owner: c.file, detail: `→ ${d.target}` })
      }
      for (const d of w.bindings)
        if (!c.bindings.some((b) => b.type === d.type && b.binding === d.binding)) add({ kind: "binding", status: "drift", resource: `${c.name}.${d.binding} (${d.type})`, owner: c.file, detail: `deployed → ${d.target}, not in the config` })
    }
  }

  // Routes and custom domains, by zone and pattern.
  const declared = workers.flatMap((c) => c.routes.map((r) => ({ c, r, zone: routeZone(r) })))
  if (!skip("route") && actual.routes) {
    for (const route of actual.routes) {
      const resource = `${route.pattern} → ${route.script ?? "(no Worker)"}`
      const mine = declared.filter((d) => !d.r.customDomain && d.r.pattern === route.pattern && (!d.zone || d.zone === route.zone))
      const owner = mine.find((d) => d.c.name === route.script)
      if (owner) add({ kind: "route", status: "owned", resource, owner: owner.c.file })
      else if (mine.length) add({ kind: "route", status: "drift", resource, owner: files(mine.map((d) => d.c)), detail: `the config sends it to ${mine.map((d) => d.c.name).join(", ")}` })
      else if (workers.some((c) => c.name === route.script)) add({ kind: "route", status: "drift", resource, owner: files(workers.filter((c) => c.name === route.script)), detail: "in Cloudflare, not in the config" })
      else orphan("route", resource, route.script ? "its Worker has no config" : "a route with no Worker", allowed("route", route.pattern) ?? allowed("zone", route.zone) ?? allowed("worker", route.script))
    }
    for (const d of declared.filter((d) => !d.r.customDomain)) {
      if (actual.routes.some((r) => r.pattern === d.r.pattern && (!d.zone || r.zone === d.zone))) continue
      const live = deployed.has(d.c.name)
      add({ kind: "route", status: live ? "drift" : "missing", resource: `${d.r.pattern} → ${d.c.name}`, owner: d.c.file, detail: live ? "in the config, not in Cloudflare" : "Worker not deployed" })
    }
  }

  if (!skip("custom_domain") && actual.customDomains) {
    for (const domain of actual.customDomains) {
      const resource = `${domain.hostname} → ${domain.service}`
      const mine = declared.filter((d) => d.r.customDomain && hostOf(d.r.pattern) === domain.hostname)
      const owner = mine.find((d) => d.c.name === domain.service)
      if (owner) add({ kind: "custom_domain", status: "owned", resource, owner: owner.c.file })
      else if (mine.length) add({ kind: "custom_domain", status: "drift", resource, owner: files(mine.map((d) => d.c)), detail: `the config sends it to ${mine.map((d) => d.c.name).join(", ")}` })
      else if (workers.some((c) => c.name === domain.service)) add({ kind: "custom_domain", status: "drift", resource, owner: files(workers.filter((c) => c.name === domain.service)), detail: "in Cloudflare, not in the config" })
      else orphan("custom_domain", resource, "no config declares it", allowed("custom_domain", domain.hostname) ?? allowed("zone", domain.zone) ?? allowed("worker", domain.service))
    }
    for (const d of declared.filter((d) => d.r.customDomain)) {
      if (actual.customDomains.some((x) => x.hostname === hostOf(d.r.pattern))) continue
      const live = deployed.has(d.c.name)
      add({ kind: "custom_domain", status: live ? "drift" : "missing", resource: `${hostOf(d.r.pattern)} → ${d.c.name}`, owner: d.c.file, detail: live ? "in the config, not in Cloudflare" : "Worker not deployed" })
    }
  }

  // Storage and the other account resources a binding points at.
  const bound = (type: Binding["type"]) => configs.flatMap((c) => c.bindings.filter((b) => b.type === type).map((b) => ({ c, b, target: resolved(c, b) })))

  if (!skip("d1") && actual.d1) {
    const decl = bound("d1")
    for (const db of actual.d1) {
      const byId = decl.filter((d) => d.target === db.id)
      const byName = decl.filter((d) => d.b.name === db.name)
      if (byId.length) add({ kind: "d1", status: "owned", resource: db.name, owner: files(byId.map((d) => d.c)) })
      else if (byName.length) add({ kind: "d1", status: "drift", resource: db.name, owner: files(byName.map((d) => d.c)), detail: `the config's database_id is ${byName[0]!.target ?? "unset"}, Cloudflare's is ${db.id}` })
      else orphan("d1", db.name, `id ${db.id}`, allowed("d1", db.name, db.id))
    }
    const missing = decl.filter((d) => !actual.d1!.some((db) => db.id === d.target || db.name === d.b.name))
    for (const [i, d] of missing.entries()) {
      const name = d.b.name ?? d.b.binding
      if (missing.findIndex((x) => (x.b.name ?? x.b.binding) === name) !== i) continue
      const owner = files(missing.filter((x) => (x.b.name ?? x.b.binding) === name).map((x) => x.c))
      add({ kind: "d1", status: "missing", resource: name, owner, detail: isId(d.target) ? `id ${d.target} not in Cloudflare` : "not created yet" })
    }
  }

  if (!skip("kv") && actual.kv) {
    const decl = bound("kv")
    for (const ns of actual.kv) {
      const mine = decl.filter((d) => d.target === ns.id)
      if (mine.length) add({ kind: "kv", status: "owned", resource: ns.title, owner: [...new Set(mine.map((d) => `${d.c.file} (${d.b.binding})`))].join(", ") })
      else orphan("kv", ns.title, `id ${ns.id}`, allowed("kv", ns.title, ns.id))
    }
    for (const d of decl) {
      if (d.target && actual.kv.some((ns) => ns.id === d.target)) continue
      add({ kind: "kv", status: "missing", resource: `${d.c.name}.${d.b.binding}`, owner: d.c.file, detail: d.target ? `id ${d.target} not in Cloudflare` : "not provisioned yet (no id, and the deployed Worker has no such binding)" })
    }
  }

  // Resources known by name (or id) alone: owned by a binding that points at them (or `owners`), missing when a config's binding points at nothing.
  const byName = (kind: Kind, names: string[] | undefined, type: Binding["type"] | null, owners: (name: string) => string | undefined = () => undefined, extra: { name: string; owner: string }[] = []): void => {
    if (skip(kind) || !names) return
    const decl = type ? bound(type).filter((d) => d.target) : []
    for (const name of names) {
      const owner = owners(name) ?? files(decl.filter((d) => d.target === name).map((d) => d.c))
      if (owner) add({ kind, status: "owned", resource: name, owner })
      else orphan(kind, name, undefined, allowed(kind, name))
    }
    const wanted = [...decl.map((d) => ({ name: d.target!, owner: d.c.file })), ...extra]
    for (const [i, d] of wanted.entries()) if (!names.includes(d.name) && wanted.findIndex((x) => x.name === d.name) === i) add({ kind, status: "missing", resource: d.name, owner: d.owner, detail: "not in Cloudflare" })
  }
  byName("r2", actual.r2, "r2")
  byName("queue", actual.queues, "queue", (q) => files(configs.filter((c) => c.consumes.includes(q))), configs.flatMap((c) => c.consumes.map((name) => ({ name, owner: c.file }))))
  byName("pages", actual.pages, null, (p) => files(configs.filter((c) => c.pages && c.name === p)), configs.filter((c) => c.pages).map((c) => ({ name: c.name, owner: c.file })))
  byName("durable_object", actual.durableObjects, "durable_object")
  byName("hyperdrive", actual.hyperdrive, "hyperdrive")
  byName("vectorize", actual.vectorize, "vectorize")
  byName("workflow", actual.workflows, "workflow")
  const gateway = (c: Config): string | undefined => (typeof c.vars.AI_GATEWAY === "string" && c.vars.AI_GATEWAY) || undefined
  byName("ai_gateway", actual.aiGateways, null, (g) => files(configs.filter((c) => gateway(c) === g)), configs.filter(gateway).map((c) => ({ name: gateway(c)!, owner: c.file })))

  // DNS records: owned when a route or custom domain of a config reaches the host.
  if (!skip("dns") && actual.dns) {
    for (const record of actual.dns) {
      const resource = `${record.name} ${record.type}`
      const owner = files(workers.filter((c) => c.routes.some((r) => glob(hostOf(r.pattern)).test(record.name))))
      if (owner) add({ kind: "dns", status: "owned", resource, owner })
      else orphan("dns", resource, "no route or custom domain reaches it", allowed("dns", resource, record.name) ?? allowed("zone", record.zone))
    }
  }

  // Access applications: owned by the config whose ACCESS_AUD is theirs, or whose route reaches one of their domains.
  if (!skip("access") && actual.access) {
    for (const app of actual.access) {
      const owner = files(configs.filter((c) => c.vars.ACCESS_AUD === app.aud)) ?? files(workers.filter((c) => c.routes.some((r) => app.domains.some((d) => reaches(r.pattern, d)))))
      const domains = app.domains.join(" ")
      if (owner) add({ kind: "access", status: "owned", resource: app.name, owner, detail: domains })
      else orphan("access", app.name, `${domains || "no domain"}: no route reaches it`, allowed("access", app.name, app.aud) ?? app.domains.map((d) => allowed("zone", zoneOf(hostOf(d), zoneNames))).find(Boolean))
    }
    for (const c of configs) {
      const aud = c.vars.ACCESS_AUD
      if (typeof aud === "string" && aud && !actual.access.some((a) => a.aud === aud)) add({ kind: "access", status: "missing", resource: `ACCESS_AUD ${aud.slice(0, 12)}…`, owner: c.file, detail: "no Access application has this audience" })
    }
  }

  // Allow-list entries that matched nothing, in the kinds that were read: kept for something that is gone.
  for (const entry of allow) {
    if (used.has(entry) || actual.notChecked[entry.kind]) continue
    add({ kind: entry.kind, status: "missing", resource: entry.name, owner: `allow-list: ${entry.reason}`, detail: "allow-listed, not in Cloudflare" })
  }

  const order: Status[] = ["unowned", "drift", "missing", "not_checked", "external", "owned"]
  return rows.sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || order.indexOf(a.status) - order.indexOf(b.status) || a.resource.localeCompare(b.resource))
}

/** True when the audit should fail: something in Cloudflare has no owner, or differs from its config. */
export const failing = (rows: Row[]): boolean => rows.some((r) => r.status === "unowned" || r.status === "drift")

// ---------------------------------------------------------------------------------------------------------------- reading Cloudflare

type Answer = { ok: true; result: any; info?: Raw } | { ok: false; status: number; message: string }

function token(): { token: string; source: "env" | "wrangler" } {
  if (process.env.CLOUDFLARE_API_TOKEN) return { token: process.env.CLOUDFLARE_API_TOKEN, source: "env" }
  const out = execFileSync(join(ROOT, "node_modules/.bin/wrangler"), ["auth", "token", "--json"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
  return { token: (JSON.parse(out) as { token: string }).token, source: "wrangler" }
}

async function api(auth: string, path: string): Promise<Answer> {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers: { authorization: `Bearer ${auth}` } })
  const json = (await response.json().catch(() => ({}))) as Raw
  if (!response.ok || json.success === false) {
    const message = list(json.errors).map((e) => `${e.code} ${e.message}`).join("; ") || response.statusText
    return { ok: false, status: response.status, message }
  }
  return { ok: true, result: json.result, info: json.result_info }
}

/** Every page of a paginated list (page numbers, or R2's cursor). */
async function all(auth: string, path: string, perPage = 50, pick: (result: any) => Raw[] = (r) => list(r)): Promise<Answer> {
  const items: Raw[] = []
  let cursor: string | undefined
  for (let page = 1; page <= 100; page++) {
    const query = `${path}${path.includes("?") ? "&" : "?"}per_page=${perPage}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : `&page=${page}`}`
    const answer = await api(auth, query)
    if (!answer.ok) return answer
    const got = pick(answer.result)
    items.push(...got)
    cursor = answer.info?.cursor || undefined
    if (cursor) continue
    const { total_pages: pages, total_count: total } = answer.info ?? {}
    if (got.length < perPage || (pages !== undefined && page >= pages) || (total !== undefined && items.length >= total)) break
  }
  return { ok: true, result: items }
}

const why = (a: Extract<Answer, { ok: false }>): string => `${a.status === 401 || a.status === 403 ? "no permission" : `error ${a.status}`} (${a.message})`

export async function fetchActual(auth: string, source: "env" | "wrangler", account = ACCOUNT): Promise<Actual> {
  const notChecked: Actual["notChecked"] = {}
  const take = <T>(kinds: Kind[], answer: Answer, map: (result: Raw[]) => T): T | undefined => {
    if (answer.ok) return map(list(answer.result))
    for (const k of kinds) notChecked[k] = why(answer)
    return undefined
  }
  const A = `/accounts/${account}`
  const [zones, scripts, domains, d1, kv, r2, queues, pages, dos, hyperdrive, vectorize, workflows, gateways] = await Promise.all([
    all(auth, `/zones?account.id=${account}`),
    api(auth, `${A}/workers/scripts`),
    api(auth, `${A}/workers/domains`),
    all(auth, `${A}/d1/database`, 100),
    all(auth, `${A}/storage/kv/namespaces`, 100),
    all(auth, `${A}/r2/buckets`, 1000, (r) => list(r?.buckets)),
    all(auth, `${A}/queues`, 100),
    all(auth, `${A}/pages/projects`, 10),
    all(auth, `${A}/workers/durable_objects/namespaces`, 100),
    all(auth, `${A}/hyperdrive/configs`, 20),
    api(auth, `${A}/vectorize/v2/indexes`),
    all(auth, `${A}/workflows`, 100),
    all(auth, `${A}/ai-gateway/gateways`, 50),
  ])
  const actual: Actual = {
    notChecked,
    zones: take(["zone", "route", "dns"], zones, (r) => r.map((z) => ({ id: String(z.id), name: String(z.name) }))),
    customDomains: take(["custom_domain"], domains, (r) => r.map((d) => ({ hostname: String(d.hostname), zone: String(d.zone_name), service: String(d.service) }))),
    d1: take(["d1"], d1, (r) => r.map((d) => ({ id: String(d.uuid), name: String(d.name) }))),
    kv: take(["kv"], kv, (r) => r.map((k) => ({ id: String(k.id), title: String(k.title) }))),
    r2: take(["r2"], r2, (r) => r.map((b) => String(b.name))),
    queues: take(["queue"], queues, (r) => r.map((q) => String(q.queue_name))),
    pages: take(["pages"], pages, (r) => r.map((p) => String(p.name))),
    durableObjects: take(["durable_object"], dos, (r) => r.map((d) => `${d.script}.${d.class}`)),
    hyperdrive: take(["hyperdrive"], hyperdrive, (r) => r.map((h) => String(h.id))),
    vectorize: take(["vectorize"], vectorize, (r) => r.map((v) => String(v.name))),
    workflows: take(["workflow"], workflows, (r) => r.map((w) => String(w.name))),
    aiGateways: take(["ai_gateway"], gateways, (r) => r.map((g) => String(g.id))),
  }

  const names = take(["worker", "cron", "workers_dev", "binding"], scripts, (r) => r.map((s) => String(s.id)))
  if (names)
    actual.workers = await Promise.all(
      names.map(async (name): Promise<ActualWorker> => {
        const s = `${A}/workers/scripts/${encodeURIComponent(name)}`
        const [schedules, subdomain, settings] = await Promise.all([api(auth, `${s}/schedules`), api(auth, `${s}/subdomain`), api(auth, `${s}/settings`)])
        return {
          name,
          crons: schedules.ok ? list(schedules.result?.schedules).map((x) => String(x.cron)) : undefined,
          workersDev: subdomain.ok ? Boolean(subdomain.result?.enabled) : undefined,
          previews: subdomain.ok && typeof subdomain.result?.previews_enabled === "boolean" ? subdomain.result.previews_enabled : undefined,
          bindings: settings.ok ? deployedBindings(list(settings.result?.bindings), name) : undefined,
        }
      }),
    )

  if (actual.zones) {
    const perZone = await Promise.all(actual.zones.map(async (z) => ({ z, routes: await api(auth, `/zones/${z.id}/workers/routes`), dns: await all(auth, `/zones/${z.id}/dns_records`, 100) })))
    const failed = (key: "routes" | "dns") => perZone.map((p) => p[key]).find((a): a is Extract<Answer, { ok: false }> => !a.ok)
    const routeError = failed("routes")
    if (routeError) notChecked.route = why(routeError)
    else actual.routes = perZone.flatMap((p) => list(p.routes.ok && p.routes.result).map((r) => ({ zone: p.z.name, pattern: String(r.pattern), script: r.script ? String(r.script) : null })))
    const dnsError = failed("dns")
    if (dnsError) notChecked.dns = why(dnsError)
    else actual.dns = perZone.flatMap((p) => list(p.dns.ok && p.dns.result).map((r) => ({ zone: p.z.name, name: String(r.name), type: String(r.type) })))
  }

  // wrangler's login has no Access scope, yet the API answers it with an empty list rather than a refusal.
  if (source === "wrangler") notChecked.access = "no permission (wrangler's login has no Access scope and gets an empty list; set CLOUDFLARE_API_TOKEN)"
  else
    actual.access = take(["access"], await all(auth, `${A}/access/apps`, 100), (r) =>
      r.map((a) => ({
        name: String(a.name),
        aud: String(a.aud ?? ""),
        domains: [...new Set([a.domain, ...list(a.self_hosted_domains), ...list(a.destinations).map((d) => d.uri)].filter((d): d is string => typeof d === "string" && d.length > 0))],
      })),
    )
  return actual
}

const BINDING_TYPES: Record<string, Binding["type"]> = { d1: "d1", kv_namespace: "kv", r2_bucket: "r2", queue: "queue", service: "service", durable_object_namespace: "durable_object", hyperdrive: "hyperdrive", vectorize: "vectorize", workflow: "workflow" }

/** The resource bindings of a deployed Worker, in the config's terms (variables, secrets, assets, AI and rate limits are no account resource). */
export function deployedBindings(bindings: Raw[], script: string): Binding[] {
  return bindings.flatMap((b): Binding[] => {
    const type = BINDING_TYPES[b.type]
    if (!type) return []
    const target =
      type === "d1" ? (b.database_id ?? b.id)
      : type === "kv" ? b.namespace_id
      : type === "r2" ? b.bucket_name
      : type === "queue" ? (b.queue_name ?? b.queue)
      : type === "service" ? b.service
      : type === "durable_object" ? `${b.script_name ?? script}.${b.class_name}`
      : type === "hyperdrive" ? b.id
      : type === "vectorize" ? b.index_name
      : b.workflow_name
    return [{ type, binding: String(b.name), target: target === undefined ? undefined : String(target) }]
  })
}

// ---------------------------------------------------------------------------------------------------------------- the report

const MARK: Record<Status, string> = { owned: "✓", external: "✓", unowned: "✗", missing: "!", drift: "≠", not_checked: "?" }
const TITLE: Record<Kind, string> = {
  zone: "Zones",
  worker: "Workers",
  route: "Routes",
  custom_domain: "Custom domains",
  cron: "Cron Triggers",
  workers_dev: "workers.dev and preview URLs",
  binding: "Bindings (deployed vs config)",
  d1: "D1 databases",
  kv: "KV namespaces",
  r2: "R2 buckets",
  queue: "Queues",
  pages: "Pages projects",
  durable_object: "Durable Object namespaces",
  hyperdrive: "Hyperdrive configs",
  vectorize: "Vectorize indexes",
  workflow: "Workflows",
  ai_gateway: "AI Gateways",
  dns: "DNS records",
  access: "Access applications",
}

export function render(rows: Row[]): string {
  const out: string[] = []
  for (const kind of KINDS) {
    const these = rows.filter((r) => r.kind === kind)
    out.push(`\n${TITLE[kind]}`)
    if (!these.length) out.push("  (none)")
    const width = Math.min(44, Math.max(0, ...these.map((r) => r.resource.length)))
    for (const r of these) out.push(`  ${MARK[r.status]} ${r.resource.padEnd(width)}  ${r.status.replace("_", " ").padEnd(12)}${[r.owner, r.detail].filter(Boolean).join(" — ")}`.trimEnd())
  }
  const count = (s: Status) => rows.filter((r) => r.status === s).length
  out.push(`\n${count("owned")} owned, ${count("external")} external, ${count("unowned")} unowned, ${count("drift")} drift, ${count("missing")} missing, ${count("not_checked")} not checked`)
  return out.join("\n")
}

export function readAllow(file = join(ROOT, "scripts/cf-audit.allow.json")): AllowEntry[] {
  if (!existsSync(file)) return []
  const entries = list((JSON.parse(readFileSync(file, "utf8")) as Raw).external) as AllowEntry[]
  for (const e of entries) {
    if (!KINDS.includes(e.kind)) throw new Error(`${relative(ROOT, file)}: unknown kind "${e.kind}" (one of ${KINDS.join(", ")})`)
    if (!e.name || !e.reason) throw new Error(`${relative(ROOT, file)}: every entry needs a name and a reason (${JSON.stringify(e)})`)
  }
  return entries
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { json: { type: "boolean", default: false } } })
  const configs = findConfigs()
  const allow = readAllow()
  const { token: auth, source } = token()
  const rows = audit(configs, await fetchActual(auth, source), allow)
  if (values.json) console.log(JSON.stringify({ account: ACCOUNT, token: source, configs: configs.map((c) => c.file), failing: failing(rows), rows }, null, 2))
  else {
    console.log(`Cloudflare account ${ACCOUNT} (token: ${source === "env" ? "CLOUDFLARE_API_TOKEN" : "wrangler login"}), ${configs.length} wrangler.jsonc files`)
    console.log(render(rows))
  }
  process.exitCode = failing(rows) ? 1 : 0
}
