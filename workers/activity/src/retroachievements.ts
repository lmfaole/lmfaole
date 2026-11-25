/** RetroAchievements' Web API: recently played games, the profile's rich presence and unlocks in a period. */

import type { Fetch } from "./listenbrainz.ts"

const API = "https://retroachievements.org/API"

export interface RecentGame {
  GameID: number
  Title: string
  ConsoleName: string
  LastPlayed: string
  NumPossibleAchievements: number
  NumAchieved: number
  NumAchievedHardcore: number
}

export interface Profile {
  LastGameID: number
  RichPresenceMsg: string
}

export interface Earned {
  AchievementID: number
  GameID: number
  Title: string
  Description: string
  Points: number
  HardcoreMode: number
  Date: string
}

/** RetroAchievements writes UTC as `2026-11-23 09:46:34`. */
export const utc = (value: string): number => Date.parse(`${value.replace(" ", "T")}Z`) / 1000

async function ask<T>(endpoint: string, query: Record<string, string>, fetch: Fetch): Promise<T> {
  const response = await fetch(`${API}/${endpoint}.php?${new URLSearchParams(query)}`)
  if (!response.ok) throw new Error(`RetroAchievements ${endpoint} ${response.status}`)
  return (await response.json()) as T
}

export const recentGames = (user: string, key: string, fetch: Fetch) => ask<RecentGame[]>("API_GetUserRecentlyPlayedGames", { u: user, y: key, c: "50" }, fetch)
export const profile = (user: string, key: string, fetch: Fetch) => ask<Profile>("API_GetUserProfile", { u: user, y: key }, fetch)
export const earnedBetween = (user: string, key: string, from: number, to: number, fetch: Fetch) =>
  ask<Earned[]>("API_GetAchievementsEarnedBetween", { u: user, y: key, f: String(from), t: String(to) }, fetch)
