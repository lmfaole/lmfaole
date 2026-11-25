import { strict as assert } from "node:assert"
import { afterEach, test } from "node:test"

import relay from "./worker.js"

const ENV = { UPSTREAM_KEY: "shared", GITHUB_TOKEN: "gh-secret" }
const real = globalThis.fetch
afterEach(() => {
  globalThis.fetch = real
})

function spy(status = 200) {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(status === 204 ? null : "{}", { status })
  }
  return calls
}

const ask = (path, init = {}) => {
  const { key = "shared", ...rest } = init
  const headers = new Headers(rest.headers)
  if (key !== null) headers.set("X-Upstream-Key", key)
  return relay.fetch(new Request(`https://relay.example${path}`, { ...rest, headers }), ENV)
}

test("without the shared key nothing is asked", async () => {
  const calls = spy()
  assert.equal((await ask("/api.spotify.com/v1/me", { key: null })).status, 403)
  assert.equal(calls.length, 0)
})

test("Spotify: what is asked carries its own sign-in, and the GitHub token is never given to it", async () => {
  const calls = spy()
  await ask("/api.spotify.com/v1/me/player/currently-playing", { headers: { Authorization: "Bearer abc" } })
  const headers = new Headers(calls[0].init.headers)
  assert.equal(calls[0].url, "https://api.spotify.com/v1/me/player/currently-playing")
  assert.equal(headers.get("authorization"), "Bearer abc")
})

test("the one POST to Spotify is the token, with the client's sign-in and the form; any other path on its accounts host is not found", async () => {
  const calls = spy()
  await ask("/accounts.spotify.com/api/token", { method: "POST", body: "grant_type=refresh_token", headers: { Authorization: "Basic xyz", "Content-Type": "application/x-www-form-urlencoded" } })
  assert.equal(calls[0].url, "https://accounts.spotify.com/api/token")
  assert.equal(new Headers(calls[0].init.headers).get("authorization"), "Basic xyz")
  assert.equal((await ask("/accounts.spotify.com/authorize")).status, 404)
  assert.equal((await ask("/accounts.spotify.com/api/token")).status, 404)
  assert.equal((await ask("/api.spotify.com/v1/me", { method: "POST", body: "x" })).status, 405)
  assert.equal(calls.length, 1)
})

test("GitHub still gets the relay's token and ignores the caller's; other hosts are unknown; nothing playing (204) passes through", async () => {
  const calls = spy()
  await ask("/api.github.com/user", { headers: { Authorization: "Bearer from-the-page" } })
  assert.equal(new Headers(calls[0].init.headers).get("authorization"), "Bearer gh-secret")
  assert.equal((await ask("/example.com/x")).status, 404)
  spy(204)
  assert.equal((await ask("/api.spotify.com/v1/me/player/currently-playing")).status, 204)
})

test("a source's answer, also a 525 of its own, is marked as passed on by the relay, so the page can tell it from the binding's", async () => {
  spy(525)
  const response = await ask("/api.github.com/search/issues?q=is%3Apublic")
  assert.equal(response.status, 525)
  assert.equal(response.headers.get("X-Relay"), "startside-upstream")
})

test("Oslo Bysykkel is told who asks; the other open sources are let through without it", async () => {
  const calls = spy()
  await ask("/gbfs.urbansharing.com/oslobysykkel.no/station_status.json")
  assert.equal(new Headers(calls[0].init.headers).get("client-identifier"), "lmfaole-startside")
  await ask("/www.hvakosterstrommen.no/api/v1/prices/2026/11-21_NO1.json")
  assert.equal(new Headers(calls[1].init.headers).get("client-identifier"), null)
  for (const path of ["/api01.nve.no/hydrology/forecast/flood/v1.0.10/api/x", "/ws.geonorge.no/kommuneinfo/v1/punkt"]) assert.equal((await ask(path)).status, 200)
})

test("a key that is wrong, or only part of the right one, is not let in", async () => {
  const calls = spy()
  for (const key of ["shard", "share", "shared2", ""]) assert.equal((await ask("/api.met.no/x", { key })).status, 403)
  assert.equal((await relay.fetch(new Request("https://relay.example/api.met.no/x", { headers: { "X-Upstream-Key": "" } }), { ...ENV, UPSTREAM_KEY: "" })).status, 403)
  assert.equal(calls.length, 0)
})

test("GraphQL: queries go through, also with the words in strings and comments; mutations, subscriptions, bad and large bodies do not", async () => {
  const calls = spy()
  const post = (body, path = "/api.github.com/graphql") => ask(path, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })
  assert.equal((await post({ query: 'query ($q: String!) { search(query: $q) { nodes { id } } } # no mutation here', variables: { q: "mutation" } })).status, 200)
  assert.equal((await post({ query: '{ search(query: "mutation subscription") { issueCount } viewer { login } }' })).status, 200)
  assert.equal(JSON.parse(calls[0].init.body).variables.q, "mutation")
  assert.equal(calls.length, 2)
  for (const query of ["mutation { addStar(input: {starrableId: \"x\"}) { clientMutationId } }", "mutation($id: ID!){deleteIssue(input:{issueId:$id}){clientMutationId}}", "query { a } mutation B { c }", "subscription { x }", '{ a(s: "\\"") } mutation { b }']) {
    assert.equal((await post({ query })).status, 400, query)
  }
  assert.equal((await post({ query: "mutation { x }" }, "/api.entur.io/journey-planner/v3/graphql")).status, 400)
  assert.equal((await post("not json")).status, 400)
  assert.equal((await post({ variables: {} })).status, 400)
  assert.equal((await post({ query: `{ a } #${"x".repeat(70_000)}` })).status, 413)
  assert.equal(calls.length, 2)
})
