import { strict as assert } from "node:assert"
import { test } from "node:test"

import { parseRetroGame, parseRetroProfile, parseRetroRecent, retroCase, retroRecentUrl, retroTime } from "./retroachievements.ts"

test("RetroAchievements' times are UTC, with or without an offset written", () => {
  assert.equal(retroTime("2026-11-22 03:40:19"), Date.UTC(2026, 10, 22, 3, 40, 19) / 1000)
  assert.equal(retroTime("2023-10-27T02:52:34+00:00"), Date.UTC(2023, 9, 27, 2, 52, 34) / 1000)
  assert.equal(retroTime(null), null)
  assert.equal(retroTime("never"), null)
})

test("the games played lately are the last played first, with the title screen, and the key and user encoded", () => {
  assert.equal(retroRecentUrl("k y", "a b"), "https://retroachievements.org/API/API_GetUserRecentlyPlayedGames.php?u=a%20b&c=20&y=k%20y")
  const games = parseRetroRecent([
    { GameID: 5741, Title: "Ninja Taro", ConsoleName: "Game Boy", ImageTitle: "/Images/054085.png", LastPlayed: "2026-11-21 01:58:33", NumAchieved: 17, NumPossibleAchievements: 17 },
    { GameID: 759, Title: "Dragon Ball Z", ConsoleName: "Game Boy Advance", ImageTitle: "/Images/095164.png", LastPlayed: "2026-11-22 03:40:19", NumAchieved: 3, AchievementsTotal: 57 },
    { GameID: 0, Title: "Nothing" },
  ])
  assert.deepEqual(games.map((game) => [game.gameId, game.unlocked, game.total]), [[759, 3, 57], [5741, 17, 17]])
  assert.equal(games[0]?.image, "https://media.retroachievements.org/Images/095164.png")
  assert.deepEqual(parseRetroRecent({ error: "nope" }), [])
  assert.ok(parseRetroProfile({ User: "MaxMilyin" }) && !parseRetroProfile([]))
})

test("a game's achievements are the unlocked last first, locked with the grey badge, each with the share of its players and its points counted", () => {
  const game = parseRetroGame({
    ID: 1, Title: "Sonic the Hedgehog", ConsoleID: 1, ConsoleName: "Genesis/Mega Drive", ImageBoxArt: "/Images/112941.png", Genre: "2D Platforming, Action", Released: "1991-06-11 00:00:00",
    NumDistinctPlayers: 200, UserTotalPlaytime: 3959, HighestAwardKind: "beaten-hardcore",
    Achievements: {
      "9": { ID: 9, Title: "That Was Easy", Points: 3, BadgeName: "250336", NumAwarded: 150, DisplayOrder: 1, DateEarned: "2026-11-20 10:00:00" },
      "10": { ID: 10, Title: "Ring Hoarder", Points: 10, BadgeName: "250345", NumAwarded: 20, DisplayOrder: 2 },
      "11": { ID: 11, Title: "Fast", Points: 5, BadgeName: "622549", NumAwarded: 50, DisplayOrder: 3, DateEarnedHardcore: "2026-11-21 10:00:00" },
    },
  })
  assert.deepEqual(game?.achievements.list.map((one) => [one.name, one.percent]), [["Fast", 25], ["That Was Easy", 75], ["Ring Hoarder", 10]])
  assert.equal(game?.achievements.list[2]?.icon, "https://media.retroachievements.org/Badge/250345_lock.png")
  assert.deepEqual([game?.achievements.unlocked, game?.points, game?.possiblePoints, game?.minutes, game?.award, game?.released], [2, 8, 18, 66, "Klart (hardcore)", "1991-06-11"])
  assert.deepEqual(game?.genres, ["2D Platforming", "Action"])
  assert.equal(parseRetroGame([]), null)
})

test("an old console's game is in that console's own case, else a disc console's in a DVD's and a cartridge console's in a game card's", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 12].map(retroCase), ["genesis", "n64", "snes", "gameboy", "gba", "gameboy", "nes", "psx"])
  assert.equal(retroCase(21), "dvd")
  assert.equal(retroCase(25), "cartridge")
})
