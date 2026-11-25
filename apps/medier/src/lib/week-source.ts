/**
 * What a week's wrapped needs from Last.fm and Trakt, asked for when the page is asked for, each answer kept for as long as it holds (a week that is over does not change; the week that is going on does).
 * Where the D1 databases (`stored.ts`) have the stretch, they are read instead, and only what they do not hold is asked for (the posters, the lengths of songs the listens do not know).
 * A page may only ask a Worker's limit of questions, so what is not kept is asked for in turns: the lengths of songs and the artists that may be new come as far as the budget goes, newest and most played
 * first, and the rest are filled in by the next pages. Pure but for `get`, which is passed in, so a test hands it a fake one.
 */

import { type ChartArtist, artistChartUrl, artistInfoUrl, type Play, parseArtistChart, parseArtistInfo, parseRecentPage, parseTrackInfo, playsInRangeUrl, playsTotalUrl, trackInfoUrl } from "./lastfm.ts"
import { type Env, type Get, lastfmBase, setting, settle, TTL, withPosters } from "./sources.ts"
import { mergeHistory, parseHistory, type Watch } from "./trakt.ts"
import type { Query } from "./d1.ts"
import { artistChartIn, listenCount, listensCover, listensCursor, listensIn, newArtistsIn, watchesIn } from "./stored.ts"
import { type Month, previousMonth } from "./months.ts"
import { previousWeek, type Week } from "./weeks.ts"
import { artistsByPlays, trackKey, tracksByPlays, type WatchStats, type WeekStats, watchStats, weekStats } from "./wrapped.ts"

/** The most pages of plays (200 each) a week is read from: a week of more than this is cut, and says so. */
export const MAX_PLAY_PAGES = 8
/** The most questions about a song's length, and about an artist being new, a page asks that are not kept already. */
export const MAX_LENGTH_LOOKUPS = 10
export const MAX_FIRSTS_LOOKUPS = 8
/** The songs whose length is wanted, the most played first: the rest are counted at the average of those. A dozen or two is a fair sample of what a week is. */
const LENGTH_CANDIDATES = 20
/** The artists that are checked for being new, the most played first. */
const FIRSTS_CANDIDATES = 10
/** Last.fm answers a rate limit as an error when an IP asks too fast: a few at a time. */
const BATCH = 3
/** How many artists a chart of Last.fm's has at most: a chart that long may have left some out. */
const CHART_CAP = 1000

export interface MusicWeek {
  stats: WeekStats
  /** The plays of the week were more than the pages read: the numbers are of the newest of them. */
  truncated: boolean
  /** The plays in the week before, `null` where it is not known. */
  previousTotal: number | null
  /** Of the most played artists, those that had never been played before the week: `null` where that could not be told. */
  newArtists: { name: string; plays: number }[] | null
}

/** A stretch of time to sum up, in unix seconds: a week or a month. `end` is not part of it. */
export interface Range {
  start: number
  end: number
}

/** What a stretch of time has to tell: the music and what was watched, each `null` where its source is not set up or fails. */
/** What a wrapped is of: the music (Last.fm), the films or the shows' episodes (Trakt). Each has its own pages, and asks only its own source (the films only Trakt's films, the TV only its episodes). */
export type Medium = "music" | "film" | "tv"

export interface PeriodData {
  /** The time is over: its numbers are final. */
  complete: boolean
  music: MusicWeek | null
  watched: { items: Watch[]; stats: WatchStats } | null
}

export interface WeekData extends PeriodData {
  week: Week
}

export interface MonthData extends PeriodData {
  month: Month
}

/** How many pages of plays a stretch of time is read from: a month is some four weeks, so it may have the pages of four. */
const PAGES = { week: MAX_PLAY_PAGES, month: 14 } as const
/** How many pages of Trakt's history (100 each, for films and for episodes) are read. */
const HISTORY_PAGES = 3

/** Runs `ask` over the items in batches, until `maxMisses` answers that were not kept have been had: what is kept costs nothing, so a page with most things kept finishes them all. */
async function within<T, R>(items: readonly T[], maxMisses: number, ask: (item: T) => Promise<{ value: R; hit: boolean }>): Promise<R[]> {
  const found: R[] = []
  let misses = 0
  for (let start = 0; start < items.length && misses < maxMisses; start += BATCH) {
    const answers = await Promise.all(items.slice(start, start + BATCH).map((item) => settle(ask(item))))
    for (const answer of answers) {
      if (answer === null) {
        misses += 1
        continue
      }
      if (!answer.hit) misses += 1
      found.push(answer.value)
    }
  }
  return found
}

/** Every finished play of the week, newest first, from the first page and as many of the others as the limit allows. */
async function readPlays(base: string, week: Range, get: Get, ttl: number, maxPages: number): Promise<{ plays: Play[]; truncated: boolean }> {
  const first = parseRecentPage((await get(playsInRangeUrl(base, week.start, week.end, 1), { ttl })).data)
  const last = Math.min(first.totalPages, maxPages)
  const rest = Array.from({ length: Math.max(0, last - 1) }, (_, index) => index + 2)
  const pages = new Map<number, Play[]>()
  // A page that fails (a rate limit, the limit on questions) is asked again once, one at a time: dropping it silently would make the count too low.
  const ask = async (page: number): Promise<void> => {
    const answer = await settle(get(playsInRangeUrl(base, week.start, week.end, page), { ttl }))
    if (answer !== null) pages.set(page, parseRecentPage(answer.data).plays)
  }
  for (let start = 0; start < rest.length; start += BATCH) await Promise.all(rest.slice(start, start + BATCH).map(ask))
  for (const page of rest) if (!pages.has(page)) await ask(page)
  const missing = rest.some((page) => !pages.has(page))
  return { plays: [...first.plays, ...rest.flatMap((page) => pages.get(page) ?? [])], truncated: missing || first.totalPages > maxPages }
}

/** The lengths in seconds of the most played songs, as far as the limit on new questions goes; those `known` already are not asked for. */
async function readLengths(env: Env, base: string, plays: readonly Play[], get: Get, known: ReadonlyMap<string, number> = new Map()): Promise<Map<string, number>> {
  const user = setting(env, "LASTFM_USER")
  const lengths = new Map(known)
  const wanted = tracksByPlays(plays).slice(0, LENGTH_CANDIDATES).filter((track) => !known.has(trackKey(track.artist, track.title)))
  const found = await within(wanted, MAX_LENGTH_LOOKUPS, async (track) => {
    const answer = await get(trackInfoUrl(base, track.artist, track.title, user), { ttl: TTL.length })
    return { value: { key: trackKey(track.artist, track.title), seconds: parseTrackInfo(answer.data).seconds }, hit: answer.hit }
  })
  for (const one of found) if (one.seconds !== null) lengths.set(one.key, one.seconds)
  return lengths
}

const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase()

/**
 * Of the most played artists, those with no plays at all before the week began. Last.fm's chart of everything before the week (from the beginning of time to its start) has the artists played, up to a thousand of them:
 * an artist that is on it is not new; one that is not is new if the chart is whole, and if the chart is cut (a library of more than a thousand artists) it is asked about by the owner's total for it, less the plays in the week
 * and after it (`user.getartisttracks`, which would say it directly, is gone from Last.fm). `null` when it could not be told.
 */
async function readNewArtists(env: Env, base: string, plays: readonly Play[], week: Range, nowMs: number, get: Get): Promise<{ name: string; plays: number }[] | null> {
  const candidates = artistsByPlays(plays).slice(0, FIRSTS_CANDIDATES)
  if (candidates.length === 0) return []
  const answer = await settle(get(artistChartUrl(base, 0, week.start), { ttl: TTL.firsts }))
  if (answer === null) return null
  const before = parseArtistChart(answer.data)
  const absent = candidates.filter((artist) => !before.some((one) => same(one.name, artist.name)))
  if (before.length < CHART_CAP) return absent
  // The chart is cut: what is not on it may have been played a few times before. Ask the totals, and what came after the week.
  const afterChart = nowMs >= week.end * 1000 ? await settle(get(artistChartUrl(base, week.end, Math.floor(nowMs / 1000)), { ttl: TTL.weekLive })) : { data: null }
  if (afterChart === null) return null
  const after = parseArtistChart(afterChart.data)
  const afterCut = after.length >= CHART_CAP
  const user = setting(env, "LASTFM_USER")
  const asked = await within(absent, MAX_FIRSTS_LOOKUPS, async (artist) => {
    const info = await get(artistInfoUrl(base, artist.name, user), { ttl: TTL.weekLive })
    const afterPlays = after.find((one) => same(one.name, artist.name))?.plays ?? (afterCut ? null : 0)
    const total = parseArtistInfo(info.data).userPlays
    return { value: { artist, earlier: total === null || afterPlays === null ? null : total - artist.plays - afterPlays }, hit: info.hit }
  })
  const known = asked.filter((one) => one.earlier !== null)
  return known.length === 0 && absent.length > 0 ? null : known.filter((one) => (one.earlier ?? 1) <= 0).map((one) => one.artist)
}

async function musicWeek(env: Env, get: Get, week: Range, previous: Range, ttl: number, nowMs: number, maxPages: number): Promise<MusicWeek | null> {
  const base = lastfmBase(env)
  if (base === null) return null
  const [{ plays, truncated }, chart] = await Promise.all([
    readPlays(base, week, get, ttl, maxPages),
    settle(get(artistChartUrl(base, previous.start, previous.end), { ttl: TTL.weekDone })).then((answer): ChartArtist[] | null => (answer === null ? null : parseArtistChart(answer.data))),
  ])
  const [lengths, newArtists] = await Promise.all([readLengths(env, base, plays, get), readNewArtists(env, base, plays, week, nowMs, get)])
  return { stats: weekStats(plays, chart, lengths), truncated, previousTotal: chart === null ? null : chart.reduce((sum, artist) => sum + artist.plays, 0), newArtists }
}

/** A stretch's music from the listens in D1: the songs' lengths the listens do not know are Last.fm's, as far as the limit goes. */
async function storedMusicWeek(env: Env, get: Get, query: Query, week: Range, previous: Range, ttl: number): Promise<MusicWeek> {
  const [{ plays, lengths: known, truncated }, chart] = await Promise.all([listensIn(query, week, ttl, trackKey), artistChartIn(query, previous, TTL.weekDone)])
  const base = lastfmBase(env)
  const [lengths, newArtists] = await Promise.all([base === null ? known : readLengths(env, base, plays, get, known), newArtistsIn(query, artistsByPlays(plays).slice(0, FIRSTS_CANDIDATES), week)])
  return { stats: weekStats(plays, chart, lengths), truncated, previousTotal: chart.reduce((sum, artist) => sum + artist.plays, 0), newArtists }
}

/** A stretch's films or episodes from Trakt's history in D1 (and the logs, where they are), with their posters. */
async function storedWatchedWeek(env: Env, get: Get, query: Query, week: Range, ttl: number, kind: "movies" | "episodes"): Promise<PeriodData["watched"]> {
  if (setting(env, "TRAKT_USER") === "") return null
  const items = await withPosters(await watchesIn(query, week, kind === "movies" ? "movie" : "episode", ttl), setting(env, "TMDB_API_KEY"), get)
  return { items, stats: watchStats(items) }
}

/** What the database has, or, where it has not (`null`) or cannot answer, what the service has. */
async function storedOr<T>(stored: (() => Promise<T | null>) | null, service: () => Promise<T>): Promise<T> {
  const found = stored === null ? null : await stored().catch(() => null)
  return found ?? service()
}

async function watchedWeek(env: Env, get: Get, week: Range, ttl: number, kind: "movies" | "episodes"): Promise<PeriodData["watched"]> {
  const clientId = setting(env, "TRAKT_CLIENT_ID")
  if (clientId === "" || setting(env, "TRAKT_USER") === "") return null
  const user = encodeURIComponent(setting(env, "TRAKT_USER"))
  const range = `start_at=${encodeURIComponent(new Date(week.start * 1000).toISOString())}&end_at=${encodeURIComponent(new Date((week.end - 1) * 1000).toISOString())}&limit=100`
  const headers = { "trakt-api-version": "2", "trakt-api-key": clientId }
  // Up to a few pages of a hundred: a month of episodes can be more than one. A page that is not full is the last.
  const pages = async (kind: string): Promise<Watch[]> => {
    const found: Watch[] = []
    for (let page = 1; page <= HISTORY_PAGES; page += 1) {
      const items = parseHistory((await get(`https://api.trakt.tv/users/${user}/history/${kind}?${range}&page=${page}`, { headers, ttl })).data)
      found.push(...items)
      if (items.length < 100) break
    }
    return found
  }
  const found = await pages(kind)
  const items = await withPosters(mergeHistory(found), setting(env, "TMDB_API_KEY"), get)
  return { items, stats: watchStats(items) }
}

/**
 * The sum of a stretch of time of one medium: the music, or the films or episodes watched (the other is `null`). `null` too where the source is not set up or fails. With `query`, from D1 where it has
 * the stretch (the listens only once they reach its end), and from Last.fm or Trakt where it has not or cannot answer.
 */
async function loadPeriod(env: Env, get: Get, range: Range, previous: Range, nowMs: number, maxPages: number, medium: Medium, query: Query | null): Promise<PeriodData> {
  const complete = nowMs >= range.end * 1000
  const ttl = complete ? TTL.weekDone : TTL.weekLive
  const storedMusic = query === null ? null : async (): Promise<MusicWeek | null> => (listensCover(await listensCursor(query), range.end, Math.floor(nowMs / 1000)) ? storedMusicWeek(env, get, query, range, previous, ttl) : null)
  const kind = medium === "film" ? "movies" : "episodes"
  const storedWatched = query === null ? null : () => storedWatchedWeek(env, get, query, range, ttl, kind)
  const [music, watched] = await Promise.all([
    medium === "music" ? settle(storedOr(lastfmBase(env) === null ? null : storedMusic, () => musicWeek(env, get, range, previous, ttl, nowMs, maxPages))) : null,
    medium === "music" ? null : settle(storedOr(storedWatched, () => watchedWeek(env, get, range, ttl, kind))),
  ])
  return { complete, music, watched }
}

/** A week's wrapped of one medium. */
export async function loadWeek(env: Env, get: Get, week: Week, nowMs: number, medium: Medium, query: Query | null = null): Promise<WeekData> {
  return { week, ...(await loadPeriod(env, get, week, previousWeek(week), nowMs, PAGES.week, medium, query)) }
}

/** A month's wrapped of one medium. */
export async function loadMonth(env: Env, get: Get, month: Month, nowMs: number, medium: Medium, query: Query | null = null): Promise<MonthData> {
  return { month, ...(await loadPeriod(env, get, month, previousMonth(month), nowMs, PAGES.month, medium, query)) }
}

/** One period of a trend: its id, and how many plays it had (`null` where Last.fm did not answer). */
export interface TrendPoint {
  id: string
  total: number | null
}

/**
 * How many plays each of the periods had, oldest first: one small question each (ended periods are kept a day, the one still running five minutes), of D1 where it has the period (`query`) and of Last.fm
 * where it has not. A question that fails is asked once more, one at a time, and then its period is `null`, so a gap shows as a gap and never as a period with no plays.
 */
export async function loadTrend(env: Env, get: Get, periods: readonly (Range & { id: string })[], nowMs: number, query: Query | null = null): Promise<TrendPoint[]> {
  const base = lastfmBase(env)
  if (base === null) return []
  const cursor = query === null ? null : await settle(listensCursor(query))
  const totals = new Map<string, number>()
  const ask = async (period: Range & { id: string }): Promise<void> => {
    const ttl = nowMs >= period.end * 1000 ? TTL.weekDone : TTL.weekLive
    const covered = query !== null && cursor !== null && listensCover(cursor, period.end, Math.floor(nowMs / 1000))
    const stored = covered ? await settle(listenCount(query, period, ttl)) : null
    if (stored !== null) {
      totals.set(period.id, stored)
      return
    }
    const answer = await settle(get(playsTotalUrl(base, period.start, period.end), { ttl }))
    if (answer !== null) totals.set(period.id, parseRecentPage(answer.data).total)
  }
  for (let start = 0; start < periods.length; start += BATCH) await Promise.all(periods.slice(start, start + BATCH).map(ask))
  for (const period of periods) if (!totals.has(period.id)) await ask(period)
  return periods.map((period) => ({ id: period.id, total: totals.get(period.id) ?? null }))
}
