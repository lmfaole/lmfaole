/**
 * What Steam's store tells of a game beyond `steam.ts`'s `StoreGame`, all from the one `appdetails` answer the game's page already asks for (its pictures and films, machines, kinds of play,
 * controller and DLC), and from the store's other answers: the players' reviews (`appreviews`), how many play it now (`GetNumberOfCurrentPlayers`), its news and patch notes
 * (`GetNewsForApp`), how it runs on a Steam Deck (`ajaxgetdeckappcompatibilityreport`), prices of many games in one ask (`appdetails` with `filters=price_overview`) and the names of many
 * (`IStoreBrowseService/GetItems`). Pure, with a test.
 */

import { headerImage, libraryImage, parseStoreDetails, plainText, type StoreGame } from "./steam.ts"

const API = "https://api.steampowered.com"
const STORE = "https://store.steampowered.com"
const CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps"

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string | null => (typeof value === "string" && value.trim() !== "" ? value.trim() : null)
const whole = (value: unknown): number | null => {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value
  return typeof number === "number" && Number.isFinite(number) ? Math.round(number) : null
}

// ---- appdetails ----

export const heroImage = (appId: number): string => `${CDN}/${appId}/library_hero.jpg`
export const logoImage = (appId: number): string => `${CDN}/${appId}/logo.png`

export interface Screenshot {
  /** 600×338. */
  thumbnail: string
  /** 1920×1080. */
  full: string
}

/** A film of the game: the old answers give WebM and MP4 files (480p and the largest), the newer only streams (HLS and DASH); `null` where the answer has not that one. */
export interface StoreMovie {
  id: number
  name: string
  thumbnail: string | null
  /** The film Steam shows first. */
  highlight: boolean
  webm: { low: string | null; max: string | null } | null
  mp4: { low: string | null; max: string | null } | null
  /** An HLS playlist (H.264), for Safari and hls.js. */
  hls: string | null
  /** A DASH manifest, H.264. */
  dash: string | null
  /** A DASH manifest, AV1. */
  dashAv1: string | null
}

export interface StoreMedia {
  /** 460×215. */
  header: string
  /** The store's small capsule (231×87); `null` where the answer has none. */
  capsule: string | null
  /** The library's tall picture, 600×900. */
  library: string
  /** The library's wide picture behind the name, 3840×1240 (not every game has one: a 404). */
  hero: string
  /** The game's name as a transparent picture (not every game has one: a 404). */
  logo: string
  /** The store page's background, with the store's own tint; `null` where it has none. */
  background: string | null
  /** The same without the tint. */
  backgroundRaw: string | null
  screenshots: Screenshot[]
  movies: StoreMovie[]
}

/** The kinds of play the store names (`categories`), by their ids, as booleans. */
export interface StoreFeatures {
  singlePlayer: boolean
  multiPlayer: boolean
  /** Co-op of any kind. */
  coop: boolean
  onlineCoop: boolean
  /** Co-op on one screen (shared or split). */
  localCoop: boolean
  /** Shared or split screen of any kind. */
  sharedScreen: boolean
  pvp: boolean
  achievements: boolean
  tradingCards: boolean
  workshop: boolean
  cloud: boolean
  remotePlayTogether: boolean
  familySharing: boolean
}

const FEATURE_IDS: Record<keyof StoreFeatures, readonly number[]> = {
  singlePlayer: [2],
  multiPlayer: [1, 49, 36, 37, 38, 39, 47, 48, 24, 27],
  coop: [9, 38, 39, 48],
  onlineCoop: [38],
  localCoop: [39],
  sharedScreen: [24, 37, 39],
  pvp: [49, 36, 37, 47],
  achievements: [22],
  tradingCards: [29],
  workshop: [30],
  cloud: [23],
  remotePlayTogether: [44],
  familySharing: [62],
}

export type ControllerSupport = "full" | "partial"
export const CONTROLLER_LABEL: Record<ControllerSupport, string> = { full: "Full støtte for kontroller", partial: "Delvis støtte for kontroller" }

/** What the store's page tells of a game: `StoreGame`'s, and the rest of the same answer. */
export interface StoreApp extends StoreGame {
  appId: number
  name: string
  /** «game», «dlc», «demo», «music»… */
  type: string | null
  media: StoreMedia
  platforms: { windows: boolean; mac: boolean; linux: boolean }
  /** Every kind of play the store lists, in its words (Norwegian), in its order. */
  categories: { id: number; label: string }[]
  features: StoreFeatures
  /** `null` where the store says nothing of a controller. */
  controller: ControllerSupport | null
  /** The app ids of its DLC, as the store lists them. */
  dlc: number[]
  /** How many have reviewed it on Steam; `null` where the store does not say. */
  recommendations: number | null
  /** The price now, its discount and the price before; `null` for a game with no price (free, not out, not sold in Norway). */
  priceNow: StorePrice | null
  comingSoon: boolean
}

const flag = (value: unknown): boolean => value === true || value === 1 || value === "1"

function movie(one: Record<string, unknown>): StoreMovie | null {
  const id = whole(one["id"])
  if (id === null) return null
  const files = (value: unknown): { low: string | null; max: string | null } | null => {
    const sizes = record(value)
    const low = text(sizes["480"])
    const max = text(sizes["max"])
    return low === null && max === null ? null : { low, max }
  }
  return {
    id,
    name: text(one["name"]) ?? "",
    thumbnail: text(one["thumbnail"]),
    highlight: flag(one["highlight"]),
    webm: files(one["webm"]),
    mp4: files(one["mp4"]),
    hls: text(one["hls_h264"]),
    dash: text(one["dash_h264"]),
    dashAv1: text(one["dash_av1"]),
  }
}

/** The whole of the store's answer for one game (`storeDetailsUrl`); `null` where it has no page for it. */
export function parseStoreApp(answer: unknown, appId: number): StoreApp | null {
  const store = parseStoreDetails(answer, appId)
  if (store === null) return null
  const data = record(record(record(answer)[String(appId)])["data"])
  const categories = list(data["categories"]).map(record).flatMap((one) => {
    const id = whole(one["id"])
    const label = text(one["description"])
    return id === null || label === null ? [] : [{ id, label }]
  })
  const ids = new Set(categories.map((one) => one.id))
  const features = Object.fromEntries(Object.entries(FEATURE_IDS).map(([name, wanted]) => [name, wanted.some((id) => ids.has(id))])) as unknown as StoreFeatures
  const support = text(data["controller_support"])
  const controller: ControllerSupport | null = support === "full" || ids.has(28) ? "full" : support === "partial" || ids.has(18) ? "partial" : null
  const platforms = record(data["platforms"])
  const recommendations = whole(record(data["recommendations"])["total"])
  return {
    ...store,
    appId,
    name: text(data["name"]) ?? "",
    type: text(data["type"]),
    media: {
      header: text(data["header_image"]) ?? headerImage(appId),
      capsule: text(data["capsule_image"]),
      library: libraryImage(appId),
      hero: heroImage(appId),
      logo: logoImage(appId),
      background: text(data["background"]),
      backgroundRaw: text(data["background_raw"]),
      screenshots: list(data["screenshots"]).map(record).flatMap((one) => {
        const thumbnail = text(one["path_thumbnail"])
        const full = text(one["path_full"])
        return thumbnail === null || full === null ? [] : [{ thumbnail, full }]
      }),
      movies: list(data["movies"]).map(record).flatMap((one) => movie(one) ?? []),
    },
    platforms: { windows: flag(platforms["windows"]), mac: flag(platforms["mac"]), linux: flag(platforms["linux"]) },
    categories,
    features,
    controller,
    dlc: list(data["dlc"]).flatMap((id) => (typeof id === "number" && Number.isInteger(id) ? [id] : [])),
    recommendations: recommendations !== null && recommendations > 0 ? recommendations : null,
    priceNow: data["is_free"] === true ? null : priceOf(data["price_overview"]),
    comingSoon: record(data["release_date"])["coming_soon"] === true,
  }
}

// ---- Prices of many ----

/** A price in Norway, in øre and as the store writes it. */
export interface StorePrice {
  currency: string
  /** Before the discount, in the currency's hundredths. */
  initial: number
  /** Now, in the currency's hundredths. */
  final: number
  /** 0 where it is not on sale. */
  discountPercent: number
  /** «219,00 kr»; the same as `finalFormatted` where it is not on sale (the store leaves it empty then). */
  initialFormatted: string
  /** «120,45 kr». */
  finalFormatted: string
}

function priceOf(value: unknown): StorePrice | null {
  const price = record(value)
  const final = whole(price["final"])
  const finalFormatted = text(price["final_formatted"])
  if (final === null || finalFormatted === null) return null
  const discount = Math.max(0, whole(price["discount_percent"]) ?? 0)
  return { currency: text(price["currency"]) ?? "NOK", initial: whole(price["initial"]) ?? final, final, discountPercent: discount, initialFormatted: text(price["initial_formatted"]) ?? finalFormatted, finalFormatted }
}

/** How many games one ask for prices (or names) holds at most. */
export const STORE_BATCH = 100

/** The prices of many games in one ask: the store takes many app ids only with `filters=price_overview`. */
export const pricesUrl = (appIds: readonly number[]): string => `${STORE}/api/appdetails?appids=${appIds.join(",")}&filters=price_overview&cc=no`

/** The prices of the games of `pricesUrl`'s answer, by app id: `null` for one with no price (free, not out yet, not sold in Norway); a game the store did not answer for is not there. */
export function parsePrices(answer: unknown): Map<number, StorePrice | null> {
  return new Map(
    Object.entries(record(answer)).flatMap(([id, value]) => {
      const appId = Number(id)
      const entry = record(value)
      if (!Number.isInteger(appId) || entry["success"] !== true) return []
      return [[appId, priceOf(record(entry["data"])["price_overview"])] as const]
    }),
  )
}

/** The names of many games in one ask (`IStoreBrowseService/GetItems`), in Norwegian where the store has it; no key. */
export function storeItemsUrl(appIds: readonly number[]): string {
  const input = { ids: appIds.map((appid) => ({ appid })), context: { language: "norwegian", country_code: "NO" }, data_request: {} }
  return `${API}/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(JSON.stringify(input))}`
}

export interface StoreItem {
  appId: number
  name: string
  comingSoon: boolean
}

/** The games of `storeItemsUrl`'s answer, by app id; one the store does not know (taken off it) is not there. */
export function parseStoreItems(answer: unknown): Map<number, StoreItem> {
  return new Map(
    list(record(record(answer)["response"])["store_items"]).map(record).flatMap((one) => {
      const appId = whole(one["appid"] ?? one["id"])
      const name = text(one["name"])
      return appId === null || name === null || one["success"] !== 1 ? [] : [[appId, { appId, name, comingSoon: one["is_coming_soon"] === true }] as const]
    }),
  )
}

// ---- Reviews ----

/** Every review, in all languages and by every kind of buyer; only the sums (`query_summary`), no reviews. */
export const reviewsUrl = (appId: number): string => `${STORE}/appreviews/${appId}?json=1&language=all&purchase_type=all&num_per_page=0`

/** Steam's `review_score`, 1 to 9, as the Norwegian store words it. */
export const REVIEW_LABELS: Readonly<Record<number, string>> = {
  9: "Overveldende positive",
  8: "Svært positive",
  7: "Positive",
  6: "Stort sett positive",
  5: "Blandede",
  4: "Stort sett negative",
  3: "Negative",
  2: "Svært negative",
  1: "Overveldende negative",
}
const REVIEW_SCORES: Readonly<Record<string, number>> = {
  "overwhelmingly positive": 9,
  "very positive": 8,
  positive: 7,
  "mostly positive": 6,
  mixed: 5,
  "mostly negative": 4,
  negative: 3,
  "very negative": 2,
  "overwhelmingly negative": 1,
}

export interface Reviews {
  /** 1 (overwhelmingly negative) to 9 (overwhelmingly positive); `null` with too few reviews to say. */
  score: number | null
  /** «Svært positive», or with too few to say, how many («3 anmeldelser», «Ingen anmeldelser»). */
  label: string
  positive: number
  negative: number
  total: number
  /** The share of positive ones, in whole per cent; `null` with none. */
  percent: number | null
}

/** The sums of a game's reviews; `null` where the store did not answer with them. */
export function parseReviews(answer: unknown): Reviews | null {
  const body = record(answer)
  const summary = record(body["query_summary"])
  if (body["success"] !== 1 || Object.keys(summary).length === 0) return null
  const positive = Math.max(0, whole(summary["total_positive"]) ?? 0)
  const negative = Math.max(0, whole(summary["total_negative"]) ?? 0)
  const total = Math.max(whole(summary["total_reviews"]) ?? 0, positive + negative)
  const said = whole(summary["review_score"])
  const score = said !== null && said >= 1 && said <= 9 ? said : (REVIEW_SCORES[(text(summary["review_score_desc"]) ?? "").toLowerCase()] ?? null)
  const label = score !== null ? (REVIEW_LABELS[score] ?? "") : total === 0 ? "Ingen anmeldelser" : total === 1 ? "1 anmeldelse" : `${total} anmeldelser`
  return { score, label, positive, negative, total, percent: total === 0 ? null : Math.round((positive / total) * 100) }
}

// ---- Players now ----

export const currentPlayersUrl = (appId: number): string => `${API}/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`

/** How many play the game on Steam now; `null` where Steam does not say. */
export function parseCurrentPlayers(answer: unknown): number | null {
  const response = record(record(answer)["response"])
  const count = whole(response["player_count"])
  return response["result"] === 1 && count !== null && count >= 0 ? count : null
}

// ---- News ----

export const NEWS_COUNT = 10
export const newsUrl = (appId: number): string => `${API}/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${NEWS_COUNT}&maxlength=300&format=json`

/** BBCode (`[b]`, `[url=…]…[/url]`, `[img]…[/img]`, `[list][*]`…), Steam's picture placeholders (`{STEAM_CLAN_IMAGE}/…`) and HTML, as plain text. */
export function bbcodeText(source: string): string {
  return plainText(
    source
      .replace(/\[img[^\]]*\][\s\S]*?\[\/img\]/gi, " ")
      .replace(/\[previewyoutube[^\]]*\][\s\S]*?\[\/previewyoutube\]/gi, " ")
      .replace(/\[(video|youtube)[^\]]*\][\s\S]*?\[\/\1\]/gi, " ")
      .replace(/\{STEAM_CLAN_IMAGE\}\S*/g, " ")
      .replace(/\[\*\]/g, " ")
      .replace(/\[\/?(h[1-6]|p|list|olist|table|tr|td|th|quote|code|hr|noparse)[^\]]*\]/gi, " ")
      .replace(/\[\/?[a-z]+(=[^\]]*)?\]/gi, "")
      .replace(/<(p|div|li|h[1-6])[^>]*>/gi, " "),
  )
}

export interface NewsItem {
  id: string
  title: string
  url: string
  /** When it was published, in seconds since 1970. */
  date: number
  /** Where it is from («Community Announcements», «PC Gamer»). */
  feedLabel: string
  author: string | null
  /** The start of it, as plain text (Steam cuts it at 300 characters). */
  contents: string
  /** Whether the link goes off Steam. */
  external: boolean
  /** The game's own patch notes (tagged `patchnotes`), or any other news. */
  kind: "patch" | "news"
  /** Whether it is the game's maker's own (Steam's community announcements), not the press's. */
  official: boolean
}

/** A game's news, newest first. */
export function parseNews(answer: unknown): NewsItem[] {
  return list(record(record(answer)["appnews"])["newsitems"])
    .map(record)
    .flatMap((one): NewsItem[] => {
      const id = text(one["gid"])
      const title = text(one["title"])
      const url = text(one["url"])
      const date = whole(one["date"])
      if (id === null || title === null || url === null || date === null) return []
      const tags = list(one["tags"]).filter((tag): tag is string => typeof tag === "string")
      return [{
        id,
        title: bbcodeText(title),
        url,
        date,
        feedLabel: text(one["feedlabel"]) ?? text(one["feedname"]) ?? "",
        author: text(one["author"]),
        contents: bbcodeText(typeof one["contents"] === "string" ? one["contents"] : ""),
        external: one["is_external_url"] === true,
        kind: tags.includes("patchnotes") ? "patch" : "news",
        official: one["feed_type"] === 1 || one["feedname"] === "steam_community_announcements",
      }]
    })
    .sort((a, b) => b.date - a.date)
}

// ---- Steam Deck ----

export const deckUrl = (appId: number): string => `${STORE}/saleaction/ajaxgetdeckappcompatibilityreport?nAppID=${appId}`

export type DeckStatus = "unknown" | "unsupported" | "playable" | "verified"
const DECK_STATUSES: readonly DeckStatus[] = ["unknown", "unsupported", "playable", "verified"]
export const DECK_LABEL: Record<DeckStatus, string> = { unknown: "Ukjent", unsupported: "Ikke støttet", playable: "Spillbar", verified: "Verifisert" }

export interface DeckCompatibility {
  /** Steam's `resolved_category`: 0 unknown, 1 unsupported, 2 playable, 3 verified. */
  category: 0 | 1 | 2 | 3
  status: DeckStatus
  /** «Verifisert». */
  label: string
}

/** How a game runs on a Steam Deck; `null` where the store did not answer. */
export function parseDeck(answer: unknown): DeckCompatibility | null {
  const body = record(answer)
  if (body["success"] !== 1) return null
  const said = whole(record(body["results"])["resolved_category"])
  const category = (said !== null && said >= 0 && said <= 3 ? said : 0) as DeckCompatibility["category"]
  const status = DECK_STATUSES[category] ?? "unknown"
  return { category, status, label: DECK_LABEL[status] }
}

// ---- DLC ----

/** A DLC of a game, with its name and price. */
export interface Dlc {
  appId: number
  name: string
  price: StorePrice | null
  url: string
}

/** How many of a game's DLC are named and priced (two asks, however many). */
export const DLC_LIMIT = 30

/** A game's DLC, from the names (`parseStoreItems`) and the prices (`parsePrices`) of its ids, in the store's order; one without a name is left out. */
export function dlcOf(appIds: readonly number[], names: ReadonlyMap<number, StoreItem>, prices: ReadonlyMap<number, StorePrice | null>): Dlc[] {
  return appIds.flatMap((appId) => {
    const item = names.get(appId)
    return item === undefined ? [] : [{ appId, name: item.name, price: prices.get(appId) ?? null, url: `${STORE}/app/${appId}/` }]
  })
}
