import { parseAir, airUrl, type Air } from "./air.ts"
import { BIKE_FEEDS, metresBetween, nearbyBikes, type BikeStation } from "./bikes.ts"
import { osloTime, addDays } from "./day.ts"
import { osloOffset } from "./format.ts"
import { moonUrl, parseMoon, type Moon } from "./moon.ts"
import { nowcastUrl, parseNowcast, type Nowcast } from "./nowcast.ts"
import type { Position } from "./position.ts"
import { parsePrices, priceAreaFor, pricesUrl, type PriceArea, type PriceHour } from "./power.ts"
import { upstream } from "./upstream"
import { byUrgency, parseAvalanche, parseMetAlerts, parseNveWarnings, type Warning } from "./warnings.ts"
import { weatherPosition } from "./yr"

// The sources around the weather: warnings, the radar, the air, the moon, the price of power and the city bikes. Each answers nothing rather than
// failing the page: outside its area (the radar, the air, the bikes) or when it is down, the page simply has less to say.

const OSLO = { lat: 59.913, lon: 10.752 }
const MET = { "User-Agent": "startside github.com/lmfaole/startside" }

async function json(url: string, init: Parameters<typeof upstream>[1]): Promise<unknown> {
  try {
    const response = await upstream(url, init)
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

/** The municipality number at a position (Kartverket), for NVE's warnings by municipality. Borders seldom move, so it is kept a week. */
async function municipality({ lat, lon }: Position): Promise<string | null> {
  const body = (await json(`https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=${lat}&ost=${lon}&koordsys=4258`, { revalidate: 7 * 86_400 })) as { kommunenummer?: string } | null
  return body?.kommunenummer ?? null
}

/**
 * The warnings in force where the reader is, the most serious first: MET's (MetAlerts, asked at most every ten minutes) and NVE's flood, landslide
 * and avalanche warnings from Varsom (every half hour).
 */
export async function getWarnings(device: Position | null, now: Date): Promise<Warning[]> {
  const position = weatherPosition(device)
  const { lat, lon } = position
  const today = osloTime(now).date
  const end = addDays(today, 2)
  const nve = { revalidate: 1800 }
  const [met, number, avalanche] = await Promise.all([
    json(`https://api.met.no/weatherapi/metalerts/2.0/current.json?lat=${lat}&lon=${lon}&lang=no`, { headers: MET, revalidate: 600 }),
    municipality(position),
    json(`https://api01.nve.no/hydrology/forecast/avalanche/v6.3.0/api/AvalancheWarningByCoordinates/Simple/${lat}/${lon}/1/${today}/${end}`, nve),
  ])
  const [flood, landslide] = number === null ? [null, null] : await Promise.all(["flood/v1.0.10", "landslide/v1.0.6"].map((service) => json(`https://api01.nve.no/hydrology/forecast/${service}/api/Warning/Municipality/${number}/1/${today}/${end}`, nve)))
  return [...parseMetAlerts(met, now), ...parseNveWarnings(flood, "flood", now), ...parseNveWarnings(landslide, "landslide", now), ...parseAvalanche(avalanche, now)].toSorted(byUrgency)
}

/** The radar's next ninety minutes (MET Nowcast), asked every five minutes: it is about now. `null` outside the Nordic radar. */
export async function getNowcast(device: Position | null): Promise<Nowcast | null> {
  const { lat, lon } = weatherPosition(device)
  return parseNowcast(await json(nowcastUrl(lat, lon), { headers: MET, revalidate: 300, staleFor: 120 }))
}

/** The air today (MET's air quality forecast), every half hour. `null` outside Norway. */
export async function getAir(device: Position | null, now: Date): Promise<Air | null> {
  const { lat, lon } = weatherPosition(device)
  return parseAir(await json(airUrl(lat, lon), { headers: MET, revalidate: 1800 }), now)
}

/** The moon today (MET's Sunrise 3.0): it changes by the day, so it is kept six hours. */
export async function getMoon(device: Position | null, now: Date): Promise<Moon | null> {
  const { lat, lon } = weatherPosition(device)
  return parseMoon(await json(moonUrl(lat, lon, osloTime(now).date, osloOffset(now)), { headers: MET, revalidate: 6 * 3600 }))
}

export interface Prices {
  area: PriceArea
  /** Whether the area was chosen, or guessed from the position. */
  chosen: boolean
  hours: PriceHour[]
}

/**
 * A day's spot prices (today by default) in the chosen area, or the one the position is in (hvakosterstrommen.no; a day's prices are set the day before,
 * around one o'clock, so an hour is plenty). `null` for tomorrow before they are set.
 */
export async function getPrices(device: Position | null, chosen: PriceArea | null, now: Date, date = osloTime(now).date): Promise<Prices | null> {
  const area = chosen ?? priceAreaFor(weatherPosition(device))
  const hours = parsePrices(await json(pricesUrl(date, area), { revalidate: 3600 }))
  return hours.length === 0 ? null : { area, chosen: chosen !== null, hours }
}

/**
 * Oslo Bysykkel's stations near the device, with bikes and docks now (the status every minute, the stations every hour). Nothing without a position:
 * the place in the settings is a forecast's, not where the reader stands.
 */
export async function getBikes(device: Position | null): Promise<BikeStation[]> {
  // Oslo Bysykkel is in Oslo: no need to ask from elsewhere.
  if (device === null || metresBetween(device, OSLO) > 25_000) return []
  const headers = { "Client-Identifier": "lmfaole-startside" }
  const [information, status] = await Promise.all([json(BIKE_FEEDS.information, { headers, revalidate: 3600 }), json(BIKE_FEEDS.status, { headers, revalidate: 60, staleFor: 60 })])
  return nearbyBikes(information, status, device)
}
