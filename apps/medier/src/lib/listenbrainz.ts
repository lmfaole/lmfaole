/**
 * ListenBrainz (https://listenbrainz.org), the music's other source where a visitor has no Last.fm: their listens, what plays now and the artists they played most this month, read into the same
 * plays and top artists Last.fm's are (`lastfm.ts`), so Musikk, its history and the front page show them alike. The covers are the Cover Art Archive's, by the release MusicBrainz matched the listen to.
 * What ListenBrainz cannot give in Last.fm's shape is not asked: an artist's, an album's or a song's page, the weeks and months, and the trend are Last.fm's alone. Pure, with a test.
 */

import type { Play, TopArtist } from "./lastfm.ts"
import type { NowPlaying } from "./spotify.ts"

const API = "https://api.listenbrainz.org/1"

const user = (name: string): string => encodeURIComponent(name)
export const listensUrl = (name: string, count = 50): string => `${API}/user/${user(name)}/listens?count=${count}`
export const playingNowUrl = (name: string): string => `${API}/user/${user(name)}/playing-now`
export const topArtistsUrl = (name: string, count = 10): string => `${API}/stats/user/${user(name)}/artists?range=month&count=${count}`
/** A user that is not one answers 404 here. */
export const listenCountUrl = (name: string): string => `${API}/user/${user(name)}/listen-count`
export const profileUrl = (name: string): string => `https://listenbrainz.org/user/${user(name)}/`

/** ListenBrainz asks for at most one request a second from a client, and for a User-Agent that says who asks. */
export const LISTENBRAINZ_PAUSE_MS = 1000

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "")
const MBID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** The Cover Art Archive's front cover of a release, 250 pixels; `null` without the release's MusicBrainz id. */
export const coverOf = (releaseMbid: string): string | null => (MBID.test(releaseMbid) ? `https://coverartarchive.org/release/${releaseMbid}/front-250` : null)

function track(value: unknown, name: string): (NowPlaying & { playedAt: string | null }) | null {
  const listen = object(value)
  const meta = object(listen["track_metadata"])
  const mapping = object(meta["mbid_mapping"])
  const info = object(meta["additional_info"])
  const title = text(meta["track_name"])
  const artist = text(meta["artist_name"])
  if (title === "" || artist === "") return null
  const recording = text(mapping["recording_mbid"]) || text(info["recording_mbid"])
  const release = text(mapping["caa_release_mbid"]) || text(mapping["release_mbid"]) || text(info["release_mbid"])
  const at = listen["listened_at"]
  return {
    track: title,
    artist,
    album: text(meta["release_name"]),
    image: coverOf(release),
    url: MBID.test(recording) ? `https://musicbrainz.org/recording/${recording}` : profileUrl(name),
    playedAt: listen["playing_now"] === true || typeof at !== "number" ? null : new Date(at * 1000).toISOString(),
  }
}

/** A user's listens, newest first, as plays. */
export function parseListens(answer: unknown, name: string): Play[] {
  return list(object(object(answer)["payload"])["listens"]).flatMap((value) => {
    const play = track(value, name)
    return play === null || play.playedAt === null ? [] : [play]
  })
}

/** What plays now, or `null`: ListenBrainz says so only while the player says it. */
export function parsePlayingNow(answer: unknown, name: string): NowPlaying | null {
  const playing = track(list(object(object(answer)["payload"])["listens"])[0], name)
  return playing === null ? null : { track: playing.track, artist: playing.artist, album: playing.album, image: playing.image, url: playing.url }
}

/** The artists played most this month; none where ListenBrainz has not counted them yet (it answers 204, read as `null`). */
export function parseTopArtists(answer: unknown): TopArtist[] {
  return list(object(object(answer)["payload"])["artists"]).flatMap((value) => {
    const artist = object(value)
    const name = text(artist["artist_name"])
    const plays = artist["listen_count"]
    if (name === "" || typeof plays !== "number") return []
    const mbid = text(artist["artist_mbid"])
    return [{ name, plays, url: MBID.test(mbid) ? `https://listenbrainz.org/artist/${mbid}/` : `https://listenbrainz.org/search/?search_term=${encodeURIComponent(name)}&search_type=artist` }]
  })
}

/** Whether ListenBrainz's answer to `listen-count` is a user's. */
export const parseUserFound = (answer: unknown): boolean => typeof object(object(answer)["payload"])["count"] === "number"
