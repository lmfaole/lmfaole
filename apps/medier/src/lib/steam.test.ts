import { strict as assert } from "node:assert"
import { test } from "node:test"

import { gamePeriod, isSteamId, parseAchievements, parseOwnedGame, parseOwnedGames, parsePlayedSince, parseStoreDetails, parseRecentGames, parseVanity, playtimeText, vanityUrl } from "./steam.ts"

test("a profile is its SteamID, or the custom name in its address resolved to one", () => {
  assert.ok(isSteamId("76561197960287930") && !isSteamId("gabelogannewell") && !isSteamId("12345678901234567"))
  assert.equal(vanityUrl("k", "a b"), "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=k&vanityurl=a%20b")
  assert.equal(parseVanity({ response: { steamid: "76561197960287930", success: 1 } }), "76561197960287930")
  assert.equal(parseVanity({ response: { success: 42, message: "No match" } }), null)
})

test("the games of the last two weeks, most played first, with Steam's header images and store pages", () => {
  const games = parseRecentGames({ response: { total_count: 3, games: [
    { appid: 620, name: "Portal 2", playtime_2weeks: 30, playtime_forever: 900 },
    { appid: 1145360, name: "Hades", playtime_2weeks: 300, playtime_forever: 4000 },
    { appid: 1, name: "", playtime_2weeks: 999 },
  ] } })
  assert.deepEqual(games.map((game) => game.name), ["Hades", "Portal 2"])
  assert.equal(games[0]?.image, "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg")
  assert.equal(games[0]?.url, "https://store.steampowered.com/app/1145360/")
  assert.deepEqual(parseRecentGames({ response: {} }), [])
})

test("the most played of all leaves out the ones never played, and a private list is none", () => {
  const owned = parseOwnedGames({ response: { game_count: 3, games: [
    { appid: 10, name: "Counter-Strike", playtime_forever: 0 },
    { appid: 620, name: "Portal 2", playtime_forever: 900 },
    { appid: 1145360, name: "Hades", playtime_forever: 4000, playtime_2weeks: 300 },
  ] } })
  assert.equal(owned?.owned, 3)
  assert.deepEqual(owned?.most.map((game) => [game.name, game.recentMinutes]), [["Hades", 0], ["Portal 2", 0]])
  assert.equal(parseOwnedGames({ response: {} }), null)
})

test("time played reads as minutes under an hour, and hours from one", () => {
  assert.equal(playtimeText(45), "45 min")
  assert.equal(playtimeText(210), "3,5 t")
  assert.equal(playtimeText(72240), "1\u00a0204 t")
})

test("a game of the owned list: its time on each machine, the Deck's taken out of Linux's, and when it was last played", () => {
  const game = parseOwnedGame({ response: { game_count: 2, games: [
    { appid: 620, name: "Portal 2", playtime_forever: 900 },
    { appid: 1145360, name: "Hades", playtime_forever: 4000, rtime_last_played: 1700000000, playtime_windows_forever: 1000, playtime_linux_forever: 3000, playtime_deck_forever: 2500, playtime_mac_forever: 0 },
  ] } }, 1145360)
  assert.deepEqual(game?.platforms, [{ label: "Steam Deck", minutes: 2500 }, { label: "Windows", minutes: 1000 }, { label: "Linux", minutes: 500 }])
  assert.equal(game?.lastPlayed, 1700000000)
  assert.equal(parseOwnedGame({ response: { game_count: 1, games: [{ appid: 620, name: "Portal 2" }] } }, 1), null)
})

test("the store's page of a game: its text without HTML, who made it, when, and the price in Norway", () => {
  const store = parseStoreDetails({ "620": { success: true, data: { short_description: "Spill &amp; <b>tenk</b>.", developers: ["Valve"], publishers: ["Valve"], release_date: { date: "18. apr. 2011" }, genres: [{ description: "Action" }], metacritic: { score: 95, url: "https://m" }, is_free: false, price_overview: { final_formatted: "89,00 kr" } } } }, 620)
  assert.deepEqual(store, { description: "Spill & tenk.", developers: ["Valve"], publishers: ["Valve"], released: "18. apr. 2011", genres: ["Action"], metacritic: { score: 95, url: "https://m" }, price: "89,00 kr" })
  assert.equal(parseStoreDetails({ "620": { success: false } }, 620), null)
})

test("achievements: how many of how many, the last unlocked first, with the share of players, and a hidden one keeps its secret", () => {
  const found = parseAchievements(
    { playerstats: { achievements: [{ apiname: "A", achieved: 1, unlocktime: 100 }, { apiname: "B", achieved: 1, unlocktime: 300 }, { apiname: "C", achieved: 0, unlocktime: 0 }] } },
    { game: { availableGameStats: { achievements: [{ name: "A", displayName: "Først", icon: "a.jpg", icongray: "a-g.jpg" }, { name: "B", displayName: "Andre", description: "Gjør noe" }, { name: "C", displayName: "Hemmelig", description: "Avslører", hidden: 1, icongray: "c-g.jpg" }] } } },
    { achievementpercentages: { achievements: [{ name: "A", percent: "71.5" }, { name: "B", percent: 3.2 }] } },
  )
  assert.equal(found?.total, 3)
  assert.equal(found?.unlocked, 2)
  assert.deepEqual(found?.list.map((one) => [one.name, one.percent]), [["Andre", 3.2], ["Først", 71.5], ["Skjult prestasjon", null]])
  assert.equal(found?.list[1]?.icon, "a.jpg")
  assert.equal(found?.list[2]?.description, null)
  assert.equal(found?.list[2]?.icon, "c-g.jpg")
  assert.equal(parseAchievements({ playerstats: { error: "Profile is not public", success: false } }, {}, {}), null)
})

test("a week or a month of games: the games last played in it or with an achievement unlocked in it, and the achievements per day", () => {
  const owned = { response: { game_count: 3, games: [
    { appid: 1, name: "Før", playtime_forever: 60, rtime_last_played: 100 },
    { appid: 2, name: "Sist", playtime_forever: 60, rtime_last_played: 900 },
    { appid: 3, name: "Midt", playtime_forever: 60, rtime_last_played: 400 },
  ] } }
  const since = parsePlayedSince(owned, 300)
  assert.deepEqual(since.map((game) => game.name), ["Sist", "Midt"])
  const achievement = (key: string, unlocked: number | null) => ({ key, name: key, description: null, icon: null, unlocked, percent: null })
  const [last, middle] = since as [NonNullable<(typeof since)[0]>, NonNullable<(typeof since)[0]>]
  const period = gamePeriod([{ game: last, achievements: { total: 3, unlocked: 2, list: [achievement("a", 350), achievement("b", 380), achievement("c", null)] } }, { game: middle, achievements: null }], 300, 500, (seconds) => (seconds < 360 ? "d1" : "d2"))
  // «Sist» was last played after the period, but unlocked two in it; «Midt» was last played in it.
  assert.deepEqual(period.games.map((one) => [one.game.name, one.unlocked, one.lastPlayedHere]), [["Sist", 2, false], ["Midt", 0, true]])
  assert.deepEqual(period.unlocks.map((unlock) => unlock.achievement.key), ["b", "a"])
  assert.deepEqual(period.byDate, { d1: 1, d2: 1 })
})
