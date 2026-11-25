import { strict as assert } from "node:assert"
import { test } from "node:test"

import { cacheableRequest } from "./page-cache.ts"

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
