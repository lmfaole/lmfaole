/**
 * What plays now: Last.fm's scrobble of the song the visitor is playing (whatever plays it). `disc` is the cover the card turns into a disc (round, with a hole and a shine on it): Last.fm's own,
 * `null` where it has none.
 */

import type { NowPlaying } from "./spotify.ts"

export interface Playing extends NowPlaying {
  disc: string | null
}

export function playingNow(lastfm: NowPlaying | null): Playing | null {
  return lastfm === null ? null : { ...lastfm, disc: lastfm.image }
}

const text = (value: unknown): string | null => (typeof value === "string" ? value : null)

/** What `/api/now` answered, checked: a song with its names, or `null` for nothing playing or an answer that is not one. */
export function parsePlaying(answer: unknown): Playing | null {
  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) return null
  const body = answer as Record<string, unknown>
  const [track, artist, album, url] = [text(body["track"]), text(body["artist"]), text(body["album"]), text(body["url"])]
  if (track === null || track === "" || artist === null || artist === "" || album === null || url === null) return null
  return { track, artist, album, url, image: text(body["image"]), disc: text(body["disc"]) }
}

/** The same song with the same covers: a poll that finds it again changes nothing on the page. */
export const samePlaying = (a: Playing | null, b: Playing | null): boolean => a === b || (a !== null && b !== null && a.track === b.track && a.artist === b.artist && a.album === b.album && a.image === b.image && a.disc === b.disc && a.url === b.url)
