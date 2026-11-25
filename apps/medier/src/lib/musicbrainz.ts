/**
 * What the site asks MusicBrainz: which of an artist's releases are albums. Last.fm does not know an album from a single, an EP, a live album or a compilation, and
 * MusicBrainz does (a release group's primary type, and its secondary types: Compilation, Live, Remix, Soundtrack, Demo, DJ-mix and so on). One search gives them all, so
 * an artist's page asks once (MusicBrainz allows one ask a second, and wants a User-Agent that names the site: the relay's and `runtime.ts`'s do). No key.
 */

import { plain } from "./spotify.ts"

/** One of an artist's albums: a release group whose primary type is Album and which has no secondary type. */
export interface StudioAlbum {
  id: string
  title: string
  /** `YYYY-MM-DD`, `YYYY-MM` or `YYYY`; `null` where MusicBrainz does not know. */
  released: string | null
}

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string => (typeof value === "string" ? value : "")

/** The front cover of a release group in the Cover Art Archive, an image 250 wide: an address the browser asks for itself (it redirects to the Internet Archive), and that has nothing where no cover was given. */
export const coverArtUrl = (id: string): string => `https://coverartarchive.org/release-group/${encodeURIComponent(id)}/front-250`

/** A name inside quotes in MusicBrainz's search (Lucene): a quote or a backslash in it is escaped. */
const quoted = (name: string): string => `"${name.replace(/["\\]/g, "\\$&")}"`

/**
 * The search for an artist's official albums: by its MusicBrainz id where Last.fm gave one, else by its name (the answer is then checked against the name, `parseStudioAlbums`).
 * The secondary types are left out by `parseStudioAlbums`, not by the search, which cannot ask for «none».
 */
export function releaseGroupsUrl(artist: string, mbid: string | null): string {
  const who = mbid === null ? `artist:${quoted(artist)}` : `arid:${mbid}`
  return `https://musicbrainz.org/ws/2/release-group?fmt=json&limit=100&query=${encodeURIComponent(`${who} AND primarytype:album AND status:official`)}`
}

/**
 * The artist's albums in MusicBrainz's answer, oldest first: primary type Album, no secondary type, credited to the artist (by id where it is known, else by name), each title once.
 * `null` for an answer that is not one, and for one with no album at all: an artist MusicBrainz does not know is not one with no albums.
 */
export function parseStudioAlbums(answer: unknown, artist: string, mbid: string | null): StudioAlbum[] | null {
  const groups = object(answer)["release-groups"]
  if (!Array.isArray(groups)) return null
  const wanted = plain(artist)
  const seen = new Set<string>()
  const albums: StudioAlbum[] = []
  for (const value of groups) {
    const group = object(value)
    const id = text(group["id"])
    const title = text(group["title"]).trim()
    const credited = list(group["artist-credit"]).some((credit) => {
      const one = object(object(credit)["artist"])
      return mbid === null ? plain(text(object(credit)["name"])) === wanted || plain(text(one["name"])) === wanted : text(one["id"]) === mbid
    })
    if (id === "" || title === "" || text(group["primary-type"]) !== "Album" || list(group["secondary-types"]).length > 0 || !credited || seen.has(plain(title))) continue
    seen.add(plain(title))
    const released = text(group["first-release-date"])
    albums.push({ id, title, released: /^\d{4}(-\d{2}(-\d{2})?)?$/.test(released) ? released : null })
  }
  if (albums.length === 0) return null
  return albums.sort((a, b) => (a.released ?? "9999").localeCompare(b.released ?? "9999"))
}
