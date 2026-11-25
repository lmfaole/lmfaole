import assert from "node:assert/strict"
import { test } from "node:test"
import { mainPlatform } from "./steam.ts"

const game = { appid: 620, name: "Portal 2", playtime_forever: 600 }

test("a game's main platform is the machine with the most time, the Deck's taken out of Linux's", () => {
  assert.equal(mainPlatform({ ...game, playtime_windows_forever: 100, playtime_mac_forever: 300, playtime_linux_forever: 200 }), "Mac")
  assert.equal(mainPlatform({ ...game, playtime_windows_forever: 100, playtime_linux_forever: 500, playtime_deck_forever: 450 }), "Steam Deck")
  assert.equal(mainPlatform({ ...game, playtime_windows_forever: 100, playtime_linux_forever: 500, playtime_deck_forever: 50 }), "Linux")
  // A tie goes to the first of Windows, Mac, Linux and the Deck.
  assert.equal(mainPlatform({ ...game, playtime_windows_forever: 300, playtime_mac_forever: 300 }), "Windows")
  // Time from before Steam counted machines is on none of them.
  assert.equal(mainPlatform({ ...game, playtime_windows_forever: 0, playtime_mac_forever: 0, playtime_linux_forever: 0, playtime_deck_forever: 0 }), null)
  assert.equal(mainPlatform(game), null)
})
