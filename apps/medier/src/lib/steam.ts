/**
 * Games from Steam's Web API (https://steamcommunity.com/dev): what a profile has played the last two weeks and what it has played most of all, with the time in hours. A profile is found by
 * its SteamID (17 digits) or the custom name in its address (`steamcommunity.com/id/<name>`, resolved with `ResolveVanityURL`). Its game details must be public, else Steam answers with none.
 * The pictures are Steam's own header images (460×215) from its CDN. Pure, with a test.
 */

const API = "https://api.steampowered.com"

/** A SteamID64: what a profile is asked by, and what a custom name is resolved to. */
export const isSteamId = (value: string): boolean => /^7656\d{13}$/.test(value)

export const vanityUrl = (key: string, name: string): string => `${API}/ISteamUser/ResolveVanityURL/v1/?key=${encodeURIComponent(key)}&vanityurl=${encodeURIComponent(name)}`
export const recentGamesUrl = (key: string, steamId: string): string => `${API}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${encodeURIComponent(key)}&steamid=${steamId}&count=20`
export const ownedGamesUrl = (key: string, steamId: string): string => `${API}/IPlayerService/GetOwnedGames/v1/?key=${encodeURIComponent(key)}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`

export interface Game {
  appId: number
  name: string
  /** Minutes played the last two weeks (0 in the owned list, which does not say). */
  recentMinutes: number
  /** Minutes played in all. */
  totalMinutes: number
  /** Steam's header image, 460×215. */
  image: string
  /** The game in Steam's store. */
  url: string
}

/** A profile's games: the ones played the last two weeks, most played first, and the most played of all. */
export interface Games {
  recent: Game[]
  most: Game[]
  /** How many games the profile has; `null` where its list is not public. */
  owned: number | null
  /** The profile on Steam. */
  profile: string
}

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const count = (value: unknown): number => (typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : 0)

export const headerImage = (appId: number): string => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`
export const storeUrl = (appId: number): string => `https://store.steampowered.com/app/${appId}/`
export const profileUrl = (steamId: string): string => `https://steamcommunity.com/profiles/${steamId}/`

/** The SteamID a custom name resolves to; `null` where Steam knows no such name. */
export function parseVanity(answer: unknown): string | null {
  const response = record(record(answer)["response"])
  const id = response["steamid"]
  return response["success"] === 1 && typeof id === "string" && isSteamId(id) ? id : null
}

function games(answer: unknown): Game[] {
  return list(record(record(answer)["response"])["games"]).flatMap((value) => {
    const one = record(value)
    const appId = one["appid"]
    const name = typeof one["name"] === "string" ? one["name"].trim() : ""
    if (typeof appId !== "number" || !Number.isInteger(appId) || name === "") return []
    return [{ appId, name, recentMinutes: count(one["playtime_2weeks"]), totalMinutes: count(one["playtime_forever"]), image: headerImage(appId), url: storeUrl(appId) }]
  })
}

/** The games of the last two weeks, most played first. */
export const parseRecentGames = (answer: unknown): Game[] => games(answer).sort((a, b) => b.recentMinutes - a.recentMinutes)

/** The games a profile has played most of all (only the ones played), and how many it has; `null` games where the list is not public (Steam answers an empty `response`). */
export function parseOwnedGames(answer: unknown, limit = 10): { most: Game[]; owned: number } | null {
  const response = record(record(answer)["response"])
  if (typeof response["game_count"] !== "number") return null
  const most = games(answer)
    .filter((game) => game.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, limit)
    .map((game) => ({ ...game, recentMinutes: 0 }))
  return { most, owned: response["game_count"] }
}

const HOURS = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 })

/** Time played, in Norwegian: «45 min» under an hour, «3,5 t» from one, «1 204 t» for a lot. */
export function playtimeText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  return `${HOURS.format(minutes < 600 ? Math.round(minutes / 6) / 10 : Math.round(minutes / 60))} t`
}

/** Steam's tall library picture of a game (600×900), the box on its page. */
export const libraryImage = (appId: number): string => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`
/** The store's own page of a game, in Norwegian with Norwegian prices: no key. */
export const storeDetailsUrl = (appId: number): string => `https://store.steampowered.com/api/appdetails?appids=${appId}&l=norwegian&cc=no`
export const achievementsUrl = (key: string, steamId: string, appId: number): string => `${API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${encodeURIComponent(key)}&steamid=${steamId}&appid=${appId}&l=norwegian`
export const schemaUrl = (key: string, appId: number): string => `${API}/ISteamUserStats/GetSchemaForGame/v2/?key=${encodeURIComponent(key)}&appid=${appId}&l=norwegian`
export const globalAchievementsUrl = (appId: number): string => `${API}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${appId}`

/** A game the profile has, as its page tells it: the time in all, on which machines, and when it was last played. */
export interface OwnedGame {
  appId: number
  name: string
  totalMinutes: number
  /** When it was last played, in seconds since 1970; `null` where Steam does not say. */
  lastPlayed: number | null
  /** The time in all on each kind of machine that has any, most first. */
  platforms: { label: string; minutes: number }[]
}

const PLATFORMS = [["playtime_windows_forever", "Windows"], ["playtime_mac_forever", "Mac"], ["playtime_linux_forever", "Linux"], ["playtime_deck_forever", "Steam Deck"]] as const

/** A game of the owned list as its page tells it; `null` where it has no name. */
function ownedGame(one: Record<string, unknown>): OwnedGame | null {
  const appId = one["appid"]
  const name = typeof one["name"] === "string" ? one["name"].trim() : ""
  if (typeof appId !== "number" || !Number.isInteger(appId) || name === "") return null
  const last = count(one["rtime_last_played"])
  // Steam counts a Deck's time under Linux too: Linux is only what was not on the Deck.
  const deck = count(one["playtime_deck_forever"])
  const platforms = PLATFORMS.map(([field, label]) => ({ label, minutes: field === "playtime_linux_forever" ? Math.max(0, count(one[field]) - deck) : count(one[field]) }))
    .filter((platform) => platform.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
  return { appId, name, totalMinutes: count(one["playtime_forever"]), lastPlayed: last === 0 ? null : last, platforms }
}

/** One game from the owned list, by its app id; `null` where the profile does not have it, or its list is not public. */
export function parseOwnedGame(answer: unknown, appId: number): OwnedGame | null {
  const one = list(record(record(answer)["response"])["games"]).map(record).find((game) => game["appid"] === appId)
  return one === undefined ? null : ownedGame(one)
}

/** Every game of the owned list, in Steam's order; empty where the list is not public. */
export const parseOwnedList = (answer: unknown): OwnedGame[] => list(record(record(answer)["response"])["games"]).map(record).flatMap((one) => ownedGame(one) ?? [])

/** The games of the owned list played since `since` (seconds), last played first. */
export function parsePlayedSince(answer: unknown, since: number): OwnedGame[] {
  return list(record(record(answer)["response"])["games"])
    .map(record)
    .flatMap((one) => {
      const game = ownedGame(one)
      return game === null || game.lastPlayed === null || game.lastPlayed < since ? [] : [game]
    })
    .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0))
}

/** What the store says of a game. */
export interface StoreGame {
  description: string | null
  developers: string[]
  publishers: string[]
  /** As the store writes it («23. feb. 2022»). */
  released: string | null
  genres: string[]
  metacritic: { score: number; url: string } | null
  /** «Gratis», or the price in Norway as the store writes it. */
  price: string | null
}

const strings = (value: unknown): string[] => list(value).filter((one): one is string => typeof one === "string" && one.trim() !== "").map((one) => one.trim())
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" }
/** The store's descriptions are HTML: the text of it. */
export const plainText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#?\w+);/g, (whole, name: string) => ENTITIES[name] ?? (name.startsWith("#") ? String.fromCodePoint(Number(name.slice(1))) : whole))
    .replace(/\s+/g, " ")
    .trim()

/** The store's answer for one game; `null` where it has no page for it (a game taken off the store). */
export function parseStoreDetails(answer: unknown, appId: number): StoreGame | null {
  const entry = record(record(answer)[String(appId)])
  if (entry["success"] !== true) return null
  const data = record(entry["data"])
  const description = typeof data["short_description"] === "string" ? plainText(data["short_description"]) : ""
  const release = record(data["release_date"])
  const date = typeof release["date"] === "string" ? release["date"].trim() : ""
  const critic = record(data["metacritic"])
  const price = record(data["price_overview"])
  return {
    description: description === "" ? null : description,
    developers: strings(data["developers"]),
    publishers: strings(data["publishers"]),
    released: date === "" ? null : date,
    genres: list(data["genres"]).flatMap((genre) => { const text = record(genre)["description"]; return typeof text === "string" && text !== "" ? [text] : [] }),
    metacritic: typeof critic["score"] === "number" && typeof critic["url"] === "string" ? { score: critic["score"], url: critic["url"] } : null,
    price: data["is_free"] === true ? "Gratis" : typeof price["final_formatted"] === "string" && price["final_formatted"] !== "" ? price["final_formatted"] : null,
  }
}

export interface Achievement {
  key: string
  name: string
  description: string | null
  /** Its picture, coloured where it is unlocked; `null` where the game's list has none. */
  icon: string | null
  /** When it was unlocked, in seconds since 1970; `null` where it is not. */
  unlocked: number | null
  /** The share of all players who have it, in per cent; `null` where Steam does not say. */
  percent: number | null
}

/** A profile's achievements in one game: how many of how many, and each, the unlocked last first. */
export interface Achievements {
  total: number
  unlocked: number
  list: Achievement[]
}

const percentOf = (value: unknown): number | null => {
  const number = typeof value === "string" ? Number(value) : value
  return typeof number === "number" && Number.isFinite(number) ? number : null
}

/**
 * The achievements of a game, from the profile's own (`GetPlayerAchievements`), the game's list of them with names and pictures (`GetSchemaForGame`), and the share of all
 * players who have each (`GetGlobalAchievementPercentagesForApp`). `null` where the game has none, or the profile's are not public. A hidden one not yet unlocked keeps its name hidden.
 */
export function parseAchievements(player: unknown, schema: unknown, global: unknown): Achievements | null {
  const own = list(record(record(player)["playerstats"])["achievements"]).map(record)
  if (own.length === 0) return null
  const known = new Map(list(record(record(record(schema)["game"])["availableGameStats"])["achievements"]).map(record).map((one) => [one["name"], one] as const))
  const shares = new Map(list(record(record(global)["achievementpercentages"])["achievements"]).map(record).map((one) => [one["name"], percentOf(one["percent"])] as const))
  const achievements = own.flatMap((one): Achievement[] => {
    const key = one["apiname"]
    if (typeof key !== "string") return []
    const info = known.get(key) ?? {}
    const unlocked = one["achieved"] === 1 ? count(one["unlocktime"]) || null : null
    const hidden = info["hidden"] === 1 && unlocked === null
    const name = [one["name"], info["displayName"]].find((text): text is string => typeof text === "string" && text.trim() !== "") ?? key
    const description = hidden ? null : ([one["description"], info["description"]].find((text): text is string => typeof text === "string" && text.trim() !== "") ?? null)
    const icon = unlocked === null ? info["icongray"] : info["icon"]
    return [{ key, name: hidden ? "Skjult prestasjon" : name, description, icon: typeof icon === "string" && icon !== "" ? icon : null, unlocked, percent: shares.get(key) ?? null }]
  })
  const done = achievements.filter((one) => one.unlocked !== null).length
  return { total: achievements.length, unlocked: done, list: achievements.sort((a, b) => (b.unlocked ?? 0) - (a.unlocked ?? 0)) }
}

/** A game played lately, with the visitor's achievements in it (`null` where it has none, or they are not public). */
export interface PlayedGame {
  game: OwnedGame
  achievements: Achievements | null
}

/** An achievement unlocked, with the game it is in. */
export interface Unlock {
  game: OwnedGame
  achievement: Achievement & { unlocked: number }
}

/** The achievements unlocked in the games, newest first; with `start` and `end` (seconds, half open), only those unlocked then. */
export function unlocksOf(played: readonly PlayedGame[], start = 0, end = Number.POSITIVE_INFINITY): Unlock[] {
  return played
    .flatMap(({ game, achievements }) => (achievements?.list ?? []).flatMap((achievement) => (achievement.unlocked !== null && achievement.unlocked >= start && achievement.unlocked < end ? [{ game, achievement: { ...achievement, unlocked: achievement.unlocked } }] : [])))
    .sort((a, b) => b.achievement.unlocked - a.achievement.unlocked)
}

/** What a week or a month of games was: each game played then (last played in it, or an achievement unlocked in it), most unlocked first, and the achievements unlocked, per day too. */
export interface GamePeriod {
  games: { game: OwnedGame; unlocked: number; lastPlayedHere: boolean }[]
  unlocks: Unlock[]
  /** The achievements unlocked on each date in Oslo, `YYYY-MM-DD`. */
  byDate: Record<string, number>
}

/** A period of the games, from `start` to `end` (seconds, half open); `dateOf` is the calendar date of a moment (in seconds). */
export function gamePeriod(played: readonly PlayedGame[], start: number, end: number, dateOf: (seconds: number) => string): GamePeriod {
  const unlocks = unlocksOf(played, start, end)
  const byDate: Record<string, number> = {}
  for (const unlock of unlocks) {
    const date = dateOf(unlock.achievement.unlocked)
    byDate[date] = (byDate[date] ?? 0) + 1
  }
  const games = played
    .map(({ game }) => ({ game, unlocked: unlocks.filter((unlock) => unlock.game.appId === game.appId).length, lastPlayedHere: game.lastPlayed !== null && game.lastPlayed >= start && game.lastPlayed < end }))
    .filter((one) => one.unlocked > 0 || one.lastPlayedHere)
    .sort((a, b) => b.unlocked - a.unlocked || (b.game.lastPlayed ?? 0) - (a.game.lastPlayed ?? 0))
  return { games, unlocks, byDate }
}
