/** What the sync asks of Spotify's Web API: an access token from the refresh token, and the liked songs, newest first. Pure, so a test pins it. */

export const TOKEN_URL = "https://accounts.spotify.com/api/token"
export const AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
/** To read the liked songs. It cannot change anything in the account. */
export const SCOPE = "user-library-read"
/** The most Spotify gives a page of liked songs. */
export const PAGE = 50
export const likedUrl = (offset: number, limit = PAGE): string => `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`

export interface Request {
  url: string
  method: "POST"
  headers: Record<string, string>
  body: string
}

/** A liked song: when it was liked (ISO 8601, so it sorts as text), its name and its first artist's (what Spotify scrobbles to Last.fm). */
export interface Liked {
  addedAt: string
  track: string
  artist: string
}

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const text = (value: unknown): string => (typeof value === "string" ? value : "")
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const tokenRequest = (clientId: string, clientSecret: string, body: Record<string, string>): Request => ({
  url: TOKEN_URL,
  method: "POST",
  headers: { Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(body).toString(),
})

export const refreshRequest = (clientId: string, clientSecret: string, refreshToken: string): Request =>
  tokenRequest(clientId, clientSecret, { grant_type: "refresh_token", refresh_token: refreshToken })

export const codeRequest = (clientId: string, clientSecret: string, code: string, redirectUri: string): Request =>
  tokenRequest(clientId, clientSecret, { grant_type: "authorization_code", code, redirect_uri: redirectUri })

export const authorizeUrl = (clientId: string, redirectUri: string, state: string): string =>
  `${AUTHORIZE_URL}?${new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: redirectUri, scope: SCOPE, state }).toString()}`

/** The access token, and the new refresh token where Spotify gave one (it may rotate it: the old one then stops working). `null` where it gave no access token. */
export function parseToken(answer: unknown): { accessToken: string; refreshToken: string | null } | null {
  const token = object(answer)
  const accessToken = text(token["access_token"])
  const refreshToken = text(token["refresh_token"])
  return accessToken === "" ? null : { accessToken, refreshToken: refreshToken === "" ? null : refreshToken }
}

/** One page of liked songs, and whether there is a next one. Local files and songs that are gone have no artist to love them by, so they are left out. */
export function parseLikedPage(answer: unknown): { items: Liked[]; more: boolean } {
  const page = object(answer)
  const items: Liked[] = []
  for (const entry of list(page["items"])) {
    const addedAt = text(object(entry)["added_at"])
    const track = object(object(entry)["track"])
    const name = text(track["name"])
    const artist = text(object(list(track["artists"])[0])["name"])
    if (addedAt === "" || name === "" || artist === "" || track["is_local"] === true) continue
    items.push({ addedAt, track: name, artist })
  }
  return { items, more: typeof page["next"] === "string" }
}
