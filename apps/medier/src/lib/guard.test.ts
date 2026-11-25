import { strict as assert } from "node:assert"
import { test } from "node:test"

import { asRateLimit, limitersFor, secure } from "./guard.ts"

test("pages and the API count against the pages' limit, islands against their own, built files against none", () => {
  assert.deepEqual(limitersFor("GET", "/"), ["LIMITER"])
  assert.deepEqual(limitersFor("GET", "/musikk/album/a-b/"), ["LIMITER"])
  assert.deepEqual(limitersFor("GET", "/api/now/"), ["LIMITER"])
  assert.deepEqual(limitersFor("GET", "/_server-islands/TopTracksIsland"), ["ISLAND_LIMITER"])
  assert.deepEqual(limitersFor("GET", "/_astro/client.abc123.js"), [])
  assert.deepEqual(limitersFor("GET", "/favicon.png"), [])
})

test("a post to the API, which may check usernames with their services, counts against the checks' limit too", () => {
  assert.deepEqual(limitersFor("POST", "/api/innstillinger/"), ["LIMITER", "CHECK_LIMITER"])
  assert.deepEqual(limitersFor("POST", "/api/brukernavn/"), ["LIMITER", "CHECK_LIMITER"])
})

test("under the site's base, its islands and its API are known by their paths there", () => {
  assert.deepEqual(limitersFor("GET", "/medier/_server-islands/TopTracksIsland", "/medier/"), ["ISLAND_LIMITER"])
  assert.deepEqual(limitersFor("POST", "/medier/api/innstillinger/", "/medier/"), ["LIMITER", "CHECK_LIMITER"])
  assert.deepEqual(limitersFor("GET", "/medier/_astro/client.abc123", "/medier/"), [])
  assert.deepEqual(limitersFor("GET", "/medier/musikk/", "/medier/"), ["LIMITER"])
})

test("only a binding with `limit` is a rate limit: without one (astro dev), nothing is limited", () => {
  const binding = { limit: async () => ({ success: true }) }
  assert.equal(asRateLimit(binding), binding)
  for (const none of [undefined, null, "x", {}]) assert.equal(asRateLimit(none), null)
})

test("the policy keeps what it shut, lets scripts come only from the site and the beacon, and does not change an answer's own", () => {
  const headers = new Headers()
  secure(headers, { script: "https://static.cloudflareinsights.com", connect: "https://cloudflareinsights.com" })
  const policy = headers.get("Content-Security-Policy") ?? ""
  for (const part of ["frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'", "form-action 'self'", "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com", "connect-src 'self' https://cloudflareinsights.com"]) assert.ok(policy.includes(part), part)
  assert.ok(!policy.includes("img-src"))
  assert.equal(headers.get("X-Frame-Options"), "DENY")
  const own = new Headers({ "Content-Security-Policy": "default-src 'none'" })
  secure(own, { script: "https://s", connect: "https://c" })
  assert.equal(own.get("Content-Security-Policy"), "default-src 'none'")
})
