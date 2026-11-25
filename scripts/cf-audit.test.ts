import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { audit, deployedBindings, failing, fetchActual, parseJsonc, readAllow, readConfig, type Actual, type Get, type Row } from "./cf-audit.ts"

const ZONE = { id: "z1", name: "lmfaole.party" }
const site = readConfig("apps/site/wrangler.jsonc", {
  name: "site",
  workers_dev: false,
  routes: [{ pattern: "lmfaole.party/*", zone_name: "lmfaole.party" }],
  kv_namespaces: [{ binding: "STATE" }],
  vars: { ACCESS_AUD: "aud-1", AI_GATEWAY: "default" },
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

  it("owns an Access application by its audience or by the most specific route reaching its domain", () => {
    const actual = clean()
    actual.access!.push({ name: "Files", aud: "aud-2", domains: ["lmfaole.party/_next"] }, { name: "Old", aud: "aud-3", domains: ["www.lmfaole.party"] })
    assert.deepEqual(problems(audit(configs, actual)), ["d1 missing library", "access unowned Old"])
    const start = readConfig("apps/start/wrangler.jsonc", { name: "start", main: "w.ts", routes: [{ pattern: "lmfaole.party/start*", zone_name: "lmfaole.party" }] })
    const icons = { name: "Start icons", aud: "aud-4", domains: ["lmfaole.party/start/icon.png", "lmfaole.party/start/icons"] }
    assert.equal(audit([...configs, start], { ...clean(), access: [icons] }).find((r) => r.resource === "Start icons")?.owner, "apps/start/wrangler.jsonc")
    assert.deepEqual(problems(audit(configs, { ...clean(), access: [] })), ["d1 missing library", "access missing ACCESS_AUD aud-1…"])
  })

  it("reports a kind the token may not read as not checked, without failing", () => {
    const rows = audit(configs, { ...clean(), dns: undefined, notChecked: { dns: "no permission" } })
    assert.deepEqual(rows.find((r) => r.kind === "dns"), { kind: "dns", status: "not_checked", resource: "*", detail: "no permission" })
    assert.equal(failing(rows), false)
  })
})

describe("DNS records", () => {
  const record = (name: string, type: string, content: string, proxied?: boolean) => ({ zone: "lmfaole.party", name, type, content, proxied })
  const dns = [
    record("lmfaole.party", "CNAME", "lmfaole.example", true),
    record("lmfaole.party", "MX", "mail.protonmail.ch"),
    record("lmfaole.party", "TXT", "v=spf1 include:_spf.protonmail.ch ~all"),
    record("lmfaole.party", "TXT", "google-site-verification=abc"),
    record("www.lmfaole.party", "CNAME", "party.example", true),
    record("old.lmfaole.party", "A", "192.0.2.1", false),
  ]
  const allow = [
    { kind: "dns" as const, name: "lmfaole.party MX", reason: "mail" },
    { kind: "dns" as const, name: "lmfaole.party TXT v=spf1", reason: "SPF" },
    { kind: "dns" as const, name: "www.lmfaole.party", reason: "kept" },
    { kind: "dns" as const, name: "_dmarc.lmfaole.party TXT", reason: "DMARC" },
  ]

  it("owns the proxied records a route runs on, and needs the allow-list for mail, verification and other hosts", () => {
    const rows = audit(configs, { ...clean(), dns }, allow).filter((r) => r.kind === "dns")
    assert.deepEqual(
      rows.map((r) => `${r.status} ${r.resource}`),
      [
        "unowned lmfaole.party TXT google-site-verification=abc",
        "unowned old.lmfaole.party A 192.0.2.1",
        "missing _dmarc.lmfaole.party TXT",
        "external lmfaole.party MX mail.protonmail.ch",
        "external lmfaole.party TXT v=spf1 include:_spf.protonmail.ch ~all",
        "external www.lmfaole.party CNAME party.example",
        "owned lmfaole.party CNAME lmfaole.example",
      ],
    )
    assert.equal(rows[0]!.detail, "no Worker needs a TXT record")
  })

  it("flags a record a route needs that is not proxied", () => {
    const rows = audit(configs, { ...clean(), dns: [record("lmfaole.party", "A", "192.0.2.1", false)] })
    assert.deepEqual(problems(rows), ["d1 missing library", "dns drift lmfaole.party A 192.0.2.1"])
  })
})

/** Cloudflare's API as the official docs shape its answers, one fixture per path (query left out); a number answers with that error status. */
function cloudflare(answers: Record<string, unknown>): { get: Get; asked: string[] } {
  const asked: string[] = []
  const get: Get = async (url) => {
    const { pathname, searchParams } = new URL(url)
    const path = pathname.replace("/client/v4", "") + (searchParams.has("account.id") ? `?account.id=${searchParams.get("account.id")}` : "")
    asked.push(path)
    if (!(path in answers)) throw new Error(`no fixture for ${path}`)
    const answer = answers[path]
    if (typeof answer === "number")
      return Response.json({ success: false, errors: [{ code: 10000, message: "Authentication error" }], messages: [], result: null }, { status: answer })
    const result = answer
    const info = Array.isArray(result) ? { result_info: { page: 1, per_page: 100, count: result.length, total_count: result.length, total_pages: 1 } } : {}
    return Response.json({ success: true, errors: [], messages: [], result, ...info })
  }
  return { get, asked }
}

describe("reading Cloudflare", () => {
  const A = "/accounts/acc"
  const Z = "af1e25a6c6cc76a5bf403946bfe7ebb4"
  const answers = (): Record<string, unknown> => ({
    "/zones?account.id=acc": [{ id: Z, name: "lmfaole.party", status: "active", account: { id: "acc", name: "lmfaole" } }],
    [`${A}/workers/scripts`]: [{ id: "site", created_on: "2026-01-01T00:00:00Z" }, { id: "scheduler" }],
    [`${A}/workers/scripts/site/schedules`]: { schedules: [] },
    [`${A}/workers/scripts/site/subdomain`]: { enabled: false, previews_enabled: false },
    [`${A}/workers/scripts/site/settings`]: { bindings: [{ name: "STATE", type: "kv_namespace", namespace_id: "kv-1" }, { name: "AI", type: "ai" }] },
    [`${A}/workers/scripts/scheduler/schedules`]: { schedules: [{ cron: "*/15 * * * *", created_on: "2026-01-01T00:00:00Z" }] },
    [`${A}/workers/scripts/scheduler/subdomain`]: { enabled: false, previews_enabled: false },
    [`${A}/workers/scripts/scheduler/settings`]: { bindings: [{ name: "SITE", type: "service", service: "site", environment: "production" }] },
    [`${A}/workers/domains`]: [],
    [`${A}/d1/database`]: [],
    [`${A}/storage/kv/namespaces`]: [{ id: "kv-1", title: "site-state", supports_url_encoding: true }],
    [`${A}/r2/buckets`]: { buckets: [] },
    [`${A}/queues`]: [],
    [`${A}/pages/projects`]: [],
    [`${A}/workers/durable_objects/namespaces`]: [],
    [`${A}/hyperdrive/configs`]: [],
    [`${A}/vectorize/v2/indexes`]: [],
    [`${A}/workflows`]: [],
    [`${A}/ai-gateway/gateways`]: [
      { id: "default", internal_id: "6d7e…", cache_invalidate_on_update: false, cache_ttl: 0, collect_logs: true, rate_limiting_interval: 0, rate_limiting_limit: 0, authentication: true, created_at: "2026-01-01T00:00:00Z", modified_at: "2026-01-01T00:00:00Z" },
    ],
    [`/zones/${Z}/workers/routes`]: [{ id: "r1", pattern: "lmfaole.party/*", script: "site" }],
    [`/zones/${Z}/dns_records`]: [
      { id: "d1", name: "lmfaole.party", type: "CNAME", content: "lmfaole.example", proxiable: true, proxied: true, ttl: 1, settings: {}, meta: {}, tags: [] },
      { id: "d2", name: "lmfaole.party", type: "MX", content: "mail.protonmail.ch", priority: 10, proxiable: false, proxied: false, ttl: 1 },
      { id: "d3", name: "lmfaole.party", type: "TXT", content: '"v=spf1 include:_spf.protonmail.ch ~all"', proxiable: false, proxied: false, ttl: 1 },
      { id: "d4", name: "_dmarc.lmfaole.party", type: "TXT", content: '"v=DMARC1; p=quarantine"', proxiable: false, proxied: false, ttl: 1 },
    ],
    [`${A}/access/apps`]: [
      { id: "a1", uid: "a1", aud: "aud-1", name: "Site", type: "self_hosted", domain: "lmfaole.party/start", self_hosted_domains: ["lmfaole.party/start"], destinations: [{ type: "public", uri: "lmfaole.party/start" }] },
      { id: "a2", aud: "aud-9", name: "party", type: "self_hosted", domain: "www.lmfaole.party", destinations: [{ type: "public", uri: "www.lmfaole.party" }] },
    ],
  })
  const allow = [
    { kind: "dns" as const, name: "lmfaole.party MX", reason: "mail" },
    { kind: "dns" as const, name: "lmfaole.party TXT v=spf1", reason: "SPF" },
    { kind: "dns" as const, name: "_dmarc.lmfaole.party TXT", reason: "DMARC" },
    { kind: "access" as const, name: "party", reason: "kept" },
  ]

  it("reads DNS, Access and AI Gateway with an API token, and the account passes", async () => {
    const actual = await fetchActual("token", "env", "acc", cloudflare(answers()).get)
    assert.deepEqual(actual.notChecked, {})
    assert.deepEqual(actual.aiGateways, ["default"])
    assert.deepEqual(actual.dns![2], { zone: "lmfaole.party", name: "lmfaole.party", type: "TXT", content: "v=spf1 include:_spf.protonmail.ch ~all", proxied: undefined })
    assert.deepEqual(actual.access![0], { name: "Site", aud: "aud-1", domains: ["lmfaole.party/start"] })
    const rows = audit(configs, actual, allow)
    assert.deepEqual(problems(rows), ["d1 missing library"])
    assert.deepEqual(
      rows.filter((r) => ["ai_gateway", "dns", "access"].includes(r.kind)).map((r) => `${r.kind} ${r.status} ${r.resource}`),
      [
        "ai_gateway owned default",
        "dns external _dmarc.lmfaole.party TXT v=DMARC1; p=quarantine",
        "dns external lmfaole.party MX mail.protonmail.ch",
        "dns external lmfaole.party TXT v=spf1 include:_spf.protonmail.ch ~all",
        "dns owned lmfaole.party CNAME lmfaole.example",
        "access external party",
        "access owned Site",
      ],
    )
  })

  it("reports what the token may not read as not checked, and does not ask wrangler's login for Access", async () => {
    const refused = { ...answers(), [`/zones/${Z}/dns_records`]: 403, [`${A}/ai-gateway/gateways`]: 403 }
    const env = await fetchActual("token", "env", "acc", cloudflare(refused).get)
    assert.equal(env.notChecked.dns, "no permission (10000 Authentication error)")
    assert.equal(env.notChecked.ai_gateway, "no permission (10000 Authentication error)")
    const rows = audit(configs, env, allow)
    assert.equal(failing(rows), false)
    assert.deepEqual(rows.filter((r) => r.kind === "dns").map((r) => r.status), ["not_checked"])

    const { get, asked } = cloudflare(refused)
    const wrangler = await fetchActual("token", "wrangler", "acc", get)
    assert.match(wrangler.notChecked.access!, /^no permission/)
    assert.equal(asked.includes(`${A}/access/apps`), false)
  })

  it("follows the pages of a long list", async () => {
    const records = Array.from({ length: 150 }, (_, i) => ({ id: `d${i}`, name: `h${i}.lmfaole.party`, type: "A", content: "192.0.2.1", proxiable: true, proxied: true }))
    const base = cloudflare(answers()).get
    const get: Get = async (url, init) => {
      const u = new URL(url)
      if (!u.pathname.endsWith("/dns_records")) return base(url, init)
      const page = Number(u.searchParams.get("page"))
      const perPage = Number(u.searchParams.get("per_page"))
      const result = records.slice((page - 1) * perPage, page * perPage)
      return Response.json({ success: true, errors: [], messages: [], result, result_info: { page, per_page: perPage, count: result.length, total_count: records.length, total_pages: Math.ceil(records.length / perPage) } })
    }
    assert.equal((await fetchActual("token", "env", "acc", get)).dns!.length, 150)
  })
})

describe("the allow-list", () => {
  it("is valid and gives every entry a reason", () => {
    assert.ok(readAllow().length > 0)
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
