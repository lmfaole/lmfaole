/**
 * The air (MET's air quality forecast 0.1): the worst hour of the rest of today as a level, and what causes it. MET's index: under 2 is low, 2 moderate,
 * 3 high, 4 very high. Pure: the answer in, the level out; the page passes `now`.
 */
import { TIME_ZONE } from "./format.ts"

export type AirLevel = "low" | "moderate" | "high" | "very-high"

export const AIR_LEVEL_NAMES: Record<AirLevel, string> = { low: "Lite forurenset", moderate: "Moderat forurenset", high: "Høy forurensning", "very-high": "Svært høy forurensning" }

const POLLUTANTS = { AQI_pm10: "svevestøv (PM10)", AQI_pm25: "fint svevestøv (PM2,5)", AQI_no2: "nitrogendioksid (NO₂)", AQI_o3: "ozon (O₃)" } as const

export interface Air {
  level: AirLevel
  aqi: number
  /** The hour of the worst air. */
  time: string
  /** What weighs most in the index then. */
  cause: string | null
  /** Where the forecast is for (MET's area: a part of a municipality). */
  place: string | null
  /** The index each hour from now to the end of today, for a chart. */
  hours: { time: string; aqi: number }[]
}

export const airLevel = (aqi: number): AirLevel => (aqi >= 4 ? "very-high" : aqi >= 3 ? "high" : aqi >= 2 ? "moderate" : "low")

interface Answer {
  meta?: { superlocation?: { name?: string }; location?: { name?: string } }
  data?: { time?: { from?: string; variables?: Record<string, { value?: number }> }[] }
}

const DATE = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE })

/** The worst air from now to the end of today (Oslo time); `null` without data. */
export function parseAir(body: unknown, now: Date): Air | null {
  const answer = body as Answer | null
  const today = DATE.format(now)
  const hours = (answer?.data?.time ?? []).filter((hour) => typeof hour.from === "string" && Date.parse(hour.from) > now.getTime() - 3_600_000 && DATE.format(new Date(hour.from)) === today)
  let worst: { time: string; aqi: number; variables: Record<string, { value?: number }> } | undefined
  for (const hour of hours) {
    const aqi = hour.variables?.AQI?.value
    if (typeof aqi === "number" && (worst === undefined || aqi > worst.aqi)) worst = { time: hour.from!, aqi, variables: hour.variables ?? {} }
  }
  if (worst === undefined) return null
  const variables = worst.variables
  const cause = (Object.keys(POLLUTANTS) as (keyof typeof POLLUTANTS)[]).map((key) => [key, variables[key]?.value ?? 0] as const).toSorted((a, b) => b[1] - a[1])[0]
  return {
    level: airLevel(worst.aqi),
    aqi: worst.aqi,
    time: worst.time,
    cause: cause === undefined || cause[1] < 2 ? null : POLLUTANTS[cause[0]],
    place: answer?.meta?.superlocation?.name ?? answer?.meta?.location?.name ?? null,
    hours: hours.flatMap((hour) => (typeof hour.variables?.AQI?.value === "number" ? [{ time: hour.from!, aqi: hour.variables.AQI.value }] : [])),
  }
}

export const airUrl = (lat: number, lon: number): string => `https://api.met.no/weatherapi/airqualityforecast/0.1/?lat=${lat}&lon=${lon}`
