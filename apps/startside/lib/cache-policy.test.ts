import { strict as assert } from "node:assert"
import { test } from "node:test"

import { freshSeconds, STALE_SECONDS, verdict } from "./cache-policy.ts"

test("an answer is fresh for its ttl, stale for the time after it, and expired after that", () => {
  assert.equal(verdict(0, 60, STALE_SECONDS), "fresh")
  assert.equal(verdict(59, 60, STALE_SECONDS), "fresh")
  assert.equal(verdict(60, 60, STALE_SECONDS), "stale")
  assert.equal(verdict(60 + STALE_SECONDS - 1, 60, STALE_SECONDS), "stale")
  assert.equal(verdict(60 + STALE_SECONDS, 60, STALE_SECONDS), "expired")
})

test("an answer with no time, or one from the future, is not trusted", () => {
  assert.equal(verdict(Number.NaN, 60, STALE_SECONDS), "expired")
  assert.equal(verdict(-5, 60, STALE_SECONDS), "expired")
})

test("an answer is good until its Expires when that is later than revalidate, and never shorter", () => {
  const now = Date.parse("2026-11-21T22:00:00Z")
  assert.equal(freshSeconds(1800, "Sat, 21 Nov 2026 23:00:00 GMT", now), 3600)
  assert.equal(freshSeconds(1800, "Sat, 21 Nov 2026 22:05:00 GMT", now), 1800)
  assert.equal(freshSeconds(1800, "nonsense", now), 1800)
  assert.equal(freshSeconds(1800, null, now), 1800)
})
