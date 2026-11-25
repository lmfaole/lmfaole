/**
 * The numbers of a week's wrapped, made from the week's plays: the top artists, albums and songs, how much and when, how long (an estimate, as far as the lengths are known), who is new, and how
 * the week compares with the one before. Pure, so a test pins it; `sources.ts` fetches what it is given.
 */

import type { ChartArtist, Play } from "./lastfm.ts"
import { groupViewings, type Viewing, type Watch } from "./trakt.ts"
import { dateAt, slotOf } from "./weeks.ts"

/** How many of each the wrapped lists. */
export const TOP = 5
/** The length of a song nobody knows the length of, in seconds: what a song is, about, until a better one is known. */
export const TYPICAL_SECONDS = 210

/** A viewing's length where TMDB does not tell it: a show's info has no episode length, and a film's may be missing. */
export const TYPICAL_EPISODE_MINUTES = 45
export const TYPICAL_FILM_MINUTES = 110

/** How long a viewing took, in minutes: the film's runtime from TMDB, or the typical length. */
export const watchMinutes = (watch: Watch): number => (watch.episode === null ? (watch.info?.runtime ?? TYPICAL_FILM_MINUTES) : TYPICAL_EPISODE_MINUTES)

/** A song as one key, for the lengths known of songs. */
export const trackKey = (artist: string, track: string): string => `${artist}\u0000${track}`

/** How an artist's place compares with the week before: it moved up or down some places, did not move, or was not on that week's chart at all. */
export type Change = { kind: "up" | "down"; by: number } | { kind: "same" } | { kind: "entered" }

export interface TopArtist {
  name: string
  plays: number
  rank: number
  /** `null` where the week before is not known. */
  change: Change | null
}

export interface TopAlbum {
  title: string
  artist: string
  plays: number
  image: string | null
}

export interface TopTrack {
  title: string
  artist: string
  plays: number
  image: string | null
  url: string
}

export interface WeekStats {
  /** The plays of the week. */
  total: number
  artists: number
  tracks: number
  /** Plays on each day of the week, Monday first, and in each hour of the day. */
  byDay: number[]
  byHour: number[]
  /** Plays on each calendar date (`YYYY-MM-DD`, Oslo time) that had any. */
  byDate: Record<string, number>
  busiestDay: { day: number; plays: number } | null
  busiestHour: { hour: number; plays: number } | null
  topArtists: TopArtist[]
  topAlbums: TopAlbum[]
  topTracks: TopTrack[]
  /** How long was listened to: an estimate, with how many of the plays the length is known of. */
  listening: { seconds: number; knownPlays: number }
}

const byPlays = <T extends { plays: number }>(a: T & { name?: string; title?: string }, b: T & { name?: string; title?: string }): number => b.plays - a.plays || (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "", "nb")

/** The artists played, most first, with how many plays each had. Ties are by name, so the order is the same every time. */
export function artistsByPlays(plays: readonly Play[]): { name: string; plays: number }[] {
  const counts = new Map<string, number>()
  for (const play of plays) counts.set(play.artist, (counts.get(play.artist) ?? 0) + 1)
  return [...counts].map(([name, count]) => ({ name, plays: count })).sort(byPlays)
}

/** The songs played, most first, each with its plays, its cover (the first there is) and its address on Last.fm. */
export function tracksByPlays(plays: readonly Play[]): TopTrack[] {
  const found = new Map<string, TopTrack>()
  for (const play of plays) {
    const key = trackKey(play.artist, play.track)
    const track = found.get(key) ?? { title: play.track, artist: play.artist, plays: 0, image: null, url: play.url }
    track.plays += 1
    track.image ??= play.image
    found.set(key, track)
  }
  return [...found.values()].sort(byPlays)
}

function albumsByPlays(plays: readonly Play[]): TopAlbum[] {
  const found = new Map<string, TopAlbum>()
  for (const play of plays) {
    if (play.album === "") continue
    const key = trackKey(play.artist, play.album)
    const album = found.get(key) ?? { title: play.album, artist: play.artist, plays: 0, image: null }
    album.plays += 1
    album.image ??= play.image
    found.set(key, album)
  }
  return [...found.values()].sort(byPlays)
}

/** How an artist's place compares with last week's chart. */
export function changeOf(rank: number, previous: readonly ChartArtist[], name: string): Change {
  const before = previous.find((artist) => artist.name === name)
  if (before === undefined || before.rank <= 0) return { kind: "entered" }
  if (before.rank === rank) return { kind: "same" }
  return before.rank > rank ? { kind: "up", by: before.rank - rank } : { kind: "down", by: rank - before.rank }
}

/** How long the plays were: the lengths known, and the plays whose length is not known counted at the average of the known ones (or a typical song's where none is). */
export function listeningTime(plays: readonly Play[], lengths: ReadonlyMap<string, number>): { seconds: number; knownPlays: number } {
  let known = 0
  let knownSeconds = 0
  for (const play of plays) {
    const length = lengths.get(trackKey(play.artist, play.track))
    if (length === undefined || length <= 0) continue
    known += 1
    knownSeconds += length
  }
  const average = known === 0 ? TYPICAL_SECONDS : knownSeconds / known
  return { seconds: Math.round(knownSeconds + (plays.length - known) * average), knownPlays: known }
}

/**
 * The stats of a week. `previous` is the week before's artist chart (`null` where it could not be had, so no change is told); `lengths` is the length in seconds of the songs it is known of
 * (`trackKey`).
 */
export function weekStats(plays: readonly Play[], previous: readonly ChartArtist[] | null, lengths: ReadonlyMap<string, number>): WeekStats {
  const byDay = Array.from({ length: 7 }, () => 0)
  const byHour = Array.from({ length: 24 }, () => 0)
  const byDate: Record<string, number> = {}
  for (const play of plays) {
    if (play.playedAt === null) continue
    const slot = slotOf(Date.parse(play.playedAt) / 1000)
    byDay[slot.day] = (byDay[slot.day] ?? 0) + 1
    byHour[slot.hour] = (byHour[slot.hour] ?? 0) + 1
    const date = dateAt(Date.parse(play.playedAt))
    const key = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`
    byDate[key] = (byDate[key] ?? 0) + 1
  }
  const peak = (counts: readonly number[]): { index: number; plays: number } | null => {
    const plays = Math.max(0, ...counts)
    return plays === 0 ? null : { index: counts.indexOf(plays), plays }
  }
  const day = peak(byDay)
  const hour = peak(byHour)
  const artists = artistsByPlays(plays)
  return {
    total: plays.length,
    artists: artists.length,
    tracks: tracksByPlays(plays).length,
    byDay,
    byHour,
    byDate,
    busiestDay: day === null ? null : { day: day.index, plays: day.plays },
    busiestHour: hour === null ? null : { hour: hour.index, plays: hour.plays },
    topArtists: artists.slice(0, TOP).map((artist, index) => ({ name: artist.name, plays: artist.plays, rank: index + 1, change: previous === null ? null : changeOf(index + 1, previous, artist.name) })),
    topAlbums: albumsByPlays(plays).slice(0, TOP),
    topTracks: tracksByPlays(plays).slice(0, TOP),
    listening: listeningTime(plays, lengths),
  }
}

/** The change in the number of plays since the week before: `null` where that is not known, and 0 for none. */
export const playsChange = (total: number, previousTotal: number | null): number | null => (previousTotal === null ? null : total - previousTotal)

/** A length as «7 t 20 min» (hours and minutes, no seconds, for a length that is an estimate), or «45 min» under an hour. */
export function longLength(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return hours === 0 ? `${minutes} min` : `${hours} t${minutes % 60 === 0 ? "" : ` ${minutes % 60} min`}`
}

/** How many episodes of one show on one day make a binge. */
export const BINGE = 3

export interface WatchStats {
  films: number
  episodes: number
  /** How many shows had an episode watched. */
  showCount: number
  /** How long was watched, an estimate (`watchMinutes`). */
  minutes: number
  /** Viewings on each day of the week, Monday first, and on each calendar date (`YYYY-MM-DD`, Oslo time) that had any. */
  byDay: number[]
  byDate: Record<string, number>
  busiestDay: { day: number; viewings: number } | null
  /** The films watched, newest first, with the day: what a count of films does not say. */
  filmItems: { title: string; year: number | null; poster: string | null; watchedAt: string }[]
  /** The shows watched, most episodes first (up to the top five), with a poster. */
  shows: { title: string; episodes: number; poster: string | null }[]
  /** The runs of one show's episodes on one day that were `BINGE` or more, as the lists show them. */
  binges: Viewing[]
  /** The genres of the films watched (TMDB's, where it has been asked), most films first, up to the top five. */
  genres: { name: string; films: number }[]
  /** Who directed the films watched (TMDB's credits), most films first, up to the top five. */
  directors: { id: number; name: string; films: number }[]
}

/** The most common of some names, most first and then by name, up to the top five. */
function mostOf<T extends { name: string; films: number }>(counted: Map<string, T>): T[] {
  return [...counted.values()].sort((a, b) => b.films - a.films || a.name.localeCompare(b.name, "nb")).slice(0, TOP)
}

/** What was watched in a week, from the history in it (newest first). */
export function watchStats(items: readonly Watch[]): WatchStats {
  const shows = new Map<string, { title: string; episodes: number; poster: string | null }>()
  for (const watch of items) {
    if (watch.episode === null) continue
    const show = shows.get(watch.title) ?? { title: watch.title, episodes: 0, poster: null }
    show.episodes += 1
    show.poster ??= watch.poster
    shows.set(watch.title, show)
  }
  const byDay = Array.from({ length: 7 }, () => 0)
  const byDate: Record<string, number> = {}
  for (const watch of items) {
    const at = Date.parse(watch.watchedAt)
    if (Number.isNaN(at)) continue
    const slot = slotOf(at / 1000)
    byDay[slot.day] = (byDay[slot.day] ?? 0) + 1
    const date = dateAt(at)
    const key = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`
    byDate[key] = (byDate[key] ?? 0) + 1
  }
  const most = Math.max(0, ...byDay)
  const films = items.filter((watch) => watch.kind === "film")
  const genres = new Map<string, { name: string; films: number }>()
  const directors = new Map<string, { id: number; name: string; films: number }>()
  for (const film of films) {
    for (const name of new Set(film.info?.genres ?? [])) genres.set(name, { name, films: (genres.get(name)?.films ?? 0) + 1 })
    for (const person of new Map((film.info?.crew ?? []).filter((one) => one.role === "Regi").map((one) => [one.id, one])).values()) {
      directors.set(String(person.id), { id: person.id, name: person.name, films: (directors.get(String(person.id))?.films ?? 0) + 1 })
    }
  }
  return {
    films: items.filter((watch) => watch.kind === "film").length,
    showCount: shows.size,
    minutes: items.reduce((sum, watch) => sum + watchMinutes(watch), 0),
    byDay,
    byDate,
    busiestDay: most === 0 ? null : { day: byDay.indexOf(most), viewings: most },
    filmItems: items.filter((watch) => watch.kind === "film").map((watch) => ({ title: watch.title, year: watch.year, poster: watch.poster, watchedAt: watch.watchedAt })),
    episodes: items.filter((watch) => watch.kind === "episode").length,
    shows: [...shows.values()].sort((a, b) => b.episodes - a.episodes || a.title.localeCompare(b.title, "nb")).slice(0, TOP),
    binges: groupViewings(items).filter((viewing) => viewing.episodes.length >= BINGE),
    genres: mostOf(genres),
    directors: mostOf(directors),
  }
}

/** A change in plays as «+12», «−8» (the minus sign, not a hyphen) or «±0». */
export const signed = (change: number): string => (change > 0 ? `+${change.toLocaleString("nb-NO")}` : change < 0 ? `−${Math.abs(change).toLocaleString("nb-NO")}` : "±0")

/** A place's change as the design system's `RankedRows` takes it (`entered` is `new` there). */
export function rankChange(change: Change): { kind: "up" | "down"; by: number } | { kind: "same" } | { kind: "new" } {
  return change.kind === "entered" ? { kind: "new" } : change
}

/** An hour of the day as the hour it is: «kl. 21–22». */
export const hourText = (hour: number): string => `kl. ${String(hour).padStart(2, "0")}–${String((hour + 1) % 24).padStart(2, "0")}`
