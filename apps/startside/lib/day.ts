import { DEFAULT_DAY_SETTINGS, PARTS, type DaySettings } from "./day-settings.ts"

export const TIME_ZONE = "Europe/Oslo"

export type DayPart = "morgen" | "arbeidsdag" | "kveld" | "natt"

export interface Day {
  part: DayPart
  /** The Oslo hour, 0–23. */
  hour: number
  /** The weekend days (Saturday and Sunday by default), with the night after their evening: the night after Friday is still a weekday. */
  weekend: boolean
  /** The date the day belongs to, `YYYY-MM-DD` in Oslo: before the morning starts (05:00 by default) it is still the day before. */
  date: string
}

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })

/** The Oslo date (`YYYY-MM-DD`), hour and minute of an instant. A Worker runs in UTC, so the zone is always named. */
export function osloTime(instant: Date): { date: string; hour: number; minute: number } {
  const parts = Object.fromEntries(clock.formatToParts(instant).map((part) => [part.type, part.value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), minute: Number(parts.minute) }
}

/** `YYYY-MM-DD` plus a number of days. */
export function addDays(date: string, days: number): string {
  const moved = new Date(`${date}T12:00:00Z`)
  moved.setUTCDate(moved.getUTCDate() + days)
  return moved.toISOString().slice(0, 10)
}

/** The Oslo date (`YYYY-MM-DD`) a number of days before an instant. */
export function osloDateDaysAgo(instant: Date, days: number): string {
  return addDays(osloTime(instant).date, -days)
}

/** The part of the day a time (minutes after midnight, Oslo) is in: the last one started. By default morning 05–09, workday 09–16, evening 16–22, night 22–05. */
export function partOfMinute(minute: number, starts: DaySettings["starts"] = DEFAULT_DAY_SETTINGS.starts): DayPart {
  const since = (part: DayPart) => (minute - starts[part] + 24 * 60) % (24 * 60)
  return PARTS.reduce((latest, part) => (since(part) < since(latest) ? part : latest))
}

/** The part of the day at the start of an hour (Oslo). */
export function partOfHour(hour: number, starts: DaySettings["starts"] = DEFAULT_DAY_SETTINGS.starts): DayPart {
  return partOfMinute(hour * 60, starts)
}

/** The time of day at an instant, with the visitor's starts and weekend days (`startside_day`, lib/day-settings.ts). */
export function dayOf(instant: Date, settings: Pick<DaySettings, "starts" | "weekendDays"> = DEFAULT_DAY_SETTINGS): Day {
  const { date: calendar, hour, minute } = osloTime(instant)
  const minutes = hour * 60 + minute
  const date = minutes < settings.starts.morgen ? addDays(calendar, -1) : calendar
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  return { part: partOfMinute(minutes, settings.starts), hour, weekend: settings.weekendDays.includes(weekday), date }
}

/** Now; in `next dev`, `NOW` (an ISO time) stands in for it, to see every time of day. Never read in production. */
export function now(override: string | undefined = process.env.NODE_ENV === "production" ? undefined : process.env.NOW): Date {
  const forced = override ? new Date(override) : undefined
  return forced !== undefined && !Number.isNaN(forced.getTime()) ? forced : new Date()
}
