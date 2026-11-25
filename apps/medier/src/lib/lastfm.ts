/**
 * What the site keeps of Last.fm, and how it is read from Last.fm's answers (`user.getrecenttracks`, `user.gettopartists`). Pure, so a test
 * pins it; `scripts/fetch.ts` does the asking.
 */

export interface Play {
  track: string
  artist: string
  album: string
  /** The cover, as Last.fm hosts it; `null` where it has none. */
  image: string | null
  url: string
  /** ISO time it was played; `null` for what is playing now. */
  playedAt: string | null
}

export interface TopArtist {
  name: string
  plays: number
  url: string
}

export interface Music {
  /** When it was fetched; `null` before the first fetch. */
  at: string | null
  user: string
  recent: Play[]
  topArtists: TopArtist[]
}

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : value === undefined || value === null ? [] : [value])
const text = (value: unknown): string => (typeof value === "string" ? value : typeof value === "number" ? String(value) : "")
/** Last.fm writes a name as `{ "#text": … }` in some places and as a string in others. */
const named = (value: unknown): string => (typeof value === "string" ? value : text(object(value)["#text"]))

/** The largest picture Last.fm lists, or `null`: it lists empty strings for a track with no cover, and a placeholder star for an unknown one. */
function largest(images: unknown): string | null {
  const found = list(images).map((image) => text(object(image)["#text"])).filter((url) => url !== "" && !url.includes("2a96cbd8b46e442fc41c2b86b821562f"))
  return found.at(-1) ?? null
}

export function parseRecentTracks(answer: unknown): Play[] {
  return list(object(object(answer)["recenttracks"])["track"]).map((value) => {
    const track = object(value)
    const nowPlaying = text(object(track["@attr"])["nowplaying"]) === "true"
    const seconds = Number(text(object(track["date"])["uts"]))
    return {
      track: text(track["name"]),
      artist: named(track["artist"]),
      album: named(track["album"]),
      image: largest(track["image"]),
      url: text(track["url"]),
      playedAt: nowPlaying || !Number.isFinite(seconds) || seconds === 0 ? null : new Date(seconds * 1000).toISOString(),
    }
  }).filter((play) => play.track !== "" && play.artist !== "")
}

export function parseTopArtists(answer: unknown): TopArtist[] {
  return list(object(object(answer)["topartists"])["artist"])
    .map((value) => {
      const artist = object(value)
      return { name: text(artist["name"]), plays: Number(text(artist["playcount"])) || 0, url: text(artist["url"]) }
    })
    .filter((artist) => artist.name !== "")
}

/** What Last.fm says of an artist beyond its plays here: what it is tagged as, how many listen, how many times the owner has played it, and a few lines about it. */
export interface ArtistInfo {
  tags: string[]
  listeners: number | null
  /** How many times the owner has played it in all (Last.fm counts it when asked with the user's name); `null` where it is not known. */
  userPlays: number | null
  /** The start of Last.fm's text about it, as plain text (their text is the users', CC BY-SA, with a link back where it is shown). */
  bio: string | null
  /** Its MusicBrainz id, where Last.fm knows it (`musicbrainz.ts` asks for its albums by it). */
  mbid: string | null
}

/** What Last.fm says of a track. */
export interface TrackInfo {
  tags: string[]
  listeners: number | null
  userPlays: number | null
  /** How long it is, in seconds. */
  seconds: number | null
  /** The start of Last.fm's text about it, plain text; `null` where there is none (most tracks have none). */
  bio: string | null
  /** The cover of the album Last.fm puts it on; `null` where it knows of none. */
  cover: string | null
}

/** What Last.fm says of an album, with the tracks it has. */
export interface AlbumInfo {
  tags: string[]
  listeners: number | null
  userPlays: number | null
  bio: string | null
  /** The tracks in order, with their length in seconds where Last.fm has it. */
  tracks: { title: string; seconds: number | null }[]
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " }

/** At most `limit` characters of the text, cut at the end of a sentence where there is one, so it never ends in the middle of a word. */
export function firstSentences(text: string, limit: number): string {
  if (text.length <= limit) return text
  const head = text.slice(0, limit)
  const end = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "))
  return end > limit / 3 ? head.slice(0, end + 1) : `${head.slice(0, head.lastIndexOf(" "))}…`
}

/** A count Last.fm writes as text («1234»): a whole number above nothing, or `null`. */
const count = (value: unknown): number | null => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

/** The text of one of Last.fm's wikis (`bio`, `wiki`): what is before its own link and licence line, as plain text, cut at a sentence; `null` for a text that is only the link. */
function wikiText(wiki: unknown): string | null {
  const summary = object(wiki)["summary"]
  // The summary ends with a link to Last.fm («Read more on Last.fm») and a licence line: only the text before them is the text.
  const raw = typeof summary === "string" ? summary.split(/<a\s/i)[0] ?? "" : ""
  const text = raw.replace(/<[^>]+>/g, "").replace(/&(?:amp|quot|#39|lt|gt|nbsp);/g, (entity) => ENTITIES[entity] ?? entity).replace(/\s+/g, " ").trim()
  return text.length < 40 ? null : firstSentences(text, 420)
}

/** The first tags of what it is tagged as (Last.fm's users'). */
function tagsOf(value: unknown): string[] {
  return list(object(value)["tag"]).flatMap((tag) => {
    const name = object(tag)["name"]
    return typeof name === "string" && name !== "" ? [name] : []
  }).slice(0, 4)
}

/** The address of one of Last.fm's `getinfo` methods: `base` is the one with the key (`sources.ts`), `user` the owner, whose own count Last.fm then adds as `userplaycount`. */
function infoUrl(base: string, method: string, parts: Record<string, string>, user: string): string {
  const query = Object.entries(parts).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")
  return `${base}&method=${method}&autocorrect=1&${query}&username=${encodeURIComponent(user)}`
}

export const artistInfoUrl = (base: string, artist: string, user: string): string => infoUrl(base, "artist.getinfo", { artist }, user)
export const trackInfoUrl = (base: string, artist: string, track: string, user: string): string => infoUrl(base, "track.getinfo", { artist, track }, user)
export const albumInfoUrl = (base: string, artist: string, album: string, user: string): string => infoUrl(base, "album.getinfo", { artist, album }, user)

export function parseArtistInfo(answer: unknown): ArtistInfo {
  const info = object(object(answer)["artist"])
  const stats = object(info["stats"])
  const mbid = text(info["mbid"]).trim().toLowerCase()
  return { tags: tagsOf(info["tags"]), listeners: count(stats["listeners"]), userPlays: count(stats["userplaycount"]), bio: wikiText(info["bio"]), mbid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(mbid) ? mbid : null }
}

export function parseTrackInfo(answer: unknown): TrackInfo {
  const info = object(object(answer)["track"])
  const milliseconds = count(info["duration"])
  return { tags: tagsOf(info["toptags"]), listeners: count(info["listeners"]), userPlays: count(info["userplaycount"]), seconds: milliseconds === null ? null : Math.round(milliseconds / 1000), bio: wikiText(info["wiki"]), cover: largest(object(info["album"])["image"]) }
}

export function parseAlbumInfo(answer: unknown): AlbumInfo {
  const info = object(object(answer)["album"])
  const tracks = list(object(info["tracks"])["track"]).flatMap((value) => {
    const track = object(value)
    const title = typeof track["name"] === "string" ? track["name"].trim() : ""
    return title === "" ? [] : [{ title, seconds: count(track["duration"]) }]
  })
  return { tags: tagsOf(info["tags"]), listeners: count(info["listeners"]), userPlays: count(info["userplaycount"]), bio: wikiText(info["wiki"]), tracks }
}

/** One page of the plays in a range of time (`user.getrecenttracks` with `from` and `to`), with where it is among the pages. What is playing this moment is left out: it is not a finished play. */
export interface RecentPage {
  plays: Play[]
  page: number
  totalPages: number
  /** How many plays there are in all, in the whole range. */
  total: number
}

export function parseRecentPage(answer: unknown): RecentPage {
  const meta = object(object(object(answer)["recenttracks"])["@attr"])
  const whole = (value: unknown, fallback: number): number => {
    const written = text(value)
    return written !== "" && Number.isInteger(Number(written)) && Number(written) >= 0 ? Number(written) : fallback
  }
  return {
    plays: parseRecentTracks(answer).filter((play) => play.playedAt !== null),
    page: whole(meta["page"], 1),
    totalPages: whole(meta["totalPages"], 1),
    total: whole(meta["total"], 0),
  }
}

/** One artist of a week's chart: its plays that week, and its place (1 is the most played). */
export interface ChartArtist {
  name: string
  plays: number
  rank: number
}

export function parseArtistChart(answer: unknown): ChartArtist[] {
  return list(object(object(answer)["weeklyartistchart"])["artist"]).flatMap((value) => {
    const artist = object(value)
    const name = text(artist["name"])
    const plays = Number(text(artist["playcount"]))
    return name === "" || !Number.isFinite(plays) ? [] : [{ name, plays, rank: Number(text(object(artist["@attr"])["rank"])) || 0 }]
  })
}

/** The addresses of the weekly wrapped's questions to Last.fm: `base` is the one with the key and the user (`sources.ts`); times are unix seconds, and `to` is not included. */
export const playsInRangeUrl = (base: string, from: number, to: number, page: number): string => `${base}&method=user.getrecenttracks&from=${from}&to=${to - 1}&limit=200&page=${page}`
export const artistChartUrl = (base: string, from: number, to: number): string => `${base}&method=user.getweeklyartistchart&from=${from}&to=${to}`
/** The same question with one play to a page: Last.fm still says how many there are in all, which is all a trend needs. */
export const playsTotalUrl = (base: string, from: number, to: number): string => `${base}&method=user.getrecenttracks&from=${from}&to=${to - 1}&limit=1&page=1`

/** One of an artist's albums as Last.fm ranks them: its name, how many plays it has on Last.fm in all, and its cover. */
export interface ArtistAlbum {
  title: string
  plays: number
  image: string | null
  url: string
}

/**
 * The most played albums of an artist (`artist.gettopalbums`), most first: Last.fm lists some with no name («(null)») and the same album twice under different spellings, which are left out; at most `limit`.
 * What Last.fm has no plays for is not ranked. Last.fm does not tell an album from a single, an EP, a live album or a compilation: `albums.ts` sorts those out.
 */
export function parseTopAlbums(answer: unknown, limit = 8): ArtistAlbum[] {
  const seen = new Set<string>()
  const albums: ArtistAlbum[] = []
  for (const value of list(object(object(answer)["topalbums"])["album"])) {
    const album = object(value)
    const title = text(album["name"]).trim()
    const plays = Number(text(album["playcount"]))
    const key = title.toLowerCase()
    if (title === "" || title === "(null)" || !Number.isFinite(plays) || plays <= 0 || seen.has(key)) continue
    seen.add(key)
    albums.push({ title, plays, image: largest(album["image"]), url: text(album["url"]) })
  }
  return albums.sort((a, b) => b.plays - a.plays).slice(0, limit)
}

export const artistTopAlbumsUrl = (base: string, artist: string): string => `${base}&method=artist.gettopalbums&autocorrect=1&artist=${encodeURIComponent(artist)}&limit=50`

/** What Last.fm says of the user: when they started (unix seconds) and how many plays they have in all; `null` for what it does not say. */
export interface UserInfo {
  registered: number | null
  plays: number | null
}

export const userInfoUrl = (base: string): string => `${base}&method=user.getinfo`

export function parseUserInfo(answer: unknown): UserInfo {
  const user = object(object(answer)["user"])
  const registered = object(user["registered"])
  return { registered: count(registered["unixtime"] ?? registered["#text"]), plays: count(user["playcount"]) }
}

/** The user's most played artists and songs of all time: the first thousand, one answer shared by every artist's page. */
export const allTimeArtistsUrl = (base: string): string => `${base}&method=user.gettopartists&period=overall&limit=1000`
export const allTimeTracksUrl = (base: string): string => `${base}&method=user.gettoptracks&period=overall&limit=1000`

/** A song among the user's most played, with how many times they have played it. */
export interface TopTrack {
  title: string
  artist: string
  plays: number
  url: string
}

export function parseTopTracks(answer: unknown): TopTrack[] {
  return list(object(object(answer)["toptracks"])["track"]).flatMap((value) => {
    const track = object(value)
    const title = text(track["name"]).trim()
    const artist = text(object(track["artist"])["name"]) || named(track["artist"])
    const plays = Number(text(track["playcount"]))
    return title === "" || artist === "" || !Number.isFinite(plays) || plays <= 0 ? [] : [{ title, artist, plays, url: text(track["url"]) }]
  })
}

/** Artists like one (`artist.getsimilar`), the most like it first, with how alike Last.fm finds them (0 to 1). */
export interface SimilarArtist {
  name: string
  match: number
  url: string
}

export const similarArtistsUrl = (base: string, artist: string): string => `${base}&method=artist.getsimilar&autocorrect=1&artist=${encodeURIComponent(artist)}&limit=50`

export function parseSimilarArtists(answer: unknown): SimilarArtist[] {
  return list(object(object(answer)["similarartists"])["artist"]).flatMap((value) => {
    const artist = object(value)
    const name = text(artist["name"]).trim()
    const match = Number(text(artist["match"]))
    return name === "" ? [] : [{ name, match: Number.isFinite(match) ? match : 0, url: text(artist["url"]) }]
  })
}
