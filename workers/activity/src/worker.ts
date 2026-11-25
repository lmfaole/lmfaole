/** The Worker. Every three hours (workers/scheduler calls `scheduled`) it copies, each into its D1 database: new listens from ListenBrainz and loves from Last.fm, what was played on Steam and RetroAchievements, what was watched and rated on Trakt, and the Letterboxd diary. Sundays at 03:00 UTC it backs the databases up to R2 instead. It also answers the read-only API. */

import { handle } from "./api.ts"
import { backup, type Bucket } from "./backup.ts"
import type { Database } from "./db.ts"
import { syncGames } from "./games.ts"
import { syncLetterboxd } from "./letterboxd.ts"
import { syncLoves } from "./loves.ts"
import { sync } from "./music.ts"
import { syncTrakt } from "./trakt.ts"

interface Env {
  MUSIC: Database
  GAMES: Database
  WATCHING: Database
  ARCHIVE: Bucket
  ACCOUNT_ID: string
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
  /** An API token allowed to export D1 (Account, D1, Edit). Without it there is no backup. */
  BACKUP_TOKEN?: string
  /** `wrangler dev --test-scheduled --var FORCE_BACKUP:1` runs the backup now, to try it. */
  FORCE_BACKUP?: string
}

interface Context {
  waitUntil(promise: Promise<unknown>): void
}

const DATABASES = [
  { name: "music", id: "ca72bd29-9022-4bfc-b4cc-d7968d91fa1b" },
  { name: "gameplay", id: "5d315e5c-61b7-465a-a7e0-d3e3ab6d44bc" },
  { name: "watching", id: "de856333-5317-41e0-99be-0b01e43101ec" },
]

export const isBackupRun = (at: Date): boolean => at.getUTCDay() === 0 && at.getUTCHours() === 3

async function settle(jobs: Promise<unknown>[]): Promise<void> {
  const failed = (await Promise.allSettled(jobs)).filter((result) => result.status === "rejected")
  for (const result of failed) console.error(result.reason)
  if (failed.length > 0) throw new AggregateError(failed.map((result) => result.reason), "sync failed")
}

export default {
  async scheduled(controller: { scheduledTime: number }, env: Env, _ctx: Context): Promise<void> {
    // fetch is wrapped: called as options.fetch, workerd throws «Illegal invocation».
    const fetcher = (input: string, init?: RequestInit) => fetch(input, init)
    const at = new Date(controller.scheduledTime)
    if (isBackupRun(at) || env.FORCE_BACKUP === "1") {
      if (env.BACKUP_TOKEN === undefined) return console.log("backup: no BACKUP_TOKEN")
      return void (await backup({ accountId: env.ACCOUNT_ID, token: env.BACKUP_TOKEN, databases: DATABASES, bucket: env.ARCHIVE, fetch: fetcher, now: at, keep: 4, log: console.log }))
    }
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
