/** What the site keeps of Trakt's public history (`/users/<user>/history`), and how it is read from the answer. Pure, so a test pins it. */

import type { TitleInfo } from "./tmdb.ts"

export interface Watch {
  /** Trakt's id of the history entry: the same viewing keeps it. */
  id: number
  watchedAt: string
  kind: "film" | "episode"
  /** The film's title, or the show's. */
  title: string
  year: number | null
  /** For an episode: its own title and where it is in the show. */
  episode: { title: string; season: number; number: number } | null
  url: string
  /** TMDB's id of the film, or of the show for an episode; the poster is asked for with it. */
  tmdbId: number | null
  /** The poster's address (TMDB), `null` where there is none or it has not been fetched. */
  poster: string | null
  /** The plot, genres and so on (TMDB), `null` where it has not been fetched. */
  info: TitleInfo | null
}

export interface Watched {
  at: string | null
  user: string
  items: Watch[]
}

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const text = (value: unknown): string => (typeof value === "string" ? value : "")
const whole = (value: unknown): number | null => (typeof value === "number" && Number.isInteger(value) ? value : null)

export function parseHistory(answer: unknown): Watch[] {
  if (!Array.isArray(answer)) return []
  return answer.flatMap((value): Watch[] => {
    const item = object(value)
    const id = whole(item["id"])
    const watchedAt = text(item["watched_at"])
    if (id === null || watchedAt === "") return []
    if (item["type"] === "movie") {
      const movie = object(item["movie"])
      const ids = object(movie["ids"])
      const slug = text(ids["slug"])
      return [{ id, watchedAt, kind: "film", title: text(movie["title"]), year: whole(movie["year"]), episode: null, url: slug === "" ? "https://trakt.tv" : `https://trakt.tv/movies/${slug}`, tmdbId: whole(ids["tmdb"]), poster: null, info: null }]
    }
    if (item["type"] === "episode") {
      const show = object(item["show"])
      const episode = object(item["episode"])
      const season = whole(episode["season"]) ?? 0
      const number = whole(episode["number"]) ?? 0
      const ids = object(show["ids"])
      const slug = text(ids["slug"])
      const url = slug === "" ? "https://trakt.tv" : `https://trakt.tv/shows/${slug}/seasons/${season}/episodes/${number}`
      return [{ id, watchedAt, kind: "episode", title: text(show["title"]), year: whole(show["year"]), episode: { title: text(episode["title"]), season, number }, url, tmdbId: whole(ids["tmdb"]), poster: null, info: null }]
    }
    return []
  })
}

/** Newest first, each viewing once (two pages of history can overlap while a new one is added). */
export function mergeHistory(...pages: readonly Watch[][]): Watch[] {
  const byId = new Map<number, Watch>()
  for (const page of pages) for (const watch of page) byId.set(watch.id, watch)
  return [...byId.values()].toSorted((a, b) => b.watchedAt.localeCompare(a.watchedAt))
}

/** «S2 E5» */
export const episodeCode = (episode: { season: number; number: number }): string => `S${episode.season} E${episode.number}`

/** One row of the list: a film, or the episodes of one show watched in a row on one day (a binge is one row, not nine). */
export interface Viewing {
  key: string
  kind: "film" | "episode"
  title: string
  year: number | null
  url: string
  poster: string | null
  /** The latest of the row. */
  watchedAt: string
  /** The episodes, oldest first; empty for a film. */
  episodes: { title: string; season: number; number: number }[]
}

const osloDay = (iso: string): string => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" })

/** The history (newest first) as rows: episodes of the same show that follow each other on the same day in Oslo are one row. */
export function groupViewings(items: readonly Watch[]): Viewing[] {
  const rows: Viewing[] = []
  for (const watch of items) {
    const last = rows.at(-1)
    if (watch.episode !== null && last !== undefined && last.kind === "episode" && last.title === watch.title && osloDay(last.watchedAt) === osloDay(watch.watchedAt)) {
      last.episodes.unshift(watch.episode)
      last.poster ??= watch.poster
      continue
    }
    rows.push({ key: String(watch.id), kind: watch.kind, title: watch.title, year: watch.year, url: watch.url, poster: watch.poster, watchedAt: watch.watchedAt, episodes: watch.episode === null ? [] : [watch.episode] })
  }
  return rows
}

/** «S3 E9», «S3 E5–E10» for a run in one season, «S2 E9–S3 E2» across seasons, «S3: 4 episoder» for a season with gaps. */
export function episodesCode(episodes: readonly { season: number; number: number }[]): string {
  const first = episodes[0]
  const last = episodes.at(-1)
  if (first === undefined || last === undefined) return ""
  if (episodes.length === 1) return episodeCode(first)
  if (first.season !== last.season) return `${episodeCode(first)}–${episodeCode(last)}`
  const inOrder = episodes.every((episode, index) => episode.season === first.season && episode.number === first.number + index)
  return inOrder ? `S${first.season} E${first.number}–E${last.number}` : `S${first.season}: ${episodes.length} episoder`
}
