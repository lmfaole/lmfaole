/**
 * What the site keeps of Spotify's Web API: the search for an artist's picture and an album's or a track's link, and how the token to ask for them is made. Pure, so a test pins it;
 * `sources.ts` does the asking. What plays now is not asked of Spotify (it would be the owner's, not the visitor's): it is Last.fm's, for the visitor's own username.
 */

export const TOKEN_URL = "https://accounts.spotify.com/api/token"
export const AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
/** The one permission the site asks for: to see what plays. It cannot change anything in the account. */
export const SCOPE = "user-read-currently-playing"
/** The search for one artist by name: ten hits (the most Spotify gives a search in Development Mode), because the first is not always the one (`parseArtistMatch` takes the one that is named the same). */
export const searchArtistUrl = (name: string): string => `https://api.spotify.com/v1/search?type=artist&limit=10&q=${encodeURIComponent(`artist:"${name}"`)}`
/** The search for one album, or one track, by its name and its artist's: ten hits, the most Spotify gives (`parseAlbumMatch` and `parseTrackMatch` take the one named the same). */
export const searchAlbumUrl = (album: string, artist: string): string => `https://api.spotify.com/v1/search?type=album&limit=10&q=${encodeURIComponent(`album:"${album}" artist:"${artist}"`)}`
export const searchTrackUrl = (track: string, artist: string): string => `https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(`track:"${track}" artist:"${artist}"`)}`

/** A song playing now (Last.fm's scrobble of it). */
export interface NowPlaying {
  track: string
  artist: string
  album: string
  /** The cover; `null` where there is none. */
  image: string | null
  url: string
}

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const text = (value: unknown): string => (typeof value === "string" ? value : "")
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const SPOTIFY_URL = "https://open.spotify.com/"

/** The request that swaps the refresh token for an access token (one hour): the client signs in with its id and secret, the user's token is the grant. */
export function refreshRequest(clientId: string, clientSecret: string, refreshToken: string): { url: string; method: "POST"; headers: Record<string, string>; body: string } {
  return {
    url: TOKEN_URL,
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }).toString(),
  }
}

/** The access token and for how many seconds it is good, from the token endpoint's answer; `null` where it gave none (a refresh token that has run out gives `invalid_grant`). */
export function parseToken(answer: unknown): { accessToken: string; expiresIn: number } | null {
  const token = object(answer)
  const accessToken = text(token["access_token"])
  const expiresIn = typeof token["expires_in"] === "number" ? token["expires_in"] : 3600
  return accessToken === "" ? null : { accessToken, expiresIn }
}

/** The address the person approves at, once (`npm run spotify:auth`). `redirectUri` is one that is registered in the Spotify dashboard (a loopback one, `http://127.0.0.1:<port>/…`). */
export function authorizeUrl(clientId: string, redirectUri: string, state: string): string {
  return `${AUTHORIZE_URL}?${new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: redirectUri, scope: SCOPE, state }).toString()}`
}

/** The request that swaps the code Spotify sent back for the refresh token. */
export function codeRequest(clientId: string, clientSecret: string, code: string, redirectUri: string): { url: string; method: "POST"; headers: Record<string, string>; body: string } {
  const request = refreshRequest(clientId, clientSecret, "")
  return { ...request, body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }).toString() }
}

/** The refresh token from the answer to `codeRequest`, or `null` where Spotify gave none. */
export function parseRefreshToken(answer: unknown): string | null {
  const token = text(object(answer)["refresh_token"])
  return token === "" ? null : token
}

/** An artist on Spotify: where to open it, its picture in the widths Spotify has (for `Picture`'s `sources`), and what Spotify calls its genres. */
export interface SpotifyArtist {
  url: string
  images: { src: string; width: number }[]
  genres: string[]
}

/** A name as a person compares it: no case, no accents, nothing but letters and digits («Beyoncé» is «beyonce»). */
export const plain = (name: string): string => name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, "")

/**
 * The artist the search found that is named the same as the one asked for, or `null`: a search for «After» finds a dozen artists, and the first is not always the
 * one played, so a picture of the wrong artist is worse than none. The pictures come smallest first.
 */
export function parseArtistMatch(answer: unknown, name: string): SpotifyArtist | null {
  const wanted = plain(name)
  if (wanted === "") return null
  for (const value of list(object(object(answer)["artists"])["items"])) {
    const artist = object(value)
    const url = text(object(artist["external_urls"])["spotify"])
    if (plain(text(artist["name"])) !== wanted || !url.startsWith(SPOTIFY_URL)) continue
    const images = list(artist["images"]).flatMap((image) => {
      const found = object(image)
      return text(found["url"]) !== "" && typeof found["width"] === "number" ? [{ src: text(found["url"]), width: found["width"] }] : []
    })
    return { url, images: images.toSorted((a, b) => a.width - b.width), genres: list(artist["genres"]).flatMap((genre) => (typeof genre === "string" ? [genre] : [])).slice(0, 4) }
  }
  return null
}

/** An album on Spotify: where to open it, when it came out and how many tracks it has. */
export interface SpotifyAlbum {
  url: string
  /** `YYYY-MM-DD`, or `YYYY-MM` or `YYYY` where Spotify only knows that much. */
  released: string | null
  tracks: number | null
}

/** A track on Spotify: where to open it. */
export interface SpotifyTrack {
  url: string
}

const names = (value: unknown): string[] => list(value).map((artist) => text(object(artist)["name"])).filter((name) => name !== "")

/** The album the search found that has the name asked for, by the artist asked for (one of its artists, for an album with several), or `null`. */
export function parseAlbumMatch(answer: unknown, album: string, artist: string): SpotifyAlbum | null {
  const wanted = plain(album)
  if (wanted === "" || plain(artist) === "") return null
  for (const value of list(object(object(answer)["albums"])["items"])) {
    const found = object(value)
    const url = text(object(found["external_urls"])["spotify"])
    if (plain(text(found["name"])) !== wanted || !names(found["artists"]).some((name) => plain(name) === plain(artist)) || !url.startsWith(SPOTIFY_URL)) continue
    const released = text(found["release_date"])
    return { url, released: /^\d{4}(-\d{2}(-\d{2})?)?$/.test(released) ? released : null, tracks: typeof found["total_tracks"] === "number" && found["total_tracks"] > 0 ? found["total_tracks"] : null }
  }
  return null
}

/** The track the search found that has the name asked for, by the artist asked for, or `null`. */
export function parseTrackMatch(answer: unknown, track: string, artist: string): SpotifyTrack | null {
  const wanted = plain(track)
  if (wanted === "" || plain(artist) === "") return null
  for (const value of list(object(object(answer)["tracks"])["items"])) {
    const found = object(value)
    const url = text(object(found["external_urls"])["spotify"])
    if (plain(text(found["name"])) === wanted && names(found["artists"]).some((name) => plain(name) === plain(artist)) && url.startsWith(SPOTIFY_URL)) return { url }
  }
  return null
}
