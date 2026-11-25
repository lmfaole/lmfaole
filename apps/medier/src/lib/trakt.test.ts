import { strict as assert } from "node:assert"
import { test } from "node:test"

import { episodeCode, episodesCode, groupViewings, mergeHistory, parseHistory } from "./trakt.ts"

const movie = { id: 1, watched_at: "2026-11-18T20:00:00.000Z", type: "movie", movie: { title: "Heat", year: 1995, ids: { slug: "heat-1995", tmdb: 949 } } }
const episode = {
  id: 2,
  watched_at: "2026-11-19T19:00:00.000Z",
  type: "episode",
  episode: { season: 2, number: 5, title: "Rubicon" },
  show: { title: "Andor", year: 2022, ids: { slug: "andor", tmdb: 83867 } },
}

test("a film and an episode are read with their links to Trakt, and anything else is left out", () => {
  assert.deepEqual(parseHistory([movie, episode, { id: 3, type: "movie" }, "junk"]), [
    { id: 1, watchedAt: "2026-11-18T20:00:00.000Z", kind: "film", title: "Heat", year: 1995, episode: null, url: "https://trakt.tv/movies/heat-1995", tmdbId: 949, poster: null, info: null },
    { id: 2, watchedAt: "2026-11-19T19:00:00.000Z", kind: "episode", title: "Andor", year: 2022, episode: { title: "Rubicon", season: 2, number: 5 }, url: "https://trakt.tv/shows/andor/seasons/2/episodes/5", tmdbId: 83867, poster: null, info: null },
  ])
  assert.deepEqual(parseHistory({ error: "x" }), [])
})

test("the films and the episodes are one list, newest first, each viewing once", () => {
  const [film, show] = parseHistory([movie, episode])
  assert.ok(film !== undefined && show !== undefined)
  assert.deepEqual(mergeHistory([film], [show, film]).map((watch) => watch.id), [2, 1])
  assert.equal(episodeCode({ season: 2, number: 5 }), "S2 E5")
})

const watch = (id: number, at: string, title: string, episode: { season: number; number: number } | null) => ({
  id, watchedAt: at, kind: episode === null ? ("film" as const) : ("episode" as const), title, year: 2023, url: "u", tmdbId: null, poster: id === 1 ? null : `p${id}`, info: null,
  episode: episode === null ? null : { title: `T${episode.number}`, ...episode },
})

test("a binge of one show on one day is one row, oldest episode first; another day, another show or a film between starts a new row", () => {
  const rows = groupViewings([
    watch(1, "2026-11-09T12:39:00Z", "Silo", { season: 3, number: 10 }),
    watch(2, "2026-11-09T11:40:00Z", "Silo", { season: 3, number: 9 }),
    watch(3, "2026-11-08T21:08:00Z", "Silo", { season: 3, number: 7 }),
    watch(4, "2026-11-08T20:16:00Z", "Heat", null),
    watch(5, "2026-11-08T19:00:00Z", "Silo", { season: 3, number: 6 }),
  ])
  assert.deepEqual(rows.map((row) => [row.title, row.episodes.map((episode) => episode.number), row.poster]), [["Silo", [9, 10], "p2"], ["Silo", [7], "p3"], ["Heat", [], "p4"], ["Silo", [6], "p5"]])
})

test("a night past midnight in Oslo is the next day, and the codes say a run, a jump between seasons and a season with gaps", () => {
  // 23:30 and 00:30 in Oslo (UTC+1): two days.
  assert.equal(groupViewings([watch(2, "2026-11-08T23:30:00Z", "Silo", { season: 1, number: 2 }), watch(3, "2026-11-08T22:30:00Z", "Silo", { season: 1, number: 1 })]).length, 2)
  assert.equal(episodesCode([{ season: 3, number: 9 }]), "S3 E9")
  assert.equal(episodesCode([{ season: 3, number: 5 }, { season: 3, number: 6 }, { season: 3, number: 7 }]), "S3 E5–E7")
  assert.equal(episodesCode([{ season: 2, number: 9 }, { season: 3, number: 1 }]), "S2 E9–S3 E1")
  assert.equal(episodesCode([{ season: 3, number: 1 }, { season: 3, number: 4 }]), "S3: 2 episoder")
})
