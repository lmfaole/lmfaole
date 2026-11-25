/**
 * The detail pages: one for each film (`/film/<slug>/`) or show (`/tv/<slug>/`) in the history and one for each artist played (`/musikk/<slug>/`), with
 * what the data holds about it. Pure, so a test pins which pages there are and what each one holds; the pages in `src/pages/` only show it.
 */

import type { Music, Play } from "./lastfm.ts"
import type { TitleInfo } from "./tmdb.ts"
import type { Watch } from "./trakt.ts"

/** A name as a part of an address: lower case, Norwegian letters spelled out, anything else a dash. */
export function slugify(text: string): string {
  const plain = text.toLowerCase().replaceAll("æ", "ae").replaceAll("ø", "o").normalize("NFKD").replace(/[̀-ͯ]/g, "")
  return plain.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "uten-navn"
}

export interface TitlePage {
  slug: string
  kind: "film" | "episode"
  title: string
  year: number | null
  poster: string | null
  /** What TMDB says of it: plot, genres, length, vote; `null` until it has been asked. */
  info: TitleInfo | null
  /** The film's or the show's page on Trakt (not an episode's). */
  traktUrl: string
  /** Every viewing of it in the history, newest first. */
  viewings: Watch[]
}

const TRAKT = /^https:\/\/trakt\.tv\/(movies|shows)\/([^/]+)/

/** Trakt's own slug where the address has one, so a page keeps its address; a film and a show with the same slug are two pages, one under Film and one under TV. */
export function titlePages(items: readonly Watch[]): TitlePage[] {
  const byKey = new Map<string, TitlePage>()
  for (const watch of items) {
    const match = TRAKT.exec(watch.url)
    const base = match?.[2] ?? slugify(watch.title)
    const key = `${watch.kind}:${base}`
    const found = byKey.get(key)
    if (found !== undefined) {
      found.viewings.push(watch)
      found.poster ??= watch.poster
      found.info ??= watch.info
      continue
    }
    const traktUrl = match === null ? "https://trakt.tv" : `https://trakt.tv/${match[1]}/${base}`
    byKey.set(key, { slug: base, kind: watch.kind, title: watch.title, year: watch.year, poster: watch.poster, info: watch.info, traktUrl, viewings: [watch] })
  }
  return [...byKey.values()]
}

export interface ArtistPage {
  slug: string
  name: string
  /** The artist on Last.fm. */
  url: string
  /** The plays in the recent list, newest first. */
  plays: Play[]
  /** Place and plays among the most played of the last month, where it is one of them. */
  top: { rank: number; plays: number } | null
}

/** «https://www.last.fm/music/Artist/_/Track» is the track; the artist is the part before `/_/`. */
const artistUrl = (trackUrl: string): string => trackUrl.split("/_/")[0] ?? trackUrl

export function artistPages(music: Pick<Music, "recent" | "topArtists">): ArtistPage[] {
  const pages = new Map<string, ArtistPage>()
  const page = (name: string, url: string): ArtistPage => {
    const slug = slugify(name)
    const existing = pages.get(slug)
    if (existing !== undefined) return existing
    const made: ArtistPage = { slug, name, url, plays: [], top: null }
    pages.set(slug, made)
    return made
  }
  music.topArtists.forEach((artist, index) => {
    page(artist.name, artist.url).top = { rank: index + 1, plays: artist.plays }
  })
  for (const play of music.recent) page(play.artist, artistUrl(play.url)).plays.push(play)
  return [...pages.values()]
}

/**
 * An album's or a track's page, `/musikk/album/<artist>--<album>/` and `/musikk/spor/<artist>--<track>/`: the artist's slug and the name's, set apart by `--`, which a slug never has inside it (a run of
 * anything but letters is one dash), so two names are never taken for one.
 */
export const albumSlug = (artist: string, album: string): string => `${slugify(artist)}--${slugify(album)}`
export const trackSlug = (artist: string, track: string): string => `${slugify(artist)}--${slugify(track)}`
export const albumHref = (base: string, artist: string, album: string): string => `${base}musikk/album/${albumSlug(artist, album)}/`
export const trackHref = (base: string, artist: string, track: string): string => `${base}musikk/spor/${trackSlug(artist, track)}/`

/** A name as a part of an address on Last.fm: spaces are `+`, the rest is encoded. */
const lastfmPart = (name: string): string => encodeURIComponent(name).replaceAll("%20", "+")

export interface AlbumPage {
  slug: string
  title: string
  artist: string
  /** The cover as Last.fm hosts it, the first of the plays that has one. */
  image: string | null
  /** The album on Last.fm. */
  url: string
  /** The plays of tracks on it in the recent list, newest first. */
  plays: Play[]
}

export interface TrackPage {
  slug: string
  title: string
  artist: string
  /** The album it was played from (the first, for a track on more than one); `null` for a play with none. */
  album: string | null
  image: string | null
  /** The track on Last.fm. */
  url: string
  /** Each play of it in the recent list, newest first. */
  plays: Play[]
}

/** One page for each album in the recent plays, with the plays from it. A play with no album has none. */
export function albumPages(music: Pick<Music, "recent">): AlbumPage[] {
  const pages = new Map<string, AlbumPage>()
  for (const play of music.recent) {
    if (play.album === "") continue
    const slug = albumSlug(play.artist, play.album)
    const page = pages.get(slug) ?? { slug, title: play.album, artist: play.artist, image: null, url: `https://www.last.fm/music/${lastfmPart(play.artist)}/${lastfmPart(play.album)}`, plays: [] }
    page.image ??= play.image
    page.plays.push(play)
    pages.set(slug, page)
  }
  return [...pages.values()]
}

/** One page for each track in the recent plays (by artist and title: the same song on a single and on an album is one), with each play of it. */
export function trackPages(music: Pick<Music, "recent">): TrackPage[] {
  const pages = new Map<string, TrackPage>()
  for (const play of music.recent) {
    const slug = trackSlug(play.artist, play.track)
    const page = pages.get(slug) ?? { slug, title: play.track, artist: play.artist, album: null, image: null, url: play.url, plays: [] }
    page.album ??= play.album === "" ? null : play.album
    page.image ??= play.image
    page.plays.push(play)
    pages.set(slug, page)
  }
  return [...pages.values()]
}

/** A film's page is under Film, a show's under TV. */
export { titleHref } from "./media.ts"
export const artistHref = (base: string, name: string): string => `${base}musikk/${slugify(name)}/`

/** A person's page, `/personer/<id>-<name>/`: TMDB's id first, so two with the same name are two pages and a changed spelling of a name is the same page. */
export function personHref(base: string, id: number, name: string): string {
  const slug = slugify(name)
  // A name with no Latin letters (Japanese, Korean) has no slug: the id alone is the address, not «225730-uten-navn».
  return `${base}personer/${slug === "uten-navn" ? id : `${id}-${slug}`}/`
}

/** A game's page, `/spill/<app id>-<name>/`: Steam's app id first, like a person's. */
export function gameHref(base: string, appId: number, name: string): string {
  const slug = slugify(name)
  return `${base}spill/${slug === "uten-navn" ? appId : `${appId}-${slug}`}/`
}

/** The id in a person's address, or `null` where it is not one. */
export function personId(slug: string): number | null {
  const match = /^(\d{1,9})(?:-|$)/.exec(slug)
  return match === null ? null : Number(match[1])
}

/** The app id in a game's address, or `null` where it is not one. */
export const gameId = personId

/** A person as the pages that name them know them: who, a picture, and what they did there. */
export interface Appearance {
  /** The film or the show. */
  page: TitlePage
  /** What they did in it: the part, or the jobs. */
  roles: string[]
}

/**
 * Where a person is named among the films and shows seen: the cast and the crew each title's page keeps. Newest first, as the titles are, with the parts and the jobs of each.
 * `name` and `profile` are what the credits say of them (the first found), for a page that has nothing else of them.
 */
export function personIn(items: readonly Watch[], id: number): { name: string; profile: string | null; appearances: Appearance[] } | null {
  let name = ""
  let profile: string | null = null
  const appearances: Appearance[] = []
  for (const page of titlePages(items)) {
    const credits = [...(page.info?.cast ?? []), ...(page.info?.crew ?? [])].filter((one) => one.id === id)
    if (credits.length === 0) continue
    name ||= credits[0]?.name ?? ""
    profile ??= credits.find((one) => one.profile !== null)?.profile ?? null
    appearances.push({ page, roles: [...new Set(credits.flatMap((one) => (one.role === null ? [] : [one.role])))] })
  }
  return appearances.length === 0 ? null : { name, profile, appearances }
}

/** A game's page on RetroAchievements, `/spill/retro/<game id>-<name>/`: apart from Steam's, whose ids are another count. */
export function retroGameHref(base: string, gameId: number, title: string): string {
  const slug = slugify(title)
  return `${base}spill/retro/${slug === "uten-navn" ? gameId : `${gameId}-${slug}`}/`
}
