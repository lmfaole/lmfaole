import assert from "node:assert/strict"
import { test } from "node:test"
import { workerFetch } from "./fetch.ts"

function recorder(answers: (Response | Error)[]) {
  const calls: { url: string; headers: Headers; method: string }[] = []
  const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), headers: new Headers(init?.headers), method: init?.method ?? "GET" })
    const answer = answers.shift() ?? new Response("ok")
    if (answer instanceof Error) throw answer
    return answer
  }) as typeof globalThis.fetch
  return { fetch, calls }
}
const sleep = async () => {}

test("without options it only passes the call on, headers untouched", async () => {
  const { fetch, calls } = recorder([])
  const init = { headers: { accept: "application/json" } }
  await workerFetch({ fetch })("https://example.com/a", init)
  assert.equal(calls.length, 1)
  assert.equal(calls[0]!.headers.get("user-agent"), null)
})

test("a User-Agent is added where the request has none, never over its own", async () => {
  const { fetch, calls } = recorder([])
  const get = workerFetch({ fetch, userAgent: "test (+https://lmfaole.party)" })
  await get("https://example.com/a")
  await get("https://example.com/b", { headers: { "User-Agent": "own" } })
  assert.deepEqual(calls.map((c) => c.headers.get("user-agent")), ["test (+https://lmfaole.party)", "own"])
})

test("a GET is tried again on 5xx, 429 and network errors, up to retries, and the last answer is given", async () => {
  const { fetch, calls } = recorder([new Response("", { status: 503 }), new Error("reset"), new Response("", { status: 429, headers: { "retry-after": "1" } }), new Response("ok")])
  const waits: number[] = []
  const response = await workerFetch({ fetch, retries: 3, backoff: 100, sleep: async (ms) => void waits.push(ms) })("https://example.com/a")
  assert.equal(response.status, 200)
  assert.equal(calls.length, 4)
  assert.deepEqual(waits, [100, 200, 1000])

  const { fetch: failing } = recorder([new Response("", { status: 500 }), new Response("", { status: 502 })])
  assert.equal((await workerFetch({ fetch: failing, retries: 1, sleep })("https://example.com/a")).status, 502)
})

test("a POST or a 4xx is not tried again", async () => {
  const { fetch, calls } = recorder([new Response("", { status: 500 }), new Response("", { status: 404 })])
  const call = workerFetch({ fetch, retries: 2, sleep })
  assert.equal((await call("https://example.com/a", { method: "POST", body: "{}" })).status, 500)
  assert.equal((await call("https://example.com/a")).status, 404)
  assert.equal(calls.length, 2)
})

test("a timeout aborts a request that takes too long", async () => {
  const slow = ((_input: string | URL | Request, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)))) as typeof globalThis.fetch
  await assert.rejects(workerFetch({ fetch: slow, timeout: 10 })("https://example.com/a"), { name: "TimeoutError" })
})
