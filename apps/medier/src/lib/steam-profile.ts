/**
 * A Steam profile beyond its games (`steam.ts`): whether it is online and what it plays now (`GetPlayerSummaries`), its Steam level and badges (`GetBadges`, `GetSteamLevel`), and its own
 * numbers in one game (`GetUserStatsForGame`, named by the game's `GetSchemaForGame`). Pure, with a test.
 */

const API = "https://api.steampowered.com"

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string | null => (typeof value === "string" && value.trim() !== "" ? value.trim() : null)
const whole = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null)
const seconds = (value: unknown): number | null => {
  const number = whole(value)
  return number !== null && number > 0 ? number : null
}

export const playerSummariesUrl = (key: string, steamId: string): string => `${API}/ISteamUser/GetPlayerSummaries/v2/?key=${encodeURIComponent(key)}&steamids=${steamId}`
export const steamLevelUrl = (key: string, steamId: string): string => `${API}/IPlayerService/GetSteamLevel/v1/?key=${encodeURIComponent(key)}&steamid=${steamId}`
export const badgesUrl = (key: string, steamId: string): string => `${API}/IPlayerService/GetBadges/v1/?key=${encodeURIComponent(key)}&steamid=${steamId}`
export const userStatsUrl = (key: string, steamId: string, appId: number): string => `${API}/ISteamUserStats/GetUserStatsForGame/v2/?key=${encodeURIComponent(key)}&steamid=${steamId}&appid=${appId}`

/** Steam's `personastate`, by name. */
export type PersonaState = "offline" | "online" | "busy" | "away" | "snooze" | "trade" | "play"

const STATES: readonly PersonaState[] = ["offline", "online", "busy", "away", "snooze", "trade", "play"]
export const PERSONA_STATE_LABEL: Record<PersonaState, string> = { offline: "Frakoblet", online: "Pålogget", busy: "Opptatt", away: "Borte", snooze: "Sover", trade: "Vil bytte", play: "Vil spille" }

/** Whether a profile is online, and what it plays now. */
export interface SteamPresence {
  steamId: string
  /** Its name on Steam. */
  name: string
  /** Its picture, 184×184; `null` where it has none. */
  avatar: string | null
  /** The profile on Steam. */
  profile: string
  state: PersonaState
  /** The state in Norwegian («Pålogget»). */
  stateLabel: string
  /** Anything but offline. A private profile always says offline. */
  online: boolean
  /** The game it plays now; `appId` `null` for a game outside Steam (a shortcut), which has only its name. */
  playing: { appId: number | null; name: string } | null
  /** When it last went offline, in seconds since 1970; `null` where Steam does not say (a private profile). */
  lastLogoff: number | null
  /** Whether the profile is public (`communityvisibilitystate` 3): a private one tells only its name and picture. */
  public: boolean
}

/** The one profile of a `GetPlayerSummaries` answer; `null` where Steam has none by that id. */
export function parsePlayerSummary(answer: unknown, steamId: string): SteamPresence | null {
  const player = list(record(record(answer)["response"])["players"]).map(record).find((one) => one["steamid"] === steamId)
  if (player === undefined) return null
  const state = STATES[whole(player["personastate"]) ?? 0] ?? "offline"
  const gameName = text(player["gameextrainfo"])
  const gameId = typeof player["gameid"] === "string" && /^\d+$/.test(player["gameid"]) ? Number(player["gameid"]) : null
  // A game outside Steam has a 64-bit id far above any app's.
  const appId = gameId !== null && Number.isSafeInteger(gameId) && gameId < 2 ** 32 ? gameId : null
  return {
    steamId,
    name: text(player["personaname"]) ?? steamId,
    avatar: text(player["avatarfull"]) ?? text(player["avatarmedium"]) ?? text(player["avatar"]),
    profile: text(player["profileurl"]) ?? `https://steamcommunity.com/profiles/${steamId}/`,
    state,
    stateLabel: PERSONA_STATE_LABEL[state],
    online: state !== "offline",
    playing: gameName === null ? null : { appId, name: gameName },
    lastLogoff: seconds(player["lastlogoff"]),
    public: player["communityvisibilitystate"] === 3,
  }
}

/**
 * Steam's own badges (those not of a game), by `badgeid`, in Norwegian as Steam names them. Where a badge's name changes with its level (13, the games owned; 29, Salien) the name of the badge
 * itself. A badge not here has no name.
 */
export const COMMUNITY_BADGES: Readonly<Record<number, string>> = {
  1: "År i tjeneste",
  2: "Samfunnsleder",
  3: "Potetsekken",
  4: "Steams store skattejakt",
  5: "Steams sommerleir",
  6: "Steams høytidssalg 2011",
  7: "Steams sommersalg 2012",
  8: "Steams høytidssalg 2012",
  13: "Spillsamler",
  14: "Samlekort-betatester",
  25: "Steam-prisens nominasjonskomité 2016",
  26: "Klistremerkesamler",
  27: "Steam-prisens nominasjonskomité 2017",
  28: "Vårrengjøringen 2018",
  29: "Salien",
  31: "Steam-prisens nominasjonskomité 2018",
  33: "Vinter 2018",
  36: "Vårrengjøringen 2019",
  37: "Steam Grand Prix 2019",
  38: "Steam Grand Prix 2019 – lag Hare",
  43: "Steam-prisens nominasjonskomité 2019",
  44: "Vintermerket 2019",
  45: "Steamvik-merket 2019",
  47: "Vårrengjøringen 2020",
  48: "Samfunnets bidragsmerke",
  49: "Samfunnets godhetsmerke",
  50: "Steam-prisens nominasjonskomité 2020",
  53: "Vitenskapsgorillaen",
  56: "Steam-prisens nominasjonskomité 2021",
  57: "Steam-prisens nominasjonskomité 2021 – klassisk utgave",
  59: "Steams racingfestival 2022",
  60: "Steams førslippfestival 2022 – juni",
  61: "Clorthax' paradoksmerke",
  62: "Steams førslippfestival 2022 – oktober",
  63: "Steam-prisens nominasjonskomité 2022",
  64: "Steam-revyen 2022",
  65: "Steam-prisens nominasjonskomité 2023",
  66: "Steam-revyen 2023",
  67: "Steam-prisens nominasjonskomité 2024",
  68: "Steam-revyen 2024",
  69: "Steam-revyen 2025",
  70: "Steam-prisens nominasjonskomité 2025",
}

export interface SteamBadge {
  badgeId: number
  /** The game of a game's badge (its trading cards); `null` for one of Steam's own. */
  appId: number | null
  /** The game's name for a game's badge (where the owned list knows it), Steam's name for one of its own; `null` where neither is known. */
  name: string | null
  level: number
  /** When it was earned (its present level), in seconds since 1970; `null` where Steam does not say. */
  completed: number | null
  xp: number
  /** How many have it; `null` where Steam does not say. */
  scarcity: number | null
  /** A foil game badge. */
  foil: boolean
}

/** A profile's Steam level and badges, the last earned first. */
export interface SteamBadges {
  level: number
  /** The experience in all. */
  xp: number
  /** The experience still needed for the next level. */
  xpToNext: number
  /** The experience the present level began at. */
  xpLevelStart: number
  badges: SteamBadge[]
}

/** The level alone (`GetSteamLevel`), for a profile whose badges Steam does not tell; `null` where it does not tell that either. */
export const parseSteamLevel = (answer: unknown): number | null => whole(record(record(answer)["response"])["player_level"])

/** The level and the badges (`GetBadges`), the badges of games named by `names` (app id to name; the owned list's); `null` where the profile does not tell (it is private). */
export function parseBadges(answer: unknown, names: ReadonlyMap<number, string> = new Map()): SteamBadges | null {
  const response = record(record(answer)["response"])
  const level = whole(response["player_level"])
  if (level === null) return null
  const badges = list(response["badges"]).map(record).flatMap((one): SteamBadge[] => {
    const badgeId = whole(one["badgeid"])
    if (badgeId === null) return []
    const appId = whole(one["appid"])
    const name = appId === null ? (COMMUNITY_BADGES[badgeId] ?? null) : (names.get(appId) ?? null)
    return [{ badgeId, appId, name, level: whole(one["level"]) ?? 0, completed: seconds(one["completion_time"]), xp: whole(one["xp"]) ?? 0, scarcity: seconds(one["scarcity"]), foil: one["border_color"] === 1 }]
  })
  return {
    level,
    xp: whole(response["player_xp"]) ?? 0,
    xpToNext: whole(response["player_xp_needed_to_level_up"]) ?? 0,
    xpLevelStart: whole(response["player_xp_needed_current_level"]) ?? 0,
    badges: badges.sort((a, b) => (b.completed ?? 0) - (a.completed ?? 0)),
  }
}

/** One of a profile's numbers in a game. */
export interface GameStat {
  key: string
  /** The game's own name of it (`displayName`), or the name of the achievement it counts towards. */
  label: string
  value: number
}

/** What a game puts after an achievement's key to name the number that counts towards it (`LikeAShadow_stat`, `KILLS_PROGRESS`). */
const COUNTER = /[_\s-]?(stat|stats|progress|count|counter)$/i

/**
 * A profile's numbers in a game (`GetUserStatsForGame`), named by the game's list of them (`GetSchemaForGame`'s `stats`, the same answer the achievements are named by), in the schema's order.
 * Many games give a number no name: it is a counter of their own, often towards an achievement, and is named by that achievement where its key is the achievement's with `_stat` or the like
 * after it, and left out where nothing names it (a key such as `LikeAShadow_stat` says nothing to a reader). Empty where the game keeps none, or the profile's are not public.
 */
export function parseUserStats(player: unknown, schema: unknown): GameStat[] {
  const own = list(record(record(player)["playerstats"])["stats"]).map(record)
  if (own.length === 0) return []
  const game = record(record(record(schema)["game"])["availableGameStats"])
  const known = list(game["stats"]).map(record)
  const order = new Map(known.map((one, at) => [one["name"], at] as const))
  const labels = new Map(known.map((one) => [one["name"], text(one["displayName"])] as const))
  const achievements = new Map(list(game["achievements"]).map(record).map((one) => [String(one["name"]).toLowerCase(), text(one["displayName"])] as const))
  const named = (key: string): string | null => {
    const label = labels.get(key) ?? null
    if (label !== null && label !== key) return label
    const towards = achievements.get(key.toLowerCase()) ?? achievements.get(key.replace(COUNTER, "").toLowerCase()) ?? null
    return towards === null ? null : `Fremdrift mot «${towards}»`
  }
  return own
    .flatMap((one): GameStat[] => {
      const key = text(one["name"])
      const value = typeof one["value"] === "number" && Number.isFinite(one["value"]) ? one["value"] : null
      const label = key === null ? null : named(key)
      return key === null || value === null || label === null ? [] : [{ key, label, value }]
    })
    .sort((a, b) => (order.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.key) ?? Number.MAX_SAFE_INTEGER))
}
