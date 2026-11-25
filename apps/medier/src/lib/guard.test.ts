import { strict as assert } from "node:assert"
import { test } from "node:test"

import { asRateLimit, limitersFor, secure } from "./guard.ts"

test("pages and the API count against the pages' limit, islands against their own, built files against none", () => {
  assert.deepEqual(limitersFor("/"), ["LIMITER"])
  assert.deepEqual(limitersFor("/musikk/album/a-b/"), ["LIMITER"])
  assert.deepEqual(limitersFor("/api/now/"), ["LIMITER"])
  assert.deepEqual(limitersFor("/_server-islands/TopTracksIsland"), ["ISLAND_LIMITER"])
  assert.deepEqual(limitersFor("/_astro/client.abc123.js"), [])
  assert.deepEqual(limitersFor("/favicon.png"), [])
})

test("under the site's base, its islands are known by their paths there", () => {
  assert.deepEqual(limitersFor("/medier/_server-islands/TopTracksIsland", "/medier/"), ["ISLAND_LIMITER"])
  assert.deepEqual(limitersFor("/medier/_astro/client.abc123", "/medier/"), [])
  assert.deepEqual(limitersFor("/medier/musikk/", "/medier/"), ["LIMITER"])
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
