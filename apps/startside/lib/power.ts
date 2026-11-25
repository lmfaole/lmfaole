/**
 * The price of electricity (spot price, from hvakosterstrommen.no): the price area of a position, the price now and the cheapest hours of the day.
 * Prices are the exchange's, in NOK per kWh, without VAT and grid rent. Pure: the answer in, the hours out; the page passes `now`.
 */
import type { Position } from "./position.ts"

export const PRICE_AREAS = ["NO1", "NO2", "NO3", "NO4", "NO5"] as const
export type PriceArea = (typeof PRICE_AREAS)[number]

/** Each area as the reader knows it. */
export const PRICE_AREA_NAMES: Record<PriceArea, string> = { NO1: "Øst-Norge", NO2: "Sørvest-Norge", NO3: "Midt-Norge", NO4: "Nord-Norge", NO5: "Vest-Norge" }

/** Where a page's address has a chosen price area (`?omrade=NO3`); without it the area is guessed from the position, and is NO1 (Oslo) without that. */
export const AREA_PARAM = "omrade"

/** A page's query (`positionQuery`, `""` or `?pos=…`) with the chosen area added, as the links between the power pages carry both on. */
export const withArea = (query: string, area: PriceArea | null): string => (area === null ? query : `${query === "" ? "?" : `${query}&`}${AREA_PARAM}=${area}`)

export const parsePriceArea = (value: string | undefined | null): PriceArea | null => ((PRICE_AREAS as readonly string[]).includes(String(value).toUpperCase()) ? (String(value).toUpperCase() as PriceArea) : null)

/**
 * The price area a position is most likely in, from where the borders roughly go (they follow the grid, not the counties): the north from Nordland, the middle
 * from Møre og Romsdal and Trøndelag, the west coast from Hardanger to Sogn, the south-west from Agder to Telemark, the east the rest. Close to a border it may
 * be wrong, so the reader can choose it. No position: NO1.
 */
export function priceAreaFor(position: Position | null): PriceArea {
  if (position === null) return "NO1"
  const { lat, lon } = position
  if (lat >= 65) return "NO4"
  if (lat >= 62) return "NO3"
  if (lat >= 59.8 && lon < 7.5) return "NO5"
  if (lat < 59.8 && lon < 9.8) return "NO2"
  return "NO1"
}

export interface PriceHour {
  /** The hour's start. */
  start: string
  end: string
  /** NOK per kWh, without VAT. */
  price: number
}

interface Answer {
  NOK_per_kWh?: number
  time_start?: string
  time_end?: string
}

/** The day's prices, one per hour: an answer in quarter hours is averaged into hours. */
export function parsePrices(body: unknown): PriceHour[] {
  if (!Array.isArray(body)) return []
  const hours = new Map<string, { start: string; end: string; sum: number; count: number }>()
  for (const entry of body as Answer[]) {
    if (typeof entry.NOK_per_kWh !== "number" || typeof entry.time_start !== "string" || typeof entry.time_end !== "string") continue
    const key = entry.time_start.slice(0, 13)
    const hour = hours.get(key) ?? { start: entry.time_start, end: entry.time_end, sum: 0, count: 0 }
    hour.sum += entry.NOK_per_kWh
    hour.count += 1
    hour.end = entry.time_end
    hours.set(key, hour)
  }
  return [...hours.values()].map((hour) => ({ start: hour.start, end: hour.end, price: hour.sum / hour.count }))
}

/** The hour `now` is in. */
export const priceNow = (hours: readonly PriceHour[], now: Date): PriceHour | undefined => hours.find((hour) => Date.parse(hour.start) <= now.getTime() && now.getTime() < Date.parse(hour.end))

/**
 * The cheapest `length` hours in a row that are not over yet (the hour now counts), for what can wait: the dishwasher, the car. `undefined` when fewer are left.
 */
export function cheapestSpan(hours: readonly PriceHour[], now: Date, length = 3): { start: string; end: string; price: number } | undefined {
  const left = hours.filter((hour) => Date.parse(hour.end) > now.getTime())
  let best: { start: string; end: string; price: number } | undefined
  for (let index = 0; index + length <= left.length; index += 1) {
    const span = left.slice(index, index + length)
    const price = span.reduce((sum, hour) => sum + hour.price, 0) / length
    if (best === undefined || price < best.price) best = { start: span[0]!.start, end: span.at(-1)!.end, price }
  }
  return best
}

/** The mean price of the hours. */
export const averagePrice = (hours: readonly PriceHour[]): number | undefined => (hours.length === 0 ? undefined : hours.reduce((sum, hour) => sum + hour.price, 0) / hours.length)

/** The cheapest and the dearest hour of a day; `undefined` without hours. */
export function priceExtremes(hours: readonly PriceHour[]): { lowest: PriceHour; highest: PriceHour } | undefined {
  if (hours.length === 0) return undefined
  return hours.reduce((found, hour) => ({ lowest: hour.price < found.lowest.price ? hour : found.lowest, highest: hour.price > found.highest.price ? hour : found.highest }), { lowest: hours[0]!, highest: hours[0]! })
}

/** The first day hvakosterstrommen.no has prices for. */
export const FIRST_PRICE_DATE = "2021-12-01"

/** Whether a day's page can have prices: a real date (`YYYY-MM-DD`) from the first day there are prices for up to `last` (tomorrow, set at about one o'clock). */
export function isPriceDate(date: string, last: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const parsed = new Date(`${date}T12:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date) && date >= FIRST_PRICE_DATE && date <= last
}

const KRONER = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** «1,23 kr/kWh»; under a krone in øre: «84 øre/kWh». */
export function formatPrice(price: number): string {
  return Math.abs(price) < 1 ? `${Math.round(price * 100)} øre/kWh` : `${KRONER.format(price)} kr/kWh`
}

/** The address of a day's prices for an area (`date` is `YYYY-MM-DD`). */
export const pricesUrl = (date: string, area: PriceArea): string => `https://www.hvakosterstrommen.no/api/v1/prices/${date.slice(0, 4)}/${date.slice(5, 7)}-${date.slice(8, 10)}_${area}.json`

export const PRICE_CREDIT = { text: "Strømpriser levert av Hva koster strømmen.no", href: "https://www.hvakosterstrommen.no" } as const
