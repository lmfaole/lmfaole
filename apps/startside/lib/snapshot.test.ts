import { strict as assert } from "node:assert"
import { test } from "node:test"

import { bodyKey, CRON_SECONDS, forecastUrl, INDEX_KEY, isFresh, KP_URL, MAX_REPOS, MAX_WRITES, readIndex, readSnapshot, refreshSnapshot, repoIssuesUrl, repoUrl, requestKey, sharedJobs, type Job, type Store } from "./snapshot.ts"

function memory(): Store & { data: Map<string, string>; writes: string[] } {
  const data = new Map<string, string>()
  const writes: string[] = []
  return {
    data,
    writes,
    get: async (key) => data.get(key) ?? null,
    put: async (key, value) => {
      writes.push(key)
      data.set(key, value)
    },
  }
}

const MINUTE = 60_000
const jobs: Job[] = [
  { url: "https://a.example/1", revalidate: 1800 },
  { url: "https://a.example/2", revalidate: 60 },
]

test("the shared questions are the forecast, the Kp and the first watched repositories, with the addresses the page asks", () => {
  const list = sharedJobs({ WEATHER_LAT: "59.91", WEATHER_LON: "10.75", GITHUB_WATCH_REPOS: "fremtind/jokul, navikt/aksel ,bad, a/b" })
  assert.deepEqual(
    list.map((job) => job.url),
    [forecastUrl(59.91, 10.75), KP_URL, repoUrl("fremtind/jokul"), repoIssuesUrl("fremtind/jokul"), repoUrl("navikt/aksel"), repoIssuesUrl("navikt/aksel")],
  )
  assert.equal(MAX_REPOS, 2)
  assert.equal(forecastUrl(59.91, 10.75), "https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=59.91&lon=10.75")
})

test("a body is written once, and again only when it changes; the index on each run that checked something", async () => {
  const store = memory()
  let body = "one"
  const ask = async () => new Response(body, { headers: { "Content-Type": "application/json" } })
  const t0 = Date.UTC(2026, 10, 22, 12)
  assert.deepEqual(await refreshSnapshot(store, jobs, ask, t0), { fetched: 2, written: 2, unchanged: 0, failed: 0, deferred: 0 })
  assert.equal(store.writes.length, 3)
  store.writes.length = 0
  // Fifteen minutes on: only the one due every minute is asked, and it has not changed.
  assert.deepEqual(await refreshSnapshot(store, jobs, ask, t0 + 15 * MINUTE), { fetched: 1, written: 0, unchanged: 1, failed: 0, deferred: 0 })
  assert.deepEqual(store.writes, [INDEX_KEY])
  store.writes.length = 0
  body = "two"
  await refreshSnapshot(store, jobs, ask, t0 + 30 * MINUTE)
  assert.deepEqual(store.writes.sort(), [bodyKey(await requestKey(jobs[0].url)), bodyKey(await requestKey(jobs[1].url)), INDEX_KEY].sort())
})

test("nothing due is no write at all, and a failing source keeps what was there", async () => {
  const store = memory()
  const t0 = Date.UTC(2026, 10, 22, 12)
  await refreshSnapshot(store, [jobs[0]], async () => new Response("one"), t0)
  store.writes.length = 0
  assert.equal((await refreshSnapshot(store, [jobs[0]], async () => new Response("x"), t0 + 15 * MINUTE)).fetched, 0)
  assert.deepEqual(store.writes, [])
  const report = await refreshSnapshot(store, [jobs[0]], async () => new Response("down", { status: 503 }), t0 + 30 * MINUTE)
  assert.equal(report.failed, 1)
  assert.deepEqual(store.writes, [])
  assert.equal((await readSnapshot(store, await requestKey(jobs[0].url), t0 + 31 * MINUTE))?.body, "one")
})

test("a run writes at most MAX_WRITES bodies; the rest wait", async () => {
  const store = memory()
  const many = Array.from({ length: MAX_WRITES + 2 }, (_, i) => ({ url: `https://a.example/${i}`, revalidate: 60 }))
  const report = await refreshSnapshot(store, many, async (job) => new Response(job.url), Date.UTC(2026, 10, 22, 12))
  assert.equal(report.written, MAX_WRITES)
  assert.equal(report.deferred, 2)
  assert.equal(store.writes.length, MAX_WRITES + 1)
  assert.equal(Object.keys((await readIndex(store)).entries).length, MAX_WRITES)
})

test("a source no longer asked for leaves the index", async () => {
  const store = memory()
  const t0 = Date.UTC(2026, 10, 22, 12)
  await refreshSnapshot(store, jobs, async () => new Response("x"), t0)
  await refreshSnapshot(store, [jobs[1]], async () => new Response("x"), t0 + 15 * MINUTE)
  assert.deepEqual(Object.keys((await readIndex(store)).entries), [await requestKey(jobs[1].url)])
})

test("a page takes a recent snapshot as fresh, an older one only to stand in, and none past a day", async () => {
  const store = memory()
  const t0 = Date.UTC(2026, 10, 22, 12)
  await refreshSnapshot(store, [jobs[1]], async () => new Response("body", { headers: { "Content-Type": "text/plain" } }), t0)
  const key = await requestKey(jobs[1].url)
  const recent = await readSnapshot(store, key, t0 + 5 * MINUTE)
  assert.equal(recent?.body, "body")
  assert.equal(recent?.type, "text/plain")
  assert.equal(isFresh(recent!, t0 + 5 * MINUTE), true)
  // Due every minute, but the cron comes every 15: good until the next run (and a minute).
  assert.equal(isFresh(recent!, t0 + (CRON_SECONDS + 59) * 1000), true)
  assert.equal(isFresh(recent!, t0 + 20 * MINUTE), false)
  assert.notEqual(await readSnapshot(store, key, t0 + 23 * 60 * MINUTE), null)
  assert.equal(await readSnapshot(store, key, t0 + 25 * 60 * MINUTE), null)
  assert.equal(await readSnapshot(store, "unknown", t0), null)
})

test("a broken or missing index is an empty one", async () => {
  const store = memory()
  assert.deepEqual(await readIndex(store), { version: 1, entries: {} })
  store.data.set(INDEX_KEY, "{not json")
  assert.deepEqual(await readIndex(store), { version: 1, entries: {} })
})

test("the key is the page's: the address and the body", async () => {
  assert.equal(await requestKey("https://a.example/1"), await requestKey("https://a.example/1", undefined, undefined))
  assert.notEqual(await requestKey("https://a.example/1"), await requestKey("https://a.example/1", { query: "x" }))
})

test("a private repository, and its issues, are never kept", async () => {
  const store = memory()
  const list = sharedJobs({ GITHUB_WATCH_REPOS: "me/secret" }).slice(2)
  const ask = async (job: Job) => new Response(job.url.endsWith("/issues?state=open&sort=updated&direction=desc&per_page=50") ? "[]" : JSON.stringify({ private: true }))
  const report = await refreshSnapshot(store, list, ask, Date.UTC(2026, 10, 22, 12))
  assert.equal(report.written, 0)
  assert.deepEqual(store.writes, [])
  const open = await refreshSnapshot(store, sharedJobs({ GITHUB_WATCH_REPOS: "me/open" }).slice(2), async (job) => new Response(job.url.includes("/issues") ? "[]" : JSON.stringify({ private: false })), Date.UTC(2026, 10, 22, 12))
  assert.equal(open.written, 2)
  const internal = await refreshSnapshot(memory(), list, async (job) => new Response(job.url.includes("/issues") ? "[]" : JSON.stringify({ private: false, visibility: "internal" })), Date.UTC(2026, 10, 22, 12))
  assert.equal(internal.written, 0)
})
