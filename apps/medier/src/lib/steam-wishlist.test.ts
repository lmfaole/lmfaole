import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { StorePrice } from "./steam-store.ts"
import { parseSeenSales, parseWishlist, seenSalesValue, wishlistOf, wishlistUrl } from "./steam-wishlist.ts"

const price = (final: number, discount: number): StorePrice => ({ currency: "NOK", initial: 20000, final, discountPercent: discount, initialFormatted: "200,00 kr", finalFormatted: `${final / 100},00 kr` })

test("a wishlist in the profile's order: the ordered first, then the last added; a private one is none", () => {
  assert.equal(wishlistUrl("76561197968575517"), "https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=76561197968575517")
  const wishes = parseWishlist({ response: { items: [{ appid: 1, priority: 0, date_added: 100 }, { appid: 2, priority: 2, date_added: 50 }, { appid: 3, priority: 0, date_added: 300 }, { appid: 4, priority: 1, date_added: 10 }, { appid: "x" }] } })
  assert.deepEqual(wishes?.map((wish) => [wish.appId, wish.priority]), [[4, 1], [2, 2], [3, null], [1, null]])
  assert.equal(parseWishlist({ response: {} }), null)
})

test("sales: on sale now, the largest discount first, and new where the visitor did not see it on sale", () => {
  const wishes = [1, 2, 3, 4].map((appId) => ({ appId, added: 0, priority: null }))
  const prices = new Map<number, StorePrice | null>([[1, price(10000, 50)], [2, price(20000, 0)], [3, price(15000, 25)], [4, null]])
  const names = new Map([[1, { appId: 1, name: "En", comingSoon: false }]])
  const list = wishlistOf(wishes, names, prices, new Set([1, 99]))
  assert.deepEqual(list.onSale.map((game) => game.appId), [1, 3])
  assert.deepEqual(list.newSales.map((game) => game.appId), [3])
  assert.deepEqual([list.games[0]?.name, list.games[1]?.name, list.games[3]?.price], ["En", null, null])
  // Never looked: every sale is new.
  assert.deepEqual(wishlistOf(wishes, names, prices, null).newSales.map((game) => game.appId), [1, 3])
})

test("what was on sale is kept in a cookie, small, and read back; a bad part is left out", () => {
  const value = seenSalesValue([1086940, 620, 620, -1, 1.5])
  assert.equal(value, "naos.h8")
  assert.deepEqual([...(parseSeenSales(value) ?? [])], [1086940, 620])
  assert.deepEqual([...(parseSeenSales("") ?? [])], [])
  assert.deepEqual([...(parseSeenSales("h8.<script>") ?? [])], [620])
  assert.equal(parseSeenSales(undefined), null)
  assert.ok(seenSalesValue(Array.from({ length: 1000 }, (_, at) => 3000000 + at)).length < 3000)
})
