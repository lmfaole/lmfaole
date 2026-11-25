/** Every track loved on Last.fm. New loves from the first pages (newest first) until one is older than the newest stored; until the start is reached, `backfillPages` further pages each run. New loves only push older ones to later pages, so the backfill may see some twice but misses none; the key keeps them single. Unloving isn't followed. */

import type { Database, Statement } from "./db.ts"
import type { Fetch } from "./listenbrainz.ts"

export interface LovesOptions {
  user: string
  key: string
  fetch: Fetch
  pageSize: number
  maxPages: number
  backfillPages: number
  log?: (message: string) => void
}

interface Loved {
  name: string
  mbid?: string
  url?: string
  date?: { uts: string }
  artist: { name: string; mbid?: string }
}

interface Page {
  loves: Loved[]
  totalPages: number
}

async function page(n: number, options: LovesOptions): Promise<Page> {
  const query = new URLSearchParams({ method: "user.getlovedtracks", user: options.user, api_key: options.key, format: "json", limit: String(options.pageSize), page: String(n) })
  const response = await options.fetch(`https://ws.audioscrobbler.com/2.0/?${query}`, { headers: { "User-Agent": "activity (lmfaole.party)" } })
  if (!response.ok) throw new Error(`Last.fm getlovedtracks ${response.status}`)
  const body = (await response.json()) as { lovedtracks: { track: Loved[] | Loved; "@attr": { totalPages: string } } }
  const track = body.lovedtracks.track
  return { loves: Array.isArray(track) ? track : [track], totalPages: Number(body.lovedtracks["@attr"].totalPages) }
}

const LOVE = "INSERT INTO loves (artist, track, loved_at, track_mbid, artist_mbid, url) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (artist, track) DO NOTHING"
const STATE = "INSERT INTO state (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value"

export async function syncLoves(db: Database, options: LovesOptions): Promise<number> {
  const newest = (await db.prepare("SELECT MAX(loved_at) AS at FROM loves").first<{ at: number | null }>())?.at ?? 0
  const state = await db.prepare("SELECT value FROM state WHERE key = 'loves_backfill_page'").first<{ value: string }>()
  const seen: Loved[] = []
  for (let n = 1; n <= options.maxPages; n++) {
    const got = await page(n, options)
    seen.push(...got.loves)
    if (n >= got.totalPages || got.loves.some((love) => Number(love.date?.uts ?? 0) <= newest)) break
  }
  const writes: Statement[] = []
  const next = Number(state?.value ?? 1)
  if (next > 0) {
    let n = next
    for (; n < next + options.backfillPages; n++) {
      const got = await page(n, options)
      seen.push(...got.loves)
      if (n >= got.totalPages) {
        n = -1
        break
      }
    }
    writes.push(db.prepare(STATE).bind("loves_backfill_page", String(n === -1 ? 0 : n)))
  }
  const love = db.prepare(LOVE)
  for (const l of seen) if (l.date !== undefined) writes.push(love.bind(l.artist.name, l.name, Number(l.date.uts), l.mbid || null, l.artist.mbid || null, l.url ?? null))
  await db.batch(writes)
  options.log?.(`loves: ${seen.length} seen${next > 0 ? `, backfill ${state === null ? "started" : "page " + next}` : ""}`)
  return seen.length
}
