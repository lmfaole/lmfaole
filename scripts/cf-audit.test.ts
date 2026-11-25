import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { audit, deployedBindings, failing, parseJsonc, readConfig, type Actual, type Row } from "./cf-audit.ts"

const ZONE = { id: "z1", name: "lmfaole.party" }
const site = readConfig("apps/site/wrangler.jsonc", {
  name: "site",
  workers_dev: false,
  routes: [{ pattern: "lmfaole.party/*", zone_name: "lmfaole.party" }],
  kv_namespaces: [{ binding: "STATE" }],
  vars: { ACCESS_AUD: "aud-1" },
})
const scheduler = readConfig("workers/scheduler/wrangler.jsonc", { name: "scheduler", main: "src/worker.ts", workers_dev: false, triggers: { crons: ["*/15 * * * *"] }, services: [{ binding: "SITE", service: "site" }] })
const db = readConfig("packages/db/wrangler.jsonc", { name: "db", d1_databases: [{ binding: "LIBRARY", database_name: "library", database_id: "library-not-created-yet" }] })
const configs = [site, scheduler, db]

/** The account as the configs want it. */
const clean = (): Actual => ({
  notChecked: {},
  zones: [ZONE],
  workers: [
    { name: "site", workersDev: false, crons: [], bindings: [{ type: "kv", binding: "STATE", target: "kv-1" }] },
    { name: "scheduler", workersDev: false, crons: ["*/15 * * * *"], bindings: [{ type: "service", binding: "SITE", target: "site" }] },
  ],
  routes: [{ zone: "lmfaole.party", pattern: "lmfaole.party/*", script: "site" }],
  customDomains: [],
  d1: [],
  kv: [{ id: "kv-1", title: "site-state" }],
  r2: [],
  access: [{ name: "Site", aud: "aud-1", domains: ["lmfaole.party"] }],
})
const problems = (rows: Row[]) => rows.filter((r) => r.status !== "owned" && r.status !== "external").map((r) => `${r.kind} ${r.status} ${r.resource}`)

describe("wrangler.jsonc", () => {
  it("reads comments and trailing commas, but not inside strings", () => {
    const text = `{
      // a comment, with "quotes"
      "name": "a", /* block */
      "url": "https://x.example/*, ]",
      "routes": [{ "pattern": "x/*", },],
    }`
    assert.deepEqual(parseJsonc(text), { name: "a", url: "https://x.example/*, ]", routes: [{ pattern: "x/*" }] })
  })

  it("knows a Worker from a file that only holds resources, and wrangler's workers.dev default", () => {
    assert.equal(db.worker, false)
    assert.equal(readConfig("a/wrangler.jsonc", { name: "astro" }, true).worker, true)
    assert.equal(readConfig("a/wrangler.jsonc", { name: "cron", main: "w.ts" }).workersDev, true)
    assert.equal(readConfig("a/wrangler.jsonc", { name: "r", main: "w.ts", routes: ["a.b/*"] }).workersDev, false)
  })
})

describe("the audit", () => {
  it("passes when Cloudflare is what the configs say, and resolves a KV binding without an id through the deployed Worker", () => {
    const rows = audit(configs, clean())
    assert.deepEqual(problems(rows), ["d1 missing library"])
    assert.equal(failing(rows), false)
    assert.deepEqual(rows.find((r) => r.kind === "kv"), { kind: "kv", status: "owned", resource: "site-state", owner: "apps/site/wrangler.jsonc (STATE)" })
  })

  it("flags what has no owner, and lets the allow-list keep it with a reason", () => {
    const actual = clean()
    actual.zones!.push({ id: "z2", name: "other.games" })
    actual.workers!.push({ name: "other-api", workersDev: false, crons: ["0 * * * *"] }, { name: "stray", workersDev: true, crons: [] })
    actual.routes!.push({ zone: "other.games", pattern: "other.games/*", script: "other-api" }, { zone: "lmfaole.party", pattern: "lmfaole.party/old*", script: null })
    actual.kv!.push({ id: "kv-2", title: "leftover" })
    const allow = [
      { kind: "zone" as const, name: "other.games", reason: "elsewhere" },
      { kind: "worker" as const, name: "other-api", reason: "elsewhere" },
      { kind: "d1" as const, name: "gone", reason: "deleted since" },
    ]
    const rows = audit(configs, actual, allow)
    assert.deepEqual(problems(rows), ["worker unowned stray", "route unowned lmfaole.party/old* → (no Worker)", "d1 missing gone", "d1 missing library", "kv unowned leftover"])
    assert.deepEqual(
      rows.filter((r) => r.status === "external").map((r) => `${r.kind} ${r.resource}`),
      ["zone other.games", "worker other-api", "route other.games/* → other-api", "cron other-api: 0 * * * *"],
    )
    assert.equal(failing(rows), true)
  })

  it("flags crons outside the scheduler, workers.dev left on, and routes and bindings on one side only", () => {
    const actual = clean()
    actual.workers![0] = { name: "site", workersDev: true, crons: ["0 3 * * *"], bindings: [{ type: "kv", binding: "STATE", target: "kv-1" }, { type: "r2", binding: "OLD", target: "bucket" }] }
    actual.workers![1]!.crons = ["*/5 * * * *"]
    actual.routes = [{ zone: "lmfaole.party", pattern: "lmfaole.party/*", script: "scheduler" }]
    assert.deepEqual(problems(audit(configs, actual)), [
      "route drift lmfaole.party/* → scheduler",
      "cron drift scheduler: */15 * * * *",
      "cron drift scheduler: */5 * * * *",
      "cron drift site: 0 3 * * *",
      "workers_dev drift site",
      "binding drift site.OLD (r2)",
      "d1 missing library",
    ])
  })

  it("tells a resource not created yet from one whose id the config lacks", () => {
    const notDeployed = audit(configs, { ...clean(), workers: [clean().workers![1]!], routes: [], kv: [] })
    assert.deepEqual(problems(notDeployed), ["worker missing site", "route missing lmfaole.party/* → site", "binding missing scheduler.SITE (service)", "d1 missing library", "kv missing site.STATE"])
    const created = audit(configs, { ...clean(), d1: [{ id: "11111111-2222-3333-4444-555555555555", name: "library" }] })
    assert.deepEqual(problems(created), ["d1 drift library"])
  })

  it("owns an Access application by its audience or by a route reaching its domain", () => {
    const actual = clean()
    actual.access!.push({ name: "Files", aud: "aud-2", domains: ["lmfaole.party/_next"] }, { name: "Old", aud: "aud-3", domains: ["www.lmfaole.party"] })
    assert.deepEqual(problems(audit(configs, actual)), ["d1 missing library", "access unowned Old"])
    assert.deepEqual(problems(audit(configs, { ...clean(), access: [] })), ["d1 missing library", "access missing ACCESS_AUD aud-1…"])
  })

  it("reports a kind the token may not read as not checked, without failing", () => {
    const rows = audit(configs, { ...clean(), dns: undefined, notChecked: { dns: "no permission" } })
    assert.deepEqual(rows.find((r) => r.kind === "dns"), { kind: "dns", status: "not_checked", resource: "*", detail: "no permission" })
    assert.equal(failing(rows), false)
  })
})

describe("deployed bindings", () => {
  it("keeps the account resources and drops variables, secrets and assets", () => {
    const got = deployedBindings(
      [
        { name: "DB", type: "d1", database_id: "d-1", id: "d-1" },
        { name: "STATE", type: "kv_namespace", namespace_id: "k-1" },
        { name: "UP", type: "service", service: "up", environment: "production" },
        { name: "X", type: "plain_text", text: "1" },
        { name: "ASSETS", type: "assets" },
      ],
      "w",
    )
    assert.deepEqual(got, [
      { type: "d1", binding: "DB", target: "d-1" },
      { type: "kv", binding: "STATE", target: "k-1" },
      { type: "service", binding: "UP", target: "up" },
    ])
  })
})
