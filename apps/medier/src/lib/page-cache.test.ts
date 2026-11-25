import { strict as assert } from "node:assert"
import { test } from "node:test"

import { cacheableRequest, cacheableResponse } from "./page-cache.ts"

test("a GET of a page or a server island under the base is kept; the API, built files, other methods and other paths are not", () => {
  for (const path of ["/medier/", "/medier/musikk/", "/medier/film/historikk/", "/medier/_server-islands/AlbumDaysIsland?e=x&p=y"]) assert.ok(cacheableRequest("GET", new URL(path, "https://x").pathname, "/medier/"), path)
  assert.ok(!cacheableRequest("POST", "/medier/", "/medier/"))
  assert.ok(!cacheableRequest("HEAD", "/medier/", "/medier/"))
  assert.ok(!cacheableRequest("GET", "/medier/api/now/", "/medier/"))
  assert.ok(!cacheableRequest("GET", "/medier/_astro/page.js", "/medier/"))
  assert.ok(!cacheableRequest("GET", "/medier/sw.js", "/medier/"))
  assert.ok(!cacheableRequest("GET", "/medier/manifest.webmanifest", "/medier/"))
  assert.ok(!cacheableRequest("GET", "/annet/", "/medier/"))
})

test("only a page that went well, sets no cookie and does not forbid it is kept", () => {
  const html = (more: Record<string, string> = {}): Headers => new Headers({ "Content-Type": "text/html; charset=utf-8", ...more })
  assert.ok(cacheableResponse(200, html()))
  for (const status of [301, 302, 404, 429, 500, 503]) assert.ok(!cacheableResponse(status, html()), String(status))
  assert.ok(!cacheableResponse(200, html({ "Set-Cookie": "a=b; Path=/medier/" })))
  assert.ok(!cacheableResponse(200, html({ "Cache-Control": "no-store" })))
  assert.ok(!cacheableResponse(200, html({ "Cache-Control": "private, no-cache" })))
  assert.ok(!cacheableResponse(200, new Headers({ "Content-Type": "application/json" })))
  assert.ok(!cacheableResponse(200, new Headers()))
})
