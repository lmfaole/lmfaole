/** Trakt's watch history and ratings, read from the public profile (only the app's client id is needed). The history is filled two ways: new entries from a week before the newest stored, and, until it reaches the start, `backfillPages` older pages each run. */

import type { Database, Statement } from "./db.ts"
import type { Fetch } from "./listenbrainz.ts"

const API = "https://api.trakt.tv"

interface Ids {
  trakt?: number
  tmdb?: number | null
  imdb?: string | null
}

interface Item {
  title?: string | null
  year?: number | null
  number?: number
  season?: number
  ids: Ids
}

export interface Entry {
  id: number
  watched_at: string
  action: string
  type: "movie" | "episode"
  movie?: Item
  episode?: Item
  show?: Item
}

export interface Rating {
  rated_at: string
  rating: number
  type: "movie" | "show" | "season" | "episode"
  movie?: Item
  show?: Item
  season?: Item
  episode?: Item
}

export interface TraktOptions {
  user: string
  clientId: string
  fetch: Fetch
  now: number
  pageSize: number
  backfillPages: number
  log?: (message: string) => void
}

const seconds = (iso: string): number => Math.floor(Date.parse(iso) / 1000)
const iso = (at: number): string => new Date(at * 1000).toISOString()

async function ask<T>(path: string, query: Record<string, string>, options: TraktOptions): Promise<T> {
  const response = await options.fetch(`${API}/users/${encodeURIComponent(options.user)}/${path}?${new URLSearchParams(query)}`, {
    headers: { "trakt-api-version": "2", "trakt-api-key": options.clientId, "User-Agent": "activity (lmfaole.party)" },
  })
  if (!response.ok) throw new Error(`Trakt ${path} ${response.status}`)
  return (await response.json()) as T
}

export function watchRow(entry: Entry): unknown[] {
  const item = (entry.type === "movie" ? entry.movie : entry.episode) ?? { ids: {} }
  const show = entry.show
  const title = item.title ?? (entry.type === "episode" ? `S${item.season ?? "?"}E${item.number ?? "?"}` : "?")
  return [
    entry.id, seconds(entry.watched_at), entry.action, entry.type, title, entry.type === "movie" ? (item.year ?? null) : (show?.year ?? null),
    show?.title ?? null, entry.type === "episode" ? (item.season ?? null) : null, entry.type === "episode" ? (item.number ?? null) : null,
    item.ids.trakt ?? null, show?.ids.trakt ?? null, item.ids.tmdb ?? null, item.ids.imdb ?? show?.ids.imdb ?? null, JSON.stringify(entry),
  ]
}

export function ratingRow(rating: Rating): unknown[] {
  const item = rating[rating.type] ?? { ids: {} }
  const title = item.title ?? (rating.show?.title ? `${rating.show.title}${rating.type === "season" ? ` S${item.number}` : ""}` : "?")
  return [rating.type, item.ids.trakt ?? 0, rating.rating, seconds(rating.rated_at), title, item.year ?? rating.show?.year ?? null, JSON.stringify(rating)]
}

const WATCH = "INSERT OR IGNORE INTO watches (id, watched_at, action, type, title, year, show, season, episode, trakt_id, show_trakt_id, tmdb_id, imdb_id, raw) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
const RATING = `INSERT INTO ratings (type, trakt_id, rating, rated_at, title, year, raw) VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (type, trakt_id) DO UPDATE SET rating = excluded.rating, rated_at = excluded.rated_at, title = excluded.title, year = excluded.year, raw = excluded.raw
WHERE ratings.raw IS NOT excluded.raw`
const STATE = "INSERT INTO state (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value WHERE state.value IS NOT excluded.value"

export async function syncTrakt(db: Database, options: TraktOptions): Promise<{ entries: number; ratings: number }> {
  const state = new Map((await db.prepare("SELECT key, value FROM state").all<{ key: string; value: string }>()).results.map((row) => [row.key, row.value]))
  const page = (query: Record<string, string>, n: number) => ask<Entry[]>("history", { ...query, page: String(n), limit: String(options.pageSize) }, options)
  const entries: Entry[] = []

  const newest = state.get("history_newest")
  if (newest !== undefined) {
    // A week back, for entries added afterwards with an earlier time; the id keeps them single.
    for (let n = 1; n <= 2; n++) {
      const got = await page({ start_at: iso(Number(newest) - 7 * 86400) }, n)
      entries.push(...got)
      if (got.length < options.pageSize) break
    }
  }

  let backfilled = 0
  if (state.get("history_done") !== "1") {
    let end = state.get("history_end") ?? iso(options.now)
    for (let n = 0; n < options.backfillPages; n++) {
      const got = await page({ end_at: end }, 1)
      entries.push(...got)
      backfilled += got.length
      if (got.length < options.pageSize) {
        state.set("history_done", "1")
        break
      }
      // The oldest second of the page is asked again (end_at is inclusive), so entries sharing it aren't lost.
      end = got.reduce((oldest, entry) => (entry.watched_at < oldest ? entry.watched_at : oldest), end)
    }
    state.set("history_end", end)
  }

  const ratings: Rating[] = []
  for (let n = 1; ; n++) {
    const got = await ask<Rating[]>("ratings", { page: String(n), limit: String(options.pageSize) }, options)
    ratings.push(...got)
    if (got.length < options.pageSize) break
  }

  const watch = db.prepare(WATCH), rate = db.prepare(RATING), set = db.prepare(STATE)
  const writes: Statement[] = [...entries.map((entry) => watch.bind(...watchRow(entry))), ...ratings.map((rating) => rate.bind(...ratingRow(rating)))]
  // A rating taken off on Trakt goes here too.
  writes.push(db.prepare("DELETE FROM ratings WHERE type || ':' || trakt_id NOT IN (SELECT value FROM json_each(?))").bind(JSON.stringify(ratings.map((r) => `${r.type}:${r[r.type]?.ids.trakt ?? 0}`))))
  const newestSeen = Math.max(Number(newest ?? 0), ...entries.map((entry) => seconds(entry.watched_at)))
  if (newestSeen > 0) writes.push(set.bind("history_newest", String(newestSeen)))
  for (const key of ["history_end", "history_done"]) if (state.has(key)) writes.push(set.bind(key, state.get(key)))
  await db.batch(writes)
  options.log?.(`trakt: ${entries.length} history entries (${backfilled} backfill${state.get("history_done") === "1" ? ", done" : ""}), ${ratings.length} ratings`)
  return { entries: entries.length, ratings: ratings.length }
}
