import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Play } from "./lastfm.ts"
import { groupNounsOf, listeningSessions, playingEvent, playsTimeline, spansWithin, watchesTimeline, watchSessions } from "./timeline.ts"
import type { Watch } from "./trakt.ts"
import { trackKey } from "./wrapped.ts"

const play = (playedAt: string | null, track: string, album = "Blue", artist = "Joni Mitchell"): Play => ({ track, artist, album, image: null, url: `https://www.last.fm/music/x/_/${track}`, playedAt })
const watch = (id: number, watchedAt: string, title: string, episode: { season: number; number: number } | null, runtime: number | null = null): Watch => ({
  id,
  watchedAt,
  kind: episode === null ? "film" : "episode",
  title,
  year: null,
  episode: episode === null ? null : { title: "", ...episode },
  url: `https://trakt.tv/x/${id}`,
  tmdbId: null,
  poster: null,
  info: runtime === null ? null : { overview: null, genres: [], runtime, seasons: null, rating: null, cast: [], crew: [] },
})

test("nothing played or watched is no events and no sessions", () => {
  assert.deepEqual(playsTimeline([]), [])
  assert.deepEqual(watchesTimeline([]), [])
  assert.deepEqual(listeningSessions([]), [])
  assert.deepEqual(watchSessions([]), [])
})

test("a play is «spilte <spor – artist>», newest first, grouped by album, with what plays now left out", () => {
  const events = playsTimeline([play("2026-11-19T10:00:00.000Z", "River"), play(null, "Now"), play("2026-11-19T11:00:00.000Z", "Carey")], { href: (one) => `/musikk/spor/${one.track}/` })
  assert.deepEqual(events.map((event) => event.target?.label), ["Carey – Joni Mitchell", "River – Joni Mitchell"])
  assert.deepEqual(events[0], {
    id: `spilt-${Date.parse("2026-11-19T11:00:00.000Z") / 1000}`,
    at: "2026-11-19T11:00:00.000Z",
    kind: "event",
    icon: "music",
    summary: "spilte",
    target: { label: "Carey – Joni Mitchell", href: "/musikk/spor/Carey/" },
    href: "https://www.last.fm/music/x/_/Carey",
    group: "album:joni-mitchell--blue",
    groupNoun: "spor",
  })
  assert.deepEqual(groupNounsOf(events), { "album:joni-mitchell--blue": "spor" })
})

test("a play with no album is grouped by its artist, as every play is with groupBy artist", () => {
  assert.equal(playsTimeline([play("2026-11-19T10:00:00.000Z", "Single", "")])[0]?.group, "artist:joni-mitchell")
  assert.equal(playsTimeline([play("2026-11-19T10:00:00.000Z", "River")], { groupBy: "artist" })[0]?.group, "artist:joni-mitchell")
})

test("two plays at the same second keep their order and get ids of their own", () => {
  const events = playsTimeline([play("2026-11-19T10:00:00.000Z", "A"), play("2026-11-19T10:00:00.000Z", "B")])
  assert.deepEqual(events.map((event) => event.target?.label.split(" ")[0]), ["A", "B"])
  assert.equal(new Set(events.map((event) => event.id)).size, 2)
})

test("a viewing is «så <tittel>», an episode with its code and grouped by its show", () => {
  const events = watchesTimeline([watch(1, "2026-11-18T20:00:00.000Z", "Heat", null), watch(2, "2026-11-19T19:00:00.000Z", "Andor", { season: 2, number: 5 })])
  assert.deepEqual(events.map(({ id, icon, summary, target, group, groupNoun }) => ({ id, icon, summary, target, group, groupNoun })), [
    { id: "sett-2", icon: "tv", summary: "så", target: { label: "Andor, S2 E5", href: "https://trakt.tv/x/2" }, group: "show:andor", groupNoun: "episoder" },
    { id: "sett-1", icon: "film", summary: "så", target: { label: "Heat", href: "https://trakt.tv/x/1" }, group: undefined, groupNoun: undefined },
  ])
})

test("one play is a session as long as a typical song", () => {
  assert.deepEqual(listeningSessions([play("2026-11-19T10:00:00.000Z", "River")]), [
    { key: "lytteokt-2026-11-19T10:00:00.000Z", label: "Lytteøkt, 1 spor", start: "2026-11-19T10:00:00.000Z", end: "2026-11-19T10:03:30.000Z", row: "Musikk" },
  ])
})

test("plays less than 30 minutes apart are one session, across midnight too; a longer pause starts the next", () => {
  const lengths = new Map([[trackKey("Joni Mitchell", "B"), 300]])
  const spans = listeningSessions([play("2026-11-19T23:50:00.000Z", "A"), play("2026-11-20T00:20:00.000Z", "B"), play("2026-11-20T01:00:00.000Z", "C")], { lengths })
  assert.deepEqual(spans.map(({ label, start, end }) => ({ label, start, end })), [
    { label: "Lytteøkt, 2 spor", start: "2026-11-19T23:50:00.000Z", end: "2026-11-20T00:25:00.000Z" },
    { label: "Lytteøkt, 1 spor", start: "2026-11-20T01:00:00.000Z", end: "2026-11-20T01:03:30.000Z" },
  ])
})

test("a whole day of plays without a pause is one long session, and plays at the same second count each", () => {
  const plays = Array.from({ length: 24 * 4 }, (_, index) => play(new Date(Date.parse("2026-11-19T00:00:00.000Z") + index * 15 * 60_000).toISOString(), `T${index}`))
  const spans = listeningSessions([...plays, play("2026-11-19T00:00:00.000Z", "Twice")])
  assert.equal(spans.length, 1)
  assert.equal(spans[0]?.label, "Lytteøkt, 97 spor")
  assert.equal(spans[0]?.end, "2026-11-19T23:48:30.000Z")
})

test("a viewing ends when Trakt marks it seen: a film's runtime, a show's episodes in a row are one session", () => {
  const spans = watchSessions([
    watch(4, "2026-11-19T22:00:00.000Z", "Heat", null, 170),
    watch(3, "2026-11-19T18:30:00.000Z", "Andor", { season: 1, number: 2 }),
    watch(2, "2026-11-19T17:45:00.000Z", "Andor", { season: 1, number: 1 }),
    watch(1, "2026-11-18T22:00:00.000Z", "Dune", null),
  ])
  assert.deepEqual(spans.map(({ label, start, end, row }) => ({ label, start, end, row })), [
    { label: "Dune", start: "2026-11-18T20:10:00.000Z", end: "2026-11-18T22:00:00.000Z", row: "Film og TV" },
    { label: "Andor, 2 episoder", start: "2026-11-19T17:00:00.000Z", end: "2026-11-19T18:30:00.000Z", row: "Film og TV" },
    { label: "Heat", start: "2026-11-19T19:10:00.000Z", end: "2026-11-19T22:00:00.000Z", row: "Film og TV" },
  ])
  assert.equal(watchSessions([watch(2, "2026-11-19T22:00:00.000Z", "Heat", null, 120), watch(1, "2026-11-19T19:50:00.000Z", "Andor", { season: 1, number: 1 })])[0]?.label, "Titteøkt, 2 titler")
})

test("the song playing now is an ongoing event at now, with no group", () => {
  assert.deepEqual(playingEvent({ track: "River", artist: "Joni Mitchell", url: "https://open.spotify.com/track/1" }, "2026-11-20T12:00:00.000Z", "https://open.spotify.com/track/1"), {
    id: "spiller-na",
    at: "2026-11-20T12:00:00.000Z",
    kind: "event",
    icon: "music",
    summary: "spiller",
    target: { label: "River – Joni Mitchell", href: "https://open.spotify.com/track/1" },
    href: "https://open.spotify.com/track/1",
    ongoing: true,
  })
  assert.equal(playingEvent({ track: "River", artist: "Joni Mitchell", url: "" }, "2026-11-20T12:00:00.000Z").target?.href, undefined)
})

test("a song playing now carries on the last session, or starts one of its own, with no end", () => {
  const plays = [play("2026-11-20T11:50:00.000Z", "A"), play("2026-11-20T09:00:00.000Z", "B")]
  const near = listeningSessions(plays, { playingAt: "2026-11-20T12:00:00.000Z" })
  assert.deepEqual(near.map(({ label, start, end }) => ({ label, start, end })), [
    { label: "Lytteøkt, 1 spor", start: "2026-11-20T09:00:00.000Z", end: "2026-11-20T09:03:30.000Z" },
    { label: "Lytteøkt, 2 spor", start: "2026-11-20T11:50:00.000Z", end: undefined },
  ])
  const far = listeningSessions(plays, { playingAt: "2026-11-20T15:00:00.000Z" })
  assert.deepEqual(far.at(-1), { key: "lytteokt-2026-11-20T15:00:00.000Z", label: "Lytteøkt, 1 spor", start: "2026-11-20T15:00:00.000Z", row: "Musikk" })
  assert.equal(far.length, 3)
})

test("only the spans that reach into the window are kept", () => {
  const spans = [
    { key: "a", label: "A", start: "2026-11-17T10:00:00.000Z", end: "2026-11-17T11:00:00.000Z" },
    { key: "b", label: "B", start: "2026-11-18T11:30:00.000Z", end: "2026-11-18T12:30:00.000Z" },
    { key: "c", label: "C", start: "2026-11-20T11:00:00.000Z" },
  ]
  assert.deepEqual(spansWithin(spans, "2026-11-18T12:00:00.000Z", "2026-11-20T12:00:00.000Z").map((span) => span.key), ["b", "c"])
})
