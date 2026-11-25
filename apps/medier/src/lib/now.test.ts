import { strict as assert } from "node:assert"
import { test } from "node:test"

import { parsePlaying, playingNow, samePlaying } from "./now.ts"

const song = (track: string, image: string | null = null) => ({ track, artist: "A", album: "B", image, url: `https://x/${track}` })

test("what plays is Last.fm's song, with its own cover as the disc", () => {
  assert.equal(playingNow(song("l"))?.track, "l")
  assert.equal(playingNow(song("l", "https://lastfm/c"))?.disc, "https://lastfm/c")
  assert.equal(playingNow(song("l"))?.disc, null)
  assert.equal(playingNow(null), null)
})

test("what the endpoint answered is checked: a song with its names, or nothing", () => {
  const body = { track: "Hard", artist: "Rihanna", album: "Rated R", url: "https://x", image: null, disc: "https://lastfm/a" }
  assert.deepEqual(parsePlaying(body), body)
  assert.equal(parsePlaying(null), null)
  assert.equal(parsePlaying([]), null)
  assert.equal(parsePlaying({ ...body, track: "" }), null)
  assert.equal(parsePlaying({ ...body, url: 5 }), null)
})

test("the same song with the same covers is the same, and a cover that arrives later is a change", () => {
  const a = { track: "t", artist: "a", album: "b", url: "u", image: "i", disc: null }
  assert.ok(samePlaying(a, { ...a }))
  assert.ok(!samePlaying(a, { ...a, disc: "https://lastfm/c" }))
  assert.ok(!samePlaying(a, { ...a, track: "other" }))
  assert.ok(!samePlaying(a, null))
  assert.ok(samePlaying(null, null))
})
