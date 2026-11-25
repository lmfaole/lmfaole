/**
 * A profile's wishlist on Steam (`IWishlistService/GetWishlist`, which must be public) with each game's name and price in Norway, and which of them are on sale now. Pure, with a test.
 */

import type { StoreItem, StorePrice } from "./steam-store.ts"

const API = "https://api.steampowered.com"

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

/** No key: a public wishlist is anyone's to see. */
export const wishlistUrl = (steamId: string): string => `${API}/IWishlistService/GetWishlist/v1/?steamid=${steamId}`

export interface Wish {
  appId: number
  /** When it was wished for, in seconds since 1970. */
  added: number
  /** The profile's own order, 1 first; `null` where it has not ordered it. */
  priority: number | null
}

/** A wishlist in the profile's order (the ordered first, then the rest, last added first); `null` where it is not public (Steam answers an empty `response`). */
export function parseWishlist(answer: unknown): Wish[] | null {
  const response = record(record(answer)["response"])
  if (!Array.isArray(response["items"])) return null
  return list(response["items"])
    .map(record)
    .flatMap((one): Wish[] => {
      const appId = one["appid"]
      if (typeof appId !== "number" || !Number.isInteger(appId)) return []
      const priority = typeof one["priority"] === "number" && one["priority"] > 0 ? one["priority"] : null
      return [{ appId, added: typeof one["date_added"] === "number" ? one["date_added"] : 0, priority }]
    })
    .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER) || b.added - a.added)
}

export interface WishlistGame extends Wish {
  /** `null` where the store's names were not had (the game is still in the list). */
  name: string | null
  /** `null` where it has no price (free, not out yet, not sold in Norway), or the prices were not had. */
  price: StorePrice | null
  comingSoon: boolean
  onSale: boolean
  url: string
  /** Steam's header image, 460×215. */
  image: string
}

export interface Wishlist {
  games: WishlistGame[]
  /** The games on sale now, the largest discount first. */
  onSale: WishlistGame[]
  /** Whether the list was longer than was priced (`WISHLIST_LIMIT`): the sales are of the first ones only. */
  truncated: boolean
}

/** How many games of a wishlist are named and priced, in its order: two asks of each, at most. */
export const WISHLIST_LIMIT = 200

const STORE = "https://store.steampowered.com"
const CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps"

/** The wishlist with names and prices, and its sales. */
export function wishlistOf(wishes: readonly Wish[], names: ReadonlyMap<number, StoreItem>, prices: ReadonlyMap<number, StorePrice | null>, truncated = false): Wishlist {
  const games = wishes.map((wish): WishlistGame => {
    const price = prices.get(wish.appId) ?? null
    const onSale = price !== null && price.discountPercent > 0
    const item = names.get(wish.appId)
    return { ...wish, name: item?.name ?? null, price, comingSoon: item?.comingSoon ?? false, onSale, url: `${STORE}/app/${wish.appId}/`, image: `${CDN}/${wish.appId}/header.jpg` }
  })
  const onSale = games.filter((game) => game.onSale).sort((a, b) => (b.price?.discountPercent ?? 0) - (a.price?.discountPercent ?? 0))
  return { games, onSale, truncated }
}
