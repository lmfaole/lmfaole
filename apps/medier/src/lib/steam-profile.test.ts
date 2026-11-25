import { strict as assert } from "node:assert"
import { test } from "node:test"

import { parseBadges, parsePlayerSummary, parseSteamLevel, parseUserStats, playerSummariesUrl } from "./steam-profile.ts"

const ID = "76561197968575517"

test("a profile playing a game: online, the game by its app id and name, its picture and when it was last off", () => {
  assert.equal(playerSummariesUrl("k", ID), `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=k&steamids=${ID}`)
  const presence = parsePlayerSummary({ response: { players: [{ steamid: ID, communityvisibilitystate: 3, personaname: "Chet", profileurl: "https://steamcommunity.com/id/ChetFaliszek/", avatar: "a.jpg", avatarfull: "a_full.jpg", personastate: 1, lastlogoff: 1700000000, gameid: "620", gameextrainfo: "Portal 2" }] } }, ID)
  assert.deepEqual(presence, { steamId: ID, name: "Chet", avatar: "a_full.jpg", profile: "https://steamcommunity.com/id/ChetFaliszek/", state: "online", stateLabel: "Pålogget", online: true, playing: { appId: 620, name: "Portal 2" }, lastLogoff: 1700000000, public: true })
})

test("a profile offline, or private, plays nothing; a game outside Steam has only its name; an unknown id is none", () => {
  const offline = parsePlayerSummary({ response: { players: [{ steamid: ID, communityvisibilitystate: 1, personaname: "Gabe", personastate: 0 }] } }, ID)
  assert.equal(offline?.online, false)
  assert.equal(offline?.stateLabel, "Frakoblet")
  assert.equal(offline?.playing, null)
  assert.equal(offline?.lastLogoff, null)
  assert.equal(offline?.public, false)
  const shortcut = parsePlayerSummary({ response: { players: [{ steamid: ID, personastate: 3, gameid: "13319385467139850240", gameextrainfo: "Minecraft" }] } }, ID)
  assert.deepEqual([shortcut?.stateLabel, shortcut?.playing], ["Borte", { appId: null, name: "Minecraft" }])
  assert.equal(parsePlayerSummary({ response: { players: [] } }, ID), null)
})

test("the level and the badges: a game's named by the owned list, Steam's own by its name, the last earned first", () => {
  const badges = parseBadges({ response: { badges: [
    { badgeid: 13, level: 744, completion_time: 1793902787, xp: 994, scarcity: 755981 },
    { badgeid: 1, appid: 620, level: 1, completion_time: 1368736795, xp: 100, communityitemid: "1", border_color: 1, scarcity: 1468068 },
    { badgeid: 99, level: 1, completion_time: 1500000000, xp: 50 },
  ], player_xp: 5791, player_level: 29, player_xp_needed_to_level_up: 209, player_xp_needed_current_level: 5700 } }, new Map([[620, "Portal 2"]]))
  assert.deepEqual([badges?.level, badges?.xp, badges?.xpToNext, badges?.xpLevelStart], [29, 5791, 209, 5700])
  assert.deepEqual(badges?.badges.map((one) => [one.name, one.appId, one.foil]), [["Spillsamler", null, false], [null, null, false], ["Portal 2", 620, true]])
  assert.equal(parseBadges({ response: {} }), null)
  assert.equal(parseSteamLevel({ response: { player_level: 32 } }), 32)
  assert.equal(parseSteamLevel({ response: {} }), null)
})

test("a game's numbers, named by its schema in its order or by the achievement they count towards, a number without a name left out; none where the game keeps none", () => {
  const stats = parseUserStats(
    { playerstats: { gameName: "Counter-Strike 2", stats: [{ name: "total_deaths", value: 91222 }, { name: "total_kills", value: 89125 }, { name: "odd", value: 1 }, { name: "bad", value: "x" }, { name: "LikeAShadow_stat", value: 7 }, { name: "same", value: 2 }] } },
    {
      game: {
        availableGameStats: {
          stats: [{ name: "total_kills", displayName: "Drap" }, { name: "total_deaths", displayName: "" }, { name: "LikeAShadow_stat", displayName: "" }, { name: "same", displayName: "same" }],
          achievements: [{ name: "LIKEASHADOW", displayName: "Som en skygge" }],
        },
      },
    },
  )
  assert.deepEqual(stats, [{ key: "total_kills", label: "Drap", value: 89125 }, { key: "LikeAShadow_stat", label: "Fremdrift mot «Som en skygge»", value: 7 }])
  assert.deepEqual(parseUserStats({ playerstats: { error: "Requested app has no stats", success: false } }, undefined), [])
})
