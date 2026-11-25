import type { Day } from "./day.ts"
import { env } from "./env"
import { pickHours, type Timeseries } from "./forecast.ts"
import { placeName } from "./place"
import { coarsePosition, type Position } from "./position.ts"
import { forecastUrl } from "./snapshot"
import { upstream } from "./upstream"

export interface Hour {
  time: string
  temperature: number
  precipitation: number
  wind: number
  symbol: string
}

export interface Weather {
  place: string
  hours: Hour[]
}

const SYMBOLS: Record<string, string> = {
  clearsky: "Klarvær",
  fair: "Lettskyet",
  partlycloudy: "Delvis skyet",
  cloudy: "Skyet",
  fog: "Tåke",
  rain: "Regn",
  lightrain: "Lett regn",
  heavyrain: "Mye regn",
  sleet: "Sludd",
  lightsleet: "Lett sludd",
  heavysleet: "Mye sludd",
  snow: "Snø",
  lightsnow: "Lett snø",
  heavysnow: "Mye snø",
}

/** `lightrainshowersandthunder_day` becomes «Lett regn» with the part Yr's codes add (showers, thunder) put after. */
export function describeSymbol(code: string): string {
  const base = code.replace(/_(day|night|polartwilight)$/, "")
  const thunder = base.includes("andthunder")
  const plain = base.replace("showers", "").replace("andthunder", "")
  const text = SYMBOLS[plain] ?? "Skiftende"
  const showers = base.includes("showers") ? " (byger)" : ""
  return `${text}${showers}${thunder ? " og torden" : ""}`
}

export interface Forecast {
  place: string
  /** Where the forecast is for, for the sun and the aurora there. */
  lat: number
  lon: number
  timeseries: Timeseries[]
}

/** Where the weather is asked for: the device's position, rounded so neighbours share an answer, or the place in the settings (Oslo without one). */
export function weatherPosition(device: Position | null): Position {
  if (device !== null) return coarsePosition(device)
  return { lat: Number(env("WEATHER_LAT") ?? "59.91"), lon: Number(env("WEATHER_LON") ?? "10.75") }
}

/** The whole forecast from MET Norway (the data Yr shows) for the device's position, or for the place in the settings. The complete one, for its UV index. */
export async function getForecast(device: Position | null = null, chosen: string | null = null): Promise<Forecast> {
  const position = device === null ? null : coarsePosition(device)
  const { lat, lon } = weatherPosition(device)
  const place = position === null ? (env("WEATHER_PLACE") ?? "Oslo") : (chosen ?? (await placeName(position.lat, position.lon)) ?? "din posisjon")
  const response = await upstream(forecastUrl(lat, lon), {
    // MET's terms ask for an identifying User-Agent, and that the same forecast in the Nordic area is not asked for more than once in 30 minutes (longer when its `Expires` says so; see `upstream.ts`).
    headers: { "User-Agent": "startside github.com/lmfaole/startside" },
    revalidate: 1800,
  })
  if (!response.ok) throw new Error(`Yr svarte ${response.status}`)
  const body = (await response.json()) as { properties: { timeseries: Timeseries[] } }
  return { place, lat, lon, timeseries: body.properties.timeseries }
}

/** The entries of a forecast for the rest of the day or for the day after, as hours. */
export function hoursOf(forecast: Forecast, window: "today" | "tomorrow", day: Day, instant: Date): Hour[] {
  return pickHours(forecast.timeseries, window, day.date, instant).map((entry): Hour => {
    const next = entry.data.next_1_hours ?? entry.data.next_6_hours
    return {
      time: entry.time,
      temperature: entry.data.instant.details.air_temperature,
      precipitation: next?.details.precipitation_amount ?? 0,
      wind: entry.data.instant.details.wind_speed,
      symbol: next?.summary.symbol_code ?? "cloudy",
    }
  })
}
