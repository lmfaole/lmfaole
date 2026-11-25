import { strict as assert } from "node:assert"
import { test } from "node:test"

import { cacheableRequest, cacheableResponse, cacheKey, pageCacheControl, ttlFor } from "./page-cache.ts"

const url = (path: string) => new URL(`https://lmfaole.party${path}`)
const none = new Headers()

test("only a GET of a page under /start is kept; never Next's data requests, built files or other sites' paths", () => {
  for (const path of ["/start", "/start/github", "/start/vaer/2026-11-20?pos=59.9,10.7", "/start/pull-requests/lmfaole/lmfaole/12"]) assert.equal(cacheableRequest("GET", url(path), none), true, path)
  for (const path of ["/", "/startx", "/start/_next/static/chunks/a.js", "/start/sw.js", "/start/manifest.webmanifest", "/start/icon.png", "/start/transport?_rsc=abc"]) {
    assert.equal(cacheableRequest("GET", url(path), none), false, path)
  }
  assert.equal(cacheableRequest("POST", url("/start"), none), false)
  assert.equal(cacheableRequest("HEAD", url("/start"), none), false)
  assert.equal(cacheableRequest("GET", url("/start"), new Headers({ RSC: "1" })), false)
})

test("the key keeps only the parameters a page reads, so made-up ones share the page", () => {
  assert.equal(cacheKey(url("/start/strom?x=1&omrade=NO3&pos=59.9,10.7&utm=y")), "https://lmfaole.party/start/strom?pos=59.900%2C10.700&omrade=NO3")
  assert.equal(cacheKey(url("/start/strom?pos=59.9,10.7&omrade=NO3")), cacheKey(url("/start/strom?omrade=no3&pos=59.90012,10.70049")))
  assert.equal(cacheKey(url("/start/strom?pos=north&omrade=NO9")), "https://lmfaole.party/start/strom")
  assert.equal(cacheKey(url("/start?random=1")), "https://lmfaole.party/start")
  assert.equal(cacheKey(url("/start?pos=")), "https://lmfaole.party/start")
})

test("the departure boards are kept a quarter of a minute, the rest a minute", () => {
  assert.equal(ttlFor("/start/transport"), 15)
  assert.equal(ttlFor("/start/transport/NSR:StopPlace:1"), 15)
  assert.equal(ttlFor("/start/transportx"), 60)
  assert.equal(ttlFor("/start"), 60)
  assert.equal(pageCacheControl(15), "public, max-age=0, s-maxage=15")
})

test("only a whole HTML page that went well and sets no cookie is kept, whatever Next says of it", () => {
  const html = (more: Record<string, string> = {}) => new Headers({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate", ...more })
  assert.equal(cacheableResponse(200, html()), true)
  assert.equal(cacheableResponse(404, html()), false)
  assert.equal(cacheableResponse(500, html()), false)
  assert.equal(cacheableResponse(307, html()), false)
  assert.equal(cacheableResponse(200, html({ "Set-Cookie": "a=b" })), false)
  assert.equal(cacheableResponse(200, new Headers({ "Content-Type": "text/x-component" })), false)
})
