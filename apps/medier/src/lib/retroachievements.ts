/**
 * RetroAchievements (retroachievements.org): the old console games a profile has played in an emulator, and its achievements in each. The site's web API key, and the owner's
 * username there; every profile is public. Its times are UTC, written «2026-11-22 03:40:19». Pure, with a test.
 */

import type { Achievement, Achievements } from "./steam.ts"

const API = "https://retroachievements.org/API"
const MEDIA = "https://media.retroachievements.org"
const enc = encodeURIComponent

export const retroRecentUrl = (key: string, user: string, count = 20): string => `${API}/API_GetUserRecentlyPlayedGames.php?u=${enc(user)}&c=${count}&y=${enc(key)}`
export const retroGameUrl = (key: string, user: string, gameId: number): string => `${API}/API_GetGameInfoAndUserProgress.php?u=${enc(user)}&g=${gameId}&a=1&y=${enc(key)}`
export const retroUserPage = (user: string): string => `https://retroachievements.org/user/${enc(user)}`
export const retroGamePage = (gameId: number): string => `https://retroachievements.org/game/${gameId}`

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})
const count = (value: unknown): number => {
  const number = typeof value === "string" ? Number(value) : value
  return typeof number === "number" && Number.isFinite(number) && number > 0 ? Math.round(number) : 0
}
const text = (value: unknown): string | null => (typeof value === "string" && value.trim() !== "" ? value.trim() : null)
/** A picture of RetroAchievements' (its path, «/Images/095539.png»), or `null`. */
const media = (value: unknown): string | null => {
  const path = text(value)
  return path === null || !path.startsWith("/") ? null : `${MEDIA}${path}`
}

/** A time of RetroAchievements' (UTC, «2026-11-22 03:40:19», or ISO with its offset) in seconds since 1970; `null` where it is none. */
export function retroTime(value: unknown): number | null {
  const written = text(value)
  if (written === null) return null
  const iso = /[zZ]|[+-]\d\d:\d\d$/.test(written) ? written : `${written.replace(" ", "T")}Z`
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000)
}


/** A game played lately, as the rows show it. */
export interface RetroGame {
  gameId: number
  title: string
  console: string
  /** The title screen (about 4:3), for a row. */
  image: string | null
  lastPlayed: number | null
  unlocked: number
  total: number
}

/** The games played lately, the last played first; one without an id or a name is left out. */
export function parseRetroRecent(answer: unknown): RetroGame[] {
  if (!Array.isArray(answer)) return []
  return answer
    .map(record)
    .flatMap((one): RetroGame[] => {
      const gameId = count(one["GameID"])
      const title = text(one["Title"])
      if (gameId === 0 || title === null) return []
      return [{ gameId, title, console: text(one["ConsoleName"]) ?? "", image: media(one["ImageTitle"]) ?? media(one["ImageIcon"]), lastPlayed: retroTime(one["LastPlayed"]), unlocked: count(one["NumAchieved"]), total: count(one["NumPossibleAchievements"] ?? one["AchievementsTotal"]) }]
    })
    .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0))
}

/** The highest award a profile has for a game, in Norwegian; `null` for none. */
const AWARDS: Record<string, string> = { mastered: "Mestret", completed: "Fullført", "beaten-hardcore": "Klart (hardcore)", "beaten-softcore": "Klart" }

/** One game of a profile's, for its page. */
export interface RetroGameDetail {
  gameId: number
  title: string
  console: string
  consoleId: number
  /** The box it came in, for the head. */
  boxArt: string | null
  developer: string | null
  publisher: string | null
  genres: string[]
  /** The day out, «1991-06-11» (or a year or month where only that is known). */
  released: string | null
  /** Minutes played, as RetroAchievements counts it (from the emulator's own reports). */
  minutes: number
  /** All who have played it there. */
  players: number
  award: string | null
  points: number
  possiblePoints: number
  achievements: Achievements
}

/** A game and the profile's progress in it (`API_GetGameInfoAndUserProgress`); `null` where it is not one. The share who have each is of all who have played it. */
export function parseRetroGame(answer: unknown): RetroGameDetail | null {
  const game = record(answer)
  const gameId = count(game["ID"])
  const title = text(game["Title"])
  if (gameId === 0 || title === null) return null
  const players = count(game["NumDistinctPlayers"])
  const own = Object.values(record(game["Achievements"])).map(record)
  let points = 0
  let possiblePoints = 0
  const list = own
    .flatMap((one): (Achievement & { order: number })[] => {
      const id = count(one["ID"])
      if (id === 0) return []
      const unlocked = retroTime(one["DateEarned"]) ?? retroTime(one["DateEarnedHardcore"])
      const worth = count(one["Points"])
      possiblePoints += worth
      if (unlocked !== null) points += worth
      const badge = text(one["BadgeName"])
      return [{ key: String(id), name: text(one["Title"]) ?? `Prestasjon ${id}`, description: text(one["Description"]), icon: badge === null ? null : `${MEDIA}/Badge/${badge}${unlocked === null ? "_lock" : ""}.png`, unlocked, percent: players === 0 ? null : (100 * count(one["NumAwarded"])) / players, order: count(one["DisplayOrder"]) }]
    })
    .sort((a, b) => (b.unlocked ?? 0) - (a.unlocked ?? 0) || a.order - b.order)
    .map(({ order: _order, ...one }) => one)
  const award = text(game["HighestAwardKind"])
  return {
    gameId,
    title,
    console: text(game["ConsoleName"]) ?? "",
    consoleId: count(game["ConsoleID"]),
    boxArt: media(game["ImageBoxArt"]) ?? media(game["ImageTitle"]),
    developer: text(game["Developer"]),
    publisher: text(game["Publisher"]),
    genres: (text(game["Genre"]) ?? "").split(",").map((one) => one.trim()).filter((one) => one !== ""),
    released: text(game["Released"])?.slice(0, 10) ?? null,
    minutes: Math.round(count(game["UserTotalPlaytime"]) / 60),
    players,
    award: award === null ? null : (AWARDS[award] ?? null),
    points,
    possiblePoints,
    achievements: { total: list.length, unlocked: list.filter((one) => one.unlocked !== null).length, list },
  }
}

/** The consoles whose games came on a disc (a PlayStation, a Saturn, a GameCube): their case in the head is a DVD's; every other's a cartridge's. */
const DISC_CONSOLES = new Set([9, 12, 16, 19, 21, 39, 40, 41, 42, 43, 49, 56, 76, 77])

/** The consoles whose games have their own case in the head (by RetroAchievements' console id): the Mega Drive's, the Nintendo 64's, the Super Nintendo's, the Game Boy's (and the Color's), the Game Boy Advance's, the NES's and the first PlayStation's. */
const CASES: Readonly<Record<number, RetroCase>> = { 1: "genesis", 2: "n64", 3: "snes", 4: "gameboy", 5: "gba", 6: "gameboy", 7: "nes", 12: "psx" }

export type RetroCase = "dvd" | "cartridge" | "nes" | "snes" | "n64" | "gameboy" | "gba" | "genesis" | "psx"

/** What a game's box is in the head: its console's own case where it has one, else a DVD's for a console of discs and a game card's for one of cartridges. */
export const retroCase = (consoleId: number): RetroCase => CASES[consoleId] ?? (DISC_CONSOLES.has(consoleId) ? "dvd" : "cartridge")
