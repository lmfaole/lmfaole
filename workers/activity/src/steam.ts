/** Steam's Web API: the library with minutes played, and one game's unlocked achievements. */

import type { Fetch } from "./listenbrainz.ts"

const API = "https://api.steampowered.com"

export interface OwnedGame {
  appid: number
  name: string
  playtime_forever: number
  rtime_last_played?: number
  playtime_windows_forever?: number
  playtime_mac_forever?: number
  playtime_linux_forever?: number
  playtime_deck_forever?: number
}

export interface Unlock {
  apiname: string
  achieved: number
  unlocktime: number
  name?: string
  description?: string
}

const PLATFORMS = [["playtime_windows_forever", "Windows"], ["playtime_mac_forever", "Mac"], ["playtime_linux_forever", "Linux"], ["playtime_deck_forever", "Steam Deck"]] as const

/** The machine a game is played on most: «Windows», «Mac», «Linux» or «Steam Deck»; the first of those on a tie, and null where Steam counts no time on any. */
export function mainPlatform(game: OwnedGame): string | null {
  const minutes = (value: number | undefined) => (typeof value === "number" && value > 0 ? value : 0)
  // Steam counts a Deck's time under Linux too: Linux is only what was not on the Deck.
  const deck = minutes(game.playtime_deck_forever)
  let best: string | null = null, most = 0
  for (const [field, label] of PLATFORMS) {
    const time = field === "playtime_linux_forever" ? minutes(game[field]) - deck : minutes(game[field])
    if (time > most) [best, most] = [label, time]
  }
  return best
}

export async function ownedGames(key: string, steamId: string, fetch: Fetch): Promise<OwnedGame[]> {
  const response = await fetch(`${API}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`)
  if (!response.ok) throw new Error(`Steam GetOwnedGames ${response.status}`)
  return ((await response.json()) as { response: { games?: OwnedGame[] } }).response.games ?? []
}

/** The achievements of one game, or null if it has none (Steam answers 400 for those). */
export async function achievements(key: string, steamId: string, appid: number, fetch: Fetch): Promise<Unlock[] | null> {
  const response = await fetch(`${API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${key}&steamid=${steamId}&appid=${appid}&l=english`)
  if (response.status === 400 || response.status === 403) return null
  if (!response.ok) throw new Error(`Steam GetPlayerAchievements ${appid} ${response.status}`)
  const body = (await response.json()) as { playerstats: { success: boolean; achievements?: Unlock[] } }
  return body.playerstats.success ? (body.playerstats.achievements ?? []) : null
}
