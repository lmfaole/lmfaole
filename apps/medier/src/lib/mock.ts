/**
 * Made-up answers from Last.fm, Trakt, TMDB, Spotify and MusicBrainz, for working on the site with no keys and no network (`MOCK_DATA=1` in `.dev.vars`; `runtime.ts` asks `mockFetch` instead of the sources).
 * Pure: the same time gives the same answers. Plays and viewings are laid out on a fixed grid of time that ends at `now`, so every week and month of the last ten months has some, a week is not like
 * the one before it, and two artists are new lately. What they are made of is real (`mock-data.json`: albums, tracklists, films, people, from Deezer and Wikipedia) and so are the pictures in `public/mock/`,
 * both fetched once by `scripts/fetch-mock-data.mjs` (the pictures are other people's artwork and not committed: `node scripts/fetch-mock-data.mjs --images` fetches them again).
 */

import data from "./mock-data.json" with { type: "json" }
import { plain } from "./spotify.ts"

/** The settings of a run on made-up data: what is not set (no keys are) is given a name that is no key, so every source is «set up». The usernames are the visitor's, as always (any one is taken). */
export function mockSettings(env: Readonly<Partial<Record<string, string>>>): Record<string, string> {
  const defaults = { LASTFM_API_KEY: "mock", TRAKT_CLIENT_ID: "mock", TMDB_API_KEY: "mock", SPOTIFY_CLIENT_ID: "mock", SPOTIFY_CLIENT_SECRET: "mock", SPOTIFY_REFRESH_TOKEN: "mock", SETLISTFM_API_KEY: "mock", STEAM_API_KEY: "mock", RETROACHIEVEMENTS_API_KEY: "mock" }
  return { ...defaults, ...Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1] !== "")) }
}

const DAY = 86400
const SLOT = 1200
const HISTORY = 300 * DAY
/** The plays go further back than the viewings: an artist's page shows them year by year, and when it was first heard. */
const PLAY_HISTORY = 1500 * DAY

/** A number from two numbers, the same each time and unlike its neighbours. */
function mix(a: number, b = 0): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35)
  h ^= h >>> 13
  h = Math.imul(h, 0x27d4eb2f)
  h ^= h >>> 15
  return h >>> 0
}

// ---- Music ----

/** Artists Last.fm finds like ours that are never played here: a page shows only those that are. */
const SIMILAR_UNHEARD = ["Morten Harket", "Kygo", "Ane Brun", "Jarle Bernhoft", "Annie"]

interface Picture {
  file: string
  source: string
}

interface MockArtist {
  name: string
  tags: string[]
  weight: number
  /** How many days ago it was first played. */
  since: number
  bio: string
  image: Picture
  /** What it is on MusicBrainz: an album, or an EP or a single (which Last.fm ranks among the albums all the same). */
  albums: {
    title: string
    year: number | null
    type: string
    cover: Picture
    tracks: { title: string; seconds: number }[]
    /** The real album on MusicBrainz: its releases, which of them came first, and the credits of that one (by level, and the track by its index). */
    musicbrainz?: {
      title: string
      releases: { title: string; status: string | null; date: string; country: string | null; disambiguation: string; labels: string[]; formats: (string | null)[] }[]
      firstRelease: number | null
      credits: { level: string; track: number | null; type: string; attributes: string[]; name: string }[]
    } | null
  }[]
  /** Its other studio albums on MusicBrainz, never played here: its discography has them, with no plays. */
  studio?: { title: string; year: number }[]
  /** Its links on, real ones from MusicBrainz (url-rels of the kinds shown) and its Wikipedia articles by language, from Wikidata. */
  links: { relations: { type: string; url: string }[]; wikipedia: Partial<Record<string, string>> }
}

const ARTISTS: readonly MockArtist[] = data.artists

interface MockTrack {
  artist: MockArtist
  artistIndex: number
  albumIndex: number
  title: string
  album: string
  seconds: number
  index: number
}

const trackOf = (artistIndex: number, albumIndex: number, index: number): MockTrack => {
  const artist = ARTISTS[artistIndex] as MockArtist
  const album = artist.albums[albumIndex] as MockArtist["albums"][number]
  const track = album.tracks[index] as { title: string; seconds: number }
  return { artist, artistIndex, albumIndex, title: track.title, album: album.title, seconds: track.seconds, index }
}

interface Play extends MockTrack {
  at: number
}

/** The artist, album and track a moment of the grid has, the most played artists most often; only those that had been played by then. */
function pick(seed: number, at: number, now: number): MockTrack {
  const live = ARTISTS.flatMap((artist, index) => (at >= now - artist.since * DAY ? [{ artist, index }] : []))
  const total = live.reduce((sum, one) => sum + one.artist.weight, 0)
  let point = mix(seed, 4) % total
  const chosen = live.find((one) => (point -= one.artist.weight) < 0) ?? (live[0] as { artist: MockArtist; index: number })
  const albumIndex = mix(seed, 5) % chosen.artist.albums.length
  const album = chosen.artist.albums[albumIndex] as MockArtist["albums"][number]
  return trackOf(chosen.index, albumIndex, mix(seed, 6) % album.tracks.length)
}

/** Every play from `from` to `to` (unix seconds, both included), newest first. The listening is in the day (nothing at night) and some weeks have more of it than others. */
function playsIn(from: number, to: number, now: number): Play[] {
  const low = Math.max(from, now - PLAY_HISTORY)
  const high = Math.min(to, now)
  const plays: Play[] = []
  for (let slot = Math.floor(high / SLOT); slot >= Math.floor(low / SLOT); slot -= 1) {
    const at = slot * SLOT + (mix(slot, 1) % SLOT)
    if (at < low || at > high) continue
    const hour = (Math.floor(at / 3600) + 2) % 24
    const week = Math.floor(at / (7 * DAY))
    if (hour < 7 || mix(slot, 2) % 100 >= 30 + (mix(week, 7) % 66)) continue
    plays.push({ ...pick(slot, at, now), at })
  }
  return plays
}

/** The song that plays now: one for a few minutes at a time. */
const nowTrack = (now: number): MockTrack => pick(Math.floor(now / 240), now, now)

const artistNamed = (name: string): { artist: MockArtist; index: number } | undefined => {
  const index = ARTISTS.findIndex((artist) => plain(artist.name) === plain(name))
  return index < 0 ? undefined : { artist: ARTISTS[index] as MockArtist, index }
}
const albumNamed = (artist: string, title: string): { artist: MockArtist; artistIndex: number; albumIndex: number } | undefined => {
  const found = artistNamed(artist)
  const albumIndex = found?.artist.albums.findIndex((album) => plain(album.title) === plain(title)) ?? -1
  return found === undefined || albumIndex < 0 ? undefined : { artist: found.artist, artistIndex: found.index, albumIndex }
}
const trackNamed = (artist: string, title: string): MockTrack | undefined => {
  const found = artistNamed(artist)
  if (found === undefined) return undefined
  for (const [albumIndex, album] of found.artist.albums.entries()) {
    const index = album.tracks.findIndex((track) => plain(track.title) === plain(title))
    if (index >= 0) return trackOf(found.index, albumIndex, index)
  }
  return undefined
}

const cover = (artistIndex: number, albumIndex: number): string => (ARTISTS[artistIndex] as MockArtist).albums[albumIndex]?.cover.file ?? ""
const lastfmImages = (url: string): { "#text": string; size: string }[] => ["small", "medium", "large", "extralarge"].map((size) => ({ "#text": url, size }))
const lastfmUrl = (...parts: string[]): string => `https://www.last.fm/music/${parts.map((part) => encodeURIComponent(part).replace(/%20/g, "+")).join("/")}`

function lastfmTrack(play: MockTrack, at: number | null): Record<string, unknown> {
  return {
    name: play.title,
    artist: { "#text": play.artist.name },
    album: { "#text": play.album },
    image: lastfmImages(cover(play.artistIndex, play.albumIndex)),
    url: lastfmUrl(play.artist.name, "_", play.title),
    ...(at === null ? { "@attr": { nowplaying: "true" } } : { date: { uts: String(at), "#text": new Date(at * 1000).toISOString() } }),
  }
}

const json = (data: unknown, status = 200): Response => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } })
const lastfmError = (code: number, message: string): Response => json({ error: code, message })

/** The MusicBrainz id of a made-up artist: the same each time, and one no real artist has. */
const mockMbid = (index: number): string => `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`

/**
 * What Last.fm ranks among an artist's albums, as it does: the albums and EPs, and besides them a single (a song of the first album, under its own name), a deluxe edition of
 * the first album and a live album, so a page shows that only the albums are kept, each once.
 */
function lastfmReleases(artist: MockArtist, index: number): { title: string; plays: number; albumIndex: number }[] {
  const plays = (slot: number): number => 400000 - slot * 90000 + (mix(index, slot) % 50000)
  const first = artist.albums[0] as MockArtist["albums"][number]
  return [
    ...artist.albums.map((album, albumIndex) => ({ title: album.title, plays: plays(albumIndex * 2), albumIndex })),
    { title: first.tracks[0]?.title ?? `${first.title} - Single`, plays: plays(1), albumIndex: 0 },
    { title: `${first.title} (Deluxe Edition)`, plays: plays(3) / 4, albumIndex: 0 },
    { title: `Live at Rockefeller`, plays: plays(4) / 3, albumIndex: 1 },
  ].map((release) => ({ ...release, plays: Math.round(release.plays) }))
}

/** MusicBrainz's answer to the search for an artist's official albums (`musicbrainz.ts`), by its id or its name: its albums (and its others never played here), and a live album and a compilation that are not albums. */
function musicbrainz(url: URL, now: number): Response {
  if (url.pathname.startsWith("/ws/2/release/") || url.pathname === "/ws/2/release" || (url.pathname === "/ws/2/release-group" && (url.searchParams.get("query") ?? "").includes("releasegroup:"))) return musicbrainzRelease(url)
  const artistPath = /^\/ws\/2\/artist\/([^/]+)$/.exec(url.pathname)
  if (artistPath !== null) return musicbrainzArtist(decodeURIComponent(artistPath[1] ?? ""))
  const query = url.searchParams.get("query") ?? ""
  if (query.includes("firstreleasedate:")) return latestReleases(query, now)
  const id = /arid:(\S+)/.exec(query)?.[1]
  const index = id === undefined ? (artistNamed(/artist:"((?:[^"\\]|\\.)*)"/.exec(query)?.[1]?.replace(/\\(.)/g, "$1") ?? "")?.index ?? -1) : ARTISTS.findIndex((_, at) => mockMbid(at) === id)
  const artist = ARTISTS[index]
  if (artist === undefined) return json({ created: new Date(0).toISOString(), count: 0, offset: 0, "release-groups": [] })
  const credit = [{ name: artist.name, artist: { id: mockMbid(index), name: artist.name } }]
  const group = (slot: number, title: string, year: number | null, secondary: string[]) => ({ id: groupMbid(index, slot), title, "primary-type": "Album", ...(secondary.length === 0 ? {} : { "secondary-types": secondary }), "first-release-date": year === null ? "" : String(year), "artist-credit": credit })
  const groups = [
    ...artist.albums.flatMap((album, albumIndex) => (album.type === "Album" ? [group(albumIndex, album.title, album.year, [])] : [])),
    ...(artist.studio ?? []).map((album, at) => group(50 + at, album.title, album.year, [])),
    group(90, "Live at Rockefeller", 2019, ["Live"]),
    group(91, `The Best of ${artist.name}`, 2020, ["Compilation"]),
  ]
  return json({ created: new Date(0).toISOString(), count: groups.length, offset: 0, "release-groups": groups })
}

/** A release group of an artist: the artist's number and the group's slot, so no two artists' groups are one. */
const groupMbid = (artistIndex: number, slot: number): string => `${mockMbid(artistIndex).slice(0, -12)}${String(artistIndex + 1).padStart(8, "0")}${String(slot).padStart(4, "0")}`
/** A release of an album's group: its number among the group's releases in the first 8 digits, the group after. */
const releaseMbid = (group: string, release: number): string => `${String(release + 1).padStart(8, "0")}${group.slice(8)}`

/** The album a group id stands for, any type (an EP is found by search, not among the studio albums). */
function albumOfGroup(group: string): { artist: MockArtist; artistIndex: number; album: MockArtist["albums"][number] } | undefined {
  for (const [artistIndex, artist] of ARTISTS.entries()) {
    const albumIndex = artist.albums.findIndex((_, at) => groupMbid(artistIndex, at) === group)
    const album = artist.albums[albumIndex]
    if (album !== undefined) return { artist, artistIndex, album }
  }
  return undefined
}

/**
 * MusicBrainz's answers about one album (`musicbrainz-release.ts`), from the real album's releases and the credits of its first, in `mock-data.json`: the search for its release group, the group's
 * releases with their labels, and the first release with its tracks, its recordings' and works' relationships.
 */
function musicbrainzRelease(url: URL): Response {
  const empty = (key: string) => json({ created: new Date(0).toISOString(), count: 0, offset: 0, [key]: [] })
  if (url.pathname === "/ws/2/release-group") {
    const query = url.searchParams.get("query") ?? ""
    const unquote = (pattern: RegExp): string => pattern.exec(query)?.[1]?.replace(/\\(.)/g, "$1") ?? ""
    const found = albumNamed(unquote(/artist:"((?:[^"\\]|\\.)*)"/), unquote(/releasegroup:"((?:[^"\\]|\\.)*)"/))
    if (found === undefined) return empty("release-groups")
    const album = found.artist.albums[found.albumIndex] as MockArtist["albums"][number]
    const credit = [{ name: found.artist.name, artist: { id: mockMbid(found.artistIndex), name: found.artist.name } }]
    return json({ created: new Date(0).toISOString(), count: 1, offset: 0, "release-groups": [{ id: groupMbid(found.artistIndex, found.albumIndex), score: 100, title: album.title, "primary-type": album.type, "artist-credit": credit }] })
  }
  const notFound = () => json({ error: "Not Found", help: "For usage, please see: https://musicbrainz.org/development/mmd" }, 404)
  const releaseOf = (release: NonNullable<MockArtist["albums"][number]["musicbrainz"]>["releases"][number], id: string) => ({
    id, title: release.title, status: release.status, date: release.date, country: release.country, disambiguation: release.disambiguation,
    "label-info": release.labels.map((name) => ({ "catalog-number": null, label: { name } })), media: release.formats.map((format) => ({ format, "track-count": 0 })),
  })
  if (url.pathname === "/ws/2/release") {
    const group = url.searchParams.get("release-group") ?? ""
    const found = albumOfGroup(group)
    if (found === undefined) return notFound()
    const releases = found.album.musicbrainz?.releases ?? []
    return json({ "release-count": releases.length, "release-offset": 0, releases: releases.map((release, index) => releaseOf(release, releaseMbid(group, index))) })
  }
  const id = decodeURIComponent(url.pathname.slice("/ws/2/release/".length))
  const found = albumOfGroup(`00000000${id.slice(8)}`)
  const stored = found?.album.musicbrainz ?? undefined
  const index = Number(id.slice(0, 8)) - 1
  const release = stored?.releases[index]
  if (found === undefined || stored === undefined || release === undefined) return notFound()
  const relation = (credit: { type: string; attributes: string[]; name: string }) => ({ type: credit.type, "target-type": "artist", attributes: credit.attributes, direction: "backward", artist: { name: credit.name } })
  const credits = stored.credits
  const tracks = found.album.tracks.map((track, at) => {
    const own = credits.filter((credit) => credit.track === at)
    const works = own.filter((credit) => credit.level === "work")
    return {
      position: at + 1, title: track.title, length: track.seconds * 1000,
      recording: { title: track.title, relations: [...own.filter((credit) => credit.level === "recording").map(relation), ...(works.length === 0 ? [] : [{ type: "performance", "target-type": "work", work: { title: track.title, relations: works.map(relation) } }])] },
    }
  })
  return json({
    ...releaseOf(release, id), "artist-credit": [{ name: found.artist.name, artist: { id: mockMbid(found.artistIndex), name: found.artist.name } }],
    relations: credits.filter((credit) => credit.level === "release").map(relation), media: [{ format: release.formats[0] ?? null, position: 1, tracks }],
  })
}

/** MusicBrainz's artist with its url-rels (`musicbrainz-artist.ts`): the real links of the made-up artist's real namesake; a Wikidata link names the item `wikidata` answers for. */
function musicbrainzArtist(id: string): Response {
  const artist = ARTISTS.find((_, at) => mockMbid(at) === id)
  if (artist === undefined) return json({ error: "Not Found", help: "For usage, please see: https://musicbrainz.org/development/mmd" }, 404)
  return json({ id, name: artist.name, relations: artist.links.relations.map((one) => ({ type: one.type, ended: false, url: { resource: one.url } })) })
}

/**
 * MusicBrainz's answer to the search for an artist's newest releases (`latestReleasesUrl`), made up around `now` so the page has one to show: every third artist has a single coming in a few weeks,
 * the next a new album a few months old (its second, so its page is linked where it is played), and the third only one from years ago, which is no news.
 */
function latestReleases(query: string, now: number): Response {
  const id = /arid:(\S+)/.exec(query)?.[1]
  const index = id === undefined ? (artistNamed(/artist:"((?:[^"\\]|\\.)*)"/.exec(query)?.[1]?.replace(/\\(.)/g, "$1") ?? "")?.index ?? -1) : ARTISTS.findIndex((_, at) => mockMbid(at) === id)
  const artist = ARTISTS[index]
  const album = artist?.albums[1] ?? artist?.albums[0]
  if (artist === undefined || album === undefined) return json({ created: new Date(0).toISOString(), count: 0, offset: 0, "release-groups": [] })
  const day = (days: number): string => new Date((now + days * DAY) * 1000).toISOString().slice(0, 10)
  const credit = [{ name: artist.name, artist: { id: mockMbid(index), name: artist.name } }]
  const group = (slot: number, title: string, type: string, released: string) => ({ id: `${mockMbid(index).slice(0, -4)}${String(slot).padStart(4, "0")}`, title, "primary-type": type, "first-release-date": released, "artist-credit": credit })
  const which = index % 3
  const groups =
    which === 1 ? [group(80, album.tracks[0]?.title ?? album.title, "Single", day(10 + (mix(index, 80) % 30)))]
    : which === 0 ? [group(82, album.title, "Album", day(-30 - (mix(index, 82) % 150))), group(83, album.tracks[1]?.title ?? album.title, "Single", day(-250))]
    : [group(84, album.tracks[0]?.title ?? album.title, "Single", day(-800))]
  return json({ created: new Date(0).toISOString(), count: groups.length, offset: 0, "release-groups": groups })
}

/** Wikidata's answer for an item's Wikipedia articles (`wikipediaLinksUrl`): the real ones of the artist whose MusicBrainz links name the item. */
function wikidata(url: URL): Response {
  const item = url.searchParams.get("ids") ?? ""
  const artist = ARTISTS.find((one) => one.links.relations.some((relation) => relation.type === "wikidata" && relation.url.endsWith(`/${item}`)))
  if (artist === undefined) return json({ error: { code: "no-such-entity", info: `Could not find an entity with the ID "${item}".` } })
  const sitelinks = Object.fromEntries(Object.entries(artist.links.wikipedia).map(([language, address]) => [`${language}wiki`, { site: `${language}wiki`, title: artist.name, badges: [], url: address }]))
  return json({ entities: { [item]: { type: "item", id: item, sitelinks } }, success: 1 })
}

function lastfm(params: URLSearchParams, now: number): Response {
  const method = params.get("method")
  const user = params.get("username") ?? ""
  const count = (artist: MockArtist, filter?: (play: Play) => boolean): number => playsIn(0, now, now).filter((play) => play.artist === artist && (filter?.(play) ?? true)).length
  const tagList = (tags: string[]): { tag: { name: string }[] } => ({ tag: tags.map((name) => ({ name })) })
  const wiki = (text: string, link: string): { summary: string } => ({ summary: `${text} <a href="${link}">Read more on Last.fm</a>. User-contributed text is available under the Creative Commons By-SA License.` })
  const chart = (from: number, to: number): { artist: MockArtist; plays: number }[] => {
    const plays = playsIn(from, to, now)
    return ARTISTS.map((artist) => ({ artist, plays: plays.filter((play) => play.artist === artist).length })).filter((one) => one.plays > 0).sort((a, b) => b.plays - a.plays)
  }
  if (method === "user.getrecenttracks") {
    const limit = Math.min(Number(params.get("limit")) || 50, 200)
    const page = Math.max(Number(params.get("page")) || 1, 1)
    const ranged = params.has("from") || params.has("to")
    const all = playsIn(Number(params.get("from")) || 0, params.has("to") ? Number(params.get("to")) : now, now)
    const shown = all.slice((page - 1) * limit, page * limit).map((play) => lastfmTrack(play, play.at))
    const playing = !ranged && page === 1 ? [lastfmTrack(nowTrack(now), null)] : []
    return json({ recenttracks: { track: [...playing, ...shown], "@attr": { user, page: String(page), perPage: String(limit), totalPages: String(Math.max(1, Math.ceil(all.length / limit))), total: String(all.length) } } })
  }
  if (method === "user.getinfo") {
    return json({ user: { name: params.get("user") ?? "", playcount: String(playsIn(0, now, now).length), registered: { unixtime: String(now - PLAY_HISTORY), "#text": now - PLAY_HISTORY } } })
  }
  if (method === "user.gettoptracks") {
    const tracks = new Map<string, { play: Play; plays: number }>()
    for (const play of playsIn(0, now, now)) {
      const key = `${play.artistIndex}:${play.albumIndex}:${play.index}`
      const found = tracks.get(key) ?? { play, plays: 0 }
      found.plays += 1
      tracks.set(key, found)
    }
    const ranked = [...tracks.values()].sort((a, b) => b.plays - a.plays)
    return json({ toptracks: { track: ranked.map((one, index) => ({ name: one.play.title, playcount: String(one.plays), url: lastfmUrl(one.play.artist.name, "_", one.play.title), artist: { name: one.play.artist.name, url: lastfmUrl(one.play.artist.name) }, "@attr": { rank: String(index + 1) } })) } })
  }
  if (method === "artist.getsimilar") {
    const found = artistNamed(params.get("artist") ?? "")
    if (found === undefined) return lastfmError(6, "The artist you supplied could not be found")
    // The others of ours, the nearest in the list most alike, among names that are not played here.
    const others = ARTISTS.filter((artist) => artist !== found.artist).sort((a, b) => Math.abs(ARTISTS.indexOf(a) - found.index) - Math.abs(ARTISTS.indexOf(b) - found.index)).map((artist) => artist.name)
    const names = [...SIMILAR_UNHEARD.slice(0, 2), ...others.slice(0, 3), ...SIMILAR_UNHEARD.slice(2), ...others.slice(3)]
    return json({ similarartists: { artist: names.map((name, index) => ({ name, match: (1 - index / names.length).toFixed(3), url: lastfmUrl(name) })), "@attr": { artist: found.artist.name } } })
  }
  if (method === "user.gettopartists") {
    const overall = params.get("period") === "overall"
    return json({ topartists: { artist: chart(overall ? 0 : now - 30 * DAY, now).map((one, index) => ({ name: one.artist.name, playcount: String(one.plays), url: lastfmUrl(one.artist.name), "@attr": { rank: String(index + 1) } })) } })
  }
  if (method === "user.getweeklyalbumchart" || method === "user.gettopalbums") {
    const albums = new Map<string, { play: Play; plays: number }>()
    const overall = method === "user.gettopalbums"
    for (const play of playsIn(overall ? 0 : Number(params.get("from")) || 0, overall ? now : Number(params.get("to")) || now, now)) {
      const key = `${play.artistIndex}:${play.albumIndex}`
      const found = albums.get(key) ?? { play, plays: 0 }
      found.plays += 1
      albums.set(key, found)
    }
    const ranked = [...albums.values()].sort((a, b) => b.plays - a.plays)
    if (overall) return json({ topalbums: { album: ranked.map((one, index) => ({ name: one.play.album, playcount: String(one.plays), url: lastfmUrl(one.play.artist.name, one.play.album), artist: { name: one.play.artist.name, url: lastfmUrl(one.play.artist.name) }, "@attr": { rank: String(index + 1) } })) } })
    return json({ weeklyalbumchart: { album: ranked.map((one, index) => ({ name: one.play.album, playcount: String(one.plays), url: lastfmUrl(one.play.artist.name, one.play.album), artist: { "#text": one.play.artist.name, mbid: "" }, "@attr": { rank: String(index + 1) } })) } })
  }
  if (method === "user.getweeklyartistchart") {
    return json({ weeklyartistchart: { artist: chart(Number(params.get("from")) || 0, Number(params.get("to")) || now).map((one, index) => ({ name: one.artist.name, playcount: String(one.plays), url: lastfmUrl(one.artist.name), "@attr": { rank: String(index + 1) } })) } })
  }
  if (method === "artist.getinfo") {
    const found = artistNamed(params.get("artist") ?? "")
    if (found === undefined) return lastfmError(6, "The artist you supplied could not be found")
    const { artist } = found
    return json({ artist: { name: artist.name, mbid: mockMbid(found.index), url: lastfmUrl(artist.name), stats: { listeners: String(20000 + (mix(found.index, 8) % 400000)), playcount: String(900000 + (mix(found.index, 9) % 9000000)), userplaycount: String(count(artist)) }, tags: tagList(artist.tags), bio: wiki(artist.bio, lastfmUrl(artist.name)) } })
  }
  if (method === "track.getinfo") {
    const found = trackNamed(params.get("artist") ?? "", params.get("track") ?? "")
    if (found === undefined) return lastfmError(6, "Track not found")
    return json({ track: { name: found.title, url: lastfmUrl(found.artist.name, "_", found.title), duration: String(found.seconds * 1000), listeners: String(5000 + (mix(found.artistIndex, found.index) % 90000)), userplaycount: String(count(found.artist, (play) => play.title === found.title)), toptags: tagList(found.artist.tags), artist: { name: found.artist.name }, album: { title: found.album, image: lastfmImages(cover(found.artistIndex, found.albumIndex)) } } })
  }
  if (method === "album.getinfo") {
    const found = albumNamed(params.get("artist") ?? "", params.get("album") ?? "")
    if (found === undefined) return lastfmError(6, "Album not found")
    const album = found.artist.albums[found.albumIndex] as MockArtist["albums"][number]
    return json({
      album: {
        name: album.title,
        artist: found.artist.name,
        url: lastfmUrl(found.artist.name, album.title),
        listeners: String(8000 + (mix(found.artistIndex * 10 + found.albumIndex, 10) % 200000)),
        userplaycount: String(count(found.artist, (play) => play.album === album.title)),
        tags: tagList(found.artist.tags),
        wiki: wiki(`${album.title} er et album av ${found.artist.name}, gitt ut ${album.year === null ? "for en tid siden" : `i ${album.year}`}. Det har ${album.tracks.length} spor og er et godt sted å begynne for den som vil bli kjent med bandet.`, lastfmUrl(found.artist.name, album.title)),
        tracks: { track: album.tracks.map((track, index) => ({ name: track.title, duration: String(track.seconds), "@attr": { rank: String(index + 1) } })) },
      },
    })
  }
  if (method === "artist.gettopalbums") {
    const found = artistNamed(params.get("artist") ?? "")
    if (found === undefined) return lastfmError(6, "The artist you supplied could not be found")
    return json({ topalbums: { album: lastfmReleases(found.artist, found.index).map((release) => ({ name: release.title, playcount: String(release.plays), url: lastfmUrl(found.artist.name, release.title), image: lastfmImages(cover(found.index, release.albumIndex)) })) } })
  }
  return lastfmError(3, `Invalid Method - ${method ?? "none"}`)
}

// ---- Film and TV ----

interface MockPerson {
  id: number
  name: string
  department: "Acting" | "Directing" | "Writing" | "Sound"
  born: string | null
  place: string | null
  bio: string
  image: Picture
}

const PEOPLE: readonly MockPerson[] = data.people as MockPerson[]

interface MockTitle {
  kind: "film" | "episode"
  tmdb: number
  slug: string
  title: string
  year: number | null
  genres: string[]
  /** Minutes for a film, seasons for a show. */
  length: number
  overview: string
  poster: Picture
}

const TITLES: readonly MockTitle[] = data.titles as MockTitle[]

const EPISODE_TITLES = ["Første dag", "Det som ble sagt", "Tilbake til kysten", "Ingen kjenner veien", "Lyset slukkes", "En ny sesong"]

const castOf = (index: number): MockPerson[] => Array.from({ length: 5 }, (_, slot) => PEOPLE[(index * 3 + slot * 2) % 10] as MockPerson)
const crewOf = (index: number): { person: MockPerson; job: string }[] => [
  { person: PEOPLE[10 + (index % 3)] as MockPerson, job: "Director" },
  { person: PEOPLE[13] as MockPerson, job: "Screenplay" },
  { person: PEOPLE[14 + (index % 2)] as MockPerson, job: "Original Music Composer" },
]
const capital = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

const NOT_FOUND = { success: false, status_code: 34, status_message: "The resource you requested could not be found." }

/** Real providers in Norway with TMDB's own logos (the browser fetches those from TMDB, as it would for real): a title has some to stream, rent or buy by its place in the list, and every fifth none. */
const PROVIDERS = [
  { provider_name: "Netflix", logo_path: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { provider_name: "Max", logo_path: "/fksCUZ9QDWZMUwL2LgMtLckROUN.jpg" },
  { provider_name: "Apple TV+", logo_path: "/6uhKBfmtzFqOcLousHwZuzcrScK.jpg" },
  { provider_name: "Strim", logo_path: "/mlNPljPGzSDqNK2Fjr4SS0gTITj.jpg" },
  { provider_name: "Apple TV", logo_path: "/9ghgSC0MA082EL6HLCW3GalykFD.jpg" },
  { provider_name: "Google Play Movies", logo_path: "/8z7rC8uIDaTM91X0ZfkRf04ydj2.jpg" },
] as const

function watchProviders(kind: string, title: MockTitle, index: number): Response {
  const listed = (names: readonly number[]) => names.map((at, order) => ({ ...PROVIDERS[at], provider_id: at + 1, display_priority: order }))
  const norway = index % 5 === 4 ? {} : { NO: { link: `https://www.themoviedb.org/${kind}/${title.tmdb}/watch?locale=NO`, flatrate: listed(index % 2 === 0 ? [index % 4, 3] : [index % 3]), rent: listed([4, 5]), buy: listed([4, 5]) } }
  return json({ id: title.tmdb, results: norway })
}

function tmdb(url: URL): Response {
  const [, , kind, id, more] = url.pathname.split("/")
  const number = Number(id)
  if (kind === "person") {
    const person = PEOPLE.find((one) => one.id === number)
    if (person === undefined) return json(NOT_FOUND, 404)
    return json({ id: person.id, name: person.name, biography: person.bio, birthday: person.born, deathday: null, place_of_birth: person.place, known_for_department: person.department, profile_path: person.image.file })
  }
  const index = TITLES.findIndex((one) => one.tmdb === number && one.kind === (kind === "movie" ? "film" : "episode"))
  const title = TITLES[index]
  if (title === undefined) return json(NOT_FOUND, 404)
  if (more === "watch") return watchProviders(kind ?? "movie", title, index)
  const crew = crewOf(index).map(({ person, job }) => ({ id: person.id, name: person.name, job, profile_path: person.image.file }))
  const cast = castOf(index).map((person, order) => ({ id: person.id, name: person.name, character: ["Hovedrollen", "Naboen", "Søsteren", "Lensmannen", "Gamlefar"][order], profile_path: person.image.file, order }))
  const common = { id: title.tmdb, overview: title.overview, genres: title.genres.map((name, genre) => ({ id: genre, name: capital(name) })), poster_path: title.poster.file, credits: { cast, crew } }
  if (kind === "movie") return json({ ...common, title: title.title, release_date: title.year === null ? null : `${title.year}-09-01`, runtime: title.length })
  const writer = PEOPLE[13] as MockPerson
  return json({ ...common, name: title.title, first_air_date: title.year === null ? null : `${title.year}-09-01`, number_of_seasons: title.length, created_by: [{ id: writer.id, name: writer.name, profile_path: writer.image.file }] })
}

interface Viewing {
  id: number
  at: number
  title: MockTitle
  episode: { season: number; number: number; title: string } | null
}

/** The viewings from `from` to `to` (unix seconds), newest first: a film now and then, and on some evenings a few episodes of one show in a row. */
function viewingsIn(kind: "film" | "episode", from: number, to: number, now: number): Viewing[] {
  const low = Math.max(from, now - HISTORY)
  const high = Math.min(to, now)
  const films = TITLES.filter((title) => title.kind === "film")
  const shows = TITLES.filter((title) => title.kind === "episode")
  const found: Viewing[] = []
  for (let day = Math.floor(high / DAY); day >= Math.floor(low / DAY); day -= 1) {
    if (kind === "film" && mix(day, 11) % 100 < 22) {
      found.push({ id: 1_000_000 + day * 10, at: day * DAY + 17 * 3600 + (mix(day, 13) % 14400), title: films[mix(day, 12) % films.length] as MockTitle, episode: null })
    }
    if (kind === "episode" && mix(day, 21) % 100 < 45) {
      const show = shows[mix(day, 22) % shows.length] as MockTitle
      const first = mix(day, 24) % 16
      const run = 1 + (mix(day, 23) % 4)
      for (let step = 0; step < run; step += 1) {
        const number = first + step
        found.push({ id: 1_000_000 + day * 10 + 1 + step, at: day * DAY + 18 * 3600 + 1800 + step * 2700, title: show, episode: { season: 1 + (Math.floor(number / 8) % show.length), number: (number % 8) + 1, title: EPISODE_TITLES[number % EPISODE_TITLES.length] as string } })
      }
    }
  }
  return found.filter((one) => one.at >= low && one.at <= high).sort((a, b) => b.at - a.at)
}

function trakt(url: URL, now: number): Response {
  const match = /^\/users\/[^/]+\/history\/(movies|episodes)$/.exec(url.pathname)
  if (match === null) return json({ error: "Not found" }, 404)
  const kind = match[1] === "movies" ? "film" : "episode"
  const time = (name: string, fallback: number): number => {
    const value = Date.parse(url.searchParams.get(name) ?? "")
    return Number.isNaN(value) ? fallback : value / 1000
  }
  const limit = Math.min(Number(url.searchParams.get("limit")) || 10, 100)
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1)
  const items = viewingsIn(kind, time("start_at", 0), time("end_at", now), now).slice((page - 1) * limit, page * limit)
  return json(
    items.map((one) => {
      const ids = { trakt: one.title.tmdb - 80000, slug: one.title.slug, tmdb: one.title.tmdb }
      const base = { id: one.id, watched_at: new Date(one.at * 1000).toISOString(), action: "watch" }
      if (one.episode === null) return { ...base, type: "movie", movie: { title: one.title.title, year: one.title.year, ids } }
      return { ...base, type: "episode", episode: { season: one.episode.season, number: one.episode.number, title: one.episode.title, ids: { trakt: one.id } }, show: { title: one.title.title, year: one.title.year, ids } }
    }),
  )
}

// ---- Spotify ----

const SPOTIFY = "https://open.spotify.com/"
const spotifyId = (...parts: string[]): string => parts.map((part) => plain(part)).join("-")

function spotifyTrack(track: MockTrack): Record<string, unknown> {
  return {
    name: track.title,
    artists: [{ name: track.artist.name }],
    album: { name: track.album, images: [640, 300, 64].map((width) => ({ url: cover(track.artistIndex, track.albumIndex), width, height: width })) },
    external_urls: { spotify: `${SPOTIFY}track/${spotifyId(track.artist.name, track.title)}` },
  }
}

function spotify(url: URL): Response {
  if (url.hostname === "accounts.spotify.com") return json({ access_token: "mock-access-token", token_type: "Bearer", expires_in: 3600, scope: "user-read-currently-playing" })
  if (url.pathname === "/v1/search") {
    const type = url.searchParams.get("type")
    const query = url.searchParams.get("q") ?? ""
    const field = (name: string): string => new RegExp(`${name}:"([^"]*)"`).exec(query)?.[1] ?? ""
    if (type === "artist") {
      const found = artistNamed(field("artist"))
      return json({ artists: { items: found === undefined ? [] : [{ name: found.artist.name, genres: found.artist.tags.slice(0, 3), external_urls: { spotify: `${SPOTIFY}artist/${spotifyId(found.artist.name)}` }, images: [640, 320, 160].map((width) => ({ url: found.artist.image.file, width, height: width })) }] } })
    }
    if (type === "album") {
      const found = albumNamed(field("artist"), field("album"))
      const album = found?.artist.albums[found.albumIndex]
      return json({ albums: { items: found === undefined || album === undefined ? [] : [{ name: album.title, artists: [{ name: found.artist.name }], release_date: `${album.year ?? 2000}-03-${String(1 + (mix(found.artistIndex, found.albumIndex) % 27)).padStart(2, "0")}`, total_tracks: album.tracks.length, external_urls: { spotify: `${SPOTIFY}album/${spotifyId(found.artist.name, album.title)}` } }] } })
    }
    if (type === "track") {
      const found = trackNamed(field("artist"), field("track"))
      return json({ tracks: { items: found === undefined ? [] : [spotifyTrack(found)] } })
    }
  }
  return json({ error: { status: 404, message: `mock: ${url.pathname}` } }, 404)
}

const VENUES = [
  ["Sentrum Scene", "Oslo", "Norway"],
  ["Rockefeller Music Hall", "Oslo", "Norway"],
  ["USF Verftet", "Bergen", "Norway"],
  ["Cirkus", "Stockholm", "Sweden"],
  ["Vega", "Copenhagen", "Denmark"],
  ["Tavastia", "Helsinki", "Finland"],
  ["Spektrum", "Oslo", "Norway"],
] as const

/** setlist.fm: an artist's concerts by its MusicBrainz id, one every few weeks back from now and one coming (with no songs yet), the newest that has been with its songs from the artist's albums; every fifth artist has none (setlist.fm answers 404). */
function setlistfm(url: URL, now: number): Response {
  const id = /^\/rest\/1\.0\/artist\/([^/]+)\/setlists$/.exec(url.pathname)?.[1]
  const index = ARTISTS.findIndex((_, at) => mockMbid(at) === id)
  const artist = ARTISTS[index]
  if (artist === undefined || index % 5 === 4) return json({ code: 404, status: "Not Found", message: "not found" }, 404)
  const day = (offset: number) => {
    const date = new Date((now + offset * DAY) * 1000)
    return `${String(date.getUTCDate()).padStart(2, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${date.getUTCFullYear()}`
  }
  const songs = artist.albums.flatMap((album) => album.tracks.map((track) => track.title))
  const played = Array.from({ length: Math.min(16, songs.length) }, (_, at) => songs[mix(index, at) % songs.length] as string).filter((song, at, all) => all.indexOf(song) === at)
  const artistOf = { mbid: id, name: artist.name, url: `https://www.setlist.fm/setlists/mock-${index}.html` }
  const concert = (slot: number, offset: number, withSongs: boolean) => {
    const [name, city, country] = VENUES[mix(index, slot) % VENUES.length] as (typeof VENUES)[number]
    return {
      id: `mock-${index}-${slot}`,
      eventDate: day(offset),
      artist: artistOf,
      venue: { name, city: { name: city, country: { code: country.slice(0, 2).toUpperCase(), name: country } } },
      tour: { name: `${artist.albums[0]?.title ?? artist.name} Tour` },
      url: `https://www.setlist.fm/setlist/mock-${index}-${slot}.html`,
      sets: { set: withSongs ? [{ song: played.slice(0, -2).map((song) => ({ name: song })) }, { encore: 1, song: played.slice(-2).map((song) => ({ name: song })) }] : [] },
    }
  }
  const setlist = [concert(0, 40, false), ...Array.from({ length: 6 }, (_, at) => concert(at + 1, -(3 + at * 17 + (mix(index, at) % 9)), at < 2))]
  return json({ type: "setlists", itemsPerPage: 20, page: 1, total: setlist.length, setlist })
}

/** Real games by their Steam app ids (their header images are Steam's own, from its CDN), with made-up hours. */
const GAMES = [
  [1145360, "Hades", 4120, "Supergiant Games", "17. sep. 2020", ["Action", "Indie", "Rollespill"]],
  [413150, "Stardew Valley", 9360, "ConcernedApe", "26. feb. 2016", ["Indie", "Rollespill", "Simulering"]],
  [1086940, "Baldur's Gate 3", 12480, "Larian Studios", "3. aug. 2023", ["Eventyr", "Rollespill", "Strategi"]],
  [367520, "Hollow Knight", 3050, "Team Cherry", "24. feb. 2017", ["Action", "Eventyr", "Indie"]],
  [620, "Portal 2", 1210, "Valve", "18. apr. 2011", ["Action", "Eventyr"]],
  [292030, "The Witcher 3: Wild Hunt", 8820, "CD PROJEKT RED", "18. mai 2015", ["Rollespill"]],
  [646570, "Slay the Spire", 6640, "Mega Crit", "23. jan. 2019", ["Indie", "Strategi"]],
  [504230, "Celeste", 1480, "Maddy Makes Games", "25. jan. 2018", ["Action", "Indie"]],
  [753640, "Outer Wilds", 1330, "Mobius Digital", "18. juni 2020", ["Eventyr", "Indie"]],
  [1794680, "Vampire Survivors", 2210, "poncle", "20. okt. 2022", ["Action", "Indie", "Rollespill"]],
  [105600, "Terraria", 5400, "Re-Logic", "16. mai 2011", ["Action", "Eventyr", "Indie", "Rollespill"]],
  [1245620, "ELDEN RING", 7310, "FromSoftware, Inc.", "25. feb. 2022", ["Action", "Rollespill"]],
  [10, "Counter-Strike", 0, "Valve", "1. nov. 2000", ["Action"]],
] as const
const MOCK_STEAM_ID = "76561197960287930"

/** Steam: any custom name is the one profile; five of its games played the last two weeks (which five turns with the week), and all of them owned. */
function steam(url: URL, now: number): Response {
  if (url.pathname.startsWith("/ISteamUser/ResolveVanityURL/")) return json({ response: { steamid: MOCK_STEAM_ID, success: 1 } })
  const week = Math.floor(now / (7 * DAY))
  const played = Array.from({ length: 5 }, (_, at) => GAMES[(week + at * 5) % (GAMES.length - 1)] as (typeof GAMES)[number])
  if (url.pathname.startsWith("/IPlayerService/GetRecentlyPlayedGames/")) {
    return json({ response: { total_count: played.length, games: played.map(([appid, name, total], at) => ({ appid, name, playtime_2weeks: 40 + (mix(week, at) % 900), playtime_forever: total })) } })
  }
  if (url.pathname.startsWith("/IPlayerService/GetOwnedGames/")) {
    // The time split between a PC and a Deck by the game, and each last played some days back: the five of the last two weeks within them, a couple of days apart.
    const games = GAMES.map(([appid, name, total], at) => {
      const deck = total === 0 ? 0 : Math.round((total * (appid % 7)) / 10)
      return { appid, name, playtime_forever: total, playtime_windows_forever: total - deck, playtime_linux_forever: deck, playtime_deck_forever: deck, rtime_last_played: total === 0 ? 0 : played.some(([id]) => id === appid) ? now - (2 * played.findIndex(([id]) => id === appid) + 1) * 24 * 3600 - 5 * 3600 : now - (15 + ((at * 37) % 200)) * 24 * 3600 }
    })
    return json({ response: { game_count: GAMES.length, games } })
  }
  if (url.pathname.startsWith("/ISteamUser/GetPlayerSummaries/")) {
    // Online and playing the first game of the fortnight most of the time, away now and then.
    const [appid, name] = played[0] ?? GAMES[0]
    const away = mix(Math.floor(now / 600)) % 4 === 0
    return json({ response: { players: [{ steamid: MOCK_STEAM_ID, communityvisibilitystate: 3, profilestate: 1, personaname: "Eksempelspiller", profileurl: `https://steamcommunity.com/profiles/${MOCK_STEAM_ID}/`, avatarfull: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg", personastate: away ? 3 : 1, lastlogoff: now - 3 * 3600, ...(away ? {} : { gameid: String(appid), gameextrainfo: name }) }] } })
  }
  if (url.pathname.startsWith("/IPlayerService/GetSteamLevel/")) return json({ response: { player_level: 42 } })
  if (url.pathname.startsWith("/IPlayerService/GetBadges/")) {
    const gameBadges = GAMES.slice(0, 6).map(([appid], at) => ({ badgeid: 1, appid, level: 1 + (at % 5), completion_time: now - (20 + at * 41) * DAY, xp: 100 * (1 + (at % 5)), communityitemid: String(1000 + at), border_color: at === 2 ? 1 : 0, scarcity: 100000 + mix(appid) % 900000 }))
    const own = [[1, 9, 365 * 9, 450], [13, GAMES.length, 30, 100], [2, 3, 900, 300], [68, 1, 330, 50], [69, 1, 5, 50]].map(([badgeid, level, days, xp]) => ({ badgeid, level, completion_time: now - (days ?? 0) * DAY, xp, scarcity: 1000000 + mix(badgeid ?? 0) % 9000000 }))
    return json({ response: { badges: [...gameBadges, ...own], player_xp: 6210, player_level: 42, player_xp_needed_to_level_up: 290, player_xp_needed_current_level: 6100 } })
  }
  if (url.pathname.startsWith("/IWishlistService/GetWishlist/")) return json({ response: { items: WISHES.map(([appid], at) => ({ appid, priority: at < 3 ? at + 1 : 0, date_added: now - (12 + at * 47) * DAY })) } })
  if (url.pathname.startsWith("/IStoreBrowseService/GetItems/")) {
    const ids = (JSON.parse(url.searchParams.get("input_json") ?? "{}") as { ids?: { appid?: number }[] }).ids ?? []
    const nameOf = (id: number): string | undefined => WISHES.find(([appid]) => appid === id)?.[1] ?? GAMES.find(([appid]) => appid === id)?.[1] ?? (() => {
      const base = GAMES.find(([appid]) => dlcOf(appid).includes(id))
      return base === undefined ? undefined : `${base[1]} – ${DLC_NAMES[(id % 10) - 1] ?? "DLC"}`
    })()
    return json({ response: { store_items: ids.flatMap(({ appid }) => {
      const name = appid === undefined ? undefined : nameOf(appid)
      return appid === undefined || name === undefined ? [] : [{ item_type: 0, id: appid, success: 1, visible: true, name, appid, type: 0, ...(appid === 1030300 ? { is_coming_soon: true } : {}) }]
    }) } })
  }
  const appId = Number(url.searchParams.get("appid") ?? url.searchParams.get("gameid"))
  const game = GAMES.find(([appid]) => appid === appId)
  // Achievements: 12 to 40 by the game, the more of them unlocked the more it was played, one a few days apart back from a week ago; none for a game never played.
  const total = game === undefined || game[2] === 0 ? 0 : 12 + (appId % 29)
  const done = game === undefined ? 0 : Math.min(total, Math.round((total * game[2]) / 10000))
  const key = (at: number) => `ACH_${at + 1}`
  const share = (at: number) => 0.4 + ((at * 53 + appId) % 900) / 10
  if (url.pathname.startsWith("/ISteamUserStats/GetPlayerAchievements/")) {
    if (total === 0) return json({ playerstats: { error: "Requested app has no stats", success: false } }, 400)
    return json({ playerstats: { steamID: MOCK_STEAM_ID, gameName: game?.[1], success: true, achievements: Array.from({ length: total }, (_, at) => ({ apiname: key(at), achieved: at < done ? 1 : 0, unlocktime: at < done ? now - (7 + (done - at) * 3) * 24 * 3600 : 0 })) } })
  }
  if (url.pathname.startsWith("/ISteamUserStats/GetSchemaForGame/")) {
    return json({ game: { gameName: game?.[1], availableGameStats: { stats: GAME_STATS.map(([name, displayName]) => ({ name, defaultvalue: 0, displayName })), achievements: Array.from({ length: total }, (_, at) => ({ name: key(at), displayName: ACHIEVEMENT_NAMES[at % ACHIEVEMENT_NAMES.length] + (at < ACHIEVEMENT_NAMES.length ? "" : ` ${Math.floor(at / ACHIEVEMENT_NAMES.length) + 1}`), description: at % 7 === 6 ? "" : `Klar del ${at + 1} av ${game?.[1] ?? "spillet"}.`, hidden: at % 7 === 6 ? 1 : 0, icon: "", icongray: "" })) } } })
  }
  if (url.pathname.startsWith("/ISteamUserStats/GetUserStatsForGame/")) {
    if (game === undefined || appId % 2 === 1 || game[2] === 0) return json({ playerstats: { error: "Requested app has no stats", success: false } }, 400)
    return json({ playerstats: { steamID: MOCK_STEAM_ID, gameName: game[1], stats: GAME_STATS.map(([name], at) => ({ name, value: Math.round(game[2] * (at + 1) * 1.7) + (mix(appId, at) % 50) })) } })
  }
  if (url.pathname.startsWith("/ISteamUserStats/GetNumberOfCurrentPlayers/")) return json({ response: { player_count: game === undefined ? 0 : 500 + (mix(appId, Math.floor(now / 120)) % 60000), result: 1 } })
  if (url.pathname.startsWith("/ISteamNews/GetNewsForApp/")) {
    const name = game?.[1] ?? "spillet"
    const newsitems = Array.from({ length: 6 }, (_, at) => {
      const patch = at % 2 === 0
      const official = at % 3 !== 2
      return {
        gid: `${appId}${at}`, title: patch ? `Oppdatering 1.${9 - at}` : official ? `Nytt fra utviklerne av ${name}` : `${name}: ny omtale`,
        url: `https://store.steampowered.com/news/app/${appId}/view/${appId}${at}`, is_external_url: !official, author: official ? (game?.[3] ?? "") : "Eksempelavisen",
        contents: patch ? "[h2]Endringer[/h2][list][*]Rettet en feil som fikk spillet til å krasje.[*]Bedre ytelse på [b]Steam Deck[/b].[/list]" : "Vi har nyheter! <a href=\"https://store.steampowered.com/\">Les mer</a> om hva som kommer. {STEAM_CLAN_IMAGE}/1/bilde.png",
        feedlabel: official ? "Community Announcements" : "Eksempelavisen", date: now - (at * 9 + 2) * DAY, feedname: official ? "steam_community_announcements" : "eksempelavisen", feed_type: official ? 1 : 0, appid: appId, ...(patch ? { tags: ["patchnotes"] } : {}),
      }
    })
    return json({ appnews: { appid: appId, newsitems, count: newsitems.length } })
  }
  if (url.pathname.startsWith("/ISteamUserStats/GetGlobalAchievementPercentagesForApp/")) {
    return json({ achievementpercentages: { achievements: Array.from({ length: total }, (_, at) => ({ name: key(at), percent: share(at).toFixed(1) })) } })
  }
  return json({ response: {} })
}

/** A game's own numbers (`GetUserStatsForGame`), with the names the schema gives them. */
const GAME_STATS = [["total_kills", "Fiender beseiret"], ["total_deaths", "Dødsfall"], ["total_runs", "Forsøk"], ["total_time_played", "Sekunder spilt"]] as const

const ACHIEVEMENT_NAMES = ["Første steg", "Oppdagelsesreisende", "Uten en skramme", "Samleren", "Mester", "Lynrask", "Hemmeligheten", "Utholdende", "Perfeksjonist", "Legende"]

/** RetroAchievements' games: real ones, with their real pictures, consoles and makers; the times and the progress made up. */
const RETRO_GAMES = [
  [759, "Dragon Ball Z: The Legacy of Goku II", 5, "Game Boy Advance", "/Images/095164.png", "/Images/095539.png", "Webfoot Technologies", "Atari", "Action RPG", "2003-06-17", 57],
  [228, "Super Mario World", 3, "SNES/Super Famicom", "/Images/110144.png", "/Images/109856.png", null, "Nintendo", "2D Platforming", "1990-11-21", 96],
  [11332, "Final Fantasy Origins", 12, "PlayStation", "/Images/144818.png", "/Images/046257.png", "TOSE, Square", "Square Enix", null, "2002-10-31", 119],
  [1, "Sonic the Hedgehog", 1, "Genesis/Mega Drive", "/Images/054993.png", "/Images/112941.png", "Sonic Team", "Sega", "2D Platforming", "1991-06-11", 23],
  [2831, "Metal Gear Solid 3: Subsistence", 21, "PlayStation 2", "/Images/143312.png", "/Images/034182.png", "Konami", "Konami", "Action-Adventure, Stealth", "2006-03-14", 60],
  [5741, "Ninja Taro", 4, "Game Boy", "/Images/054085.png", "/Images/054324.png", "NMK", "UPL", "Action-Adventure", "1991-04-08", 17],
  [1446, "Super Mario Bros.", 7, "NES/Famicom", "/Images/079350.png", "/Images/013238.png", null, "Nintendo", "2D Platforming", "1985-09-13", 30],
] as const
const RETRO_BADGES = ["250336", "250345", "622549", "250334", "461375", "250340", "250331", "250341", "250352", "250342", "250335", "461380", "461378", "461377", "461379", "461373"]

/** RetroAchievements: any username is the one profile, each game last played some days back (the first today), with the more done the earlier in the list. */
function retro(url: URL, now: number): Response {
  const utc = (seconds: number): string => new Date(seconds * 1000).toISOString().slice(0, 19).replace("T", " ")
  const played = (at: number): number => now - at * 3 * 24 * 3600 - 3600
  const done = (at: number, total: number): number => at === 5 ? total : Math.round((total * ((at * 3 + 2) % 10)) / 10)
  if (url.pathname.endsWith("/API_GetUserProfile.php")) return json({ User: url.searchParams.get("u"), TotalPoints: 1234 })
  if (url.pathname.endsWith("/API_GetUserRecentlyPlayedGames.php")) {
    return json(RETRO_GAMES.map(([GameID, Title, ConsoleID, ConsoleName, ImageTitle, ImageBoxArt, , , , , total], at) => ({ GameID, Title, ConsoleID, ConsoleName, ImageTitle, ImageBoxArt, LastPlayed: utc(played(at)), NumPossibleAchievements: total, NumAchieved: done(at, total) })))
  }
  const at = RETRO_GAMES.findIndex(([id]) => id === Number(url.searchParams.get("g")))
  const game = RETRO_GAMES[at]
  if (game === undefined) return json({}, 404)
  const [ID, Title, ConsoleID, ConsoleName, ImageTitle, ImageBoxArt, Developer, Publisher, Genre, Released, total] = game
  const unlocked = done(at, total)
  const players = 4000 + mix(ID) % 20000
  // The unlocked ones a few hours apart, back from when it was last played.
  const Achievements = Object.fromEntries(Array.from({ length: total }, (_, n) => {
    const id = ID * 1000 + n
    const earned = n < unlocked ? utc(played(at) - n * 5 * 3600) : undefined
    return [id, { ID: id, Title: ACHIEVEMENT_NAMES[n % ACHIEVEMENT_NAMES.length] + (n < ACHIEVEMENT_NAMES.length ? "" : ` ${Math.floor(n / ACHIEVEMENT_NAMES.length) + 1}`), Description: `Klar del ${n + 1} av ${Title}.`, Points: [5, 10, 25, 3][n % 4], BadgeName: RETRO_BADGES[n % RETRO_BADGES.length], NumAwarded: Math.round(players * (0.9 - (0.85 * n) / total)), DisplayOrder: n, ...(earned === undefined ? {} : { DateEarned: earned, DateEarnedHardcore: earned }) }]
  }))
  return json({ ID, Title, ConsoleID, ConsoleName, ImageTitle, ImageBoxArt, Developer, Publisher, Genre, Released, NumDistinctPlayers: players, NumAchievements: total, NumAwardedToUser: unlocked, UserTotalPlaytime: (unlocked + 1) * 1500, HighestAwardKind: unlocked === total ? "mastered" : null, Achievements })
}

/** The store's own pictures of the made-up games (their real screenshots), whether a controller is supported, the kinds of play (category ids) and the machines (w, m, l). */
const STORE_MEDIA: Readonly<Record<number, readonly [screenshots: readonly string[], controller: "full" | null, categories: readonly number[], platforms: string]>> = {
  1145360: [["ss_c0fed447426b69981cf1721756acf75369801b31", "ss_8a9f0953e8a014bd3df2789c2835cb787cd3764d", "ss_68300459a8c3daacb2ec687adcdbf4442fcc4f47"], "full", [2, 22, 28, 29, 23, 62], "wm"],
  413150: [["ss_b887651a93b0525739049eb4194f633de2df75be", "ss_9ac899fe2cda15d48b0549bba77ef8c4a090a71c", "ss_4fa0866709ede3753fdf2745349b528d5e8c4054"], "full", [2, 1, 9, 38, 39, 24, 22, 28, 29, 23, 44, 62], "wml"],
  1086940: [["ss_c73bc54415178c07fef85f54ee26621728c77504", "ss_73d93bea842b93914d966622104dcb8c0f42972b", "ss_cf936d31061b58e98e0c646aee00e6030c410cda"], "full", [2, 1, 9, 38, 22, 28, 29, 23, 44, 62], "wm"],
  367520: [["ss_5384f9f8b96a0b9934b2bc35a4058376211636d2", "ss_d5b6edd94e77ba6db31c44d8a3c09d807ab27751", "ss_a81e4231cc8d55f58b51a4a938898af46503cae5"], "full", [2, 22, 28, 29, 23, 62], "wml"],
  620: [["ss_f3f6787d74739d3b2ec8a484b5c994b3d31ef325", "ss_6a4f5afdaa98402de9cf0b59fed27bab3256a6f4", "ss_0cdd90fafc160b52d08b303d205f9fd4e83cf164"], "full", [2, 1, 9, 38, 39, 24, 22, 28, 29, 30, 23, 44, 62], "wl"],
  292030: [["f7f564ecedd09b3e503b071a637aeefdedbeedd8/ss_f7f564ecedd09b3e503b071a637aeefdedbeedd8", "0a38e4d0d57f15934772dbe09b322d08132d5518/ss_0a38e4d0d57f15934772dbe09b322d08132d5518", "19c03c2b997d3a393fc629fd42f55ddb4a3d8dd0/ss_19c03c2b997d3a393fc629fd42f55ddb4a3d8dd0"], null, [2, 22, 29, 30, 18, 23, 62], "w"],
  646570: [["ss_c171816f7ecd35b5b46d2fa27532f4c5b8ca3cc5", "ss_01aa3e7759e457bfbf2422f31c325d7b3ba8a6eb", "ss_b757436d08ba08292796bfed9c60e7cc99d5f2c3"], "full", [2, 22, 28, 29, 30, 23, 62], "wml"],
  504230: [["ss_1ad297c2044cdcf450ee83e56350cafb590da755", "ss_03bfe6bd5ddac7f747c8d2aa1a4f82cfd53c6dcb", "ss_4b0f0222341b64a37114033aca9994551f27c161"], "full", [2, 22, 28, 29, 23, 62], "wml"],
  753640: [["ss_ec95a283483f0438be40d033f08b9d956e748d54", "ss_09f0fa8d9b8d7da1408cf4e03303d896cbd9be18", "ss_c624a6b8edca0d451605592edd927dbcc14917a8"], "full", [2, 22, 28, 29, 23, 62], "w"],
  1794680: [["ss_6c55afe36be2a7784bf18cb9b3218321ae2d10e5", "ss_6105ad3d6af52593c31d915bf39e91512611ea8e", "ss_054159adc52856d066d48bda02866da524c43439"], "full", [2, 1, 9, 38, 22, 28, 29, 23, 44, 62], "wm"],
  105600: [["ss_8c03886f214d2108cafca13845533eaa3d87d83f", "ss_ae168a00ab08104ba266dc30232654d4b3c919e5", "ss_9edd98caaf9357c2f40758f354475a56e356e8b0"], "full", [2, 1, 49, 36, 9, 38, 22, 28, 29, 30, 23, 62], "wml"],
  1245620: [["ss_943bf6fe62352757d9070c1d33e50b92fe8539f1", "ss_dcdac9e4b26ac0ee5248bfd2967d764fd00cdb42", "ss_3c41384a24d86dddd58a8f61db77f9dc0bfda8b5"], "full", [2, 1, 49, 36, 9, 38, 22, 28, 29, 23, 62], "w"],
  10: [["0000000132", "0000000133", "0000000134"], null, [1, 49, 36, 37, 62], "wml"],
}
/** The store's names of the kinds of play, in Norwegian. */
const CATEGORY_NAMES: Readonly<Record<number, string>> = { 1: "Flerspiller", 2: "Enkeltspiller", 9: "Samarbeid", 18: "Delvis støtte for kontroller", 22: "Steam-prestasjoner", 23: "Steam Cloud", 24: "Delt/oppdelt skjerm", 28: "Full støtte for kontroller", 29: "Steam-samlekort", 30: "Steam Workshop", 36: "PvP på nett", 37: "Delt/oppdelt skjerm-PvP", 38: "Samarbeid på nett", 39: "Delt/oppdelt skjerm-samarbeid", 44: "Remote Play Together", 49: "PvP", 62: "Familiedeling" }
/** Two of the games' real launch trailers, as the store gives films now (streams only). */
const STORE_MOVIES: Readonly<Record<number, readonly [id: number, name: string, path: string, t: number]>> = {
  1145360: [256801252, "Hades - v1.0 Launch Trailer", "1145360/312686/b0312c49135823cc34946e98148abfb8da71f0fb/1750627549", 1600353465],
  620: [5787, "Portal 2 E3 Demo (Excursion Funnels)", "620/3746/0f4bee66d490b637707ac4fca3e850f2cc2d3b2a/1750108721", 1682715616],
}
/** Real games on the made-up wishlist (not among the owned ones), with a made-up price in øre. */
const WISHES = [
  [1145350, "Hades II", 32900],
  [1030300, "Hollow Knight: Silksong", 21900],
  [2379780, "Balatro", 16500],
  [892970, "Valheim", 21900],
  [1868140, "DAVE THE DIVER", 21900],
  [632470, "Disco Elysium - The Final Cut", 42900],
  [653530, "Return of the Obra Dinn", 21900],
  [1966720, "Lethal Company", 10500],
] as const
/** A game's made-up DLC: two, with ids no game has. */
const dlcOf = (appId: number): number[] => (appId === 10 ? [] : [appId * 10 + 1, appId * 10 + 2])
const DLC_NAMES = ["Lydsporet", "Utvidelsen"]

/** A price in øre as the store writes it («219,00 kr»). */
const kroner = (ore: number): string => `${Math.floor(ore / 100)},${String(ore % 100).padStart(2, "0")} kr`
/** A made-up price of a game: a wish, a game or a DLC; on sale by the week for some (so a new week brings a new sale). */
function priceOf(appId: number, now: number): { currency: string; initial: number; final: number; discount_percent: number; initial_formatted: string; final_formatted: string } | null {
  if (appId === 10) return null
  const wish = WISHES.find(([id]) => id === appId)
  const initial = wish?.[2] ?? (appId > 10000000 ? 4900 + (appId % 7) * 1000 : 14900 + (appId % 300) * 100)
  const week = Math.floor(now / (7 * DAY))
  const discount = mix(appId, week) % 3 === 0 ? [20, 33, 50, 75][mix(week, appId) % 4] ?? 0 : 0
  const final = Math.round((initial * (100 - discount)) / 100)
  return { currency: "NOK", initial, final, discount_percent: discount, initial_formatted: discount === 0 ? "" : kroner(initial), final_formatted: kroner(final) }
}

/** The Steam store: what it says of each of the made-up games (their real makers, days out, screenshots and kinds of play), with a made-up text and price; many prices in one; the reviews and a Steam Deck report. */
function steamStore(url: URL, now: number): Response {
  if (url.pathname.startsWith("/appreviews/")) {
    const appId = Number(url.pathname.split("/")[2])
    const total = 2000 + (mix(appId) % 400000)
    const share = 70 + (mix(appId, 1) % 29)
    const score = share >= 95 ? 9 : share >= 80 ? 8 : 7
    const positive = Math.round((total * share) / 100)
    return json({ success: 1, query_summary: { num_reviews: 0, review_score: score, review_score_desc: ["Positive", "Very Positive", "Overwhelmingly Positive"][score - 7], total_positive: positive, total_negative: total - positive, total_reviews: total }, reviews: [] })
  }
  if (url.pathname.startsWith("/saleaction/ajaxgetdeckappcompatibilityreport")) {
    const appId = Number(url.searchParams.get("nAppID"))
    return json({ success: 1, results: { appid: appId, resolved_category: appId === 10 ? 0 : [3, 3, 2, 1][mix(appId) % 4], resolved_items: [] } })
  }
  const ids = (url.searchParams.get("appids") ?? "").split(",").map(Number)
  if (url.searchParams.get("filters") === "price_overview") {
    return json(Object.fromEntries(ids.map((id) => {
      const price = priceOf(id, now)
      return [String(id), { success: true, data: price === null ? [] : { price_overview: price } }]
    })))
  }
  const appId = ids[0] ?? 0
  const game = GAMES.find(([appid]) => appid === appId)
  if (game === undefined) return json({ [String(appId)]: { success: false } })
  const [, name, , developer, released, genres] = game
  const [screenshots, controller, categories, platforms] = STORE_MEDIA[appId] ?? [[], null, [], "w"]
  const shot = (path: string, size: string) => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/${path}.${size}.jpg`
  const film = STORE_MOVIES[appId]
  const price = priceOf(appId, now)
  return json({ [String(appId)]: { success: true, data: {
    type: "game", name, steam_appid: appId, short_description: `${name} er et spill fra ${developer}. Teksten er laget for eksempeldataene, i stedet for butikkens egen.`, developers: [developer], publishers: [developer], release_date: { coming_soon: false, date: released },
    genres: genres.map((description, id) => ({ id: String(id), description })), ...(appId % 3 === 0 ? {} : { metacritic: { score: 80 + (appId % 17), url: "https://www.metacritic.com/" } }), is_free: appId === 10, ...(price === null ? {} : { price_overview: price }),
    header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`, capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`,
    background: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/page_bg_generated_v6b.jpg`, background_raw: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/page.bg.jpg`,
    screenshots: screenshots.map((path, id) => ({ id, path_thumbnail: shot(path, "600x338"), path_full: shot(path, "1920x1080") })),
    movies: film === undefined ? [] : [{ id: film[0], name: film[1], thumbnail: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${film[0]}/movie.293x165.jpg?t=${film[3]}`, hls_h264: `https://video.akamai.steamstatic.com/store_trailers/${film[2]}/hls_264_master.m3u8?t=${film[3]}`, dash_h264: `https://video.akamai.steamstatic.com/store_trailers/${film[2]}/dash_h264.mpd?t=${film[3]}`, highlight: true }],
    platforms: { windows: platforms.includes("w"), mac: platforms.includes("m"), linux: platforms.includes("l") },
    categories: categories.map((id) => ({ id, description: CATEGORY_NAMES[id] ?? String(id) })), ...(controller === null ? {} : { controller_support: controller }),
    dlc: dlcOf(appId), recommendations: { total: 2000 + (mix(appId) % 400000) },
  } } })
}

/** ListenBrainz: the same plays as Last.fm's, as listens (no covers: those are the Cover Art Archive's by a release's MusicBrainz id, which the made-up data has not got); top artists of the month, and what plays now. */
function listenbrainz(url: URL, now: number): Response {
  const [, stats = "", name = "", what = ""] = /^\/1\/(stats\/)?user\/([^/]+)\/([^/]+)$/.exec(url.pathname) ?? []
  const kind = stats === "" ? "user" : "stats"
  const listen = (play: MockTrack, at: number | null) => ({
    ...(at === null ? { playing_now: true } : { listened_at: at }),
    track_metadata: { artist_name: play.artist.name, track_name: play.title, release_name: play.album, additional_info: { duration_ms: play.seconds * 1000 } },
    user_name: name,
  })
  if (kind === "user" && what === "listens") {
    const count = Math.min(Number(url.searchParams.get("count")) || 25, 1000)
    return json({ payload: { count, user_id: name, listens: playsIn(0, now, now).slice(0, count).map((play) => listen(play, play.at)) } })
  }
  if (kind === "user" && what === "playing-now") return json({ payload: { count: 1, playing_now: true, user_id: name, listens: [listen(nowTrack(now), null)] } })
  if (kind === "user" && what === "listen-count") return json({ payload: { count: playsIn(0, now, now).length } })
  if (kind === "stats" && what === "artists") {
    const plays = playsIn(now - 30 * DAY, now, now)
    const artists = ARTISTS.map((artist, index) => ({ artist_mbid: mockMbid(index), artist_name: artist.name, listen_count: plays.filter((play) => play.artist === artist).length })).filter((one) => one.listen_count > 0).sort((a, b) => b.listen_count - a.listen_count)
    return json({ payload: { artists: artists.slice(0, Number(url.searchParams.get("count")) || 25), range: "month", user_id: name } })
  }
  return json({ code: 404, error: `mock: ${url.pathname}` }, 404)
}

/** The made-up answer for an address the sources are asked, as the source would give it; 404 for an address none of ours is. */
export function mockFetch(url: string, _request: { headers?: Record<string, string>; method?: "GET" | "POST"; body?: string }, now = Date.now()): Response {
  const address = new URL(url)
  const seconds = Math.floor(now / 1000)
  switch (address.hostname) {
    case "ws.audioscrobbler.com":
      return lastfm(address.searchParams, seconds)
    case "api.trakt.tv":
      return trakt(address, seconds)
    case "api.themoviedb.org":
      return tmdb(address)
    case "accounts.spotify.com":
    case "api.spotify.com":
      return spotify(address)
    case "musicbrainz.org":
      return musicbrainz(address, seconds)
    case "www.wikidata.org":
      return wikidata(address)
    case "api.setlist.fm":
      return setlistfm(address, seconds)
    case "api.steampowered.com":
      return steam(address, seconds)
    case "store.steampowered.com":
      return steamStore(address, seconds)
    case "retroachievements.org":
      return retro(address, seconds)
    case "api.listenbrainz.org":
      return listenbrainz(address, seconds)
    default:
      return json({ error: `mock: no fixtures for ${address.hostname}` }, 404)
  }
}

/** Names the fixtures: answers kept from an older fetch of them are not asked for again. */
export const MOCK_VERSION: string = data.generated
export const MOCK_ARTISTS: readonly string[] = ARTISTS.map((artist) => artist.name)
export const MOCK_PEOPLE_COUNT = PEOPLE.length
export const MOCK_TITLE_COUNT = TITLES.length
