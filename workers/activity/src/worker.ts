/** The Worker. Every three hours (workers/scheduler calls `scheduled`) it copies, each into its D1 database: new listens from ListenBrainz and loves from Last.fm, what was played on Steam and RetroAchievements, what was watched and rated on Trakt, and the Letterboxd diary. It also answers the read-only API. */

import type { Database } from "@lmfaole/worker/d1"
import { workerFetch } from "@lmfaole/worker/fetch"
import { settle } from "@lmfaole/worker/scheduled"

import { handle } from "./api.ts"
import { syncGames } from "./games.ts"
import { syncLetterboxd } from "./letterboxd.ts"
import { syncLoves } from "./loves.ts"
import { sync } from "./music.ts"
import { syncTrakt } from "./trakt.ts"

interface Env {
  MUSIC: Database
  GAMES: Database
  WATCHING: Database
  LISTENBRAINZ_USER: string
  LASTFM_USER: string
  TRAKT_USER: string
  LETTERBOXD_USER: string
  LASTFM_API_KEY: string
  TRAKT_CLIENT_ID: string
  STEAM_API_KEY: string
  STEAM_ID: string
  RA_USER: string
  RA_API_KEY: string
}

interface Context {
  waitUntil(promise: Promise<unknown>): void
}

export default {
  async scheduled(controller: { scheduledTime: number }, env: Env, _ctx: Context): Promise<void> {
    const fetcher = workerFetch()
    const at = new Date(controller.scheduledTime)
    const now = Math.floor(at.getTime() / 1000)
    // The free plan allows 50 subrequests a run, a D1 batch counting as one. At most: music 2 fetches + 5 queries, loves 4 + 3,
    // games 3 + 8 Steam achievement lists + 3, Trakt 3 history + 1 ratings + 2, Letterboxd 1 + 1. That is 36.
    await settle([
      sync(env.MUSIC, { user: env.LISTENBRAINZ_USER, pageSize: 500, maxPages: 2, overlap: 3 * 86400, now, fetch: fetcher, log: console.log }),
      syncLoves(env.MUSIC, { user: env.LASTFM_USER, key: env.LASTFM_API_KEY, fetch: fetcher, pageSize: 500, maxPages: 2, backfillPages: 2, log: console.log }),
      syncGames(env.GAMES, { steam: { key: env.STEAM_API_KEY, id: env.STEAM_ID }, ra: { user: env.RA_USER, key: env.RA_API_KEY }, fetch: fetcher, now, maxAchievementGames: 8, log: console.log }),
      syncLetterboxd(env.WATCHING, { user: env.LETTERBOXD_USER, fetch: fetcher, log: console.log }),
      syncTrakt(env.WATCHING, { user: env.TRAKT_USER, clientId: env.TRAKT_CLIENT_ID, fetch: fetcher, now, pageSize: 250, backfillPages: 2, log: console.log }),
    ])
  },

  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    if (request.method !== "GET") return new Response("only GET", { status: 405 })
    const cache = (caches as unknown as { default: Cache }).default
    const hit = await cache.match(request)
    if (hit !== undefined) return hit
    const response = await handle(request, { music: env.MUSIC, games: env.GAMES, watching: env.WATCHING })
    if (response.ok) ctx.waitUntil(cache.put(request, response.clone()))
    return response
  },
}
