import type { APIRoute } from 'astro'

import { playingNow } from '../../lib/now'
import { lastfmNow, usersOf } from '../../lib/runtime'

/**
 * What plays now for the visitor's Last.fm username (its cookie), or ListenBrainz's where there is no Last.fm, for the front page to ask for again while it is open. Last.fm's answer is kept for fifteen seconds in the Worker's cache, under its address,
 * which has the username in it, so any number of readers of one user asks Last.fm about as often as one would. `null` when nothing plays or there is no username. The answer is the visitor's own: never kept by a shared cache.
 */
export const GET: APIRoute = async ({ cookies }) => {
  const playing = playingNow(await lastfmNow(usersOf(cookies)))
  return new Response(JSON.stringify(playing), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie' } })
}
