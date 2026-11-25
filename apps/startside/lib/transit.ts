import type { BoardDeparture } from "@lmfaole/designsystem/lib/departures"

import type { Position } from "./position.ts"

export type Mode = "walk" | "bus" | "tram" | "metro" | "rail" | "ferry" | "other"

export interface Departure {
  /** ISO time of the expected departure. */
  time: string
  /** ISO time of the departure in the timetable. */
  aimed: string
  cancelled: boolean
  /** The platform or bay at the stop (`A`, `2`), when it has one. */
  quay: string | null
  /** A deviation for the departure (Entur's situation), in Norwegian when there is one. */
  notice: string | null
  line: string
  destination: string
  mode: Mode
  realtime: boolean
  stop: string
  /** Metres from the place asked for to the stop. */
  distance: number
  /** The trip (Entur's service journey) the departure is part of, for its stops. */
  journey?: string | null
}

/** One stop on a trip: its stop place and when the trip leaves it (arrives, at the last). */
export interface TripStop {
  id: string
  name: string
  expected: string
  aimed: string
  cancelled: boolean
}

/** A trip's id as Entur gives it (`RUT:ServiceJourney:…`), safe in a query; anything else is not asked for. */
export function isJourneyId(id: string | null | undefined): id is string {
  return typeof id === "string" && /^[A-Z]{2,8}:ServiceJourney:[\w.:-]{1,300}$/.test(id)
}

/** Where on the trip the stop is: by its id, else by its name; 0 when the trip does not call there. */
export function tripPosition(trip: readonly TripStop[], stop: { id: string; name: string }): number {
  const byId = trip.findIndex((call) => call.id === stop.id)
  if (byId !== -1) return byId
  const byName = trip.findIndex((call) => call.name === stop.name)
  return byName === -1 ? 0 : byName
}

/** The departure whose trip is shown for a way the line goes: the next that is not cancelled and has a trip, else the next. */
export function shownTrip<T extends { cancelled: boolean; journey?: string | null }>(departures: readonly T[]): T | undefined {
  return departures.find((departure) => !departure.cancelled && isJourneyId(departure.journey)) ?? departures[0]
}

export interface Stop {
  id: string
  name: string
  /** Metres from the place asked for. */
  distance: number
  /** Where the stop is (Entur's stop place), for its map; null when Entur does not say. */
  at: Position | null
  departures: Departure[]
}

export function modeOf(value: string | null | undefined): Mode {
  switch (value) {
    case "foot":
      return "walk"
    case "bus":
    case "coach":
      return "bus"
    case "tram":
    case "metro":
    case "rail":
      return value
    case "water":
      return "ferry"
    default:
      return "other"
  }
}

/** A departure for the departure board, keyed by its stop, line, destination and time unless a key is given. */
export function toBoard(departure: Departure, key = `${departure.stop}-${departure.line}-${departure.destination}-${departure.aimed}`): BoardDeparture {
  return {
    key,
    line: departure.line,
    mode: departure.mode === "walk" ? "other" : departure.mode,
    destination: departure.destination,
    expected: departure.time,
    aimed: departure.aimed,
    realtime: departure.realtime,
    ...(departure.cancelled ? { cancelled: true } : {}),
    ...(departure.notice === null ? {} : { notice: departure.notice }),
    ...(departure.quay === null ? {} : { quay: departure.quay }),
  }
}

/** The first deviation of a departure (Entur's situations), in Norwegian when it is written in Norwegian, else in its first language. */
export function noticeOf(situations: readonly { summary: readonly { value: string; language: string | null }[] }[]): string | null {
  const summaries = situations.flatMap((situation) => situation.summary).filter((summary) => summary.value.trim() !== "")
  const norwegian = summaries.find((summary) => summary.language === "nob" || summary.language === "no" || summary.language === "nb")
  return (norwegian ?? summaries[0])?.value.trim() ?? null
}

/** Minutes on foot over a distance in metres: about a metre a second, which allows for the streets not being straight. */
export function walkMinutesOver(metres: number): number {
  return Math.max(1, Math.round(metres / 60))
}

const NSR_STOP = "NSR:StopPlace:"

/** The address of a stop's page: the number alone for the national stop register's ids (`NSR:StopPlace:58366` → `58366`), any other id encoded. */
export function stopPath(id: string): string {
  return `/transport/${id.startsWith(NSR_STOP) && /^\d+$/.test(id.slice(NSR_STOP.length)) ? id.slice(NSR_STOP.length) : encodeURIComponent(id)}`
}

/** The stop id in a stop page's address, or null when it is not one: a number is the national register's, anything else must read as `CODESPACE:StopPlace:name`, so it is safe in a query. */
export function stopIdOf(segment: string): string | null {
  let text: string
  try {
    text = decodeURIComponent(segment)
  } catch {
    return null
  }
  if (/^\d{1,9}$/.test(text)) return `${NSR_STOP}${text}`
  return /^[A-Z]{2,8}:StopPlace:[\w-]{1,60}$/.test(text) ? text : null
}

export interface LineChoice {
  line: string
  mode: Mode
}

/** The lines that leave from a stop, each once, in the order of their numbers (`2` before `10`, then letters). */
export function linesOf(departures: readonly Departure[]): LineChoice[] {
  const seen = new Map<string, LineChoice>()
  for (const departure of departures) if (departure.line !== "" && !seen.has(departure.line)) seen.set(departure.line, { line: departure.line, mode: departure.mode })
  return [...seen.values()].toSorted((a, b) => a.line.localeCompare(b.line, "nb", { numeric: true }))
}

/** The address of one line's page from a stop: `/transport/58366/31`. */
export const linePath = (stopId: string, line: string): string => `${stopPath(stopId)}/${encodeURIComponent(line)}`

/** The line in a line page's address, or null when it cannot be one: Entur's public codes are short, letters and numbers («31», «RE11», «FB2»). */
export function lineOf(segment: string): string | null {
  let text: string
  try {
    text = decodeURIComponent(segment)
  } catch {
    return null
  }
  return /^[\p{L}\p{N}][\p{L}\p{N} -]{0,11}$/u.test(text) ? text : null
}

/** The destinations a line goes to from a stop, each once, the soonest first. */
export function destinationsOf(departures: readonly Departure[]): string[] {
  return [...new Set(departures.map((departure) => departure.destination))]
}
