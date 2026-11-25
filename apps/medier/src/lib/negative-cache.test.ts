import { strict as assert } from "node:assert"
import { test } from "node:test"

import { failureOf, failureTtl, keptFailure, lastfmErrorCode, NEGATIVE_TTL } from "./negative-cache.ts"

test("a «not found» is kept ten minutes, what passes is never kept", () => {
  for (const status of [400, 401, 403, 404, 410, 422]) assert.equal(failureTtl(status, null), NEGATIVE_TTL, String(status))
  for (const status of [408, 425, 429, 500, 502, 503, 525, 200]) assert.equal(failureTtl(status, null), null, String(status))
})

test("Last.fm's code decides over its status: only «no such user» is kept", () => {
  assert.equal(failureTtl(404, 6), NEGATIVE_TTL)
  assert.equal(failureTtl(200, 6), NEGATIVE_TTL)
  for (const code of [29, 8, 11, 16, 10]) assert.equal(failureTtl(400, code), null, String(code))
})

test("Last.fm's error code is read only from an error", () => {
  assert.equal(lastfmErrorCode({ error: 6, message: "User not found" }), 6)
  assert.equal(lastfmErrorCode({ error: 6 }), null)
  assert.equal(lastfmErrorCode({ user: { name: "x" } }), null)
  assert.equal(lastfmErrorCode(null), null)
})

test("a kept failure is told from an answer", () => {
  assert.equal(failureOf(keptFailure("ws.audioscrobbler.com: 404")), "ws.audioscrobbler.com: 404")
  assert.equal(failureOf({ user: { name: "x" } }), null)
  assert.equal(failureOf(null), null)
  assert.equal(failureOf([]), null)
})
