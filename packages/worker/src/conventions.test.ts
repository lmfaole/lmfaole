import assert from "node:assert/strict"
import { test } from "node:test"

import { COMPATIBILITY_DATE, CRON_WORKER, parseJsonc, workerProblems, wranglerProblems, ZONE } from "./conventions.ts"

const config = (more: Record<string, unknown> = {}): Record<string, unknown> => ({
  compatibility_date: COMPATIBILITY_DATE,
  compatibility_flags: ["nodejs_compat"],
  workers_dev: false,
  preview_urls: false,
  observability: { enabled: true },
  routes: [
    { pattern: `${ZONE}/cv`, zone_name: ZONE },
    { pattern: `${ZONE}/cv/*`, zone_name: ZONE },
  ],
  ...more,
})

test('JSON with comments: line and block comments and trailing commas go, a "/*" in a string stays', () => {
  const text = '{\n  // a comment\n  "routes": [{ "pattern": "lmfaole.party/cv/*" /* block */ },],\n  "url": "https://x//y",\n  "list": ",]",\n}\n'
  assert.deepEqual(parseJsonc(text), { routes: [{ pattern: "lmfaole.party/cv/*" }], url: "https://x//y", list: ",]" })
})

test("an app as the conventions say has no problems, under a path or at the root", () => {
  assert.deepEqual(wranglerProblems(config(), "/cv"), [])
  assert.deepEqual(wranglerProblems(config({ routes: [{ pattern: `${ZONE}/medier*`, zone_name: ZONE }] }), "/medier"), [])
  assert.deepEqual(wranglerProblems(config({ routes: [{ pattern: `${ZONE}/*`, zone_name: ZONE }, { pattern: `www.${ZONE}/*`, zone_name: ZONE }] }), ""), [])
})

test("a workers.dev or preview address, another date, no nodejs_compat or observability are each a problem", () => {
  assert.equal(wranglerProblems(config({ workers_dev: true, preview_urls: undefined, compatibility_date: "2025-01-01", compatibility_flags: [], observability: { enabled: false } }), "/cv").length, 5)
})

test("a route outside the app’s path, another zone, a custom domain or only the front page are problems", () => {
  assert.equal(wranglerProblems(config({ routes: [{ pattern: `${ZONE}/cv`, zone_name: ZONE }] }), "/cv").length, 1)
  assert.equal(wranglerProblems(config({ routes: [...(config()["routes"] as unknown[]), { pattern: `${ZONE}/annet/*`, zone_name: ZONE }] }), "/cv").length, 1)
  assert.equal(wranglerProblems(config({ routes: [{ pattern: `${ZONE}/cv/*`, zone_name: "example.com" }] }), "/cv").length, 1)
  assert.equal(wranglerProblems(config({ routes: [{ pattern: `${ZONE}/cv/*`, zone_name: ZONE, custom_domain: true }] }), "/cv").length, 1)
})

const worker = (name: string, more: Record<string, unknown> = {}): Record<string, unknown> => ({
  name,
  compatibility_date: COMPATIBILITY_DATE,
  workers_dev: false,
  preview_urls: false,
  observability: { enabled: true },
  triggers: { crons: name === CRON_WORKER ? ["*/15 * * * *"] : [] },
  ...more,
})

test("a cron Worker as the conventions say has no problems, with or without a workers.dev address", () => {
  assert.deepEqual(workerProblems(worker("catalog"), "catalog"), [])
  assert.deepEqual(workerProblems(worker("activity", { workers_dev: true }), "activity"), [])
  assert.deepEqual(workerProblems(worker(CRON_WORKER), CRON_WORKER), [])
})

test("a cron Worker with a route, a cron of its own, no crons said, workers_dev unsaid or another name has problems", () => {
  assert.equal(workerProblems(worker("catalog", { routes: [{ pattern: `${ZONE}/x`, zone_name: ZONE }] }), "catalog").length, 1)
  assert.equal(workerProblems(worker("catalog", { triggers: { crons: ["0 * * * *"] } }), "catalog").length, 1)
  assert.equal(workerProblems(worker("catalog", { triggers: undefined, workers_dev: undefined }), "catalog").length, 2)
  assert.equal(workerProblems(worker(CRON_WORKER, { triggers: { crons: [] } }), CRON_WORKER).length, 1)
  assert.equal(workerProblems(worker("catalog"), "katalog").length, 1)
  assert.equal(workerProblems(worker("catalog", { compatibility_date: "2025-01-01", preview_urls: true, observability: undefined }), "catalog").length, 3)
})
