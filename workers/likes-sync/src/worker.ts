/** The Worker: once a week (workers/scheduler calls `scheduled`) Spotify's new liked songs are loved on Last.fm. It has no address; `wrangler dev --test-scheduled` runs it by hand. */

import { workerFetch } from "@lmfaole/worker/fetch"

import { sync, type Env, type Store } from "./sync.ts"

interface Bindings extends Env {
  STATE: Store
}

export default {
  async scheduled(_controller: unknown, env: Bindings, ctx: { waitUntil(promise: Promise<unknown>): void }): Promise<void> {
    // The free plan's 50 subrequests a run: one for the token, at most five pages of liked songs, the rest loves.
    ctx.waitUntil(sync(env, env.STATE, { limit: 40, noCursor: "start", maxPages: 5, pause: 0, fetch: workerFetch(), log: console.log }))
  },
}
