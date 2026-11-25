import assert from "node:assert/strict"
import { test } from "node:test"
import { handle } from "./api.ts"
import { syncGames, type GamesOptions } from "./games.ts"
import { database } from "./testing.ts"

interface World {
  steam: { appid: number; name: string; playtime_forever: number; rtime_last_played?: number }[]
  steamAchievements: Record<number, { apiname: string; achieved: number; unlocktime: number; name?: string }[] | null>
  ra: { GameID: number; Title: string; ConsoleName: string; LastPlayed: string; NumPossibleAchievements: number; NumAchieved: number; NumAchievedHardcore: number }[]
  presence: { LastGameID: number; RichPresenceMsg: string }
  unlocks: { AchievementID: number; GameID: number; Title: string; Description: string; Points: number; HardcoreMode: number; Date: string }[]
}

function services(world: World) {
  const asked: string[] = []
  const fetch = async (input: string) => {
    const url = new URL(input)
    asked.push(url.pathname)
    if (url.pathname.endsWith("GetOwnedGames/v1/")) return Response.json({ response: { games: world.steam } })
    if (url.pathname.endsWith("GetPlayerAchievements/v1/")) {
      const list = world.steamAchievements[Number(url.searchParams.get("appid"))]
      return list === null || list === undefined ? new Response("no stats", { status: 400 }) : Response.json({ playerstats: { success: true, achievements: list } })
    }
    if (url.pathname.endsWith("API_GetUserRecentlyPlayedGames.php")) return Response.json(world.ra)
    if (url.pathname.endsWith("API_GetUserProfile.php")) return Response.json(world.presence)
    if (url.pathname.endsWith("API_GetAchievementsEarnedBetween.php")) return Response.json(world.unlocks)
    throw new Error(`unexpected ${input}`)
  }
  return { fetch, asked }
}

const options = (fetch: GamesOptions["fetch"], now: number): GamesOptions => ({ steam: { key: "k", id: "1" }, ra: { user: "u", key: "k" }, fetch, now, maxAchievementGames: 10 })

const world = (): World => ({
  steam: [{ appid: 620, name: "Portal 2", playtime_forever: 600, rtime_last_played: 1000 }, { appid: 1, name: "Never played", playtime_forever: 0 }],
  steamAchievements: { 620: [{ apiname: "a", achieved: 1, unlocktime: 900, name: "First" }, { apiname: "b", achieved: 0, unlocktime: 0 }] },
  ra: [{ GameID: 668, Title: "Pokémon Emerald", ConsoleName: "Game Boy Advance", LastPlayed: "2026-11-23 09:42:42", NumPossibleAchievements: 197, NumAchieved: 26, NumAchievedHardcore: 0 }],
  presence: { LastGameID: 668, RichPresenceMsg: "Exploring Route 101" },
  unlocks: [{ AchievementID: 5, GameID: 668, Title: "Zigzagone", Description: "", Points: 1, HardcoreMode: 0, Date: "2026-10-22 20:58:48" }],
})

test("the first run keeps a baseline, the achievements and RetroAchievements' play", async () => {
  const { db, sqlite } = database("gameplay")
  await syncGames(db, options(services(world()).fetch, 2000))
  assert.deepEqual(sqlite.prepare("SELECT source, game_id, minutes_added, baseline, presence FROM play_events ORDER BY source").all().map((r) => ({ ...r })), [
    { source: "ra", game_id: "668", minutes_added: null, baseline: 0, presence: "Exploring Route 101" },
    { source: "steam", game_id: "620", minutes_added: 600, baseline: 1, presence: null },
  ])
  assert.deepEqual(sqlite.prepare("SELECT source, title, unlocked_at FROM achievements ORDER BY source").all().map((r) => ({ ...r })), [
    { source: "ra", title: "Zigzagone", unlocked_at: Date.UTC(2026, 9, 22, 20, 58, 48) / 1000 },
    { source: "steam", title: "First", unlocked_at: 900 },
  ])
  assert.deepEqual({ ...sqlite.prepare("SELECT achievements_total, achievements_earned, achievements_checked FROM games WHERE game_id = '620'").get() }, { achievements_total: 2, achievements_earned: 1, achievements_checked: 600 })
})

test("only what grew is an event, and a game not played since isn't asked for its achievements again", async () => {
  const { db, sqlite } = database("gameplay")
  const w = world()
  await syncGames(db, options(services(w).fetch, 2000))
  const again = services(w)
  await syncGames(db, options(again.fetch, 3000))
  assert.equal(again.asked.filter((path) => path.includes("GetPlayerAchievements")).length, 0)
  assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM play_events").get() as { n: number }).n, 2)
  assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM achievements").get() as { n: number }).n, 2)

  w.steam[0] = { appid: 620, name: "Portal 2", playtime_forever: 690, rtime_last_played: 5000 }
  w.ra[0] = { ...w.ra[0]!, LastPlayed: "2026-11-23 11:00:00" }
  await syncGames(db, options(services(w).fetch, 6000))
  assert.deepEqual({ ...sqlite.prepare("SELECT at, minutes_total, minutes_added FROM play_events WHERE source = 'steam' AND baseline = 0").get() }, { at: 5000, minutes_total: 690, minutes_added: 90 })
  assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM play_events WHERE source = 'ra'").get() as { n: number }).n, 2)
})

test("sessions join events close in time and the API shows them", async () => {
  const { db, sqlite } = database("gameplay")
  await syncGames(db, options(services(world()).fetch, 2000))
  const insert = sqlite.prepare("INSERT INTO play_events (source, game_id, at, minutes_total, minutes_added) VALUES ('steam', '620', ?, ?, ?)")
  insert.run(10_000, 630, 30)
  insert.run(20_000, 700, 70)
  insert.run(100_000, 760, 60)
  const response = await handle(new Request("https://x/games/sessions"), { music: database("music").db, games: db, watching: database("watching").db })
  const sessions = ((await response.json()) as { source: string; first_seen: number; minutes: number }[]).filter((s) => s.source === "steam")
  assert.deepEqual(sessions.map((s) => [s.first_seen, s.minutes]), [[100_000, 60], [10_000, 100]])
})
