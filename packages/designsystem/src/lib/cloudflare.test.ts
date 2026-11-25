import { strict as assert } from "node:assert"
import { test } from "node:test"

import { canTransform, transformedImage, transformedSrcSet, webAnalyticsBeacon } from "./cloudflare.ts"

test("transformedImage asks the zone for a resized, modern picture", () => {
  assert.equal(transformedImage("https://a.example/x.jpg", { width: 120 }), "/cdn-cgi/image/width=120,fit=cover,format=auto/https://a.example/x.jpg")
  assert.equal(transformedImage("/mock/a.png", { width: 99.6, height: 50, fit: "contain", quality: 140, dpr: 2 }), "/cdn-cgi/image/width=100,height=50,fit=contain,quality=100,dpr=2,format=auto/mock/a.png")
  assert.equal(transformedImage("https://a.example/x.jpg", { width: 99999 }).startsWith("/cdn-cgi/image/width=4096,"), true)
})

test("what Cloudflare cannot transform comes back as it was", () => {
  for (const src of ["data:image/png;base64,AA", "blob:https://a/1", "/mock/a.svg", "https://a.example/b.SVG?x=1", "/cdn-cgi/image/width=1/a.jpg", "javascript:alert(1)"]) {
    assert.equal(canTransform(src), false, src)
    assert.equal(transformedImage(src, { width: 10 }), src)
    assert.equal(transformedSrcSet(src, { width: 10 }), "")
  }
})

test("transformedSrcSet gives 1x and 2x", () => {
  assert.equal(transformedSrcSet("/a.jpg", { width: 64 }), "/cdn-cgi/image/width=64,fit=cover,format=auto/a.jpg 1x, /cdn-cgi/image/width=64,fit=cover,dpr=2,format=auto/a.jpg 2x")
})

test("webAnalyticsBeacon takes only a real token", () => {
  assert.equal(webAnalyticsBeacon(" 0123456789abcdef0123456789ABCDEF "), '{"token":"0123456789abcdef0123456789ABCDEF","spa":true}')
  assert.equal(webAnalyticsBeacon(undefined), null)
  assert.equal(webAnalyticsBeacon(""), null)
  assert.equal(webAnalyticsBeacon('x","spa":false,"y'), null)
})
