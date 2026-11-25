import { strict as assert } from "node:assert"
import { test } from "node:test"

import { albumHref, albumPages, albumSlug, artistHref, artistPages, personHref, personId, personIn, slugify, titleHref, titlePages, trackHref, trackPages } from "./pages.ts"
import type { Play } from "./lastfm.ts"
import type { Watch } from "./trakt.ts"

const watch = (id: number, url: string, title: string, kind: "film" | "episode", poster: string | null = null): Watch => ({
  id, watchedAt: `2026-11-${String(20 - id).padStart(2, "0")}T20:00:00Z`, kind, title, year: 2023, url, tmdbId: null, poster, info: null,
  episode: kind === "film" ? null : { title: "E", season: 1, number: id },
})

test("a name becomes an address with the Norwegian letters spelled out", () => {
  assert.equal(slugify("Røyksopp & Ærlig Årstid"), "royksopp-aerlig-arstid")
  assert.equal(slugify("MØ"), "mo")
  assert.equal(slugify("!!!"), "uten-navn")
})

test("a show's episodes are one page with every viewing, at Trakt's slug, and a film with the same slug is its own page under Film", () => {
  const pages = titlePages([
    watch(1, "https://trakt.tv/shows/silo/seasons/1/episodes/2", "Silo", "episode"),
    watch(2, "https://trakt.tv/shows/silo/seasons/1/episodes/1", "Silo", "episode", "p"),
    watch(3, "https://trakt.tv/movies/silo", "Silo", "film"),
  ])
  assert.deepEqual(pages.map((page) => [page.slug, page.kind, page.viewings.length, page.poster, page.traktUrl]), [
    ["silo", "episode", 2, "p", "https://trakt.tv/shows/silo"],
    ["silo", "film", 1, null, "https://trakt.tv/movies/silo"],
  ])
  assert.deepEqual(pages.map((page) => titleHref("/", page.slug, page.kind)), ["/tv/silo/", "/film/silo/"])
})

test("an artist page has the recent plays and the place among the month's most played, and the link to it matches its address", () => {
  const pages = artistPages({
    topArtists: [{ name: "Beyoncé", plays: 100, url: "https://www.last.fm/music/Beyonc%C3%A9" }],
    recent: [
      { track: "A", artist: "Beyoncé", album: "", image: null, url: "https://www.last.fm/music/Beyonc%C3%A9/_/A", playedAt: "2026-11-19T10:00:00Z" },
      { track: "B", artist: "SZA", album: "", image: null, url: "https://www.last.fm/music/SZA/_/B", playedAt: "2026-11-19T09:00:00Z" },
    ],
  })
  assert.deepEqual(pages.map((page) => [page.slug, page.plays.length, page.top?.rank ?? null, page.url]), [
    ["beyonce", 1, 1, "https://www.last.fm/music/Beyonc%C3%A9"],
    ["sza", 1, null, "https://www.last.fm/music/SZA"],
  ])
  assert.equal(artistHref("/medier/", "Beyoncé"), "/medier/musikk/beyonce/")
})

const withCredits = (id: number, url: string, title: string, cast: { id: number; name: string; role: string | null }[], crew: { id: number; name: string; role: string }[] = []): Watch => ({
  ...watch(id, url, title, "film"),
  info: { overview: null, genres: [], runtime: null, seasons: null, rating: null, cast: cast.map((one) => ({ ...one, profile: one.id === 1 ? "/a.jpg" : null })), crew: crew.map((one) => ({ ...one, profile: null })) },
})

test("a person is found among the films seen, with the part and the jobs they had in each, and nowhere else", () => {
  const items = [
    withCredits(1, "https://trakt.tv/movies/heat-1995", "Heat", [{ id: 1, name: "Al Pacino", role: "Vincent Hanna" }]),
    withCredits(2, "https://trakt.tv/movies/scarface", "Scarface", [{ id: 1, name: "Al Pacino", role: "Tony" }, { id: 2, name: "Other", role: null }], [{ id: 1, name: "Al Pacino", role: "Regi" }]),
    withCredits(3, "https://trakt.tv/movies/x", "Other film", [{ id: 2, name: "Other", role: null }]),
  ]
  const found = personIn(items, 1)
  assert.equal(found?.name, "Al Pacino")
  assert.equal(found?.profile, "/a.jpg")
  assert.deepEqual(found?.appearances.map((one) => [one.page.title, one.roles]), [["Heat", ["Vincent Hanna"]], ["Scarface", ["Tony", "Regi"]]])
  assert.equal(personIn(items, 99), null)
})

test("a person's address has TMDB's id first, and the id is read back from it and from nothing else", () => {
  assert.equal(personHref("/", 1158, "Al Pacino"), "/personer/1158-al-pacino/")
  assert.equal(personHref("/", 225730, "神木隆之介"), "/personer/225730/")
  assert.equal(personId("1158-al-pacino"), 1158)
  assert.equal(personId("1158"), 1158)
  assert.equal(personId("al-pacino"), null)
  assert.equal(personId("12345678901-x"), null)
})

const play = (track: string, artist: string, album: string, at: string, image: string | null = null): Play => ({ track, artist, album, image, url: `https://www.last.fm/music/${artist}/_/${track}`, playedAt: at })

const RECENT = [
  play("Submit", "Shygirl", "Nymph", "2026-11-19T10:00:00Z", "n.jpg"),
  play("Firefly", "Shygirl", "Nymph", "2026-11-19T09:00:00Z"),
  play("Submit", "Shygirl", "", "2026-11-18T09:00:00Z"),
  play("Submit", "Cover Band", "Nymph", "2026-11-18T08:00:00Z"),
]

test("an album has one page for each artist and name, with the plays from it newest first and the first cover there is; a play with no album has none", () => {
  const pages = albumPages({ recent: RECENT })
  assert.deepEqual(pages.map((page) => page.slug), ["shygirl--nymph", "cover-band--nymph"])
  assert.deepEqual(pages[0]?.plays.map((one) => one.track), ["Submit", "Firefly"])
  assert.equal(pages[0]?.image, "n.jpg")
  assert.equal(pages[0]?.url, "https://www.last.fm/music/Shygirl/Nymph")
  assert.equal(albumPages({ recent: [play("A", "B C", "D E", "2026-11-19T10:00:00Z")] })[0]?.url, "https://www.last.fm/music/B+C/D+E")
})

test("a track has one page for each artist and title, however many albums or singles it was played from, with every play of it", () => {
  const pages = trackPages({ recent: RECENT })
  assert.deepEqual(pages.map((page) => page.slug), ["shygirl--submit", "shygirl--firefly", "cover-band--submit"])
  assert.equal(pages[0]?.plays.length, 2)
  assert.equal(pages[0]?.album, "Nymph")
  assert.equal(pages[0]?.image, "n.jpg")
})

test("the address of an album or a track names the artist and the name, set apart by two dashes that a slug has none of", () => {
  assert.equal(albumHref("/", "Shygirl", "Nymph"), "/musikk/album/shygirl--nymph/")
  assert.equal(trackHref("/", "Beyoncé", "Break My Soul"), "/musikk/spor/beyonce--break-my-soul/")
  assert.ok(!slugify("A -- B").includes("--"))
  assert.notEqual(albumSlug("a-b", "c"), albumSlug("a", "b-c"))
})
