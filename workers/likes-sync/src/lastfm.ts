/** What the sync asks of Last.fm: to love a track, signed with the app's secret and the user's session key (made once by `npm run auth`, it does not run out). */

import { createHash } from "node:crypto"

export const API_URL = "https://ws.audioscrobbler.com/2.0/"
export const authUrl = (apiKey: string, token: string): string => `https://www.last.fm/api/auth/?${new URLSearchParams({ api_key: apiKey, token }).toString()}`

/** Last.fm's signature: every parameter but `format` and `callback`, sorted by name, name and value one after the other, the secret last, MD5 of it all as UTF-8. */
export function sign(params: Record<string, string>, secret: string): string {
  const signed = Object.keys(params)
    .filter((name) => name !== "format" && name !== "callback")
    .toSorted()
    .map((name) => `${name}${params[name]}`)
    .join("")
  return createHash("md5").update(`${signed}${secret}`, "utf8").digest("hex")
}

/** A signed call as the form body of a POST (Last.fm's writes must be POSTs), answered in JSON. */
export function signedBody(params: Record<string, string>, secret: string): string {
  return new URLSearchParams({ ...params, api_sig: sign(params, secret), format: "json" }).toString()
}

export const loveBody = (artist: string, track: string, apiKey: string, secret: string, sessionKey: string): string =>
  signedBody({ method: "track.love", artist, track, api_key: apiKey, sk: sessionKey }, secret)

/** Last.fm's error code in an answer, or `null` where there is none. 29 is «rate limit exceeded», 9 «invalid session key», 11 and 16 «try again later». */
export function errorCode(answer: unknown): number | null {
  const code = typeof answer === "object" && answer !== null ? (answer as Record<string, unknown>)["error"] : undefined
  return typeof code === "number" ? code : null
}

/** Errors that say the next tries will fail too, so the run stops and leaves the rest for the next one. */
export const STOPPING = new Set([4, 9, 10, 11, 13, 16, 26, 29])
