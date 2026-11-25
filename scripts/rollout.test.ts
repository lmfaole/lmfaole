import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { fillIds, importDays, importEstimate, missingBindings, parseEnv, pendingMigrations, placeholders, quota, reportedToday, selectSteps, STEPS, toUpload } from "./rollout.ts"

describe("placeholder ids", () => {
  const config = `{
  // Fill in the ids printed by \`npx wrangler d1 create library\`
  "d1_databases": [
    { "binding": "LIBRARY", "database_name": "library", "database_id": "library-not-created-yet" },
    { "binding": "SITE", "database_name": "site", "database_id": "site-not-created-yet" },
    { "binding": "OTHER", "database_name": "other", "database_id": "other-not-created-yet" }
  ]
}`

  it("finds each name once", () => {
    assert.deepEqual(placeholders(config + config), ["library", "site", "other"])
  })

  it("replaces the ones it has an id for and keeps the rest", () => {
    const { text, filled, left } = fillIds(config, { library: "11111111-aaaa", site: "22222222-bbbb" })
    assert.match(text, /"database_id": "11111111-aaaa" \}/)
    assert.match(text, /"database_id": "22222222-bbbb" \}/)
    assert.match(text, /"other-not-created-yet"/)
    assert.match(text, /\/\/ Fill in the ids/)
    assert.deepEqual(filled, ["library", "site"])
    assert.deepEqual(left, ["other"])
  })

  it("leaves a config without placeholders as it is", () => {
    const done = fillIds(config, { library: "x", site: "y", other: "z" }).text
    assert.deepEqual(fillIds(done, { library: "q" }), { text: done, filled: [], left: [] })
  })
})

describe("quota", () => {
  it("gives import the room under --max-day and backfill what is left less the margin", () => {
    assert.deepEqual(quota(10_000), { used: 10_000, remaining: 90_000, importRoom: 75_000, backfillMax: 80_000 })
    assert.deepEqual(quota(91_465), { used: 91_465, remaining: 8_535, importRoom: 0, backfillMax: 3_535 })
    assert.deepEqual(quota(120_000), { used: 120_000, remaining: 0, importRoom: 0, backfillMax: 0 })
  })

  it("counts the days an import takes", () => {
    assert.equal(importDays(0, 0), 0)
    assert.equal(importDays(25_000, 0), 1)
    assert.equal(importDays(25_000, 70_000), 2)
    assert.equal(importDays(25_000, 91_000), 1) // no room today: one day, from tomorrow
    assert.equal(importDays(200_000, 0), 3)
  })
})

describe("choosing steps", () => {
  const names = STEPS.map((s) => s.name)

  it("runs all, from one on, or only some in their own order", () => {
    assert.deepEqual(selectSteps(names, {}), names)
    assert.deepEqual(selectSteps(names, { from: "backfill" }), ["backfill", "audit", "final"])
    assert.deepEqual(selectSteps(names, { only: "import, import-dry" }), ["import-dry", "import"])
  })

  it("refuses an unknown step, and --from with --only", () => {
    assert.throws(() => selectSteps(names, { only: "deploy" }), /no step "deploy"/)
    assert.throws(() => selectSteps(names, { from: "quota", only: "audit" }), /don't go together/)
  })

  it("deploys catalog before its secrets and scheduler after", () => {
    assert.ok(names.indexOf("deploy-catalog") < names.indexOf("catalog-secrets"))
    assert.ok(names.indexOf("catalog-secrets") < names.indexOf("deploy-scheduler"))
  })
})

describe("reading the tools' output", () => {
  it("reads wrangler's pending migrations", () => {
    const out = `Migrations to be applied:
┌───────────────────────┐
│ Name                  │
├───────────────────────┤
│ 0002_dump_history.sql │
├───────────────────────┤
│ 0003_more.sql         │
└───────────────────────┘`
    assert.deepEqual(pendingMigrations(out), ["0002_dump_history.sql", "0003_more.sql"])
    assert.deepEqual(pendingMigrations("✅ No migrations to apply!"), [])
  })

  it("reads import-dump's estimate", () => {
    const out = `table                              source     kept     done  to write    later  rows billed      ~bytes
site/cv_person                          1        1        0         1        0            1          60
music/listens                     174,946   92,463        0    15,185   77,278       15,185   2,613,733
                                (up to the worker's cursor 2021-06-03T08:38:02.000Z; "later" waits for it)

per database:
  site            629 rows,      629 rows billed, ~0.05 MB
  gameplay      1,446 rows,    1,950 rows billed, ~0.17 MB
  all          25,799 rows billed: 1 day(s) at --max-day 85,000 (less what the crons write)`
    assert.deepEqual(importEstimate(out), { all: 25_799, byDb: { site: 629, gameplay: 1_950 }, later: 77_278 })
    assert.throws(() => importEstimate("nothing"), /no estimate/)
  })

  it("reads the last count of today's rows import-dump printed", () => {
    assert.equal(reportedToday("music: listens +5,000 (5,000/92,463) → 5,000 rows written, 12,000 today\nmusic: … → 3 rows written, 12,003 today\n\ndone"), 12_003)
    assert.equal(reportedToday("dry run"), undefined)
  })

  it("reads an env file", () => {
    assert.deepEqual(parseEnv('# books\nHARDCOVER_TOKEN="Bearer a=b"\nexport OTHER=x # note\nEMPTY=\nnot a line\n'), { HARDCOVER_TOKEN: "Bearer a=b", OTHER: "x", EMPTY: "" })
  })
})

describe("what is there already", () => {
  it("uploads what R2 lacks or has with another size", () => {
    const local = [
      { key: "raw/apple/plays.ndjson.gz", size: 10 },
      { key: "raw/apple/tracks.ndjson.gz", size: 20 },
      { key: "raw/spotify/plays.ndjson.gz", size: 30 },
    ]
    const remote = [
      { key: "raw/apple/plays.ndjson.gz", size: 10 },
      { key: "raw/apple/tracks.ndjson.gz", size: 19 },
    ]
    assert.deepEqual(
      toUpload(local, remote).map((o) => o.key),
      ["raw/apple/tracks.ndjson.gz", "raw/spotify/plays.ndjson.gz"],
    )
  })

  it("finds the config's bindings a deployed Worker lacks", () => {
    const want = [
      { type: "d1" as const, binding: "SITE", target: "site-id" },
      { type: "d1" as const, binding: "LIBRARY", target: "library-id" },
      { type: "service" as const, binding: "CATALOG", target: "catalog" },
      { type: "kv" as const, binding: "STATE" },
    ]
    const deployed = [
      { type: "d1", name: "SITE", id: "site-id" },
      { type: "d1", name: "LIBRARY", id: "old-id" },
    ]
    assert.deepEqual(missingBindings(want, deployed), ["LIBRARY (d1 → library-id)", "CATALOG (service → catalog)"])
    assert.deepEqual(missingBindings(want, [...deployed.slice(0, 1), { type: "d1", name: "LIBRARY", id: "library-id" }, { type: "service", name: "CATALOG", service: "catalog" }]), [])
  })
})
