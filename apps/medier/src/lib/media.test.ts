import { strict as assert } from "node:assert"
import { test } from "node:test"

import { mediumHref, oldAddress, titleHref } from "./media.ts"

test("each medium has its pages under its own address", () => {
  assert.equal(mediumHref("/", "music", "historikk/"), "/musikk/historikk/")
  assert.equal(mediumHref("/", "film", "uke/", "2026-47"), "/film/uke/2026-47/")
  assert.equal(mediumHref("/", "tv", "maned/", "2026-11"), "/tv/maned/2026-11/")
  assert.equal(mediumHref("/", "film"), "/film/")
  assert.equal(titleHref("/", "heat", "film"), "/film/heat/")
  assert.equal(titleHref("/", "succession", "episode"), "/tv/succession/")
})

test("the old shared addresses lead to the music's, with the week or month and the query; others are left alone", () => {
  assert.equal(oldAddress("/", "/historikk/", ""), "/musikk/historikk/")
  assert.equal(oldAddress("/", "/historikk", "?a=1"), "/musikk/historikk/?a=1")
  assert.equal(oldAddress("/", "/uke/", ""), "/musikk/uke/")
  assert.equal(oldAddress("/", "/uke/2026-47/", ""), "/musikk/uke/2026-47/")
  assert.equal(oldAddress("/", "/maned/2026-11/", "?x=y"), "/musikk/maned/2026-11/?x=y")
  assert.equal(oldAddress("/", "/musikk/historikk/", ""), null)
  assert.equal(oldAddress("/", "/uke/2026-47/extra/", ""), null)
})

test("the old pages of film and TV together lead to the film's in one step; a title's old page is left to its page", () => {
  assert.equal(oldAddress("/", "/film-og-tv/", "?a=1"), "/film/?a=1")
  assert.equal(oldAddress("/", "/film-og-tv", ""), "/film/")
  assert.equal(oldAddress("/", "/film-og-tv/historikk/", ""), "/film/historikk/")
  assert.equal(oldAddress("/", "/film-og-tv/uke/", ""), "/film/uke/")
  assert.equal(oldAddress("/", "/film-og-tv/uke/2026-47/", ""), "/film/uke/2026-47/")
  assert.equal(oldAddress("/", "/film-og-tv/maned/2026-11/", "?x=y"), "/film/maned/2026-11/?x=y")
  assert.equal(oldAddress("/", "/film-og-tv/succession/", ""), null)
  assert.equal(oldAddress("/", "/film/historikk/", ""), null)
})
