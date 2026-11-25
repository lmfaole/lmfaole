import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Play } from "./lastfm.ts"
import type { Watch } from "./trakt.ts"
import { artistsByPlays, BINGE, changeOf, hourText, signed, listeningTime, longLength, playsChange, rankChange, TOP, TYPICAL_SECONDS, trackKey, tracksByPlays, watchStats, weekStats } from "./wrapped.ts"

const play = (track: string, artist: string, album: string, at: string, image: string | null = null): Play => ({ track, artist, album, image, url: `https://last.fm/${artist}/${track}`, playedAt: at })

// Monday 16 November 2026 in Oslo is UTC+1: 09:30 UTC is 10:30 there.
const PLAYS: Play[] = [
  play("Submit", "Shygirl", "Nymph", "2026-11-16T09:30:00Z", "n.jpg"),
  play("Submit", "Shygirl", "Nymph", "2026-11-16T09:40:00Z"),
  play("Firefly", "Shygirl", "Nymph", "2026-11-17T20:00:00Z"),
  play("Break My Soul", "Beyoncé", "Renaissance", "2026-11-17T20:10:00Z", "r.jpg"),
  play("Single", "Arca", "", "2026-11-22T22:30:00Z"),
]

test("artists, songs and albums are counted and ranked, ties by name, and a play with no album is in no album", () => {
  const stats = weekStats(PLAYS, null, new Map())
  assert.deepEqual(stats.topArtists.map((artist) => [artist.name, artist.plays, artist.rank]), [["Shygirl", 3, 1], ["Arca", 1, 2], ["Beyoncé", 1, 3]])
  assert.deepEqual(stats.topTracks.map((track) => [track.title, track.plays]), [["Submit", 2], ["Break My Soul", 1], ["Firefly", 1], ["Single", 1]])
  assert.deepEqual(stats.topAlbums.map((album) => [album.title, album.plays]), [["Nymph", 3], ["Renaissance", 1]])
  assert.equal(stats.topAlbums[0]?.image, "n.jpg")
  assert.equal(stats.topTracks[0]?.url, "https://last.fm/Shygirl/Submit")
  assert.deepEqual([stats.total, stats.artists, stats.tracks], [5, 3, 4])
})

test("no more than the top five of each is listed", () => {
  const many = Array.from({ length: 12 }, (_, index) => play(`T${index}`, `A${index}`, `L${index}`, "2026-11-16T09:30:00Z"))
  const stats = weekStats(many, null, new Map())
  assert.equal(stats.topArtists.length, TOP)
  assert.equal(stats.topTracks.length, TOP)
  assert.equal(stats.topAlbums.length, TOP)
})

test("when the plays were is told by Oslo's clock: Monday is the first day, 23:30 on Sunday is still Sunday and half past midnight is Monday, and a tie goes to the first", () => {
  const stats = weekStats(PLAYS, null, new Map())
  assert.deepEqual(stats.byDay, [2, 2, 0, 0, 0, 0, 1])
  assert.deepEqual(stats.busiestDay, { day: 0, plays: 2 })
  assert.deepEqual(stats.busiestHour, { hour: 10, plays: 2 })
  assert.equal(stats.byHour.reduce((a, b) => a + b, 0), 5)
  const night = weekStats([play("X", "Y", "", "2026-11-22T23:30:00Z")], null, new Map())
  assert.deepEqual(night.busiestDay, { day: 0, plays: 1 })
  assert.deepEqual(night.busiestHour, { hour: 0, plays: 1 })
})

test("a week with no plays has no busiest day or hour, and nothing in the lists", () => {
  const stats = weekStats([], null, new Map())
  assert.deepEqual([stats.total, stats.busiestDay, stats.busiestHour, stats.topArtists.length], [0, null, null, 0])
  assert.deepEqual(stats.listening, { seconds: 0, knownPlays: 0 })
})

test("an artist's place is compared with the week before: up or down some places, the same, or not on that chart", () => {
  const before = [{ name: "A", plays: 9, rank: 1 }, { name: "B", plays: 5, rank: 4 }, { name: "C", plays: 1, rank: 2 }]
  assert.deepEqual(changeOf(1, before, "B"), { kind: "up", by: 3 })
  assert.deepEqual(changeOf(3, before, "A"), { kind: "down", by: 2 })
  assert.deepEqual(changeOf(2, before, "C"), { kind: "same" })
  assert.deepEqual(changeOf(1, before, "New"), { kind: "entered" })
  assert.equal(weekStats(PLAYS, null, new Map()).topArtists[0]?.change, null)
  assert.deepEqual(weekStats(PLAYS, before, new Map()).topArtists[0]?.change, { kind: "entered" })
})

test("the change in plays is the difference, nothing is zero, and a week before that is not known is no change told", () => {
  assert.equal(playsChange(120, 100), 20)
  assert.equal(playsChange(80, 100), -20)
  assert.equal(playsChange(100, 100), 0)
  assert.equal(playsChange(100, null), null)
})

test("listening time is the known lengths, and the plays of unknown length are counted at the average of the known ones", () => {
  const lengths = new Map([[trackKey("Shygirl", "Submit"), 200], [trackKey("Beyoncé", "Break My Soul"), 280]])
  // Known: Submit x2 (400) + Break My Soul (280) = 680 over 3 plays, average 226.67; two unknown plays.
  assert.deepEqual(listeningTime(PLAYS, lengths), { seconds: Math.round(680 + 2 * (680 / 3)), knownPlays: 3 })
})

test("where no length is known a typical song's is used, and a length of nothing is no length", () => {
  assert.deepEqual(listeningTime(PLAYS, new Map()), { seconds: 5 * TYPICAL_SECONDS, knownPlays: 0 })
  assert.deepEqual(listeningTime(PLAYS, new Map([[trackKey("Shygirl", "Submit"), 0]])).knownPlays, 0)
})

test("a length is hours and minutes, and minutes only under an hour", () => {
  assert.equal(longLength(2700), "45 min")
  assert.equal(longLength(26400), "7 t 20 min")
  assert.equal(longLength(7200), "2 t")
})

test("the lists of artists and songs have the same order every time", () => {
  assert.deepEqual(artistsByPlays(PLAYS).map((artist) => artist.name), ["Shygirl", "Arca", "Beyoncé"])
  assert.deepEqual(tracksByPlays([...PLAYS].reverse()).map((track) => track.title), ["Submit", "Break My Soul", "Firefly", "Single"])
})

const watch = (id: number, at: string, title: string, episode: number | null): Watch => ({
  id, watchedAt: at, kind: episode === null ? "film" : "episode", title, year: 2023, url: "u", tmdbId: null, poster: id === 1 ? null : `p${id}`, info: null,
  episode: episode === null ? null : { title: `T${episode}`, season: 1, number: episode },
})

test("what was watched is counted as films and episodes, with the shows most watched first and a binge of three or more episodes of one show on a day", () => {
  const items = [
    watch(9, "2026-11-18T22:00:00Z", "Andor", 5),
    watch(8, "2026-11-18T21:00:00Z", "Andor", 4),
    watch(7, "2026-11-18T20:00:00Z", "Andor", 3),
    watch(6, "2026-11-17T20:00:00Z", "Silo", 1),
    watch(5, "2026-11-16T20:00:00Z", "Heat", null),
    watch(1, "2026-11-16T10:00:00Z", "Silo", 2),
  ]
  const stats = watchStats(items)
  assert.deepEqual([stats.films, stats.episodes], [1, 5])
  assert.deepEqual(stats.filmItems.map((film) => [film.title, film.watchedAt]), [["Heat", "2026-11-16T20:00:00Z"]])
  assert.deepEqual(stats.shows.map((show) => [show.title, show.episodes]), [["Andor", 3], ["Silo", 2]])
  assert.equal(stats.shows[1]?.poster, "p6")
  assert.deepEqual(stats.binges.map((binge) => [binge.title, binge.episodes.length]), [["Andor", 3]])
  assert.equal(BINGE, 3)
  // A film without TMDB's runtime is 110 minutes, an episode 45; Monday 16 November in Oslo.
  assert.deepEqual([stats.showCount, stats.minutes], [2, 110 + 5 * 45])
  assert.deepEqual(stats.byDay, [2, 1, 3, 0, 0, 0, 0])
  assert.deepEqual(stats.byDate, { "2026-11-16": 2, "2026-11-17": 1, "2026-11-18": 3 })
  assert.deepEqual(stats.busiestDay, { day: 2, viewings: 3 })
})

test("a week with nothing watched has nothing", () => {
  assert.deepEqual(watchStats([]), { films: 0, episodes: 0, showCount: 0, minutes: 0, byDay: [0, 0, 0, 0, 0, 0, 0], byDate: {}, busiestDay: null, filmItems: [], shows: [], binges: [], genres: [], directors: [] })
})

test("a change in plays is written with its sign, the minus sign and not a hyphen, and zero is plus and minus", () => {
  assert.equal(signed(12), "+12")
  assert.equal(signed(-8), "−8")
  assert.equal(signed(0), "±0")
  assert.equal(signed(1234), "+1\u00a0234")
})

test("a place that entered the list is new, and an hour is told as the hour it is, the last one wrapping to midnight", () => {
  assert.deepEqual(rankChange({ kind: "entered" }), { kind: "new" })
  assert.deepEqual(rankChange({ kind: "up", by: 2 }), { kind: "up", by: 2 })
  assert.equal(hourText(9), "kl. 09–10")
  assert.equal(hourText(23), "kl. 23–00")
})

test("the films' genres and directors are counted once a film, most first, from what TMDB says of them", () => {
  const info = (genres: string[], directors: [number, string][]) => ({ overview: null, genres, runtime: null, seasons: null, rating: null, cast: [], crew: directors.map(([id, name]) => ({ id, name, profile: null, role: "Regi" })) })
  const items = [
    { ...watch(3, "2026-11-18T20:00:00Z", "Heat", null), info: info(["Krim", "Drama"], [[1, "Michael Mann"]]) },
    { ...watch(2, "2026-11-17T20:00:00Z", "Collateral", null), info: info(["Krim", "Krim"], [[1, "Michael Mann"], [1, "Michael Mann"]]) },
    { ...watch(4, "2026-11-16T20:00:00Z", "Arrival", null), info: info(["Drama", "Sci-fi"], [[2, "Denis Villeneuve"]]) },
    { ...watch(5, "2026-11-16T10:00:00Z", "Andor", 1), info: info(["Drama"], [[9, "Tony Gilroy"]]) },
  ]
  const stats = watchStats(items)
  assert.deepEqual(stats.genres, [{ name: "Drama", films: 2 }, { name: "Krim", films: 2 }, { name: "Sci-fi", films: 1 }])
  assert.deepEqual(stats.directors, [{ id: 1, name: "Michael Mann", films: 2 }, { id: 2, name: "Denis Villeneuve", films: 1 }])
})
