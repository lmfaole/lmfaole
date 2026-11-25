/**
 * Which failed answers the Worker keeps for a while (`runtime.ts`), so a name that is not on a service is not asked about again on every page: a «not found» (an HTTP 4xx, or
 * Last.fm's error 6, «no such user») is kept ten minutes, under the same key as the answer would have been. Never what passes: a 429 or a timeout, a 5xx, Last.fm's rate
 * limit (29) or any other error of Last.fm's. A kept failure is thrown again, as it was. Pure, with a test.
 */

/** Ten minutes, in seconds. */
export const NEGATIVE_TTL = 600

/** Last.fm's «Invalid parameters», which is what it says of a username that is not one. */
export const LASTFM_NOT_FOUND = 6

/** HTTP 4xx that are about the moment, not the thing asked for. */
const TRANSIENT = new Set([408, 425, 429])

/** Last.fm's error code in an answer (`{ error: 6, message: "User not found" }`), if it is one. */
export function lastfmErrorCode(data: unknown): number | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null
  const body = data as Record<string, unknown>
  return typeof body["error"] === "number" && typeof body["message"] === "string" ? body["error"] : null
}

/** For how long a failure is kept, in seconds, or `null` for one that must be asked about again: by Last.fm's code where it gave one, else by the HTTP status. */
export function failureTtl(status: number, lastfmCode: number | null): number | null {
  if (lastfmCode !== null) return lastfmCode === LASTFM_NOT_FOUND ? NEGATIVE_TTL : null
  return status >= 400 && status < 500 && !TRANSIENT.has(status) ? NEGATIVE_TTL : null
}

const MARK = "medierFailure"

/** A failure as it is kept. */
export const keptFailure = (message: string): Record<string, string> => ({ [MARK]: message })

/** The message of a kept failure, or `null` for an answer. */
export function failureOf(data: unknown): string | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null
  const message = (data as Record<string, unknown>)[MARK]
  return typeof message === "string" ? message : null
}
