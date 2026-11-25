import { strict as assert } from "node:assert"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

import { askSource, relayPath, viaRelay } from "./relay.ts"

const calls: { via: string; url: string; init: RequestInit }[] = []
const binding = (status: number | Error) => ({
  fetch: async (url: string, init?: RequestInit) => {
    calls.push({ via: "binding", url, init: init ?? {} })
    if (status instanceof Error) throw status
    return new Response("b", { status })
  },
})
const byUrl = async (url: string, init: RequestInit) => {
  calls.push({ via: "url", url, init })
  return new Response("u")
}

test("the relay's path is the source's host, path and query", () => {
  assert.equal(relayPath("https://api.github.com/repos/a/b/issues?state=open"), "/api.github.com/repos/a/b/issues?state=open")
})

test("no key is no relay; a key with neither a binding nor an address is an error, never a direct fetch", async () => {
  calls.length = 0
  assert.equal(await viaRelay("https://api.met.no/x", {}, { url: "https://relay.example" }, byUrl), null)
  await assert.rejects(viaRelay("https://api.met.no/x", {}, { key: "k" }, byUrl), /Reléet er ikke tilgjengelig/)
  await assert.rejects(askSource("https://api.github.com/search/issues?q=x", {}, { key: "k" }, byUrl), /Reléet er ikke tilgjengelig/)
  assert.equal(calls.length, 0)
})

test("a source is asked directly only where there is no relay key", async () => {
  calls.length = 0
  assert.equal(await (await askSource("https://api.github.com/graphql", { method: "POST", body: "{}" }, {}, byUrl)).text(), "u")
  assert.deepEqual(calls.map((call) => [call.via, call.url]), [["url", "https://api.github.com/graphql"]])
  calls.length = 0
  await askSource("https://api.github.com/graphql", { method: "POST", body: "{}" }, { binding: binding(200), key: "k" }, byUrl)
  assert.deepEqual(calls.map((call) => call.via), ["binding"])
})

test("the binding is asked first, with the key and without the page's Authorization", async () => {
  calls.length = 0
  const response = await viaRelay("https://api.github.com/graphql", { method: "POST", body: "{}", headers: { Authorization: "Bearer t" } }, { binding: binding(200), url: "https://relay.example/", key: "k" }, byUrl)
  assert.equal(await response?.text(), "b")
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, "https://startside-upstream/api.github.com/graphql")
  assert.equal(calls[0].init.method, "POST")
  assert.deepEqual(calls[0].init.headers, { "X-Upstream-Key": "k" })
})

test("a 52x or a throw from the binding goes on to the address; any other answer is the binding's", async () => {
  for (const failure of [525, new Error("down")]) {
    calls.length = 0
    const response = await viaRelay("https://api.met.no/x?lat=1", {}, { binding: binding(failure), url: "https://relay.example/", key: "k" }, byUrl)
    assert.equal(await response?.text(), "u")
    assert.deepEqual(calls.map((call) => call.via), ["binding", "url"])
    assert.equal(calls[1].url, "https://relay.example/api.met.no/x?lat=1")
  }
  calls.length = 0
  assert.equal((await viaRelay("https://api.met.no/x", {}, { binding: binding(404), url: "https://relay.example", key: "k" }, byUrl))?.status, 404)
  assert.equal(calls.length, 1)
})

test("GitHub answering 525 through the binding goes on to the address (the live failure: no address meant «GitHub svarte 525»)", async () => {
  calls.length = 0
  const relayed525 = { fetch: async (url: string, init?: RequestInit) => (calls.push({ via: "binding", url, init: init ?? {} }), new Response("", { status: 525, headers: { "X-Relay": "startside-upstream" } })) }
  const response = await askSource("https://api.github.com/search/issues?q=is%3Apublic", {}, { binding: relayed525, url: "https://relay.example", key: "k" }, byUrl)
  assert.equal(response.status, 200)
  assert.deepEqual(calls.map((call) => call.url), ["https://startside-upstream/api.github.com/search/issues?q=is%3Apublic", "https://relay.example/api.github.com/search/issues?q=is%3Apublic"])
})

test("without an address, the binding's answer or error stands", async () => {
  assert.equal((await viaRelay("https://api.met.no/x", {}, { binding: binding(525), key: "k" }, byUrl))?.status, 525)
  await assert.rejects(viaRelay("https://api.met.no/x", {}, { binding: binding(new Error("down")), key: "k" }, byUrl))
})

// Every source is fetched through `askSource` (lib/relay.ts): a `fetch(` anywhere else on the server would go round the relay, and from a Worker on
// lmfaole.party that ends in 525. Only the service worker's script (run by the browser, not the Worker) fetches on its own.
test("nothing on the server fetches a source except through askSource", () => {
  const root = join(import.meta.dirname, "..")
  const allowed = new Set(["app/sw.js/route.ts"])
  const files: string[] = ["worker.mjs", "upstream/worker.js"]
  const walk = (dir: string): void => {
    for (const name of readdirSync(join(root, dir))) {
      const path = join(dir, name)
      if (statSync(join(root, path)).isDirectory()) walk(path)
      else if (/\.(ts|tsx|mjs|js)$/.test(name) && !/\.test\./.test(name)) files.push(path)
    }
  }
  for (const dir of ["lib", "app", "components"]) walk(dir)
  // A call to the global `fetch`, not a method (`binding.fetch(`, `next.fetch(`) nor a method's own definition (`async fetch(request, env)`).
  const calls = (text: string): boolean => text.split("\n").some((line) => !/^\s*(async\s+)?fetch\(/.test(line) && /(?<![.\w])fetch\(/.test(line))
  const offenders = files.filter((file) => !allowed.has(file) && file !== "upstream/worker.js" && calls(readFileSync(join(root, file), "utf8")))
  assert.deepEqual(offenders, [])
  // The relay itself is where the sources are fetched; it is the only other place.
  assert.ok(calls(readFileSync(join(root, "upstream/worker.js"), "utf8")))
})
