/** ListenBrainz's listens and the row each becomes. */

export interface Listen {
  listened_at: number
  inserted_at?: number
  recording_msid?: string
  track_metadata: {
    artist_name: string
    track_name: string
    release_name?: string
    additional_info?: Record<string, unknown>
    mbid_mapping?: { recording_mbid?: string; release_mbid?: string; artist_mbids?: string[] }
  }
}

export type Fetch = (input: string, init?: RequestInit) => Promise<Response>

/** The `count` oldest listens after `minTs` (newest first, as ListenBrainz sends them). */
export async function listensAfter(user: string, minTs: number, count: number, fetch: Fetch): Promise<Listen[]> {
  const url = `https://api.listenbrainz.org/1/user/${encodeURIComponent(user)}/listens?min_ts=${minTs}&count=${count}`
  const response = await fetch(url, { headers: { "User-Agent": "listens (lmfaole.party)" } })
  if (!response.ok) throw new Error(`ListenBrainz ${response.status}: ${(await response.text()).slice(0, 200)}`)
  const body = (await response.json()) as { payload: { listens: Listen[] } }
  return body.payload.listens
}

const text = (value: unknown): string | null => (typeof value === "string" && value !== "" ? value : null)

export function row(listen: Listen): unknown[] {
  const meta = listen.track_metadata
  const info = meta.additional_info ?? {}
  const mapping = meta.mbid_mapping ?? {}
  const spotify = text(info["spotify_id"])?.replace(/^https:\/\/open\.spotify\.com\/track\//, "spotify:track:") ?? null
  const duration = typeof info["duration_ms"] === "number" ? info["duration_ms"] : typeof info["duration"] === "number" ? info["duration"] * 1000 : null
  const artistMbids = mapping.artist_mbids ?? (Array.isArray(info["artist_mbids"]) ? (info["artist_mbids"] as string[]) : null)
  return [
    listen.listened_at,
    meta.artist_name,
    meta.track_name,
    text(meta.release_name),
    duration,
    spotify,
    text(mapping.recording_mbid) ?? text(info["recording_mbid"]),
    text(mapping.release_mbid) ?? text(info["release_mbid"]),
    artistMbids && artistMbids.length > 0 ? JSON.stringify(artistMbids) : null,
    text(info["submission_client"]) ?? text(info["media_player"]),
    listen.recording_msid ?? null,
    listen.inserted_at ?? null,
  ]
}
