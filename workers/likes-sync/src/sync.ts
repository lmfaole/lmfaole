/**
 * One run of the sync: Spotify's liked songs that are newer than the cursor are loved on Last.fm, oldest first, and the cursor moves to the last one loved.
 * One way only, and nothing is unloved. Loving a track that is loved already does nothing, so a run that is repeated does no harm.
 */

import { API_URL, errorCode, loveBody, STOPPING } from "./lastfm.ts"
import { likedUrl, PAGE, parseLikedPage, parseToken, refreshRequest, type Liked } from "./spotify.ts"

export interface Env {
  SPOTIFY_CLIENT_ID: string
  SPOTIFY_CLIENT_SECRET: string
  SPOTIFY_REFRESH_TOKEN: string
  LASTFM_API_KEY: string
  LASTFM_API_SECRET: string
  LASTFM_SESSION_KEY: string
}

/** Where the run keeps what it needs the next time (the Worker's KV namespace). */
export interface Store {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

export const CURSOR = "cursor"
/** The refresh token Spotify gave in place of the secret's, where it has rotated it. */
export const REFRESH_TOKEN = "spotify_refresh_token"

export interface Options {
  /** The most songs one run loves. A Worker on the free plan has 50 subrequests a run; the rest waits for the next run. */
  limit: number
  /** With no cursor: `"start"` sets it to the newest liked song and loves nothing (the Worker's first run), `"all"` loves every liked song (`npm run backfill`). */
  noCursor: "start" | "all"
  /** The most pages of liked songs to read (50 songs each). */
  maxPages: number
  /** Milliseconds to wait between loves (Last.fm allows about five calls a second). */
  pause: number
  fetch: typeof fetch
  log: (message: string) => void
}

export interface Result {
  loved: number
  /** Songs liked since the cursor that wait for the next run. */
  left: number
  failed: number
  cursor: string | null
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

async function accessToken(env: Env, store: Store, options: Options): Promise<string> {
  const refreshToken = (await store.get(REFRESH_TOKEN)) ?? env.SPOTIFY_REFRESH_TOKEN
  const request = refreshRequest(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET, refreshToken)
  const answer = await options.fetch(request.url, { method: request.method, headers: request.headers, body: request.body })
  const token = parseToken(await answer.json().catch(() => null))
  if (!answer.ok || token === null) throw new Error(`Spotify gave no access token (${answer.status}); the refresh token may have run out: run npm run auth again`)
  if (token.refreshToken !== null && token.refreshToken !== refreshToken) await store.put(REFRESH_TOKEN, token.refreshToken)
  return token.accessToken
}

/** The liked songs newer than `cursor` (all of them where it is `null`), newest first, as Spotify lists them. */
async function likedSince(cursor: string | null, token: string, options: Options): Promise<Liked[]> {
  const found: Liked[] = []
  for (let page = 0; page < options.maxPages; page++) {
    const answer = await options.fetch(likedUrl(page * PAGE), { headers: { Authorization: `Bearer ${token}` } })
    if (!answer.ok) throw new Error(`Spotify answered ${answer.status} for the liked songs`)
    const { items, more } = parseLikedPage(await answer.json())
    const newer = cursor === null ? items : items.filter((item) => item.addedAt > cursor)
    found.push(...newer)
    if (!more || newer.length < items.length) return found
  }
  options.log(`stopped after ${options.maxPages} pages of liked songs`)
  return found
}

/**
 * The cursor once the first `handled` of `pending` (oldest first) are done. Songs liked in the same second (a whole album) share a time, so where the run stopped inside such a
 * group the cursor stays before the group: the next run loves it again, which does no harm, instead of passing over the rest of it.
 */
export function cursorAfter(pending: readonly Liked[], handled: number, cursor: string | null, full: boolean): string | null {
  if (handled === 0) return cursor
  const last = pending[handled - 1]?.addedAt ?? cursor
  const next = pending[handled]?.addedAt
  if (next === undefined || next !== last) return last
  const before = pending.slice(0, handled).findLast((song) => song.addedAt < next)
  // A group bigger than a whole run would hold the cursor still for ever: then it moves past the group, and the group's rest is not loved.
  return before?.addedAt ?? (full ? last : cursor)
}

export async function sync(env: Env, store: Store, options: Options): Promise<Result> {
  const token = await accessToken(env, store, options)
  const cursor = await store.get(CURSOR)

  if (cursor === null && options.noCursor === "start") {
    const answer = await options.fetch(likedUrl(0, 1), { headers: { Authorization: `Bearer ${token}` } })
    if (!answer.ok) throw new Error(`Spotify answered ${answer.status} for the liked songs`)
    const newest = parseLikedPage(await answer.json()).items[0]?.addedAt ?? new Date().toISOString()
    await store.put(CURSOR, newest)
    options.log(`no cursor: set to ${newest}; songs liked before it are loved by npm run backfill`)
    return { loved: 0, left: 0, failed: 0, cursor: newest }
  }

  const pending = (await likedSince(cursor, token, options)).toReversed()
  const batch = pending.slice(0, options.limit)
  let handled = 0
  let loved = 0
  let failed = 0
  for (const song of batch) {
    const answer = await options.fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "likes-sync (lmfaole)" },
      body: loveBody(song.artist, song.track, env.LASTFM_API_KEY, env.LASTFM_API_SECRET, env.LASTFM_SESSION_KEY),
    })
    const code = errorCode(await answer.json().catch(() => null))
    if (answer.status >= 500 || answer.status === 429 || (code !== null && STOPPING.has(code))) {
      options.log(`Last.fm stopped the run (${answer.status}, error ${code ?? "none"}) at ${song.artist} – ${song.track}`)
      break
    }
    if (code === null && answer.ok) loved++
    else {
      failed++
      options.log(`not loved (${answer.status}, error ${code ?? "none"}): ${song.artist} – ${song.track}`)
    }
    handled++
    if (options.pause > 0) await sleep(options.pause)
  }
  const done = cursorAfter(pending, handled, cursor, handled === options.limit)
  if (done !== null && done !== cursor) await store.put(CURSOR, done)
  const left = pending.filter((song) => done === null || song.addedAt > done).length
  options.log(`loved ${loved}, not loved ${failed}, left for the next run ${left}`)
  return { loved, left, failed, cursor: done }
}
