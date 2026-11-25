/** Letterboxd's diary, read from the public RSS feed (it has no open API). The feed holds only the newest entries, so each run keeps what it shows: a diary entry is kept by its id, and a changed rating or review replaces the stored one. Lists and other items without a watched day are not diary entries and are left out. */

import type { Database } from "@lmfaole/worker/d1"
import type { Fetch } from "@lmfaole/worker/fetch"

export interface DiaryEntry {
  id: string
  kind: string
  watchedOn: string
  title: string
  year: number | null
  rating: number | null
  rewatch: boolean
  liked: boolean
  tmdbId: number | null
  review: string | null
  link: string
  poster: string | null
  publishedAt: number
  raw: string
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

const decoded = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (whole, name: string) => {
    if (name.startsWith("#x") || name.startsWith("#X")) return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
    if (name.startsWith("#")) return String.fromCodePoint(Number(name.slice(1)))
    return ENTITIES[name.toLowerCase()] ?? whole
  })

const tag = (item: string, name: string): string | null => {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`).exec(item)
  return match?.[1]?.trim() ?? null
}

/** The review a diary entry carries: the description without the poster, or none when it only says when it was watched. */
function reviewOf(description: string): string | null {
  const text = decoded(
    description
      .replace(/<p>\s*<img[^>]*>\s*<\/p>/g, "")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<\/p>\s*<p>/g, "\n\n")
      .replace(/<[^>]+>/g, ""),
  ).trim()
  return text === "" || /^Watched on .+\.$/.test(text) || text === "This review may contain spoilers." ? null : text
}

export function parseFeed(xml: string): DiaryEntry[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap(([raw, item = ""]) => {
    const watchedOn = tag(item, "letterboxd:watchedDate")
    const id = tag(item, "guid")
    const title = tag(item, "letterboxd:filmTitle")
    if (watchedOn === null || id === null || title === null) return []
    const description = tag(item, "description") ?? ""
    const number = (name: string) => {
      const value = tag(item, name)
      return value === null || value === "" ? null : Number(value)
    }
    return [
      {
        id,
        kind: /^letterboxd-(\w+)-/.exec(id)?.[1] ?? "watch",
        watchedOn,
        title: decoded(title),
        year: number("letterboxd:filmYear"),
        rating: number("letterboxd:memberRating"),
        rewatch: tag(item, "letterboxd:rewatch") === "Yes",
        liked: tag(item, "letterboxd:memberLike") === "Yes",
        tmdbId: number("tmdb:movieId"),
        review: reviewOf(description),
        link: tag(item, "link") ?? "",
        poster: /<img src="([^"]+)"/.exec(description)?.[1] ?? null,
        publishedAt: Math.floor(Date.parse(tag(item, "pubDate") ?? "") / 1000) || 0,
        raw,
      },
    ]
  })
}

export interface LetterboxdOptions {
  user: string
  fetch: Fetch
  log?: (message: string) => void
}

/** Two subrequests: the feed and one batch. */
export async function syncLetterboxd(db: Database, { user, fetch, log = () => {} }: LetterboxdOptions): Promise<void> {
  const response = await fetch(`https://letterboxd.com/${encodeURIComponent(user)}/rss/`, { headers: { "User-Agent": "activity/1.0 (+https://activity.olejorgenbakken.workers.dev)" } })
  if (!response.ok) throw new Error(`letterboxd: ${response.status}`)
  const entries = parseFeed(await response.text())
  if (entries.length === 0) return log("letterboxd: no diary entries in the feed")
  const upsert = db.prepare(`
    INSERT INTO letterboxd (id, kind, watched_on, title, year, rating, rewatch, liked, tmdb_id, review, link, poster, published_at, raw)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET kind = excluded.kind, watched_on = excluded.watched_on, rating = excluded.rating, rewatch = excluded.rewatch,
      liked = excluded.liked, review = excluded.review, poster = excluded.poster, raw = excluded.raw
    WHERE letterboxd.raw IS NOT excluded.raw`)
  await db.batch(entries.map((e) => upsert.bind(e.id, e.kind, e.watchedOn, e.title, e.year, e.rating, e.rewatch ? 1 : 0, e.liked ? 1 : 0, e.tmdbId, e.review, e.link, e.poster, e.publishedAt, e.raw)))
  log(`letterboxd: ${entries.length} diary entries in the feed`)
}
