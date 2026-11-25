import type { APIRoute } from 'astro'

import { playingNow } from '../../lib/now'
import { lastfmNow, owner } from '../../lib/runtime'

/**
 * What plays now (Last.fm's, or ListenBrainz's where there is no Last.fm username), for the front page to ask for again while it is open. Last.fm's answer is kept for fifteen seconds in the Worker's
 * cache, under its address, so any number of readers asks Last.fm about as often as one would. `null` when nothing plays or there is no username. Live: never kept by the edge's page cache or any other.
 */
export const GET: APIRoute = async () => {
  const playing = playingNow(await lastfmNow(owner()))
  return new Response(JSON.stringify(playing), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
