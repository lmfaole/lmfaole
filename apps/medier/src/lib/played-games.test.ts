import assert from "node:assert/strict"
import { test } from "node:test"

import { type GameEntry, mostPlayed, recentGames, retroEntry, retroView, steamEntry, steamView, storeDay } from "./played-games.ts"
import { parseRetroGame } from "./retroachievements.ts"

const NOW = 2_000_000_000
const steam = steamEntry({ appId: 1145360, name: "Hades", totalMinutes: 4120, lastPlayed: NOW - 3600, platforms: [{ label: "Steam Deck", minutes: 3000 }, { label: "Windows", minutes: 1120 }] }, 90)
const retro = retroEntry({ gameId: 759, title: "Dragon Ball Z", console: "Game Boy Advance", image: null, lastPlayed: NOW - 60, unlocked: 3, total: 57 }, 66)
const old: GameEntry = { ...steamEntry({ appId: 504230, name: "Celeste", totalMinutes: 1480, lastPlayed: NOW - 40 * 24 * 3600, platforms: [] }), recentMinutes: 0 }

test("a Steam game and a retro game are rows of one kind, each with where it was played", () => {
  assert.equal(steam.platform, "Steam Deck")
  assert.equal(retro.platform, "Game Boy Advance")
  assert.equal(old.platform, "PC")
  assert.deepEqual([retro.source, retro.totalMinutes, retro.recentMinutes], ["retro", 66, 0])
})

test("recently played is both services the last two weeks, the last played first", () => {
  assert.deepEqual(recentGames([steam, old, retro], NOW).map((one) => one.title), ["Dragon Ball Z", "Hades"])
})

test("most played is both services by the minutes, without the ones never counted", () => {
  assert.deepEqual(mostPlayed([retro, old, steam, retroEntry({ gameId: 1, title: "Sonic", console: "", image: null, lastPlayed: null, unlocked: 0, total: 0 })]).map((one) => one.title), ["Hades", "Celeste", "Dragon Ball Z"])
})

test("a game's page has the same facts whichever service: platform, makers, time, achievements, a link", () => {
  const fromSteam = steamView({ game: { appId: 1145360, name: "Hades", totalMinutes: 4120, lastPlayed: NOW, platforms: [{ label: "Windows", minutes: 4120 }] }, recentMinutes: 0, store: { description: "Trass i underverdenen.", developers: ["Supergiant Games"], publishers: ["Supergiant Games"], released: "17. sep. 2020", genres: ["Action"], metacritic: null, price: "Gratis" }, achievements: null })
  assert.deepEqual([fromSteam.kind, fromSteam.developer, fromSteam.publisher, fromSteam.held, fromSteam.platforms, fromSteam.link.label], ["Windows · 2020", "Supergiant Games", null, undefined, [], "Åpne i Steam-butikken"])
  const game = parseRetroGame({ ID: 228, Title: "Super Mario World", ConsoleID: 3, ConsoleName: "SNES/Super Famicom", Developer: "Nintendo", Publisher: "Nintendo", Released: "1990-11-21", UserTotalPlaytime: 7200, NumDistinctPlayers: 10, Achievements: { 1: { ID: 1, Title: "Start", Points: 5, DateEarned: "2026-01-01 10:00:00" } } })
  assert.ok(game !== null)
  const fromRetro = retroView(game, NOW)
  assert.deepEqual([fromRetro.kind, fromRetro.publisher, fromRetro.held, fromRetro.totalMinutes, fromRetro.points, fromRetro.lastPlayed, fromRetro.description], ["SNES/Super Famicom · 1990", null, "snes", 120, { got: 5, of: 5 }, NOW, null])
})

test("the store's day out is written as RetroAchievements' is, and words that are not a day are kept", () => {
  assert.equal(storeDay("17. sep. 2020"), "2020-09-17")
  assert.equal(storeDay("3. mai 2019"), "2019-05-03")
  assert.equal(storeDay("17 Sep, 2020"), "2020-09-17")
  assert.equal(storeDay("Kommer snart"), "Kommer snart")
})
