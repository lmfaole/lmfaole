/**
 * One shape for the games of every source (Steam, RetroAchievements), so «Spill» is one list and one kind of page whichever service a game was played through: the rows of
 * «Nylig spilt» and «Mest spilt» (`GameEntry`), and a game's page (`GameView`). The sources' own parsers are in `steam.ts` and `retroachievements.ts`. Pure, with a test.
 */

import { type RetroCase, retroCase, type RetroGame, type RetroGameDetail, retroGamePage } from "./retroachievements.ts"
import { type Achievements, headerImage, libraryImage, type OwnedGame, type StoreGame, storeUrl } from "./steam.ts"

export type GameSource = "steam" | "retro"

/** A game in a list: where it was played, how long, and when last. */
export interface GameEntry {
  source: GameSource
  /** The source's own id: Steam's app id, RetroAchievements' game id. */
  id: number
  title: string
  /** A wide picture for a row: Steam's header, a retro game's title screen. */
  picture: string | null
  /** Where it was played most: «Windows», «Steam Deck», or the console («Game Boy Advance»). */
  platform: string
  totalMinutes: number
  /** Minutes the last two weeks, where the source says (Steam); 0 where it does not. */
  recentMinutes: number
  /** In seconds since 1970; `null` where the source does not say. */
  lastPlayed: number | null
}

/** Steam calls a computer by its system; a game never played says none. */
const steamPlatform = (game: Pick<OwnedGame, "platforms">): string => game.platforms[0]?.label ?? "PC"

/** A game of Steam's owned list, with its minutes of the last two weeks (from the list of those). */
export const steamEntry = (game: OwnedGame, recentMinutes = 0): GameEntry => ({ source: "steam", id: game.appId, title: game.name, picture: headerImage(game.appId), platform: steamPlatform(game), totalMinutes: game.totalMinutes, recentMinutes, lastPlayed: game.lastPlayed })

/** A game of RetroAchievements' recent list, with its minutes (which only the game's own answer has). */
export const retroEntry = (game: RetroGame, minutes = 0): GameEntry => ({ source: "retro", id: game.gameId, title: game.title, picture: game.image, platform: game.console || "Retrospill", totalMinutes: minutes, recentMinutes: 0, lastPlayed: game.lastPlayed })

const TWO_WEEKS = 14 * 24 * 3600

/** The games played the last two weeks (`now` in seconds) from every source, the last played first; one without a time but with minutes this fortnight after them. */
export function recentGames(entries: readonly GameEntry[], now: number, limit = 10): GameEntry[] {
  return entries
    .filter((entry) => (entry.lastPlayed !== null && entry.lastPlayed >= now - TWO_WEEKS) || entry.recentMinutes > 0)
    .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0) || b.recentMinutes - a.recentMinutes)
    .slice(0, limit)
}

/** The games played most of all from every source, by the minutes; one with none counted is left out. */
export function mostPlayed(entries: readonly GameEntry[], limit = 10): GameEntry[] {
  return entries
    .filter((entry) => entry.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, limit)
}

/** A game's page, the same whichever service it was played through. */
export interface GameView {
  source: GameSource
  title: string
  /** Where it was played (the console, or Steam's machine), and the year it came out. */
  kind: string
  /** The box, tall, for the head. */
  cover: { src: string; width: number } | null
  /** The case the box is held in, in the head: the console's own, a game card for a Steam Deck, else a DVD's (`undefined`). */
  held: Exclude<RetroCase, "dvd"> | undefined
  platform: string
  developer: string | null
  publisher: string | null
  /** When it came out, as the page writes it: an ISO day («1991-06-11»), or the store's own words («23. feb. 2022»). */
  released: string | null
  genres: string[]
  description: { text: string; from: string } | null
  totalMinutes: number
  recentMinutes: number
  lastPlayed: number | null
  /** The time on each kind of machine, where more than one has any (Steam). */
  platforms: { label: string; minutes: number }[]
  achievements: Achievements | null
  points: { got: number; of: number } | null
  /** The highest award the visitor has for it, in words («Mestret»). */
  award: string | null
  /** How many have played it on the service, where it says. */
  players: number | null
  metacritic: { score: number; url: string } | null
  price: string | null
  /** The game on its service. */
  link: { href: string; label: string }
}

const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"]
const MONTHS_EN = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

/** The store's day out («17. sep. 2020», «17 Sep, 2020») as an ISO day, so it is written as RetroAchievements' is; the store's words where they are not a day («Kommer snart», «2025»). */
export function storeDay(written: string | null): string | null {
  if (written === null) return null
  const match = /^(\d{1,2})\.?\s+([a-zæøå]{3})[a-zæøå]*\.?,?\s+(\d{4})$/i.exec(written.trim())
  const name = match?.[2]?.toLowerCase() ?? ""
  const month = Math.max(MONTHS.indexOf(name), MONTHS_EN.indexOf(name))
  if (match === null || month < 0) return written
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${(match[1] ?? "").padStart(2, "0")}`
}

const yearOf = (released: string | null): string | undefined => released?.match(/\d{4}/)?.[0]
const kindOf = (platform: string, released: string | null): string => [platform, yearOf(released)].filter(Boolean).join(" · ")

/** A Steam game's page: the visitor's time with it, the store's words of it, and their achievements. */
export function steamView({ game, recentMinutes, store, achievements }: { game: OwnedGame; recentMinutes: number; store: StoreGame | null; achievements: Achievements | null }): GameView {
  const platform = steamPlatform(game)
  const developer = store === null || store.developers.length === 0 ? null : store.developers.join(", ")
  const publishers = store === null ? [] : store.publishers.filter((one) => !store.developers.includes(one))
  const released = storeDay(store?.released ?? null)
  return {
    source: "steam",
    title: game.name,
    kind: kindOf(platform, released),
    cover: { src: libraryImage(game.appId), width: 600 },
    held: platform === "Steam Deck" ? "cartridge" : undefined,
    platform,
    developer,
    publisher: publishers.length === 0 ? null : publishers.join(", "),
    released,
    genres: store?.genres ?? [],
    description: store?.description == null ? null : { text: store.description, from: "Steam-butikken" },
    totalMinutes: game.totalMinutes,
    recentMinutes,
    lastPlayed: game.lastPlayed,
    platforms: game.platforms.length < 2 ? [] : game.platforms,
    achievements: achievements === null || achievements.total === 0 ? null : achievements,
    points: null,
    award: null,
    players: null,
    metacritic: store?.metacritic ?? null,
    price: store?.price ?? null,
    link: { href: storeUrl(game.appId), label: "Åpne i Steam-butikken" },
  }
}

/** A retro game's page: the visitor's time with it and their achievements and points, from RetroAchievements; `lastPlayed` from its recent list. */
export function retroView(game: RetroGameDetail, lastPlayed: number | null): GameView {
  const held = retroCase(game.consoleId)
  const platform = game.console || "Retrospill"
  return {
    source: "retro",
    title: game.title,
    kind: kindOf(platform, game.released),
    cover: game.boxArt === null ? null : { src: game.boxArt, width: 400 },
    held: held === "dvd" ? undefined : held,
    platform,
    developer: game.developer,
    publisher: game.publisher === game.developer ? null : game.publisher,
    released: game.released,
    genres: game.genres,
    description: null,
    totalMinutes: game.minutes,
    recentMinutes: 0,
    lastPlayed,
    platforms: [],
    achievements: game.achievements.total === 0 ? null : game.achievements,
    points: game.possiblePoints === 0 ? null : { got: game.points, of: game.possiblePoints },
    award: game.award,
    players: game.players === 0 ? null : game.players,
    metacritic: null,
    price: null,
    link: { href: retroGamePage(game.gameId), label: "Åpne på RetroAchievements" },
  }
}
