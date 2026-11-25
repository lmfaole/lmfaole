/** Copies new listens from ListenBrainz into D1. The cursor is the newest `listened_at` stored; once caught up, each run starts `overlap` seconds before it, so listens that reach ListenBrainz late (offline players, MusicBrainz matches added afterwards) still come in. While still filling in the past it starts at the cursor: a few busy days hold more plays than a run fetches, and starting before them would never get past them. */

import type { Database } from "./db.ts"
import { listensAfter, row, type Fetch } from "./listenbrainz.ts"

export interface Options {
  user: string
  fetch: Fetch
  pageSize: number
  maxPages: number
  overlap: number
  /** Seconds since 1970. */
  now: number
  log?: (message: string) => void
}

// A play already stored is only written again when ListenBrainz has changed it (a MusicBrainz match, mostly); unchanged rows cost no writes.
const COLUMNS = ["album", "duration_ms", "spotify_id", "recording_mbid", "release_mbid", "artist_mbids", "client", "recording_msid", "inserted_at"]
export const UPSERT = `INSERT INTO listens (listened_at, artist, track, ${COLUMNS.join(", ")})
VALUES (?, ?, ?, ${COLUMNS.map(() => "?").join(", ")})
ON CONFLICT (listened_at, artist, track) DO UPDATE SET ${COLUMNS.map((c) => `${c} = excluded.${c}`).join(", ")}
WHERE (${COLUMNS.map((c) => `listens.${c}`).join(", ")}) IS NOT (${COLUMNS.map((c) => `excluded.${c}`).join(", ")})`

export async function sync(db: Database, options: Options): Promise<{ fetched: number; cursor: number }> {
  const stored = await db.prepare("SELECT value FROM state WHERE key = 'cursor'").first<{ value: string }>()
  let cursor = Number(stored?.value ?? 0)
  let minTs = cursor < options.now - options.overlap ? Math.max(0, cursor - 1) : Math.max(0, cursor - options.overlap)
  let fetched = 0
  for (let page = 0; page < options.maxPages; page++) {
    const listens = await listensAfter(options.user, minTs, options.pageSize, options.fetch)
    if (listens.length === 0) break
    const upsert = db.prepare(UPSERT)
    await db.batch(listens.map((listen) => upsert.bind(...row(listen))))
    fetched += listens.length
    const newest = Math.max(...listens.map((listen) => listen.listened_at))
    cursor = Math.max(cursor, newest)
    // Saved after every page, so a run cut short (CPU or time limits) keeps what it did.
    await db.prepare("INSERT INTO state (key, value) VALUES ('cursor', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").bind(String(cursor)).run()
    if (listens.length < options.pageSize) break
    // One second back, so listens sharing the newest second that didn't fit on this page come on the next; the key makes the repeats harmless.
    minTs = newest - 1 > minTs ? newest - 1 : newest
  }
  await db.prepare("INSERT INTO state (key, value) VALUES ('cursor', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").bind(String(cursor)).run()
  options.log?.(`listens: ${fetched} fetched, cursor ${new Date(cursor * 1000).toISOString()}`)
  return { fetched, cursor }
}
