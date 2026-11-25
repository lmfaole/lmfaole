import { strict as assert } from "node:assert"
import { test } from "node:test"

import { relayPath, viaRelay } from "./relay.ts"

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

test("no key, or neither a binding nor an address, is no relay", async () => {
  assert.equal(await viaRelay("https://api.met.no/x", {}, { url: "https://relay.example" }, byUrl), null)
  assert.equal(await viaRelay("https://api.met.no/x", {}, { key: "k" }, byUrl), null)
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

test("without an address, the binding's answer or error stands", async () => {
  assert.equal((await viaRelay("https://api.met.no/x", {}, { binding: binding(525), key: "k" }, byUrl))?.status, 525)
  await assert.rejects(viaRelay("https://api.met.no/x", {}, { binding: binding(new Error("down")), key: "k" }, byUrl))
})
