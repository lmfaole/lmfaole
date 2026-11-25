/** The read-only API. Every answer is cached for a while: D1's free plan counts every row a query reads. */

import type { Database } from "@lmfaole/worker/d1"

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=900" } })

/** `2020`, `2020-05`, `2020-05-17` or seconds since 1970; `end` gives the first second after the period. */
export function time(value: string | null, end = false): number | null {
  if (value === null || value === "") return null
  if (/^\d{9,}$/.test(value)) return Number(value)
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value)
  if (match === null) throw new RangeError(`not a time: ${value}`)
  const [, y = "", m, d] = match
  const year = Number(y), month = m === undefined ? 0 : Number(m) - 1, day = d === undefined ? 1 : Number(d)
  const at = end ? (d !== undefined ? Date.UTC(year, month, day + 1) : m !== undefined ? Date.UTC(year, month + 1, 1) : Date.UTC(year + 1, 0, 1)) : Date.UTC(year, month, day)
  return at / 1000
}

const limit = (value: string | null, fallback: number, max: number): number => Math.min(max, Math.max(1, Number.parseInt(value ?? "", 10) || fallback))

const GROUPS = {
  artist: { select: "artist", group: "artist" },
  track: { select: "artist, track", group: "artist, track" },
  album: { select: "album, MAX(artist) AS artist", group: "album" },
} as const

export interface Databases {
  music: Database
  games: Database
  watching: Database
}

export async function handle(request: Request, { music: db, games, watching }: Databases): Promise<Response> {
  const url = new URL(request.url)
  const q = url.searchParams
  let from: number, to: number
  try {
    from = time(q.get("from")) ?? 0
    to = time(q.get("to"), true) ?? 2 ** 31
  } catch (error) {
    return json({ error: (error as Error).message }, 400)
  }
  switch (url.pathname) {
    case "/":
      return json({
        endpoints: {
          "/music/stats": "totals and plays per year",
          "/music/recent?limit=50": "the newest plays",
          "/music/top?by=artist|track|album&from=2020&to=2020-06&limit=25": "most played in a period",
          "/music/listens?from=…&to=…&limit=1000": "every play, oldest first; `next` is the `from` for the next page",
          "/music/loves?from=…&to=…&limit=100": "loved tracks, newest first",
          "/watching/stats": "entries per year and type, and the newest",
          "/watching/history?type=movie|episode&from=…&to=…&limit=100": "what was watched, newest first",
          "/watching/ratings": "everything rated, newest first",
          "/watching/letterboxd?from=…&to=…&limit=100": "the Letterboxd diary, newest watched day first",
          "/games/stats": "every game with its minutes, last played and achievements",
          "/games/sessions?from=…&to=…&limit=100": "sessions, newest first",
          "/games/achievements?from=…&to=…&limit=100": "unlocks, newest first",
        },
      })
    case "/music/loves": {
      const rows = await db.prepare("SELECT loved_at, artist, track, track_mbid, url FROM loves WHERE loved_at >= ? AND loved_at < ? ORDER BY loved_at DESC LIMIT ?").bind(from, to, limit(q.get("limit"), 100, 1000)).all()
      return json(rows.results)
    }
    case "/watching/stats": {
      const years = await watching.prepare("SELECT strftime('%Y', watched_at, 'unixepoch') AS year, type, COUNT(*) AS watched FROM watches GROUP BY year, type ORDER BY year, type").all()
      const total = await watching.prepare("SELECT COUNT(*) AS entries, MIN(watched_at) AS first, MAX(watched_at) AS last, (SELECT COUNT(*) FROM ratings) AS ratings FROM watches").first()
      return json({ ...total, years: years.results })
    }
    case "/watching/history": {
      const type = q.get("type")
      if (type !== null && type !== "movie" && type !== "episode") return json({ error: "type must be movie or episode" }, 400)
      const rows = await watching
        .prepare("SELECT watched_at, type, title, year, show, season, episode, trakt_id, tmdb_id, imdb_id FROM watches WHERE watched_at >= ? AND watched_at < ? AND (? IS NULL OR type = ?) ORDER BY watched_at DESC LIMIT ?")
        .bind(from, to, type, type, limit(q.get("limit"), 100, 1000))
        .all()
      return json(rows.results)
    }
    case "/watching/letterboxd": {
      const day = (seconds: number) => new Date(seconds * 1000).toISOString().slice(0, 10)
      const rows = await watching
        .prepare("SELECT id, kind, watched_on, title, year, rating, rewatch, liked, tmdb_id, review, link, poster, published_at FROM letterboxd WHERE watched_on >= ? AND watched_on < ? ORDER BY watched_on DESC, published_at DESC LIMIT ?")
        .bind(day(from), day(to), limit(q.get("limit"), 100, 1000))
        .all()
      return json({ entries: rows.results })
    }
    case "/watching/ratings": {
      const rows = await watching.prepare("SELECT type, trakt_id, title, year, rating, rated_at FROM ratings ORDER BY rated_at DESC").all()
      return json(rows.results)
    }
    case "/games/stats": {
      const rows = await games.prepare("SELECT source, game_id, name, platform, minutes, last_played, achievements_total, achievements_earned FROM games ORDER BY last_played DESC").all()
      return json(rows.results)
    }
    case "/games/sessions": {
      const rows = await games
        .prepare("SELECT s.source, s.game_id, g.name, g.platform, s.first_seen, s.last_seen, s.minutes, s.events FROM sessions s JOIN games g USING (source, game_id) WHERE s.last_seen >= ? AND s.first_seen < ? ORDER BY s.last_seen DESC LIMIT ?")
        .bind(from, to, limit(q.get("limit"), 100, 1000))
        .all()
      return json(rows.results)
    }
    case "/games/achievements": {
      const rows = await games
        .prepare("SELECT a.source, a.game_id, g.name AS game, a.title, a.description, a.points, a.hardcore, a.unlocked_at FROM achievements a LEFT JOIN games g USING (source, game_id) WHERE a.unlocked_at >= ? AND a.unlocked_at < ? ORDER BY a.unlocked_at DESC LIMIT ?")
        .bind(from, to, limit(q.get("limit"), 100, 1000))
        .all()
      return json(rows.results)
    }
    case "/music/stats": {
      const total = await db.prepare("SELECT COUNT(*) AS plays, MIN(listened_at) AS first, MAX(listened_at) AS last, COUNT(DISTINCT artist) AS artists FROM listens").first()
      const years = await db.prepare("SELECT strftime('%Y', listened_at, 'unixepoch') AS year, COUNT(*) AS plays FROM listens GROUP BY year ORDER BY year").all()
      const undated = await db.prepare("SELECT source, COUNT(*) AS plays FROM undated_listens GROUP BY source").all()
      return json({ ...total, years: years.results, undated: undated.results })
    }
    case "/music/recent": {
      const rows = await db.prepare("SELECT listened_at, artist, track, album, spotify_id, recording_mbid FROM listens ORDER BY listened_at DESC LIMIT ?").bind(limit(q.get("limit"), 50, 500)).all()
      return json(rows.results)
    }
    case "/music/top": {
      const by = (q.get("by") ?? "artist") as keyof typeof GROUPS
      const group = GROUPS[by]
      if (group === undefined) return json({ error: "by must be artist, track or album" }, 400)
      const albumOnly = by === "album" ? "AND album IS NOT NULL" : ""
      const rows = await db
        .prepare(`SELECT ${group.select}, COUNT(*) AS plays FROM listens WHERE listened_at >= ? AND listened_at < ? ${albumOnly} GROUP BY ${group.group} ORDER BY plays DESC LIMIT ?`)
        .bind(from, to, limit(q.get("limit"), 25, 200))
        .all()
      return json(rows.results)
    }
    case "/music/listens": {
      const rows = await db
        .prepare("SELECT listened_at, artist, track, album, duration_ms, spotify_id, recording_mbid, release_mbid, artist_mbids, client FROM listens WHERE listened_at >= ? AND listened_at < ? ORDER BY listened_at LIMIT ?")
        .bind(from, to, limit(q.get("limit"), 1000, 1000))
        .all<{ listened_at: number }>()
      const last = rows.results.at(-1)
      return json({ listens: rows.results, next: last === undefined ? null : last.listened_at + 1 })
    }
    default:
      return json({ error: "not found" }, 404)
  }
}
