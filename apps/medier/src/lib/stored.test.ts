import { strict as assert } from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { DatabaseSync } from "node:sqlite"
import { test } from "node:test"

import { isMissingTable, optional, type Row } from "@lmfaole/web/d1"
import type { Query, Store } from "./d1.ts"
import { type Env, type Get } from "./sources.ts"
import { lastfmTrackUrl, listensCover, newArtistsIn, storedGames, storedMusic, storedRetroGames, steamMachine, storedSteamGame, storedWatched, watchesIn } from "./stored.ts"
import { loadTrend, loadWeek } from "./week-source.ts"
import { parseWeek, type Week } from "./weeks.ts"

/** The activity Worker's own migrations, so the queries are tried against the tables as they are. */
const MIGRATIONS = new URL("../../../../workers/activity/migrations/", import.meta.url)
const FOLDERS: Record<Store, string> = { music: "music", watching: "watching", games: "gameplay" }

/** A database of the store with its migrations up to `upTo` (all where none is given): one that is not applied yet is not there. */
function database(store: Store, upTo = "9999"): DatabaseSync {
  const db = new DatabaseSync(":memory:")
  const folder = new URL(`${FOLDERS[store]}/`, MIGRATIONS)
  for (const file of readdirSync(folder).sort()) if (file.endsWith(".sql") && file.slice(0, 4) <= upTo) db.exec(readFileSync(new URL(file, folder), "utf8"))
  return db
}

/** A `query` on the databases, remembering what it was asked; with `kept`, each query's rows are the first it gave, as the Worker's cache keeps them. */
function reader(dbs: Partial<Record<Store, DatabaseSync>>, kept = false): { query: Query; asked: string[] } {
  const asked: string[] = []
  const cache = new Map<string, Row[]>()
  const query: Query = async (store, sql, params) => {
    const key = JSON.stringify([store, sql, params])
    const found = kept ? cache.get(key) : undefined
    if (found !== undefined) return found
    asked.push(sql)
    const db = dbs[store]
    if (db === undefined) throw new Error(`${store}: not bound`)
    const rows = db.prepare(sql).all(...params) as Row[]
    cache.set(key, rows)
    return rows
  }
  return { query, asked }
}

function fakeGet(answer: (url: string) => unknown = () => ({})): { get: Get; asked: string[] } {
  const asked: string[] = []
  return {
    asked,
    get: async (url) => {
      asked.push(url)
      return { data: answer(url), hit: false }
    },
  }
}

const found = parseWeek("2026-47")
if (found === null) throw new Error("the week")
const WEEK: Week = found
const AFTER = Date.parse("2026-11-23T08:00:00+01:00")
const ENV: Env = { LASTFM_API_KEY: "k", LASTFM_USER: "me", TRAKT_CLIENT_ID: "c", TRAKT_USER: "me", STEAM_USER: "76561198871653749", RETROACHIEVEMENTS_API_KEY: "r", RETROACHIEVEMENTS_USER: "me" }

const movie = (id: number, at: string, title: string, slug: string) => ({ id, watched_at: at, action: "watch", type: "movie", movie: { title, year: 2020, ids: { slug, tmdb: id + 1000 } } })
const episode = (id: number, at: string, show: string) => ({ id, watched_at: at, action: "watch", type: "episode", episode: { title: "Pilot", season: 1, number: 1, ids: { tmdb: 77 } }, show: { title: show, year: 2019, ids: { slug: "show", tmdb: 55 } } })

function addWatch(db: DatabaseSync, raw: ReturnType<typeof movie> | ReturnType<typeof episode>, at = Math.floor(Date.parse(raw.watched_at) / 1000)): void {
  const title = "movie" in raw ? raw.movie.title : raw.show.title
  db.prepare("INSERT INTO watches (id, watched_at, action, type, title, raw) VALUES (?, ?, 'watch', ?, ?, ?)").run(raw.id, at, raw.type, title, JSON.stringify(raw))
}

function addListen(db: DatabaseSync, at: number, artist: string, track: string, extra: { album?: string; durationMs?: number; release?: string } = {}): void {
  db.prepare("INSERT INTO listens (listened_at, artist, track, album, duration_ms, release_mbid) VALUES (?, ?, ?, ?, ?, ?)").run(at, artist, track, extra.album ?? null, extra.durationMs ?? null, extra.release ?? null)
}
const setCursor = (db: DatabaseSync, at: number): void => void db.prepare("INSERT INTO state (key, value) VALUES ('cursor', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").run(String(at))

test("a table that is not there yet is no rows; any other failure is still one", async () => {
  const { query } = reader({ watching: database("watching", "0002") })
  await assert.rejects(query("watching", "SELECT * FROM film_log", [], 60), (error) => isMissingTable(error))
  assert.deepEqual(await optional(query("watching", "SELECT * FROM film_log", [], 60)), [])
  await assert.rejects(optional(query("music", "SELECT 1", [], 60)), /not bound/)
})

test("the last viewings are Trakt's stored history entries, films and episodes together, newest first, with no undated ones", async () => {
  const db = database("watching")
  addWatch(db, movie(1, "2026-11-20T20:00:00.000Z", "Heat", "heat-1995"))
  addWatch(db, episode(2, "2026-11-21T20:00:00.000Z", "Show"))
  addWatch(db, movie(3, "2026-11-19T20:00:00.000Z", "Undated", "undated"), 0)
  const { get, asked } = fakeGet()
  const watched = await storedWatched({ TRAKT_USER: "me" }, reader({ watching: db }).query, get, AFTER)
  assert.deepEqual(watched?.items.map((one) => [one.id, one.kind, one.title, one.url]), [
    [2, "episode", "Show", "https://trakt.tv/shows/show/seasons/1/episodes/1"],
    [1, "film", "Heat", "https://trakt.tv/movies/heat-1995"],
  ])
  // The show's TMDB id, not the episode's, so its poster is the show's.
  assert.equal(watched?.items[0]?.tmdbId, 55)
  assert.equal(asked.length, 0)
  await assert.rejects(storedWatched({ TRAKT_USER: "me" }, reader({ watching: database("watching") }).query, get, AFTER), /nothing stored/)
})

test("a stretch's films are Trakt's, and the log's where it is there: not the ones already on Trakt, at noon of their day, with ids below zero", async () => {
  const span = { start: Date.parse("2019-05-01T00:00:00Z") / 1000, end: Date.parse("2019-06-01T00:00:00Z") / 1000 }
  const before = database("watching", "0002")
  addWatch(before, movie(9, "2019-05-03T20:00:00.000Z", "Alien", "alien"))
  assert.deepEqual((await watchesIn(reader({ watching: before }).query, span, "movie", 60)).map((one) => one.id), [9])
  const after = database("watching")
  addWatch(after, movie(9, "2019-05-03T20:00:00.000Z", "Alien", "alien"))
  after.prepare("INSERT INTO film_log (id, watched_on, title, year, tmdb_id, same_as) VALUES (4, '2019-05-10', 'Logged', 1999, 603, NULL), (5, '2019-05-03', 'Alien', 1979, 348, 'trakt:9'), (6, '2019-07-01', 'Later', NULL, NULL, NULL)").run()
  after.prepare("INSERT INTO tv_log (id, watched_on, show, tmdb_id, season, episode) VALUES (7, '2019-05-11', 'Old show', 12, 2, 3), (8, NULL, 'Undated', NULL, 1, 1)").run()
  const { query } = reader({ watching: after })
  const films = await watchesIn(query, span, "movie", 60)
  assert.deepEqual(films.map((one) => [one.id, one.title, one.watchedAt, one.url]), [
    [-10, "Logged", "2019-05-10T12:00:00.000Z", "https://www.themoviedb.org/movie/603"],
    [9, "Alien", "2019-05-03T20:00:00.000Z", "https://trakt.tv/movies/alien"],
  ])
  const episodes = await watchesIn(query, span, "episode", 60)
  assert.deepEqual(episodes.map((one) => [one.id, one.title, one.episode, one.tmdbId]), [[-15, "Old show", { title: "", season: 2, number: 3 }, 12]])
})

test("the Steam games are the stored ones, with the minutes they grew by the last two weeks (not the first count, and not before)", async () => {
  const db = database("games")
  const now = Math.floor(AFTER / 1000)
  db.prepare("INSERT INTO games (source, game_id, name, platform, minutes, last_played, updated_at) VALUES ('steam', '620', 'Portal 2', NULL, 666, ?, 0), ('steam', '10', 'Deck game', 'Steam Deck', 30, ?, 0), ('steam', '70', 'Half-Life', 'Windows', 90, ?, 0), ('ra', '668', 'Emerald', 'Game Boy Advance', NULL, ?, 0)").run(now - 100, now - 50, now - 200, now - 10)
  db.prepare("INSERT INTO play_events (source, game_id, at, minutes_added, baseline) VALUES ('steam', '620', ?, 600, 1), ('steam', '620', ?, 40, 0), ('steam', '620', ?, 26, 0), ('steam', '620', ?, 99, 0)").run(now - 20 * 86400, now - 86400, now - 100, now - 15 * 86400)
  const { query } = reader({ games: db })
  const library = await storedGames(ENV, query, AFTER)
  assert.equal(library?.owned, 3)
  assert.equal(library?.profile, "https://steamcommunity.com/profiles/76561198871653749/")
  assert.deepEqual(library?.entries.map((one) => [one.id, one.title, one.platform, one.totalMinutes, one.recentMinutes]), [
    [10, "Deck game", "Steam Deck", 30, 0],
    [620, "Portal 2", "PC", 666, 66],
    [70, "Half-Life", "Windows", 90, 0],
  ])
  assert.deepEqual((await storedSteamGame(ENV, query, 70, AFTER))?.game.platforms, [{ label: "Windows", minutes: 90 }])
  assert.deepEqual((await storedSteamGame(ENV, query, 620, AFTER))?.recentMinutes, 66)
  assert.equal(await storedSteamGame(ENV, query, 999, AFTER), null)
  // A custom name is Steam's to resolve.
  await assert.rejects(storedGames({ STEAM_USER: "name" }, query, AFTER))
  await assert.rejects(storedGames(ENV, reader({ games: database("games") }).query, AFTER), /nothing stored/)
})

test("a stored Steam machine is named as Steam's list names it, and an unknown one is none", () => {
  assert.equal(steamMachine("Mac"), "Mac")
  assert.equal(steamMachine("linux"), "Linux")
  assert.equal(steamMachine("Steam Deck"), "Steam Deck")
  assert.equal(steamMachine("Amiga"), null)
  assert.equal(steamMachine(""), null)
  assert.equal(steamMachine(null), null)
})

test("the retro games are the stored ones, each with its picture and time from the game's own answer", async () => {
  const db = database("games")
  db.prepare("INSERT INTO games (source, game_id, name, platform, last_played, achievements_total, achievements_earned, updated_at) VALUES ('ra', '668', 'Emerald', 'Game Boy Advance', 200, 197, 26, 0), ('ra', '34641', 'Battle Revolution', 'Wii', 300, 0, 0, 0)").run()
  const { get, asked } = fakeGet((url) => (url.includes("g=668") ? { ID: 668, Title: "Emerald", ImageTitle: "/Images/1.png", UserTotalPlaytime: 330 * 60 } : (() => { throw new Error("down") })()))
  const library = await storedRetroGames(ENV, reader({ games: db }).query, get)
  assert.deepEqual(library?.entries.map((one) => [one.id, one.platform, one.picture, one.totalMinutes, one.lastPlayed]), [
    [34641, "Wii", null, 0, 300],
    [668, "Game Boy Advance", "https://media.retroachievements.org/Images/1.png", 330, 200],
  ])
  assert.equal(asked.length, 2)
  await assert.rejects(storedRetroGames(ENV, reader({ games: database("games") }).query, get), /no retro games/)
})

test("the listens are had for a stretch only up to the newest one stored, or when they are caught up with now", () => {
  assert.equal(listensCover(1000, 900, 5_000_000), true)
  assert.equal(listensCover(1000, 1100, 5_000_000), false)
  assert.equal(listensCover(5_000_000 - 3600, 5_000_000, 5_000_000), true)
})

test("the music page's listens are not read until the database has caught up with now; then the last fifty and the month's artists, linked as Last.fm's", async () => {
  const db = database("music")
  const now = Math.floor(AFTER / 1000)
  addListen(db, now - 7200, "Rico Nasty", "IPHONE", { album: "Nightmare Vacation", release: "8e3fc9d6-c6f0-4426-8c8e-c37f20fcef9e" })
  addListen(db, now - 3600, "Rico Nasty", "Smack a Bitch")
  addListen(db, now - 40 * 86400, "Old", "Song")
  setCursor(db, now - 40 * 86400)
  await assert.rejects(storedMusic(ENV, reader({ music: db }).query, AFTER), /not caught up/)
  setCursor(db, now - 3600)
  const music = await storedMusic(ENV, reader({ music: db }).query, AFTER)
  assert.deepEqual(music.recent.map((play) => play.track), ["Smack a Bitch", "IPHONE", "Song"])
  assert.equal(music.recent[1]?.image, "https://coverartarchive.org/release/8e3fc9d6-c6f0-4426-8c8e-c37f20fcef9e/front-250")
  assert.equal(music.recent[1]?.url, "https://www.last.fm/music/Rico+Nasty/_/IPHONE")
  assert.deepEqual(music.topArtists, [{ name: "Rico Nasty", plays: 2, url: "https://www.last.fm/music/Rico+Nasty" }])
  assert.equal(music.source, "lastfm")
  assert.equal(lastfmTrackUrl("AC/DC", "T.N.T. + 1"), "https://www.last.fm/music/AC%2FDC/_/T.N.T.+%2B+1")
})

test("an artist is new when its first listen is in the stretch, also when the kept first listens are from before it was heard", async () => {
  const db = database("music")
  const span = { start: 1000, end: 2000 }
  addListen(db, 500, "alpha", "Old")
  addListen(db, 1100, "Alpha", "New")
  addListen(db, 1200, "Beta", "First")
  setCursor(db, 1200)
  const { query, asked } = reader({ music: db }, true)
  const artists = [{ name: "Alpha" }, { name: "Beta" }]
  assert.deepEqual(await newArtistsIn(query, artists, span), [{ name: "Beta" }])
  // After the first listens were kept (at 1200): Gamma heard before the next stretch, Delta only in it.
  addListen(db, 2500, "Gamma", "One")
  addListen(db, 3100, "Gamma", "Two")
  addListen(db, 3200, "Delta", "One")
  const next = await newArtistsIn(query, [{ name: "Gamma" }, { name: "Delta" }, { name: "Beta" }], { start: 3000, end: 4000 })
  assert.deepEqual(next, [{ name: "Delta" }])
  assert.equal(asked.filter((sql) => sql.includes("MIN(listened_at)")).length, 1)
})

test("many artists heard after the kept first listens are asked about in parts D1 allows (100 bound values a query)", async () => {
  const db = database("music")
  addListen(db, 50, "Someone", "Song")
  setCursor(db, 50)
  const { query: read, asked } = reader({ music: db }, true)
  const query: Query = async (store, sql, params, ttl) => {
    assert.ok(params.length <= 100, `${params.length} bound values`)
    return read(store, sql, params, ttl)
  }
  await newArtistsIn(query, [{ name: "Someone" }], { start: 0, end: 100 })
  const artists = Array.from({ length: 200 }, (_, i) => ({ name: `Artist ${i}` }))
  for (const [i, artist] of artists.entries()) addListen(db, i % 2 === 0 ? 500 : 1500, artist.name, "Song")
  const found = await newArtistsIn(query, artists, { start: 1000, end: 2000 })
  assert.deepEqual(found, artists.filter((_, i) => i % 2 === 1))
  assert.equal(asked.filter((sql) => sql.includes(" IN (")).length, 3)
})

const lastfm = (answer: (method: string, url: URL) => unknown) =>
  fakeGet((url) => {
    const parsed = new URL(url)
    return answer(parsed.searchParams.get("method") ?? "", parsed)
  })

test("a week the listens have is read from them: no Last.fm but the lengths they do not know; a week they have not, from Last.fm", async () => {
  const db = database("music")
  addListen(db, WEEK.start + 100, "Alpha", "A1", { durationMs: 180_000 })
  addListen(db, WEEK.start + 200, "Alpha", "A1", { durationMs: 180_000 })
  addListen(db, WEEK.start + 300, "Beta", "B1")
  addListen(db, WEEK.start - 100, "Alpha", "A0")
  addListen(db, WEEK.start - 200, "Gamma", "G0")
  setCursor(db, WEEK.end + 10)
  const { get, asked } = lastfm((method) => (method === "track.getinfo" ? { track: { duration: "200000" } } : { recenttracks: { "@attr": { totalPages: "1", total: "0" }, track: [] } }))
  const data = await loadWeek(ENV, get, WEEK, AFTER, "music", reader({ music: db }).query)
  assert.equal(data.music?.stats.total, 3)
  assert.equal(data.music?.previousTotal, 2)
  assert.deepEqual(data.music?.newArtists?.map((artist) => artist.name), ["Beta"])
  assert.deepEqual(asked.map((url) => new URL(url).searchParams.get("method")), ["track.getinfo"])
  assert.ok(asked[0]?.includes("track=B1"))
  assert.deepEqual(data.music?.stats.listening, { seconds: 180 + 180 + 200, knownPlays: 3 })
  // Behind the week: Last.fm's.
  setCursor(db, WEEK.start - 86400)
  const behind = lastfm(() => ({ recenttracks: { "@attr": { totalPages: "1", total: "0" }, track: [] }, weeklyartistchart: { artist: [] } }))
  await loadWeek(ENV, behind.get, WEEK, AFTER, "music", reader({ music: db }).query)
  assert.ok(behind.asked.some((url) => url.includes("user.getrecenttracks")))
})

test("a week's films are read from the history stored, and from Trakt where the database cannot answer", async () => {
  const db = database("watching")
  addWatch(db, movie(1, new Date((WEEK.start + 3600) * 1000).toISOString(), "Heat", "heat"))
  const { get, asked } = fakeGet(() => [])
  const data = await loadWeek(ENV, get, WEEK, AFTER, "film", reader({ watching: db }).query)
  assert.deepEqual(data.watched?.items.map((one) => one.title), ["Heat"])
  assert.equal(asked.length, 0)
  const unbound = await loadWeek(ENV, get, WEEK, AFTER, "film", reader({}).query)
  assert.deepEqual(unbound.watched?.items, [])
  assert.ok(asked.some((url) => url.startsWith("https://api.trakt.tv/")))
})

test("a trend counts the periods the listens have from them, and asks Last.fm only of the rest", async () => {
  const db = database("music")
  addListen(db, 150, "A", "1")
  addListen(db, 160, "A", "2")
  setCursor(db, 300)
  const { get, asked } = lastfm(() => ({ recenttracks: { "@attr": { totalPages: "1", total: "7" }, track: [] } }))
  const points = await loadTrend(ENV, get, [{ id: "a", start: 100, end: 200 }, { id: "b", start: 200, end: 300 }, { id: "c", start: 300, end: 400 }], AFTER, reader({ music: db }).query)
  assert.deepEqual(points, [{ id: "a", total: 2 }, { id: "b", total: 0 }, { id: "c", total: 7 }])
  assert.equal(asked.length, 1)
})
