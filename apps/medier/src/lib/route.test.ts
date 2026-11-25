import assert from "node:assert/strict"
import test from "node:test"

import { asService, routeOf } from "./route.ts"

const LASTFM = "https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=a%20b"
const none = { upstream: false, relay: undefined, key: undefined }

test("with its binding and the key, the relay is asked through the binding, with the key", () => {
  assert.deepEqual(routeOf(LASTFM, { ...none, upstream: true, relay: "https://medier-upstream.x.workers.dev", key: "k" }), {
    via: "upstream",
    url: "https://medier-upstream.internal/ws.audioscrobbler.com/2.0/?method=user.getinfo&user=a%20b",
    key: "k",
  })
})

test("without the binding the relay is asked at its address, and without a relay or a key the source itself", () => {
  assert.deepEqual(routeOf(LASTFM, { ...none, relay: "https://medier-upstream.x.workers.dev/", key: "k" }), {
    via: "relay",
    url: "https://medier-upstream.x.workers.dev/ws.audioscrobbler.com/2.0/?method=user.getinfo&user=a%20b",
    key: "k",
  })
  assert.deepEqual(routeOf(LASTFM, none), { via: "direct", url: LASTFM })
  assert.deepEqual(routeOf(LASTFM, { ...none, relay: "https://r.workers.dev" }), { via: "direct", url: LASTFM })
})

test("the relay is never asked without the key, by either way", () => {
  assert.equal(routeOf(LASTFM, { ...none, upstream: true, relay: "https://r.workers.dev", key: "" }).via, "direct")
  assert.equal(routeOf(LASTFM, { ...none, upstream: true }).via, "direct")
})

test("a binding is something with a fetch; a setting or nothing is not", () => {
  const service = { fetch: () => Promise.resolve(new Response()) }
  assert.equal(asService(service), service)
  assert.equal(asService("https://r.workers.dev"), null)
  assert.equal(asService(undefined), null)
  assert.equal(asService({ limit: () => undefined }), null)
})
