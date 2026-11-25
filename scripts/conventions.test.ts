// What every workspace of the repository keeps to, so the shared setup (README «Shared setup») stays shared: each has `test` and `typecheck`, its
// tsconfig reaches the shared strictness (`@lmfaole/worker/tsconfig.base.json`), a dependency named by more than one has the same range in each, each
// `wrangler.jsonc` is as `@lmfaole/worker/conventions` says, and every workflow that deploys does it through the shared ones (`astro-app.yml` for an
// app, `worker.yml` for a Worker). `KNOWN` holds what does not yet, each with why: it must stay exactly so, so a fix fails here until its line goes.
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, dirname, join, relative } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import { parseJsonc, workerProblems, wranglerProblems } from "@lmfaole/worker/conventions"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const BASE = "packages/worker/tsconfig.base.json"
const REUSABLE = ["astro-app.yml", "worker.yml"]

interface Manifest {
  name?: string
  workspaces?: string[]
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/** What does not keep to the conventions yet, by what it is. */
const KNOWN = {
  // TODO: startside (Next.js) has its own tsconfig, looser than the base (no noUncheckedIndexedAccess, exactOptionalPropertyTypes, …).
  tsconfigs: ["apps/startside/tsconfig.json"],
  looser: {
    // TODO: 17 errors in the design system's components with it (an optional prop given `undefined`).
    "packages/designsystem/tsconfig.json": ["exactOptionalPropertyTypes"],
  } as Record<string, string[]>,
  ranges: {
    // TODO: startside's ranges are its own (newer @types/node; older tailwindcss and wrangler floors; typescript ^ for ~).
    "@types/node": ["apps/startside"],
    tailwindcss: ["apps/startside"],
    wrangler: ["apps/startside"],
    // The design system type-checks with TypeScript 6 (`@typescript/typescript6`), which Storybook's and Vite's tooling read; startside: TODO, above.
    typescript: ["packages/designsystem", "apps/startside"],
  } as Record<string, string[]>,
  wrangler: {
    // Only the files of Storybook (`assets`, no script): nothing to log, no Node APIs.
    "packages/designsystem": ["observability is not enabled", "compatibility_flags has no nodejs_compat"],
  } as Record<string, string[]>,
  workflows: {
    // Storybook's build is not an app's (astro-app.yml) or a Worker's (worker.yml).
    "designsystem-storybook.yml": "packages/designsystem",
  } as Record<string, string>,
}

/** A Worker named otherwise than its directory. */
const NAMES: Record<string, string> = {
  // The relay keeps the name (and with it the secrets and the apps' bindings) of medier's old relay (workers/relay/wrangler.jsonc).
  "workers/relay": "medier-upstream",
}

/** The base of a Worker with pages that is not an app (no astro.config.ts or next.config.*): Storybook, under lmfaole.party/design/. */
const BASES: Record<string, string> = { "packages/designsystem": "/design" }

const read = (path: string): string => readFileSync(join(ROOT, path), "utf8")
const manifest = (dir: string): Manifest => JSON.parse(read(`${dir}/package.json`)) as Manifest

const workspaces = (manifest(".").workspaces ?? []).flatMap((pattern) => {
  const parent = pattern.replace(/\/\*$/, "")
  return readdirSync(join(ROOT, parent))
    .map((name) => `${parent}/${name}`)
    .filter((dir) => existsSync(join(ROOT, dir, "package.json")))
    .toSorted()
})
const byName = new Map(workspaces.map((dir) => [manifest(dir).name, dir]))

test("the workspaces are found", () => {
  for (const dir of ["packages/web", "packages/worker", "apps/cv", "workers/scheduler"]) assert.ok(workspaces.includes(dir), dir)
})

test("every workspace is tested and type-checked", () => {
  for (const dir of workspaces) {
    const { scripts = {} } = manifest(dir)
    for (const script of ["test", "typecheck"]) assert.ok(script in scripts, `${dir}: no ${script} script`)
  }
})

/** Where a tsconfig's `extends` leads in the repository: a path, or a workspace's file by its package name; a package outside it (`astro/…`) is left out. */
function extended(file: string): string[] {
  const { extends: parents = [] } = parseJsonc(read(file)) as { extends?: string | string[] }
  return [parents]
    .flat()
    .map((parent) => {
      if (parent.startsWith(".")) return relative(ROOT, join(ROOT, dirname(file), parent))
      const [scope = "", name = "", ...rest] = parent.split("/")
      const dir = byName.get(`${scope}/${name}`)
      return dir === undefined ? undefined : `${dir}/${rest.join("/")}`
    })
    .filter((path) => path !== undefined)
}

function reachesBase(file: string, seen = new Set<string>()): boolean {
  if (file === BASE) return true
  if (seen.has(file) || !existsSync(join(ROOT, file))) return false
  seen.add(file)
  return extended(file).some((parent) => reachesBase(parent, seen))
}

test("every tsconfig has the shared strictness", () => {
  const tsconfigs = [...workspaces.map((dir) => `${dir}/tsconfig.json`).filter((file) => existsSync(join(ROOT, file))), "scripts/tsconfig.json", "tsconfig.base.json"]
  const looser = tsconfigs.filter((file) => !reachesBase(file))
  assert.deepEqual(looser, KNOWN.tsconfigs, "these do not extend @lmfaole/worker/tsconfig.base.json (or what extends it)")
})

test("no tsconfig turns off what the shared one turns on", () => {
  const { compilerOptions: base = {} } = parseJsonc(read(BASE)) as { compilerOptions?: Record<string, unknown> }
  const strict = Object.keys(base).filter((option) => base[option] === true && !["noEmit", "skipLibCheck", "allowImportingTsExtensions"].includes(option))
  const files = [...workspaces.flatMap((dir) => readdirSync(join(ROOT, dir)).filter((file) => /^tsconfig.*\.json$/.test(file)).map((file) => `${dir}/${file}`)), "scripts/tsconfig.json"]
  const looser: Record<string, string[]> = {}
  for (const file of files) {
    const { compilerOptions = {} } = parseJsonc(read(file)) as { compilerOptions?: Record<string, unknown> }
    const off = strict.filter((option) => compilerOptions[option] === false)
    if (off.length > 0) looser[file] = off
  }
  assert.deepEqual(looser, KNOWN.looser)
})

test("a dependency named by more than one workspace has the same range in each", () => {
  const ranges = new Map<string, Map<string, string>>()
  for (const dir of [".", ...workspaces]) {
    const { dependencies = {}, devDependencies = {} } = manifest(dir)
    for (const [name, range] of Object.entries({ ...devDependencies, ...dependencies })) {
      // A workspace (`*`) is the one in the repository.
      if (range !== "*") ranges.set(name, (ranges.get(name) ?? new Map<string, string>()).set(dir, range))
    }
  }
  const mismatches: Record<string, string[]> = {}
  for (const [name, byDir] of ranges) {
    const counts = new Map<string, number>()
    for (const range of byDir.values()) counts.set(range, (counts.get(range) ?? 0) + 1)
    if (counts.size < 2) continue
    const usual = [...counts].toSorted((a, b) => b[1] - a[1])[0]?.[0]
    mismatches[name] = [...byDir].filter(([, range]) => range !== usual).map(([dir]) => dir)
  }
  assert.deepEqual(mismatches, KNOWN.ranges, "the workspaces whose range differs from the others'")
})

test("every wrangler.jsonc is as the conventions say", () => {
  for (const dir of workspaces) {
    if (!existsSync(join(ROOT, dir, "wrangler.jsonc"))) continue
    const config = parseJsonc(read(`${dir}/wrangler.jsonc`)) as Record<string, unknown>
    let problems: string[]
    if (dir.startsWith("workers/")) problems = workerProblems(config, NAMES[dir] ?? basename(dir))
    else {
      // An app's base: Astro's `base`, Next.js's `basePath`; none is the origin's root.
      const site = ["astro.config.ts", "next.config.ts", "next.config.mjs"].find((file) => existsSync(join(ROOT, dir, file)))
      const base = site === undefined ? (BASES[dir] ?? `/${basename(dir)}`) : (/\bbase(?:Path)?: ['"]([^'"]*)['"]/.exec(read(`${dir}/${site}`))?.[1] ?? "")
      problems = wranglerProblems(config, base)
    }
    assert.deepEqual(problems, KNOWN.wrangler[dir] ?? [], `${dir}/wrangler.jsonc`)
  }
})

test("every workflow that deploys does it through astro-app.yml or worker.yml, and every app and Worker is deployed by one", () => {
  const workflows = readdirSync(join(ROOT, ".github/workflows")).filter((file) => file.endsWith(".yml") && !REUSABLE.includes(file))
  const deployed = new Set<string>()
  for (const file of workflows) {
    const text = read(`.github/workflows/${file}`)
    const call = /uses: \.\/\.github\/workflows\/(?:astro-app|worker)\.yml\s+with:\s+(?:app|worker): (\S+)/.exec(text)
    if (call?.[1] !== undefined) deployed.add(call[1])
    else if (/wrangler deploy|npm run deploy/.test(text)) {
      assert.ok(file in KNOWN.workflows, `${file} deploys with its own steps`)
      deployed.add(KNOWN.workflows[file] ?? "")
    }
  }
  for (const dir of workspaces) {
    if (/^(apps|workers)\//.test(dir) && "deploy" in (manifest(dir).scripts ?? {})) assert.ok(deployed.has(dir), `${dir} is deployed by no workflow`)
  }
  for (const [file, dir] of Object.entries(KNOWN.workflows)) assert.ok(deployed.has(dir) && workflows.includes(file), `${file} (KNOWN) is gone or no longer deploys`)
})
