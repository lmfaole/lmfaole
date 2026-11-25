/**
 * What a page needs, read from the D1 databases the activity Worker fills (`d1.ts`), in the same shapes as `sources.ts` gives them from the services: the listens, what was watched, the games.
 * The services are still asked for what the databases do not hold (what plays now, the posters, a retro game's picture and time). Each loader throws where its database cannot answer, so
 * `runtime.ts` asks the service instead. Pure but for the `query` and `get` that are passed in.
 */

import { type ChartArtist, type Play, type TopArtist } from "./lastfm.ts"
import { coverOf } from "./listenbrainz.ts"
import { type Env, type GameLibrary, type Get, type Listening, setting, TTL, withPosters } from "./sources.ts"
import { isSteamId, type OwnedGame, PLATFORMS, profileUrl } from "./steam.ts"
import { type GameEntry, retroEntry, steamEntry } from "./played-games.ts"
import { parseRetroGame, retroGameUrl, retroUserPage } from "./retroachievements.ts"
import { mergeHistory, parseHistory, type Watch, type Watched } from "./trakt.ts"
import { num, optional, type Row, str } from "@lmfaole/web/d1"
import { floorTo, type Query } from "./d1.ts"

/** A stretch of time, in unix seconds; `end` is not part of it. */
export interface Span {
  start: number
  end: number
}

// The music.

/** How long the newest listen may be behind for the listens to count as caught up: the activity Worker copies them every three hours, and a quiet day has none. */
const CAUGHT_UP = 24 * 3600
/** The most listens a stretch is read from: far more than a month of them. */
export const MAX_LISTENS = 5000

/** The newest listen the database has (`state.cursor`): while it is still filling in the past, it is far behind. */
export async function listensCursor(query: Query): Promise<number> {
  const rows = await query("music", "SELECT value FROM state WHERE key = 'cursor'", [], TTL.weekLive)
  return Number(rows[0]?.["value"] ?? 0) || 0
}

/** Whether the database has every listen of a stretch that ends at `end`: it ends before the newest listen, or the listens are caught up with now. */
export const listensCover = (cursor: number, end: number, now: number): boolean => end <= cursor || cursor >= now - CAUGHT_UP

/** Last.fm's address of an artist or a song, as Last.fm writes it (a space is «+»). */
const lastfmPart = (name: string): string => encodeURIComponent(name).replaceAll("%20", "+")
export const lastfmArtistUrl = (artist: string): string => `https://www.last.fm/music/${lastfmPart(artist)}`
export const lastfmTrackUrl = (artist: string, track: string): string => `${lastfmArtistUrl(artist)}/_/${lastfmPart(track)}`

/** A listen as a play: the cover from the Cover Art Archive by the release's MusicBrainz id, the address the song's on Last.fm. */
export function playOf(row: Row): Play | null {
  const artist = str(row["artist"])
  const track = str(row["track"])
  const at = num(row["listened_at"])
  if (artist === null || track === null || at === null) return null
  return { track, artist, album: str(row["album"]) ?? "", image: coverOf(str(row["release_mbid"]) ?? ""), url: lastfmTrackUrl(artist, track), playedAt: new Date(at * 1000).toISOString() }
}

const PLAY_COLUMNS = "listened_at, artist, track, album, duration_ms, release_mbid"

/** The listens of a stretch, newest first, and the lengths of the songs the listens know (in seconds, by `trackKey`'s key). */
export async function listensIn(query: Query, span: Span, ttl: number, key: (artist: string, track: string) => string): Promise<{ plays: Play[]; lengths: Map<string, number>; truncated: boolean }> {
  const rows = await query("music", `SELECT ${PLAY_COLUMNS} FROM listens WHERE listened_at >= ? AND listened_at < ? ORDER BY listened_at DESC LIMIT ?`, [span.start, span.end, MAX_LISTENS], ttl)
  const lengths = new Map<string, number>()
  const plays = rows.flatMap((row) => {
    const play = playOf(row)
    if (play === null) return []
    const ms = num(row["duration_ms"])
    if (ms !== null && ms > 0) lengths.set(key(play.artist, play.track), Math.round(ms / 1000))
    return [play]
  })
  return { plays, lengths, truncated: rows.length >= MAX_LISTENS }
}

/** The artists of a stretch with their plays, most first, as Last.fm's chart of it. */
export async function artistChartIn(query: Query, span: Span, ttl: number, limit = 1000): Promise<ChartArtist[]> {
  const rows = await query("music", "SELECT artist, COUNT(*) AS plays FROM listens WHERE listened_at >= ? AND listened_at < ? GROUP BY artist ORDER BY plays DESC, artist LIMIT ?", [span.start, span.end, limit], ttl)
  return rows.flatMap((row, at) => {
    const name = str(row["artist"])
    const plays = num(row["plays"])
    return name === null || plays === null ? [] : [{ name, plays, rank: at + 1 }]
  })
}

/** How many listens a stretch had. */
export async function listenCount(query: Query, span: Span, ttl: number): Promise<number> {
  const rows = await query("music", "SELECT COUNT(*) AS plays FROM listens WHERE listened_at >= ? AND listened_at < ?", [span.start, span.end], ttl)
  return num(rows[0]?.["plays"]) ?? 0
}

/**
 * Of the artists, those with no listen before the stretch began. When each artist was first heard is one read of every listen, so it is kept a day, with the newest listen there was then
 * (`seen`): an artist it does not have was first heard after that, and is asked about only between that and the stretch (a few hours of listens, or a day's).
 */
export async function newArtistsIn<T extends { name: string }>(query: Query, artists: readonly T[], span: Span): Promise<T[]> {
  if (artists.length === 0) return []
  const rows = await query("music", "SELECT NULL AS artist, CAST(value AS INTEGER) AS first FROM state WHERE key = 'cursor' UNION ALL SELECT artist, MIN(listened_at) AS first FROM listens GROUP BY artist", [], TTL.artist)
  const first = new Map<string, number>()
  let seen = 0
  for (const row of rows) {
    const name = str(row["artist"])
    const at = num(row["first"]) ?? 0
    if (name === null) seen = at
    else first.set(name.toLowerCase(), Math.min(at, first.get(name.toLowerCase()) ?? at))
  }
  const unknown = artists.filter((artist) => !first.has(artist.name.toLowerCase()))
  const heard = new Set<string>()
  if (unknown.length > 0 && seen < span.start) {
    // D1 allows 100 bound parameters a query.
    const chunks = Array.from({ length: Math.ceil(unknown.length / 90) }, (_, i) => unknown.slice(i * 90, i * 90 + 90))
    const found = await Promise.all(
      chunks.map((chunk) =>
        query("music", `SELECT DISTINCT artist FROM listens WHERE listened_at >= ? AND listened_at < ? AND artist IN (${chunk.map(() => "?").join(", ")})`, [seen, span.start, ...chunk.map((artist) => artist.name)], TTL.weekDone),
      ),
    )
    for (const row of found.flat()) heard.add((str(row["artist"]) ?? "").toLowerCase())
  }
  return artists.filter((artist) => {
    const at = first.get(artist.name.toLowerCase())
    return at === undefined ? !heard.has(artist.name.toLowerCase()) : at >= span.start
  })
}

/**
 * The music page's listens from the database: the last fifty and the artists of the last thirty days, as Last.fm's month. What plays now is Last.fm's (`now`, asked by the caller). Throws where
 * the database is not caught up with now (it is still filling in the past), so the service is asked instead.
 */
export async function storedMusic(env: Env, query: Query, nowMs: number): Promise<Omit<Listening, "now">> {
  const lastfm = setting(env, "LASTFM_USER")
  const user = lastfm === "" ? setting(env, "LISTENBRAINZ_USER") : lastfm
  if (user === "") throw new Error("music: no user")
  const now = Math.floor(nowMs / 1000)
  const cursor = await listensCursor(query)
  if (!listensCover(cursor, now, now)) throw new Error("music: the listens are not caught up")
  // The month's artists are asked of the hour, so the query is the same (and kept) for an hour.
  const hour = floorTo(now, 3600)
  const [recent, top] = await Promise.all([
    query("music", `SELECT ${PLAY_COLUMNS} FROM listens ORDER BY listened_at DESC LIMIT 50`, [], TTL.recent),
    artistChartIn(query, { start: hour - 30 * 24 * 3600, end: hour + 3600 }, TTL.topArtists, 10),
  ])
  const topArtists: TopArtist[] = top.map((artist) => ({ name: artist.name, plays: artist.plays, url: lastfmArtistUrl(artist.name) }))
  return { at: new Date(nowMs).toISOString(), user, recent: recent.flatMap((row) => playOf(row) ?? []), topArtists, source: lastfm === "" ? "listenbrainz" : "lastfm" }
}

// What was watched.

/** Trakt's history entries as they were stored (`watches.raw`), read as `trakt.ts` reads its answers. */
function watchesOf(rows: readonly Row[]): Watch[] {
  return parseHistory(
    rows.flatMap((row) => {
      try {
        return [JSON.parse(String(row["raw"]))]
      } catch {
        return []
      }
    }),
  )
}

const day = (seconds: number): string => new Date(seconds * 1000).toISOString().slice(0, 10)
/** A day of a log (`2019-05-17`) as a moment: noon, as Trakt writes a viewing of a day with no time. */
const noonOf = (value: unknown): string | null => {
  const written = str(value)
  return written !== null && /^\d{4}-\d{2}-\d{2}$/.test(written) ? `${written}T12:00:00.000Z` : null
}

/**
 * The films (`film_log`) and episodes (`tv_log`) of the owner's own logs that Trakt has not got, of the days of a stretch: there only once the migration with them is applied, and none
 * before. Their ids are below zero, so they never meet a Trakt id; a film's or a show's address is TMDB's.
 */
export async function loggedIn(query: Query, span: Span, kind: "movie" | "episode", ttl: number): Promise<Watch[]> {
  const days = [day(span.start), day(span.end), MAX_WATCHES] as const
  if (kind === "movie") {
    const rows = await optional(query("watching", "SELECT id, watched_on, title, year, tmdb_id FROM film_log WHERE same_as IS NULL AND watched_on >= ? AND watched_on < ? ORDER BY watched_on DESC LIMIT ?", days, ttl))
    return rows.flatMap((row): Watch[] => {
      const id = num(row["id"])
      const watchedAt = noonOf(row["watched_on"])
      const title = str(row["title"])
      if (id === null || watchedAt === null || title === null) return []
      const tmdbId = num(row["tmdb_id"])
      return [{ id: -2 * id - 2, watchedAt, kind: "film", title, year: num(row["year"]), episode: null, url: tmdbId === null ? "https://trakt.tv" : `https://www.themoviedb.org/movie/${tmdbId}`, tmdbId, poster: null, info: null }]
    })
  }
  const rows = await optional(query("watching", "SELECT id, watched_on, show, tmdb_id, season, episode, episode_title FROM tv_log WHERE watched_on >= ? AND watched_on < ? ORDER BY watched_on DESC LIMIT ?", days, ttl))
  return rows.flatMap((row): Watch[] => {
    const id = num(row["id"])
    const watchedAt = noonOf(row["watched_on"])
    const title = str(row["show"])
    if (id === null || watchedAt === null || title === null) return []
    const tmdbId = num(row["tmdb_id"])
    return [{ id: -2 * id - 1, watchedAt, kind: "episode", title, year: null, episode: { title: str(row["episode_title"]) ?? "", season: num(row["season"]) ?? 0, number: num(row["episode"]) ?? 0 }, url: tmdbId === null ? "https://trakt.tv" : `https://www.themoviedb.org/tv/${tmdbId}`, tmdbId, poster: null, info: null }]
  })
}

/** The most viewings of one kind a stretch is read from. */
export const MAX_WATCHES = 300

/** The films or episodes of a stretch, newest first: Trakt's history, and the logs' where they are. */
export async function watchesIn(query: Query, span: Span, kind: "movie" | "episode", ttl: number): Promise<Watch[]> {
  const [rows, logged] = await Promise.all([
    query("watching", "SELECT raw FROM watches WHERE type = ? AND watched_at >= ? AND watched_at < ? ORDER BY watched_at DESC LIMIT ?", [kind, span.start, span.end, MAX_WATCHES], ttl),
    loggedIn(query, span, kind, ttl),
  ])
  return mergeHistory(watchesOf(rows), logged)
}

/** The last fifty viewings, films and episodes together, with their posters (TMDB), as `loadWatched` gives them. */
export async function storedWatched(env: Env, query: Query, get: Get, nowMs: number): Promise<Watched | null> {
  const user = setting(env, "TRAKT_USER")
  if (user === "") return null
  const recent = (kind: string) => query("watching", "SELECT raw FROM watches WHERE type = ? AND watched_at > 0 ORDER BY watched_at DESC LIMIT 50", [kind], TTL.history)
  const [movies, episodes] = await Promise.all([recent("movie"), recent("episode")])
  const items = mergeHistory(watchesOf(movies), watchesOf(episodes)).slice(0, 50)
  if (items.length === 0) throw new Error("watching: nothing stored")
  return { at: new Date(nowMs).toISOString(), user, items: await withPosters(items, setting(env, "TMDB_API_KEY"), get) }
}

// The games.

const TWO_WEEKS = 14 * 24 * 3600
/** The owned list's time is the activity Worker's, every three hours; the fortnight's minutes are asked of the ten minutes. */
const STEP = 600

/** The machine the activity Worker stored for a Steam game (the one with the most time), named as Steam's own list is; `null` for none or one it does not know (the game shows «PC»). */
export function steamMachine(stored: string | null): string | null {
  const key = stored?.trim().toLowerCase()
  return PLATFORMS.find(([, label]) => label.toLowerCase() === key)?.[1] ?? null
}

/** A stored Steam game as the owned list has it: its machine where the Worker stored one. */
function ownedOf(row: Row): OwnedGame | null {
  const appId = Number(row["game_id"])
  const name = str(row["name"])
  if (!Number.isInteger(appId) || appId <= 0 || name === null) return null
  const minutes = num(row["minutes"]) ?? 0
  const platform = steamMachine(str(row["platform"]))
  return { appId, name, totalMinutes: minutes, lastPlayed: num(row["last_played"]), platforms: platform === null ? [] : [{ label: platform, minutes }] }
}

/** The minutes each Steam game grew by the last two weeks (the activity Worker's play events), by app id. */
async function fortnightMinutes(query: Query, nowMs: number): Promise<Map<number, number>> {
  const since = floorTo(Math.floor(nowMs / 1000), STEP) - TWO_WEEKS
  const rows = await query("games", "SELECT game_id, SUM(minutes_added) AS minutes FROM play_events WHERE source = 'steam' AND baseline = 0 AND at >= ? GROUP BY game_id", [since], TTL.gamesRecent)
  return new Map(rows.map((row) => [Number(row["game_id"]), num(row["minutes"]) ?? 0] as const))
}

const STEAM_COLUMNS = "game_id, name, platform, minutes, last_played"

/** The owner's SteamID; a custom name is not resolved here (that is Steam's), so it throws and Steam is asked. */
function steamIdOf(env: Env): string {
  const user = setting(env, "STEAM_USER")
  if (!isSteamId(user)) throw new Error("games: not a SteamID")
  return user
}

/** The owner's games on Steam, as `loadGames` gives them: every stored game, with its minutes of the last two weeks. `null` without the profile. */
export async function storedGames(env: Env, query: Query, nowMs: number): Promise<GameLibrary | null> {
  if (setting(env, "STEAM_USER") === "") return null
  const id = steamIdOf(env)
  const [rows, minutes] = await Promise.all([query("games", `SELECT ${STEAM_COLUMNS} FROM games WHERE source = 'steam' ORDER BY last_played DESC`, [], TTL.gamesRecent), fortnightMinutes(query, nowMs)])
  const owned = rows.flatMap((row) => ownedOf(row) ?? [])
  if (owned.length === 0) throw new Error("games: nothing stored")
  return { entries: owned.map((game) => steamEntry(game, minutes.get(game.appId) ?? 0)), owned: owned.length, profile: profileUrl(id) }
}

/** One stored Steam game, and its minutes of the last two weeks, for its page; `null` where it is not stored (a game lent from family is not in the owned list). */
export async function storedSteamGame(env: Env, query: Query, appId: number, nowMs: number): Promise<{ game: OwnedGame; recentMinutes: number; steamId: string } | null> {
  const steamId = steamIdOf(env)
  const [rows, minutes] = await Promise.all([query("games", `SELECT ${STEAM_COLUMNS} FROM games WHERE source = 'steam' AND game_id = ?`, [String(appId)], TTL.gamesRecent), fortnightMinutes(query, nowMs)])
  const game = rows[0] === undefined ? null : ownedOf(rows[0])
  return game === null ? null : { game, recentMinutes: minutes.get(appId) ?? 0, steamId }
}

/** How many of the retro games have their time and picture asked for: only a game's own answer (RetroAchievements') has them. */
const RETRO_TIMED = 12

/**
 * The owner's games on RetroAchievements, as `loadRetroGames` gives them: the stored ones, the last played first, each with the picture and the time from the game's own answer (the one its page
 * asks for, kept ten minutes). `null` without the key or the username.
 */
export async function storedRetroGames(env: Env, query: Query, get: Get): Promise<GameLibrary | null> {
  const key = setting(env, "RETROACHIEVEMENTS_API_KEY")
  const user = setting(env, "RETROACHIEVEMENTS_USER")
  if (key === "" || user === "") return null
  const rows = await query("games", "SELECT game_id, name, platform, last_played, achievements_total, achievements_earned FROM games WHERE source = 'ra' ORDER BY last_played DESC LIMIT 20", [], TTL.retroRecent)
  if (rows.length === 0) throw new Error("games: no retro games stored")
  const entries = await Promise.all(
    rows.map(async (row, at): Promise<GameEntry | null> => {
      const gameId = Number(row["game_id"])
      const title = str(row["name"])
      if (!Number.isInteger(gameId) || gameId <= 0 || title === null) return null
      const detail = at >= RETRO_TIMED ? null : await get(retroGameUrl(key, user, gameId), { ttl: TTL.retroGame }).then((answer) => parseRetroGame(answer.data)).catch(() => null)
      const game = { gameId, title, console: str(row["platform"]) ?? "", image: detail?.image ?? null, lastPlayed: num(row["last_played"]), unlocked: num(row["achievements_earned"]) ?? 0, total: num(row["achievements_total"]) ?? 0 }
      return retroEntry(game, detail?.minutes ?? 0)
    }),
  )
  return { entries: entries.flatMap((entry) => entry ?? []), owned: null, profile: retroUserPage(user) }
}

/** When a retro game was last played, as stored; `null` where it is not. */
export async function storedRetroLastPlayed(query: Query, gameId: number): Promise<number | null> {
  const rows = await query("games", "SELECT last_played FROM games WHERE source = 'ra' AND game_id = ?", [String(gameId)], TTL.retroRecent)
  return num(rows[0]?.["last_played"])
}
