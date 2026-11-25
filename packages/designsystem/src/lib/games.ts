import type { IconName } from "./icons"

/**
 * The words of a game's store page, the same in every app: what its reviews add up to, its price and its sale, whether it runs on a
 * Steam Deck, what kind of play it has, its player's presence and level, and its stats. Pure: the components (`gameFacts`, `List` `price`
 * and `news`, `DetailHeader presence`) draw them, and an app that needs the words alone (a row's meta) calls them here.
 */

const NBSP = "\u00a0"

/** A number as it is read in Norwegian, grouped in threes («12 345»). */
export const countWords = (value: number): string => value.toLocaleString("nb-NO")

/** What the reviews of a game add up to, in Steam's own steps. */
export type ReviewSentiment = "positive" | "mixed" | "negative" | "few"

export interface ReviewSummary {
  /** Steam's step in Norwegian: «Svært positive», «Blandede», «Overveldende negative»; «For få anmeldelser» under ten. */
  label: string
  /** The share that recommends it, a whole percent. */
  percent: number
  total: number
  sentiment: ReviewSentiment
  /** All of it in a line: «Svært positive · 94 % av 12 345». */
  words: string
}

/**
 * Steam's summary of the reviews of a game from how many recommend it of how many: 95 % or more of 500 or more is «Overveldende positive»,
 * 80 % of 50 «Svært positive», 80 % «Positive», 70 % «Stort sett positive», 40 % «Blandede», 20 % «Stort sett negative», and under that
 * «Negative», «Svært negative» (50) or «Overveldende negative» (500). Under ten reviews say too little to sum up. `null` for none.
 */
export function reviewSummary(positive: number, total: number): ReviewSummary | null {
  if (!(total > 0) || positive < 0) return null
  const share = Math.min(positive, total) / total
  const percent = Math.round(share * 100)
  const of = `${percent}${NBSP}% av ${countWords(total)}`
  if (total < 10) return { label: "For få anmeldelser", percent, total, sentiment: "few", words: `${total === 1 ? "1 anmeldelse" : `${total} anmeldelser`}` }
  const label =
    share >= 0.95 && total >= 500 ? "Overveldende positive"
    : share >= 0.8 && total >= 50 ? "Svært positive"
    : share >= 0.8 ? "Positive"
    : share >= 0.7 ? "Stort sett positive"
    : share >= 0.4 ? "Blandede"
    : share >= 0.2 ? "Stort sett negative"
    : total >= 500 ? "Overveldende negative"
    : total >= 50 ? "Svært negative"
    : "Negative"
  const sentiment: ReviewSentiment = share >= 0.7 ? "positive" : share >= 0.4 ? "mixed" : "negative"
  return { label, percent, total, sentiment, words: `${label} · ${of}` }
}

/** The icon of a sentiment: a thumb up or down, scales for mixed, and nothing for too few. */
export const SENTIMENT_ICONS: Readonly<Record<ReviewSentiment, IconName>> = { positive: "rating-positive", mixed: "rating-mixed", negative: "rating-negative", few: "comment" }

/**
 * A price as a store gives it: in the currency's smallest unit (øre for NOK), as Steam's `price_overview` (`final`, `initial`). `initial`
 * above `final` is a sale; `free` a game that costs nothing.
 */
export interface GamePrice {
  final: number
  initial?: number
  /** ISO 4217, `NOK` by default. */
  currency?: string
  free?: boolean
}

export interface PriceWords {
  /** What it costs now: «299 kr», «Gratis». */
  now: string
  /** What it cost before the sale: «499 kr»; `null` without a sale. */
  before: string | null
  /** The sale as a whole percent off (40), `null` without one. */
  discount: number | null
  /** The sale as it is shown: «−40 %» (a real minus). */
  discountWords: string | null
  /** All of it, for a screen reader: «299 kr, før 499 kr, 40 % rabatt». */
  words: string
}

const money = (minor: number, currency: string): string => {
  const whole = minor % 100 === 0
  return (minor / 100).toLocaleString("nb-NO", { style: "currency", currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })
}

/** A price in words: «299 kr», with what it cost before and the sale where there is one (Steam's own percent can be off by one; this is worked out from the prices). */
export function priceWords(price: GamePrice): PriceWords {
  if (price.free === true || (price.final === 0 && (price.initial ?? 0) === 0)) return { now: "Gratis", before: null, discount: null, discountWords: null, words: "Gratis" }
  const currency = price.currency ?? "NOK"
  const now = money(price.final, currency)
  const initial = price.initial ?? price.final
  if (!(initial > price.final)) return { now, before: null, discount: null, discountWords: null, words: now }
  const before = money(initial, currency)
  const discount = Math.round((1 - price.final / initial) * 100)
  return { now, before, discount, discountWords: `\u2212${discount}${NBSP}%`, words: `${now}, før ${before}, ${discount}${NBSP}% rabatt` }
}

/** Whether a price is on sale now. */
export const onSale = (price: GamePrice | null | undefined): boolean => price !== null && price !== undefined && price.free !== true && (price.initial ?? price.final) > price.final

/**
 * The games that have come on sale since the reader last looked: the keys on sale now that are not among those seen then (the app keeps
 * the keys it showed in its `seen` cookie). The first visit has nothing to compare with, so nothing is new. In the order given.
 */
export function newSales<Key extends string | number>(onSaleNow: readonly Key[], seen: readonly Key[] | null): Key[] {
  if (seen === null) return []
  const before = new Set(seen)
  return onSaleNow.filter((key) => !before.has(key))
}

/** How well a game runs on a Steam Deck, by Valve's test. */
export type DeckCompatibility = "verified" | "playable" | "unsupported" | "unknown"

/** Valve's `resolved_category` (3 verified, 2 playable, 1 unsupported, else unknown) as a `DeckCompatibility`. */
export const deckCompatibility = (category: number | null | undefined): DeckCompatibility => (category === 3 ? "verified" : category === 2 ? "playable" : category === 1 ? "unsupported" : "unknown")

const DECK: Readonly<Record<DeckCompatibility, { word: string; icon: IconName; tone: "default" | "muted" }>> = {
  verified: { word: "Verifisert", icon: "success", tone: "default" },
  playable: { word: "Spillbar", icon: "warning", tone: "default" },
  unsupported: { word: "Ikke støttet", icon: "failure", tone: "default" },
  unknown: { word: "Ukjent", icon: "unknown", tone: "muted" },
}

/** The Deck's verdict in a word («Verifisert», «Spillbar», «Ikke støttet», «Ukjent») with its icon. */
export const deckWords = (deck: DeckCompatibility): { word: string; icon: IconName; tone: "default" | "muted" } => DECK[deck]

/** The Deck's verdict as a status of a row (`List` `status`, `StatusLine`): «Steam Deck: Verifisert». Never `destructive`: it stops nothing. */
export function deckStatus(deck: DeckCompatibility): { text: string; icon: IconName; tone: "default" | "muted" } {
  const { word, icon, tone } = DECK[deck]
  return { text: `Steam Deck: ${word}`, icon, tone }
}

/** Steam's store categories that say how a game is played: who with, and with what. */
const PLAY: readonly (readonly [number, string])[] = [
  [2, "Enspiller"],
  [1, "Flerspiller"],
  [36, "Flerspiller på nett"],
  [37, "Delt skjerm"],
  [49, "Spiller mot spiller"],
  [9, "Samarbeid"],
  [38, "Samarbeid på nett"],
  [39, "Samarbeid på delt skjerm"],
  [27, "På tvers av plattformer"],
]

/** A general word that a more exact one makes needless: «Flerspiller» beside «Flerspiller på nett». */
const COVERED: Readonly<Record<number, readonly number[]>> = { 1: [36, 37, 49, 9, 38, 39], 9: [38, 39], 37: [39], 24: [37, 39] }

export interface GameFeatures {
  /** How it is played, in a fixed order: «Enspiller», «Samarbeid på nett» … */
  players: string[]
  /** How well it is played with a controller: «Full støtte» (28), «Delvis støtte» (18), or `null` where the store does not say. */
  controller: string | null
}

/** What Steam's store categories (`categories[].id`) say about how a game is played. */
export function gameFeatures(categories: readonly number[]): GameFeatures {
  const has = new Set(categories.includes(24) ? [...categories, 37] : categories)
  const players = PLAY.filter(([id]) => has.has(id) && !(COVERED[id] ?? []).some((exact) => has.has(exact))).map(([, word]) => word)
  return { players, controller: has.has(28) ? "Full støtte" : has.has(18) ? "Delvis støtte" : null }
}

/** Where a player is: in a game, or on Steam in some state. */
export type Presence =
  | { state: "in-game"; game: string; /** The game's page in the app. */ href?: string }
  | { state: "online" | "busy" | "away" | "snooze" | "offline"; /** When one who is offline was last online, and the time it is read by (both ISO): «sist på nett for 2 timer siden». */ lastOnline?: { at: string; now: string } }

/** Steam's `personastate` (0 offline, 1 online, 2 busy, 3 away, 4 snooze, 5 and 6 online), `gameextrainfo` and `lastlogoff` (seconds) as a `Presence`; `now` (ISO) for the time since. */
export function presenceOf(personaState: number, game?: string | null, lastLogoff?: number | null, now?: string): Presence {
  if (game !== undefined && game !== null && game !== "") return { state: "in-game", game }
  const state = personaState === 2 ? "busy" : personaState === 3 ? "away" : personaState === 4 ? "snooze" : personaState === 0 ? "offline" : "online"
  return state === "offline" && lastLogoff !== undefined && lastLogoff !== null && lastLogoff > 0 && now !== undefined ? { state, lastOnline: { at: new Date(lastLogoff * 1000).toISOString(), now } } : { state }
}

/** A presence in words («Spiller Hades II», «På nett», «Borte», «Frakoblet»), and whether it is live (in a game or online: the dot). */
export function presenceWords(presence: Presence): { words: string; live: boolean } {
  switch (presence.state) {
    case "in-game":
      return { words: `Spiller ${presence.game}`, live: true }
    case "online":
      return { words: "På nett", live: true }
    case "busy":
      return { words: "Opptatt", live: false }
    case "away":
      return { words: "Borte", live: false }
    case "snooze":
      return { words: "Slumrer", live: false }
    case "offline":
      return { words: "Frakoblet", live: false }
  }
}

/** A Steam level as `Progress` props: the XP of this level so far against the XP the level takes, in words. */
export function levelProgress({ level, xp, xpAtLevel, xpToNext }: { level: number; /** All the XP so far (`player_xp`). */ xp: number; /** The XP the level started at (`player_xp_needed_current_level`). */ xpAtLevel: number; /** The XP still needed for the next (`player_xp_needed_to_level_up`). */ xpToNext: number }): { label: string; value: number; max: number; valueText: string } {
  const value = Math.max(xp - xpAtLevel, 0)
  const max = value + Math.max(xpToNext, 0)
  return { label: `Nivå ${countWords(level)}`, value, max, valueText: `${countWords(value)} av ${countWords(max)} XP til nivå ${countWords(level + 1)}` }
}

/** One stat of a game, as the game names it («Fiender beseiret») and its value. */
export interface GameStat {
  label: string
  value: number
}

/**
 * A game's stats as facts for a `FactList`: the game's own names, each value in Norwegian figures (at most two decimals), a stat that is
 * 0, not a number, or without a name left out, the first `limit` in the game's order.
 */
export function statFacts(stats: readonly GameStat[], limit = 12): [string, string][] {
  return stats
    .filter((stat) => stat.label.trim() !== "" && Number.isFinite(stat.value) && stat.value !== 0)
    .slice(0, limit)
    .map((stat) => [stat.label.trim(), stat.value.toLocaleString("nb-NO", { maximumFractionDigits: 2 })])
}

/** What a news item of a game is, where it is more than news: the developer's patch notes, or an event in the game. */
export type NewsKind = "patch-notes" | "event"

/** The word of a news item's badge: «Oppdatering» for patch notes, «Hendelse» for an event. */
export const NEWS_WORDS: Readonly<Record<NewsKind, { label: string; icon: IconName }>> = { "patch-notes": { label: "Oppdatering", icon: "changes" }, event: { label: "Hendelse", icon: "calendar" } }

/** A Steam news item's kind from its `tags` (`patchnotes`) and `feed_type`; `null` for plain news. */
export function newsKind(tags: readonly string[] | undefined): NewsKind | null {
  if (tags === undefined) return null
  if (tags.includes("patchnotes")) return "patch-notes"
  if (tags.some((tag) => tag === "event" || tag.startsWith("event_"))) return "event"
  return null
}

/** A release date (ISO, a day) in words: «12. mars 2024»; `null` for one that is not a date (the store's «Kommer snart»). */
export function releaseWords(iso: string): string | null {
  const date = new Date(iso)
  return iso.trim() === "" || Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
}
