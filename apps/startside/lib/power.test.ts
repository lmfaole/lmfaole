import assert from "node:assert/strict"
import { test } from "node:test"

import { averagePrice, cheapestSpan, formatPrice, isPriceDate, priceExtremes, parsePriceArea, parsePrices, priceAreaFor, priceNow, pricesUrl, withArea } from "./power.ts"

const hourly = Array.from({ length: 24 }, (_, hour) => ({ NOK_per_kWh: [5, 6, 7].includes(hour) ? 0.2 : 1 + hour / 10, time_start: `2026-11-21T${String(hour).padStart(2, "0")}:00:00+01:00`, time_end: `2026-11-21T${String(hour + 1).padStart(2, "0")}:00:00+01:00` }))

test("the price area is guessed from the position, NO1 without one", () => {
  assert.equal(priceAreaFor(null), "NO1")
  assert.equal(priceAreaFor({ lat: 59.91, lon: 10.75 }), "NO1")
  assert.equal(priceAreaFor({ lat: 60.39, lon: 5.32 }), "NO5")
  assert.equal(priceAreaFor({ lat: 58.97, lon: 5.73 }), "NO2")
  assert.equal(priceAreaFor({ lat: 58.15, lon: 8.0 }), "NO2")
  assert.equal(priceAreaFor({ lat: 63.43, lon: 10.39 }), "NO3")
  assert.equal(priceAreaFor({ lat: 69.65, lon: 18.96 }), "NO4")
})

test("the chosen area is read loosely", () => {
  assert.equal(parsePriceArea("no3"), "NO3")
  assert.equal(parsePriceArea("NO6"), null)
  assert.equal(parsePriceArea(undefined), null)
})

test("quarter hours are averaged into hours", () => {
  const quarters = [0.4, 0.6, 0.8, 1.0].map((price, index) => ({ NOK_per_kWh: price, time_start: `2026-11-21T00:${String(index * 15).padStart(2, "0")}:00+01:00`, time_end: index === 3 ? "2026-11-21T01:00:00+01:00" : `2026-11-21T00:${String(index * 15 + 15).padStart(2, "0")}:00+01:00` }))
  const hours = parsePrices(quarters)
  assert.equal(hours.length, 1)
  assert.ok(Math.abs(hours[0]!.price - 0.7) < 1e-9)
  assert.equal(hours[0]?.end, "2026-11-21T01:00:00+01:00")
  assert.deepEqual(parsePrices({}), [])
})

test("the price now and the cheapest three hours that are left", () => {
  const hours = parsePrices(hourly)
  const now = new Date("2026-11-21T03:30:00+01:00")
  assert.equal(priceNow(hours, now)?.price, 1.3)
  assert.deepEqual(cheapestSpan(hours, now)?.start, "2026-11-21T05:00:00+01:00")
  const late = new Date("2026-11-21T22:10:00+01:00")
  assert.equal(cheapestSpan(hours, late), undefined)
  assert.equal(cheapestSpan(hours, late, 2)?.start, "2026-11-21T22:00:00+01:00")
  assert.equal(averagePrice([]), undefined)
  assert.equal(averagePrice([{ start: "", end: "", price: 1 }, { start: "", end: "", price: 2 }]), 1.5)
})

test("prices in kroner or øre, and the address of a day", () => {
  assert.equal(formatPrice(1.234), "1,23 kr/kWh")
  assert.equal(formatPrice(0.844), "84 øre/kWh")
  assert.equal(pricesUrl("2026-11-21", "NO5"), "https://www.hvakosterstrommen.no/api/v1/prices/2026/11-21_NO5.json")
})

test("the cheapest and the dearest hour of a day", () => {
  const hours = [0.8, 0.3, 1.4, 0.3].map((price, index) => ({ start: `h${index}`, end: `h${index + 1}`, price }))
  assert.deepEqual(priceExtremes(hours), { lowest: hours[1], highest: hours[2] })
  assert.equal(priceExtremes([]), undefined)
})

test("a day has a page from the first prices up to tomorrow, and only a real date", () => {
  assert.deepEqual(["2026-11-21", "2026-11-23", "2026-11-24", "2021-11-30", "2026-02-30", "2026-1-01", "x"].map((date) => isPriceDate(date, "2026-11-23")), [true, true, false, false, false, false, false])
})

test("a chosen area is added to the position's query, and nothing is added without one", () => {
  assert.equal(withArea("", "NO3"), "?omrade=NO3")
  assert.equal(withArea("?pos=59.91,10.75", "NO3"), "?pos=59.91,10.75&omrade=NO3")
  assert.equal(withArea("?pos=59.91,10.75", null), "?pos=59.91,10.75")
})
