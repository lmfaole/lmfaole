/**
 * Precipitation the next ninety minutes (MET's Nowcast 2.0, from the radar): «Regn om 20 min», «Opphold de neste 90 min». Outside the radar's
 * reach (or when it is down) there is nothing to say. Pure: the answer in, the words out; the page passes `now`.
 */

export interface NowcastPoint {
  time: string
  /** mm/h. */
  rate: number
}

export interface Nowcast {
  /** MET's `radar_coverage`: «ok», «temporarily unavailable», «no coverage». */
  coverage: string
  points: NowcastPoint[]
}

interface Answer {
  properties?: { meta?: { radar_coverage?: string }; timeseries?: { time?: string; data?: { instant?: { details?: { precipitation_rate?: number } } } }[] }
}

export function parseNowcast(body: unknown): Nowcast | null {
  const p = (body as Answer | null)?.properties
  if (p === undefined) return null
  const points = (p.timeseries ?? []).flatMap((entry) => (typeof entry.time === "string" && typeof entry.data?.instant?.details?.precipitation_rate === "number" ? [{ time: entry.time, rate: entry.data.instant.details.precipitation_rate }] : []))
  return { coverage: p.meta?.radar_coverage ?? "ok", points }
}

/** Below this (mm/h) it is not raining: the radar sees drizzle that never reaches the ground. */
export const WET = 0.1

export type RainSummary = { kind: "dry" | "starts" | "raining" | "stops"; text: string; minutes?: number; heaviest: number }

const strength = (rate: number): string => (rate >= 5 ? "Kraftig nedbør" : rate >= 1 ? "Nedbør" : "Litt nedbør")

/**
 * The next ninety minutes in a sentence: when it starts or stops, and how hard at most. `null` without radar (no coverage, or none of it is in the future).
 */
export function rainSummary(nowcast: Nowcast | null, now: Date): RainSummary | null {
  if (nowcast === null || nowcast.coverage !== "ok") return null
  const ahead = nowcast.points.filter((point) => Date.parse(point.time) > now.getTime() - 5 * 60_000)
  if (ahead.length === 0) return null
  const minutesTo = (point: NowcastPoint) => Math.max(0, Math.round((Date.parse(point.time) - now.getTime()) / 60_000 / 5) * 5)
  const heaviest = Math.max(...ahead.map((point) => point.rate))
  const wetNow = (ahead[0]?.rate ?? 0) >= WET
  if (wetNow) {
    const dry = ahead.find((point) => point.rate < WET)
    if (dry === undefined) return { kind: "raining", text: `${strength(heaviest)} de neste ${minutesTo(ahead.at(-1)!)} min`, heaviest }
    const minutes = minutesTo(dry)
    return { kind: "stops", text: `${strength(heaviest)} nå, opphold om ${minutes} min`, minutes, heaviest }
  }
  const wet = ahead.find((point) => point.rate >= WET)
  if (wet === undefined) return { kind: "dry", text: `Opphold de neste ${minutesTo(ahead.at(-1)!)} min`, heaviest }
  const minutes = minutesTo(wet)
  return { kind: "starts", text: `${strength(heaviest)} om ${minutes} min`, minutes, heaviest }
}

export const nowcastUrl = (lat: number, lon: number): string => `https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${lat}&lon=${lon}`
