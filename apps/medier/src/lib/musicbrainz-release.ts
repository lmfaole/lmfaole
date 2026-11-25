/**
 * What an album's page asks MusicBrainz beyond the artist's albums (`musicbrainz.ts`): which release group the album is, its official releases (the label and the country of the first, and the other
 * editions), the credits of the first (who produced it, who wrote the songs, who played and sang on it), and its place among the artist's albums. Pure, so a test pins it; `sources.ts` asks.
 */

import { albumKey } from "./albums.ts"
import type { StudioAlbum } from "./musicbrainz.ts"
import { plain } from "./spotify.ts"

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string => (typeof value === "string" ? value : "")
const quoted = (name: string): string => `"${name.replace(/["\\]/g, "\\$&")}"`
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/

const API = "https://musicbrainz.org/ws/2"

/** The search for an album's release group by its title and its artist's name: for an album that is not among the artist's studio albums (an EP, a live album), or an artist MusicBrainz has no albums of. */
export const releaseGroupSearchUrl = (artist: string, title: string): string => `${API}/release-group?fmt=json&limit=10&query=${encodeURIComponent(`releasegroup:${quoted(title)} AND artist:${quoted(artist)}`)}`

/** The official releases of a release group, with their labels and media: one ask, at most a hundred. */
export const groupReleasesUrl = (group: string): string => `${API}/release?release-group=${encodeURIComponent(group)}&inc=labels+media&fmt=json&limit=100`

/** One release with its tracks and everyone credited on it, its recordings and their works. */
export const releaseCreditsUrl = (release: string): string => `${API}/release/${encodeURIComponent(release)}?inc=artist-credits+labels+recordings+artist-rels+recording-level-rels+work-rels+work-level-rels&fmt=json`

/** Two titles are the same album whatever their case, punctuation and edition («(Deluxe Edition)»). */
const sameAlbum = (a: string, b: string): boolean => albumKey(a) === albumKey(b)

/** The album among the artist's studio albums, by title; its index (0 is the first) and the album, or `null`. */
export function studioIndex(albums: readonly StudioAlbum[], title: string): number | null {
  const index = albums.findIndex((album) => sameAlbum(album.title, title))
  return index < 0 ? null : index
}

/** The release group the search found for the album: the title must be the album's, and the artist credited; `null` where none is. */
export function parseReleaseGroupMatch(answer: unknown, artist: string, title: string): { id: string; title: string } | null {
  const wanted = plain(artist)
  for (const value of list(object(answer)["release-groups"])) {
    const group = object(value)
    const credited = list(group["artist-credit"]).some((credit) => plain(text(object(credit)["name"])) === wanted || plain(text(object(object(credit)["artist"])["name"])) === wanted)
    const id = text(group["id"])
    if (id !== "" && credited && sameAlbum(text(group["title"]), title)) return { id, title: text(group["title"]) }
  }
  return null
}

/** A release of an album: when and where it came out, on which labels, and what sets it apart («Deluxe Edition»). */
export interface Release {
  id: string
  title: string
  /** `YYYY-MM-DD`, `YYYY-MM` or `YYYY`; `null` where it is not known. */
  date: string | null
  /** The country it came out in, as MusicBrainz writes it (ISO 3166, and `XE` for Europe, `XW` for the whole world); `null` where it is not known. */
  country: string | null
  labels: string[]
  disambiguation: string
  official: boolean
  /** What each of its media is, in order, as MusicBrainz writes it («CD», «12" Vinyl», «Digital Media»); a medium with no format is left out. */
  formats: string[]
}

/** What a date is sorted by: the earliest first, and of two in the same year the one with the day before the one with only the year. */
const sortable = (date: string | null): string => (date === null ? "9999" : date.padEnd(10, "-99"))

const NO_LABEL = /^\[no label\]$/i

export function parseReleases(answer: unknown): Release[] {
  return list(object(answer)["releases"]).flatMap((value) => {
    const release = object(value)
    const id = text(release["id"])
    if (id === "") return []
    const date = text(release["date"])
    const country = text(release["country"])
    const labels = [...new Set(list(release["label-info"]).map((info) => text(object(object(info)["label"])["name"]).trim()).filter((name) => name !== "" && !NO_LABEL.test(name)))]
    const formats = list(release["media"]).map((medium) => text(object(medium)["format"]).trim()).filter((format) => format !== "")
    return [{ id, title: text(release["title"]).trim(), date: DATE.test(date) ? date : null, country: /^[A-Z]{2}$/.test(country) ? country : null, labels, disambiguation: text(release["disambiguation"]).trim(), official: text(release["status"]) === "Official", formats }]
  })
}

/** The first official release of an album (the earliest, and of those the one with a label): the one whose label, country and credits stand for the album. */
export function firstRelease(releases: readonly Release[]): Release | null {
  const official = releases.filter((release) => release.official && release.date !== null)
  return [...official].sort((a, b) => sortable(a.date).localeCompare(sortable(b.date)) || Number(b.labels.length > 0) - Number(a.labels.length > 0))[0] ?? null
}

/** Every kind of compact disc MusicBrainz names: «CD», «Enhanced CD», «SACD», «Hybrid SACD», «HDCD», «SHM-CD», «CD-R», «Copy Control CD». */
const COMPACT_DISC = /CD/

/**
 * What the album's sleeve in its head holds: a CD in its jewel case (`cd`) when its first release (`firstRelease`) came out on a compact disc of some kind, its first medium's format; else a
 * record (`record`), for vinyl, a cassette, a download, or a release MusicBrainz has no format for.
 */
export const discOf = (first: Release | null): "record" | "cd" => (COMPACT_DISC.test(first?.formats[0] ?? "") ? "cd" : "record")

/** Another edition of an album: what it is called and the year it came out. */
export interface Edition {
  name: string
  year: string
  labels: string[]
}

const capital = (words: string): string => words.charAt(0).toUpperCase() + words.slice(1)

/** A name without a bracket that closes nothing or is never closed («Deluxe Edition)» is «Deluxe Edition»), as MusicBrainz's notes sometimes have one. */
export function balanced(name: string): string {
  const kept = [...name]
  const open: number[] = []
  kept.forEach((char, index) => {
    if (char === "(") open.push(index)
    else if (char === ")" && open.pop() === undefined) kept[index] = ""
  })
  for (const index of open) kept[index] = ""
  return kept.join("").replace(/\s+/g, " ").trim()
}
/** How many years after the first a release with no other name is a new edition (a reissue), not just the album in another country. */
const REISSUE_YEARS = 5
/** What MusicBrainz sets an edition apart by, not just where or how it was made («Australian manufactured release», «club edition» is one). */
const EDITION = /deluxe|remaster|anniversary|special|expanded|edition|bonus|reissue|limited|collector|legacy|super|jubileum|utgave/i

/**
 * The album's other editions, oldest first, each once (by name), at most `limit`: a release with a title of its own («Melody A.M. (Deluxe)»), one MusicBrainz tells apart as an edition («special edition», not «Australian manufactured release»), or
 * one that came out years after the first (a reissue). The album in another country the same year, or on another format, is not another edition.
 */
export function otherEditions(releases: readonly Release[], first: Release | null, limit = 6): Edition[] {
  const start = Number(first?.date?.slice(0, 4) ?? Number.NaN)
  const seen = new Set<string>()
  const editions: Edition[] = []
  for (const release of [...releases].filter((one) => one.official && one.date !== null && one !== first).sort((a, b) => sortable(a.date).localeCompare(sortable(b.date)))) {
    const year = release.date?.slice(0, 4) ?? ""
    const ownTitle = first !== null && plain(release.title) !== plain(first.title)
    const name = ownTitle ? release.title : EDITION.test(release.disambiguation) ? capital(balanced(release.disambiguation)) : Number(year) - start >= REISSUE_YEARS ? "Nyutgivelse" : null
    if (name === null) continue
    const key = `${plain(name)}:${name === "Nyutgivelse" ? year : ""}`
    if (seen.has(key)) continue
    seen.add(key)
    editions.push({ name, year, labels: release.labels })
  }
  return editions.slice(0, limit)
}

/** The country a release came out in, in Norwegian: «Storbritannia», «Europa», «Hele verden». */
export function countryName(code: string | null): string | null {
  if (code === null) return null
  if (code === "XE") return "Europa"
  if (code === "XW") return "Hele verden"
  if (code.startsWith("X")) return null
  try {
    const name = new Intl.DisplayNames(["nb"], { type: "region" }).of(code)
    return name === undefined || name === code ? null : name
  } catch {
    return null
  }
}

/** Who made an album, as its page says it: who produced it, who wrote the songs and who sang or played on it (and what), each once, those on the most tracks first. */
export interface Credits {
  producers: string[]
  writers: string[]
  /** Those who sang or played, with what in Norwegian: «Erlend Øye (vokal)». */
  performers: string[]
}

const INSTRUMENTS: Readonly<Record<string, string>> = {
  bass: "bass", "bass guitar": "bass", "double bass": "kontrabass", "electric bass guitar": "bass", guitar: "gitar", "acoustic guitar": "akustisk gitar", "electric guitar": "elgitar", "classical guitar": "gitar",
  "steel-string acoustic guitar": "akustisk gitar", "drums (drum set)": "trommer", drums: "trommer", "drum machine": "trommemaskin", percussion: "perkusjon", membranophone: "perkusjon", cymbal: "trommer", "hi-hat": "trommer",
  piano: "piano", keyboard: "keyboard", synthesizer: "synthesizer", "bass synthesizer": "synthesizer", strings: "strykere", violin: "fiolin", viola: "bratsj", cello: "cello", trumpet: "trompet", trombone: "trombone",
  saxophone: "saksofon", flute: "fløyte", banjo: "banjo", vocoder: "vokoder", organ: "orgel", harp: "harpe", clarinet: "klarinett", "french horn": "horn", horn: "horn", harmonica: "munnspill", omnichord: "omnichord",
}
const VOCALS: Readonly<Record<string, string>> = { "background vocals": "kor", "choir vocals": "kor", "other vocals": "vokal", "lead vocals": "vokal" }
/** What the attributes of a part only say of how it was taken part in, not what was played. */
const HOW = new Set(["additional", "guest", "solo", "co", "task", "executive", "assistant"])

/** What one sang or played, in Norwegian: «vokal», «gitar», «kor»; «musiker» for an instrument with no name here. */
function roleOf(type: string, attributes: readonly string[]): string[] {
  const what = attributes.filter((one) => !HOW.has(one))
  if (type === "vocal") return what.length === 0 ? ["vokal"] : what.map((one) => VOCALS[one] ?? "vokal")
  if (type === "instrument") return what.length === 0 ? ["musiker"] : what.map((one) => INSTRUMENTS[one] ?? "musiker")
  return ["musiker"]
}

const WRITING = new Set(["composer", "lyricist", "writer"])
const PERFORMING = new Set(["vocal", "instrument", "performer"])

/** Names, those counted most first, then by when they were met: each once. */
const ranked = (counts: Map<string, number>, limit: number): string[] => [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name).slice(0, limit)

/**
 * The credits of a release (`releaseCreditsUrl`): its own relationships, its recordings' and their works'. The artist the album is by is left out of who sang and played (it is its album) but
 * not of who produced and wrote it. At most `limit` of each; `null` where the release has no credits at all.
 */
export function parseCredits(answer: unknown, artist: string, limit = 8): Credits | null {
  const release = object(answer)
  const credited = new Set([plain(artist), ...list(release["artist-credit"]).map((credit) => plain(text(object(object(credit)["artist"])["name"])))])
  const producers = new Map<string, number>()
  const writers = new Map<string, number>()
  const performers = new Map<string, { tracks: number; roles: Set<string> }>()
  const seen = new Set<string>()
  const take = (value: unknown, track: string): void => {
    const relation = object(value)
    const name = text(object(relation["artist"])["name"]).trim()
    if (text(relation["target-type"]) !== "artist" || name === "") return
    const type = text(relation["type"])
    const attributes = list(relation["attributes"]).map(text)
    const once = `${track}:${type}:${name}`
    if (seen.has(once)) return
    seen.add(once)
    if (type === "producer") producers.set(name, (producers.get(name) ?? 0) + 1)
    else if (WRITING.has(type)) writers.set(name, (writers.get(name) ?? 0) + 1)
    else if (PERFORMING.has(type) && !credited.has(plain(name))) {
      const found = performers.get(name) ?? { tracks: 0, roles: new Set<string>() }
      found.tracks += 1
      for (const role of roleOf(type, attributes)) found.roles.add(role)
      performers.set(name, found)
    }
  }
  for (const relation of list(release["relations"])) take(relation, "release")
  for (const [index, track] of list(release["media"]).flatMap((medium) => list(object(medium)["tracks"])).entries()) {
    for (const relation of list(object(object(track)["recording"])["relations"])) {
      take(relation, String(index))
      const work = object(object(relation)["work"])
      for (const inner of list(work["relations"])) take(inner, String(index))
    }
  }
  const played = [...performers.entries()].sort((a, b) => b[1].tracks - a[1].tracks).slice(0, limit).map(([name, found]) => {
    const roles = [...found.roles]
    return `${name} (${(roles.length > 1 ? roles.filter((role) => role !== "musiker") : roles).join(", ")})`
  })
  const credits = { producers: ranked(producers, limit), writers: ranked(writers, limit), performers: played }
  return credits.producers.length + credits.writers.length + credits.performers.length === 0 ? null : credits
}

/** The album's place among the artist's studio albums: which it is (1 is the first), of how many, and the ones before and after it. */
export interface DiscographyPlace {
  number: number
  of: number
  previous: StudioAlbum | null
  next: StudioAlbum | null
}

export function discographyPlace(albums: readonly StudioAlbum[], index: number | null): DiscographyPlace | null {
  if (index === null || albums[index] === undefined) return null
  return { number: index + 1, of: albums.length, previous: albums[index - 1] ?? null, next: albums[index + 1] ?? null }
}

/** «3. studioalbum av 8»; the only one is «Eneste studioalbum». */
export const placeText = (place: DiscographyPlace): string => (place.of === 1 ? "Eneste studioalbum" : `${place.number}. studioalbum av ${place.of}`)
