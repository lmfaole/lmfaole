/** Copies what is played on Steam and RetroAchievements into D1. Neither service keeps a history of sessions, so it is made here: each run compares with what was stored and keeps the difference as an event. Only what changed is written. */

import type { Database, Statement } from "./db.ts"
import type { Fetch } from "./listenbrainz.ts"
import { earnedBetween, profile, recentGames, utc } from "./retroachievements.ts"
import { achievements, mainPlatform, ownedGames } from "./steam.ts"

export interface GamesOptions {
  steam: { key: string; id: string }
  ra: { user: string; key: string }
  fetch: Fetch
  now: number
  /** Steam answers one game's achievements per request; the rest wait for the next run. */
  maxAchievementGames: number
  log?: (message: string) => void
}

interface Stored {
  source: string
  game_id: string
  minutes: number | null
  last_played: number | null
  achievements_checked: number | null
}

const UPSERT_GAME = `INSERT INTO games (source, game_id, name, platform, minutes, last_played, achievements_total, achievements_earned, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (source, game_id) DO UPDATE SET
  name = excluded.name, platform = excluded.platform, minutes = excluded.minutes, last_played = excluded.last_played,
  achievements_total = COALESCE(excluded.achievements_total, games.achievements_total), achievements_earned = COALESCE(excluded.achievements_earned, games.achievements_earned),
  updated_at = excluded.updated_at
WHERE games.name IS NOT excluded.name OR games.platform IS NOT excluded.platform OR games.minutes IS NOT excluded.minutes OR games.last_played IS NOT excluded.last_played
  OR (excluded.achievements_total IS NOT NULL AND games.achievements_total IS NOT excluded.achievements_total)
  OR (excluded.achievements_earned IS NOT NULL AND games.achievements_earned IS NOT excluded.achievements_earned)`

// Two growths with the same «last played» are one event with both.
const EVENT = `INSERT INTO play_events (source, game_id, at, minutes_total, minutes_added, baseline, presence) VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (source, game_id, at) DO UPDATE SET minutes_total = excluded.minutes_total, minutes_added = COALESCE(play_events.minutes_added, 0) + COALESCE(excluded.minutes_added, 0), presence = COALESCE(excluded.presence, play_events.presence)`

const ACHIEVEMENT = `INSERT INTO achievements (source, achievement_id, game_id, title, description, points, hardcore, unlocked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (source, achievement_id, hardcore) DO NOTHING`

export async function syncGames(db: Database, options: GamesOptions): Promise<{ events: number; achievements: number }> {
  const rows = await db.prepare("SELECT source, game_id, minutes, last_played, achievements_checked FROM games").all<Stored>()
  const stored = new Map(rows.results.map((row) => [`${row.source}:${row.game_id}`, row]))
  const upsertGame = db.prepare(UPSERT_GAME), event = db.prepare(EVENT), achievement = db.prepare(ACHIEVEMENT)
  const writes: Statement[] = []
  let events = 0, unlocks = 0

  const owned = await ownedGames(options.steam.key, options.steam.id, options.fetch)
  for (const game of owned) {
    const id = String(game.appid)
    const before = stored.get(`steam:${id}`)
    const lastPlayed = game.rtime_last_played || null
    if (before === undefined && game.playtime_forever > 0) {
      writes.push(event.bind("steam", id, lastPlayed ?? options.now, game.playtime_forever, game.playtime_forever, 1, null))
      events++
    } else if (before !== undefined && game.playtime_forever > (before.minutes ?? 0)) {
      const at = lastPlayed !== null && lastPlayed > (before.last_played ?? 0) ? lastPlayed : options.now
      writes.push(event.bind("steam", id, at, game.playtime_forever, game.playtime_forever - (before.minutes ?? 0), 0, null))
      events++
    }
    writes.push(upsertGame.bind("steam", id, game.name, mainPlatform(game), game.playtime_forever, lastPlayed, null, null, options.now))
  }

  // Games played since their achievements were last fetched, the most recently played first.
  const due = owned
    .filter((game) => game.playtime_forever > 0 && stored.get(`steam:${game.appid}`)?.achievements_checked !== game.playtime_forever)
    .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
    .slice(0, options.maxAchievementGames)
  for (const game of due) {
    const list = await achievements(options.steam.key, options.steam.id, game.appid, options.fetch)
    const id = String(game.appid)
    const earned = (list ?? []).filter((unlock) => unlock.achieved === 1)
    for (const unlock of earned) writes.push(achievement.bind("steam", `${id}/${unlock.apiname}`, id, unlock.name ?? unlock.apiname, unlock.description ?? null, null, 0, unlock.unlocktime))
    unlocks += earned.length
    writes.push(db.prepare("UPDATE games SET achievements_total = ?, achievements_earned = ?, achievements_checked = ? WHERE source = 'steam' AND game_id = ?").bind(list === null ? null : list.length, list === null ? null : earned.length, game.playtime_forever, id))
  }

  const [recent, me] = await Promise.all([recentGames(options.ra.user, options.ra.key, options.fetch), profile(options.ra.user, options.ra.key, options.fetch)])
  for (const game of recent) {
    const id = String(game.GameID)
    const at = utc(game.LastPlayed)
    const before = stored.get(`ra:${id}`)
    if (before === undefined || at > (before.last_played ?? 0)) {
      writes.push(event.bind("ra", id, at, null, null, 0, me.LastGameID === game.GameID ? me.RichPresenceMsg || null : null))
      events++
    }
    writes.push(upsertGame.bind("ra", id, game.Title, game.ConsoleName, null, at, game.NumPossibleAchievements, game.NumAchieved, options.now))
  }

  // A day back from the last run, so unlocks that reach RetroAchievements late still come in; the key keeps them single.
  const cursor = await db.prepare("SELECT value FROM state WHERE key = 'ra_unlocks'").first<{ value: string }>()
  const from = cursor === null ? 0 : Number(cursor.value) - 86400
  for (const unlock of await earnedBetween(options.ra.user, options.ra.key, from, options.now, options.fetch)) {
    writes.push(achievement.bind("ra", String(unlock.AchievementID), String(unlock.GameID), unlock.Title, unlock.Description || null, unlock.Points, unlock.HardcoreMode, utc(unlock.Date)))
    unlocks++
  }
  writes.push(db.prepare("INSERT INTO state (key, value) VALUES ('ra_unlocks', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value").bind(String(options.now)))

  await db.batch(writes)
  options.log?.(`games: ${owned.length} on Steam, ${recent.length} on RetroAchievements, ${events} play events, ${unlocks} unlocks seen, achievements of ${due.length} Steam games`)
  return { events, achievements: unlocks }
}
