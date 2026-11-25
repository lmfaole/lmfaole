import type { IconName } from "@lmfaole/designsystem/lib/icons"

import { addDays, osloTime, TIME_ZONE } from "./day.ts"

export interface Timeseries {
  time: string
  data: {
    instant: { details: { air_temperature: number; wind_speed: number; cloud_area_fraction?: number; ultraviolet_index_clear_sky?: number } }
    next_1_hours?: { summary: { symbol_code: string }; details: { precipitation_amount: number } }
    next_6_hours?: { summary: { symbol_code: string }; details: { precipitation_amount: number } }
  }
}

/**
 * The entries of a forecast that belong to a window, counted in Oslo time (a Worker runs in UTC): `today` is what is
 * left of the day `date`, one entry per two hours; `tomorrow` is the whole day after it, one per three hours.
 */
export function pickHours(timeseries: readonly Timeseries[], window: "today" | "tomorrow", date: string, instant: Date): Timeseries[] {
  const target = window === "today" ? date : addDays(date, 1)
  const inDay = timeseries.filter((entry) => {
    const time = new Date(entry.time)
    return osloTime(time).date === target && (window === "tomorrow" || time.getTime() >= instant.getTime() - 3_600_000)
  })
  return window === "today" ? inDay.filter((_, index) => index % 2 === 0) : inDay.filter((entry) => osloTime(new Date(entry.time)).hour % 3 === 0)
}

/** One hour of the chart: when, the temperature and the rain that falls in the hour after. */
export interface HourPoint {
  time: string
  temperature: number
  precipitation: number
  wind: number
  symbol?: string
}

/** The next `count` hourly entries from the hour `instant` is in, for the chart; a forecast that has gone over to six-hourly entries ends it there. */
export function nextHours(timeseries: readonly Timeseries[], instant: Date, count: number): HourPoint[] {
  const points: HourPoint[] = []
  for (const entry of timeseries) {
    if (points.length === count) break
    if (new Date(entry.time).getTime() < instant.getTime() - 3_600_000 + 1) continue
    if (entry.data.next_1_hours === undefined) break
    points.push({ time: entry.time, temperature: entry.data.instant.details.air_temperature, precipitation: entry.data.next_1_hours.details.precipitation_amount, wind: entry.data.instant.details.wind_speed, symbol: entry.data.next_1_hours?.summary.symbol_code ?? entry.data.next_6_hours?.summary.symbol_code })
  }
  return points
}

/** What the hours of the chart come to: the lowest and highest temperature, the rain that falls in all, and the strongest wind. */
export function summariseHours(points: readonly HourPoint[]): { min: number; max: number; rain: number; wind: number } | null {
  if (points.length === 0) return null
  const temperatures = points.map((point) => point.temperature)
  return {
    min: Math.min(...temperatures),
    max: Math.max(...temperatures),
    rain: points.reduce((sum, point) => sum + point.precipitation, 0),
    wind: Math.max(...points.map((point) => point.wind)),
  }
}

/** The icon for one of Yr's symbol codes (`lightrainshowersandthunder_day`): thunder before rain before snow before fog before cloud before clear. */
export function weatherIcon(code: string): IconName {
  const base = code.replace(/_(day|night|polartwilight)$/, "")
  const night = code.endsWith("_night")
  if (base.includes("thunder")) return "thunder"
  if (base.includes("sleet") || base.includes("snow")) return "snow"
  if (base.includes("rain")) return "rain"
  if (base === "fog") return "fog"
  if (base === "cloudy") return "clouds"
  if (base === "clearsky") return night ? "moon" : "sun"
  return night ? "clouds" : "weather"
}

export interface Outlook {
  /** The Oslo date, `YYYY-MM-DD`. */
  date: string
  min: number
  max: number
  /** Millimetres over the day, as far as the forecast has it. */
  precipitation: number
  /** The symbol code at midday, or the first the day has. */
  symbol: string
}

/**
 * The coming days in one line each: lowest and highest temperature, rain, and the symbol at midday. Counted in Oslo dates,
 * starting the day after `date` (today and tomorrow are shown by the hour). The forecast has hourly entries for the first days
 * and six-hourly after, so the rain is read from `next_6_hours` at 00, 06, 12 and 18 where it is there and from the hourly
 * entries otherwise.
 */
export function dailyOutlook(timeseries: readonly Timeseries[], date: string, days: number): Outlook[] {
  return Array.from({ length: days }, (_, index) => dayOutlook(timeseries, addDays(date, index + 2))).filter((one) => one !== null)
}

/** One date (Oslo time) of a forecast in one line, as `dailyOutlook` reads it; null when the forecast has nothing of it. */
export function dayOutlook(timeseries: readonly Timeseries[], target: string): Outlook | null {
  const entries = timeseries.filter((entry) => osloTime(new Date(entry.time)).date === target)
  if (entries.length === 0) return null
  const temperatures = entries.map((entry) => entry.data.instant.details.air_temperature)
  const sixHourly = entries.filter((entry) => osloTime(new Date(entry.time)).hour % 6 === 0 && entry.data.next_6_hours !== undefined)
  const precipitation = sixHourly.length >= 3 ? sixHourly.reduce((sum, entry) => sum + (entry.data.next_6_hours?.details.precipitation_amount ?? 0), 0) : entries.reduce((sum, entry) => sum + (entry.data.next_1_hours?.details.precipitation_amount ?? 0), 0)
  const midday = entries.find((entry) => osloTime(new Date(entry.time)).hour === 12) ?? entries[0]
  return {
    date: target,
    min: Math.min(...temperatures),
    max: Math.max(...temperatures),
    precipitation: Math.round(precipitation * 10) / 10,
    symbol: midday?.data.next_6_hours?.summary.symbol_code ?? midday?.data.next_1_hours?.summary.symbol_code ?? "cloudy",
  }
}

/** The dates (Oslo time) the forecast reaches, from `from` on: the days that have a page of their own. */
export function forecastDates(timeseries: readonly Timeseries[], from: string): string[] {
  return [...new Set(timeseries.map((entry) => osloTime(new Date(entry.time)).date))].filter((date) => date >= from)
}

/**
 * Every entry of a date (Oslo time) for the day's chart: by the hour while the forecast has hours, then by six hours, whose rain is
 * the six hours' rain. `from` leaves out the hours that are gone (today).
 */
export function dayHours(timeseries: readonly Timeseries[], date: string, from?: Date): HourPoint[] {
  return timeseries.flatMap((entry): HourPoint[] => {
    if (osloTime(new Date(entry.time)).date !== date) return []
    if (from !== undefined && new Date(entry.time).getTime() < from.getTime() - 3_600_000 + 1) return []
    const next = entry.data.next_1_hours ?? entry.data.next_6_hours
    return [{ time: entry.time, temperature: entry.data.instant.details.air_temperature, precipitation: next?.details.precipitation_amount ?? 0, wind: entry.data.instant.details.wind_speed, ...(next === undefined ? {} : { symbol: next.summary.symbol_code }) }]
  })
}

/** The strongest sun of a date (Oslo time) in clear sky, as MET's UV index, and the hour it peaks; `null` when the forecast has no UV (the compact one). */
export function uvPeak(timeseries: readonly Timeseries[], date: string): { uv: number; time: string } | null {
  let peak: { uv: number; time: string } | null = null
  for (const entry of timeseries) {
    const uv = entry.data.instant.details.ultraviolet_index_clear_sky
    if (typeof uv !== "number" || osloTime(new Date(entry.time)).date !== date) continue
    if (peak === null || uv > peak.uv) peak = { uv, time: entry.time }
  }
  return peak
}

/** The UV index in clear sky each hour of a date (Oslo time) while the sun gives any, for a chart; empty without UV in the forecast. */
export function uvHours(timeseries: readonly Timeseries[], date: string): { time: string; uv: number }[] {
  return timeseries.flatMap((entry) => {
    const uv = entry.data.instant.details.ultraviolet_index_clear_sky
    return typeof uv === "number" && uv >= 0.05 && osloTime(new Date(entry.time)).date === date ? [{ time: entry.time, uv: Math.round(uv * 10) / 10 }] : []
  })
}

/** The WHO's words for a UV index: under 3 low, 3–5 moderate, 6–7 high, 8–10 very high, 11 and above extreme. */
export function uvLevel(uv: number): { name: string; advice: string | null } {
  const index = Math.round(uv)
  if (index < 3) return { name: "Lav", advice: null }
  if (index < 6) return { name: "Moderat", advice: "Solkrem og solbriller midt på dagen." }
  if (index < 8) return { name: "Høy", advice: "Søk skygge midt på dagen, bruk solkrem." }
  if (index < 11) return { name: "Svært høy", advice: "Unngå sola midt på dagen." }
  return { name: "Ekstrem", advice: "Hold deg i skyggen midt på dagen." }
}

const WEEKDAY = new Intl.DateTimeFormat("nb-NO", { weekday: "short", day: "numeric", timeZone: TIME_ZONE })

/** A day in a row of days, short: «I dag», «I morgen», then «lør. 22.». */
export function dayLabel(date: string, today: string): string {
  if (date === today) return "I dag"
  if (date === addDays(today, 1)) return "I morgen"
  return WEEKDAY.format(new Date(`${date}T12:00:00Z`))
}
