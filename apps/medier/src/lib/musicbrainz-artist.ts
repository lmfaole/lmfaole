/**
 * What an artist's page asks MusicBrainz besides its albums (`musicbrainz.ts`), each from a server island of its own: the newest release (an album, a single or an EP, out lately or
 * coming), and the artist's links (its own site, Wikipedia, Bandcamp and the like). Wikipedia is reached through Wikidata, which MusicBrainz links to and which knows the article in
 * Norwegian where there is one. Pure: the asking is `sources.ts`'s.
 */

import { albumKey } from "./albums.ts"
import type { Play } from "./lastfm.ts"
import { coverArtUrl } from "./musicbrainz.ts"
import { plain } from "./spotify.ts"

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string => (typeof value === "string" ? value : "")
const quoted = (name: string): string => `"${name.replace(/["\\]/g, "\\$&")}"`

// ---- The newest release ----

/** How far back a release is still news: two years. Older than that, the page has no «Siste utgivelse». */
export const NEWS_YEARS = 2

export type ReleaseType = "Album" | "EP" | "Single"

export interface LatestRelease {
  id: string
  title: string
  type: ReleaseType
  /** `YYYY-MM-DD`, `YYYY-MM` or `YYYY`. */
  released: string
  /** It comes out after today. */
  upcoming: boolean
}

/**
 * The search for an artist's official albums, singles and EPs with no secondary type (no remix, live album, compilation…) first released in the last years or later: by its id where
 * Last.fm gave one, else by its name. The range is whole years (`today`'s year less `NEWS_YEARS`), so the address, and what is kept under it, changes once a year;
 * `parseLatestRelease` takes the exact two years.
 */
export function latestReleasesUrl(artist: string, mbid: string | null, today: string): string {
  const who = mbid === null ? `artist:${quoted(artist)}` : `arid:${mbid}`
  const from = Number(today.slice(0, 4)) - NEWS_YEARS
  const query = `${who} AND status:official AND (primarytype:album OR primarytype:single OR primarytype:ep) AND firstreleasedate:[${from} TO *] AND NOT secondarytype:[* TO *]`
  return `https://musicbrainz.org/ws/2/release-group?fmt=json&limit=100&query=${encodeURIComponent(query)}`
}

/** A date MusicBrainz gave as `YYYY`, `YYYY-MM` or `YYYY-MM-DD` as the first and the last day it may be. */
function span(date: string): { first: string; last: string } {
  const [year, month, day] = date.split("-")
  return { first: `${year}-${month ?? "01"}-${day ?? "01"}`, last: `${year}-${month ?? "12"}-${day ?? "31"}` }
}

/** `today` (`YYYY-MM-DD`) less `NEWS_YEARS` years. */
const newsSince = (today: string): string => `${Number(today.slice(0, 4)) - NEWS_YEARS}${today.slice(4)}`

const TYPES: Readonly<Record<string, ReleaseType>> = { Album: "Album", EP: "EP", Single: "Single" }
/** On the same day an album is more news than an EP, and an EP than a single (one of its songs, often). */
const WEIGHT: Record<ReleaseType, number> = { Album: 0, EP: 1, Single: 2 }

/**
 * The artist's newest album, single or EP in MusicBrainz's answer: the latest by when it first came out, coming ones too, credited to the artist (by id, else by name), with no
 * secondary type. `null` where there is none from the last two years or later (news gone stale is not news), and for an answer that is not one.
 */
export function parseLatestRelease(answer: unknown, artist: string, mbid: string | null, today: string): LatestRelease | null {
  const wanted = plain(artist)
  const since = newsSince(today)
  const found: LatestRelease[] = []
  for (const value of list(object(answer)["release-groups"])) {
    const group = object(value)
    const id = text(group["id"])
    const title = text(group["title"]).trim()
    const type = TYPES[text(group["primary-type"])]
    const released = text(group["first-release-date"])
    const credited = list(group["artist-credit"]).some((credit) => {
      const one = object(object(credit)["artist"])
      return mbid === null ? plain(text(object(credit)["name"])) === wanted || plain(text(one["name"])) === wanted : text(one["id"]) === mbid
    })
    if (id === "" || title === "" || type === undefined || !credited || list(group["secondary-types"]).length > 0 || !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(released)) continue
    const { first, last } = span(released)
    if (last < since) continue
    found.push({ id, title, type, released, upcoming: first > today })
  }
  found.sort((a, b) => span(b.released).first.localeCompare(span(a.released).first) || WEIGHT[a.type] - WEIGHT[b.type])
  return found[0] ?? null
}

/** A coming one is under «Neste utgivelse» and says «Kommer …», so it is only named for what it is. */
const KIND: Record<ReleaseType, { out: string; coming: string }> = {
  Album: { out: "Nytt album", coming: "Album" },
  EP: { out: "Ny EP", coming: "EP" },
  Single: { out: "Ny singel", coming: "Singel" },
}

const DAY_MONTH = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: "UTC" })
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
const MONTH = new Intl.DateTimeFormat("nb-NO", { month: "long", timeZone: "UTC" })
const MONTH_YEAR = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric", timeZone: "UTC" })

/** A release's date in words: «14. mars 2025», «mars 2025» or «2025»; with `sameYear` the year is left out («14. mars»). */
function dateText(released: string, sameYear: boolean): string {
  const [year, month, day] = released.split("-")
  if (month === undefined) return year ?? released
  const at = new Date(`${year}-${month}-${day ?? "15"}T12:00:00Z`)
  if (day === undefined) return (sameYear ? MONTH : MONTH_YEAR).format(at)
  return (sameYear ? DAY_MONTH : DAY_MONTH_YEAR).format(at)
}

/** What the newest release is and when, in words: «Nytt album» and «14. mars 2025», or «Singel» and «Kommer 14. mars» (this year's year left out; «Kommer i 2027» where only the year is known). */
export function latestReleaseText(release: LatestRelease, today: string): { kind: string; when: string } {
  const kind = KIND[release.type]
  if (!release.upcoming) return { kind: kind.out, when: dateText(release.released, false) }
  const when = dateText(release.released, release.released.slice(0, 4) === today.slice(0, 4))
  return { kind: kind.coming, when: /^\d{4}$/.test(when) ? `Kommer i ${when}` : `Kommer ${when}` }
}

/** The covers the recent plays show, by album (`albumKey`) and by song: a few, for the server island's props. */
export function playedCovers(plays: readonly Play[]): [string, string][] {
  const found = new Map<string, string>()
  for (const play of plays) {
    if (play.image === null) continue
    if (play.album !== "" && !found.has(`album:${albumKey(play.album)}`)) found.set(`album:${albumKey(play.album)}`, play.image)
    if (!found.has(`track:${plain(play.track)}`)) found.set(`track:${plain(play.track)}`, play.image)
  }
  return [...found]
}

/** The newest release's cover: the one the plays show for it (as an album, else as a song, for a single), else the Cover Art Archive's (which has none for some). */
export function releaseCover(release: LatestRelease, covers: ReadonlyMap<string, string>): string {
  return covers.get(`album:${albumKey(release.title)}`) ?? (release.type === "Album" ? undefined : covers.get(`track:${plain(release.title)}`)) ?? coverArtUrl(release.id)
}

// ---- The artist's links ----

/** The artist with its links to other sites (`url-rels`). */
export const artistUrlsUrl = (mbid: string): string => `https://musicbrainz.org/ws/2/artist/${encodeURIComponent(mbid)}?inc=url-rels&fmt=json`

export type LinkKind = "official" | "wikipedia" | "bandcamp" | "youtube" | "instagram" | "discogs"

export interface ArtistLink {
  kind: LinkKind
  label: string
  url: string
}

/**
 * The links a page shows, in this order: the artist's own site first, then what tells of it, then where its music, videos and pictures are, and last the discography. Shops, streaming
 * services (Spotify has its own button), the many databases and the other social networks are left out: a few ways on, not all of them.
 */
const LABELS: Record<LinkKind, string> = { official: "Offisiell nettside", wikipedia: "Wikipedia", bandcamp: "Bandcamp", youtube: "YouTube", instagram: "Instagram", discogs: "Discogs" }
const ORDER: readonly LinkKind[] = ["official", "wikipedia", "bandcamp", "youtube", "instagram", "discogs"]

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

/** Which of ours a relation is, by its type and, where the type is a broad one («social network»), its host. */
function kindOf(type: string, host: string): LinkKind | null {
  if (type === "official homepage") return "official"
  if (type === "bandcamp" || host.endsWith("bandcamp.com")) return "bandcamp"
  if (type === "youtube" && host === "youtube.com") return "youtube"
  if (type === "social network" && host === "instagram.com") return "instagram"
  if (type === "discogs") return "discogs"
  return null
}

const WIKIPEDIAS = ["no", "nn", "en"] as const
export type WikipediaLanguage = (typeof WIKIPEDIAS)[number]
export interface Wikipedia {
  language: WikipediaLanguage
  url: string
}

export interface ArtistUrls {
  /** The first link of each kind but Wikipedia, of the relations that have not ended, in `ORDER`. */
  links: ArtistLink[]
  /** Its item on Wikidata (`Q…`), which knows its Wikipedia articles. */
  wikidata: string | null
  /** A Wikipedia article MusicBrainz links to itself (few do now: it links Wikidata instead), Norwegian first. */
  wikipedia: Wikipedia | null
}

/** The artist's links in MusicBrainz's answer (`artistUrlsUrl`); `null` for an answer that is not one. */
export function parseArtistUrls(answer: unknown): ArtistUrls | null {
  const relations = object(answer)["relations"]
  if (!Array.isArray(relations)) return null
  const first = new Map<LinkKind, string>()
  let wikidata: string | null = null
  const wikipedias: Wikipedia[] = []
  for (const value of relations) {
    const relation = object(value)
    const url = text(object(relation["url"])["resource"])
    const host = hostOf(url)
    if (relation["ended"] === true || !/^https?:\/\//.test(url) || host === "") continue
    const type = text(relation["type"])
    if (type === "wikidata") {
      wikidata ??= /\/(Q\d+)$/.exec(url)?.[1] ?? null
      continue
    }
    if (type === "wikipedia") {
      const language = WIKIPEDIAS.find((one) => host === `${one}.wikipedia.org`)
      if (language !== undefined) wikipedias.push({ language, url })
      continue
    }
    const kind = kindOf(type, host)
    if (kind !== null && !first.has(kind)) first.set(kind, url.replace(/^http:\/\//, "https://"))
  }
  wikipedias.sort((a, b) => WIKIPEDIAS.indexOf(a.language) - WIKIPEDIAS.indexOf(b.language))
  return { links: ORDER.flatMap((kind) => { const url = first.get(kind); return url === undefined ? [] : [{ kind, label: LABELS[kind], url }] }), wikidata, wikipedia: wikipedias[0] ?? null }
}

/** The item's Wikipedia articles in Norwegian (bokmål, nynorsk) and English, with their addresses, and nothing else of it. */
export const wikipediaLinksUrl = (item: string): string => `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks%2Furls&sitefilter=nowiki%7Cnnwiki%7Cenwiki&ids=${encodeURIComponent(item)}`

/** The Wikipedia article in Wikidata's answer to read: bokmål where there is one, else nynorsk, else English; `null` where it has none of them. */
export function parseWikipedia(answer: unknown, item: string): Wikipedia | null {
  const sitelinks = object(object(object(object(answer)["entities"])[item])["sitelinks"])
  for (const language of WIKIPEDIAS) {
    const url = text(object(sitelinks[`${language}wiki`])["url"])
    if (url.startsWith("https://")) return { language, url }
  }
  return null
}

/** The links with Wikipedia in its place: «Wikipedia» for an article in bokmål, the language said for another one. */
export function withWikipedia(links: readonly ArtistLink[], wikipedia: Wikipedia | null): ArtistLink[] {
  if (wikipedia === null) return [...links]
  const label = wikipedia.language === "no" ? "Wikipedia" : wikipedia.language === "nn" ? "Wikipedia (nynorsk)" : "Wikipedia (engelsk)"
  return [...links.filter((link) => link.kind !== "wikipedia"), { kind: "wikipedia" as const, label, url: wikipedia.url }].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind))
}
