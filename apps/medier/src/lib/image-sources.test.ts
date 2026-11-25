import { strict as assert } from "node:assert"
import { test } from "node:test"

import { sourcesOf, transformed } from "./image-sources.ts"

test("TMDB and Last.fm addresses become their widths, anything else the one source, nothing none", () => {
  assert.deepEqual(sourcesOf("https://image.tmdb.org/t/p/w185/abc.jpg").map((source) => [source.src, source.width]), [
    ["https://image.tmdb.org/t/p/w92/abc.jpg", 92],
    ["https://image.tmdb.org/t/p/w185/abc.jpg", 185],
    ["https://image.tmdb.org/t/p/w342/abc.jpg", 342],
  ])
  assert.deepEqual(sourcesOf("https://lastfm.freetls.fastly.net/i/u/300x300/x.jpg").map((source) => source.width), [64, 174, 300])
  assert.equal(sourcesOf("https://lastfm.freetls.fastly.net/i/u/300x300/x.jpg")[0]?.src, "https://lastfm.freetls.fastly.net/i/u/64s/x.jpg")
  assert.deepEqual(sourcesOf("https://example.org/a.png"), [{ src: "https://example.org/a.png", width: 300 }])
  assert.deepEqual(sourcesOf(null), [])
})

/** As the zone's Image Transformations write it, and nothing for a `data:` address. */
const zone = (src: string, width: number): string | null => (src.startsWith("data:") ? null : `/cdn-cgi/image/width=${width}/${src}`)

test("with Image Transformations, a picture is made by the zone at a ladder of widths up to the largest the source gives", () => {
  assert.deepEqual(sourcesOf("https://lastfm.freetls.fastly.net/i/u/64s/x.jpg", zone), [64, 128, 256, 300].map((width) => ({ src: `/cdn-cgi/image/width=${width}/https://lastfm.freetls.fastly.net/i/u/300x300/x.jpg`, width })))
  assert.deepEqual(sourcesOf("https://image.tmdb.org/t/p/w185/abc.jpg", zone).map((source) => source.width), [64, 128, 256, 384, 500])
  assert.ok(sourcesOf("https://image.tmdb.org/t/p/w185/abc.jpg", zone).every((source) => source.src.endsWith("/https://image.tmdb.org/t/p/w500/abc.jpg")))
  assert.deepEqual(transformed([{ src: "https://i.scdn.co/a", width: 640 }, { src: "https://i.scdn.co/b", width: 64 }], zone).map((source) => [source.width, source.src]).at(-1), [640, "/cdn-cgi/image/width=640/https://i.scdn.co/a"])
  assert.deepEqual(transformed([{ src: "https://x/a.jpg", width: 48 }], zone), [{ src: "/cdn-cgi/image/width=48/https://x/a.jpg", width: 48 }])
})

test("without Image Transformations, or for a picture the zone cannot make, the sources are as they were", () => {
  assert.deepEqual(sourcesOf("https://image.tmdb.org/t/p/w185/abc.jpg", null).map((source) => source.width), [92, 185, 342])
  assert.deepEqual(transformed([{ src: "data:image/png;base64,AA", width: 300 }], zone), [{ src: "data:image/png;base64,AA", width: 300 }])
  assert.deepEqual(transformed([], zone), [])
  assert.deepEqual(sourcesOf(null, zone), [])
})
