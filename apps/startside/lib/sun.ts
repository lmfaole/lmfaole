import { addDays, osloTime } from "./day.ts"

/**
 * Where the sun is, worked out here rather than asked for: the formulas of NOAA's solar calculator (as in SunCalc), within a minute or so on an ordinary day (the first and last days of the polar night and the midnight sun can be off by a few, where the sun only grazes the horizon),
 * so the sunrise, the sunset and the dark need no request of their own. The sun has risen when its upper edge clears the horizon with refraction
 * (−0.833°), as Yr and the almanacs count it.
 */

const RAD = Math.PI / 180
const DAY_MS = 86_400_000
const J1970 = 2_440_588
const J2000 = 2_451_545
const OBLIQUITY = RAD * 23.4397
const J0 = 0.0009
const HORIZON = -0.833 * RAD

const toDays = (time: number): number => time / DAY_MS - 0.5 + J1970 - J2000
const fromJulian = (julian: number): Date => new Date((julian + 0.5 - J1970) * DAY_MS)
const meanAnomaly = (days: number): number => RAD * (357.5291 + 0.98560028 * days)
const eclipticLongitude = (anomaly: number): number =>
  anomaly + RAD * (1.9148 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly) + 0.0003 * Math.sin(3 * anomaly)) + RAD * 102.9372 + Math.PI
const declination = (longitude: number): number => Math.asin(Math.sin(OBLIQUITY) * Math.sin(longitude))
const rightAscension = (longitude: number): number => Math.atan2(Math.sin(longitude) * Math.cos(OBLIQUITY), Math.cos(longitude))

/** The sun's height over the horizon at an instant and a place, in degrees. */
export function sunAltitude(instant: Date, lat: number, lon: number): number {
  const days = toDays(instant.getTime())
  const longitude = eclipticLongitude(meanAnomaly(days))
  const siderealTime = RAD * (280.16 + 360.9856235 * days) - RAD * -lon
  const hourAngle = siderealTime - rightAscension(longitude)
  const phi = RAD * lat
  const dec = declination(longitude)
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngle)) / RAD
}

/** A day's sun: when it rises and sets, or that it stays under the horizon (the polar night) or over it (the midnight sun) all day. */
export type SunDay = { kind: "normal"; rise: Date; set: Date; noon: Date } | { kind: "polar-night"; noon: Date } | { kind: "midnight-sun"; noon: Date }

/** The sun on a day in Oslo (`YYYY-MM-DD`) at a place. */
export function sunDay(date: string, lat: number, lon: number): SunDay {
  const lw = RAD * -lon
  const phi = RAD * lat
  const days = toDays(Date.parse(`${date}T12:00:00Z`))
  const cycle = Math.round(days - J0 - lw / (2 * Math.PI))
  const transit = (angle: number): number => J0 + (angle + lw) / (2 * Math.PI) + cycle
  const approximate = transit(0)
  const anomaly = meanAnomaly(approximate)
  const longitude = eclipticLongitude(anomaly)
  const dec = declination(longitude)
  const solarTransit = (at: number): number => J2000 + at + 0.0053 * Math.sin(anomaly) - 0.0069 * Math.sin(2 * longitude)
  const noon = solarTransit(approximate)
  const cosine = (Math.sin(HORIZON) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec))
  if (cosine > 1) return { kind: "polar-night", noon: fromJulian(noon) }
  if (cosine < -1) return { kind: "midnight-sun", noon: fromJulian(noon) }
  const set = solarTransit(transit(Math.acos(cosine)))
  return { kind: "normal", rise: fromJulian(noon - (set - noon)), set: fromJulian(set), noon: fromJulian(noon) }
}

/** How long the sun is up on a day, in minutes. */
export function daylightMinutes(day: SunDay): number {
  if (day.kind === "polar-night") return 0
  if (day.kind === "midnight-sun") return 24 * 60
  return Math.round((day.set.getTime() - day.rise.getTime()) / 60_000)
}

export interface DarkSpan {
  from: string
  to: string
}

/**
 * The spans without the sun around a time window (each sunset to the sunrise after it, ISO), for the meteogram to shade; a span may start before the
 * window and end after it. In the polar night it is one span over all of it; under the midnight sun there are none.
 */
export function darkSpans(from: Date, to: Date, lat: number, lon: number): DarkSpan[] {
  const first = addDays(osloTime(from).date, -1)
  const last = addDays(osloTime(to).date, 1)
  const light: { from: number; to: number }[] = []
  for (let date = first; date <= last; date = addDays(date, 1)) {
    const day = sunDay(date, lat, lon)
    if (day.kind === "normal") light.push({ from: day.rise.getTime(), to: day.set.getTime() })
    if (day.kind === "midnight-sun") light.push({ from: day.noon.getTime() - DAY_MS / 2, to: day.noon.getTime() + DAY_MS / 2 })
  }
  // The days are counted from solar midnight to solar midnight, so a midnight sun leaves nothing over at either end.
  const start = sunDay(first, lat, lon).noon.getTime() - DAY_MS / 2
  const end = sunDay(last, lat, lon).noon.getTime() + DAY_MS / 2
  const spans: DarkSpan[] = []
  let cursor = start
  for (const span of light.toSorted((a, b) => a.from - b.from)) {
    // A midnight sun is noon to noon, which moves a few seconds a day: a gap of minutes is no night.
    if (span.from > cursor + 10 * 60_000) spans.push({ from: new Date(cursor).toISOString(), to: new Date(span.from).toISOString() })
    cursor = Math.max(cursor, span.to)
  }
  if (cursor < end) spans.push({ from: new Date(cursor).toISOString(), to: new Date(end).toISOString() })
  return spans
}

/** Whether it is dark enough to see the aurora: the sun more than 6° under the horizon (past the civil twilight). */
export function darkEnough(instant: Date, lat: number, lon: number): boolean {
  return sunAltitude(instant, lat, lon) < -6
}
