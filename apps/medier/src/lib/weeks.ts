/**
 * The weeks of the weekly wrapped: ISO weeks (Monday to Sunday, week 1 is the one with the year's first Thursday), counted in Oslo time. A week is a half-open range of seconds, `[start, end)`, from
 * Monday 00:00 in Oslo to the next Monday 00:00, so the week that has summer time begin or end is an hour short or long and nothing falls in two weeks or none. Pure, so a test pins it.
 */

export const ZONE = "Europe/Oslo"
const DAY = 86_400_000

export interface Week {
  /** `2026-47`: the ISO year and the week, in the address. */
  id: string
  year: number
  number: number
  /** Unix seconds: the week begins at this moment. */
  start: number
  /** Unix seconds: the next week begins at this moment (the week does not include it). */
  end: number
  /** The calendar dates of its Monday and its Sunday, `YYYY-MM-DD`. */
  monday: string
  sunday: string
}

const PARTS = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short" })
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface Wall {
  year: number
  month: number
  day: number
  hour: number
  /** Monday is 0. */
  weekday: number
}

/** What the clock and the calendar of Oslo say at a moment. */
function wall(ms: number): Wall {
  const parts = Object.fromEntries(PARTS.formatToParts(new Date(ms)).map((part) => [part.type, part.value]))
  return { year: Number(parts["year"]), month: Number(parts["month"]), day: Number(parts["day"]), hour: Number(parts["hour"]) % 24, weekday: WEEKDAYS.indexOf(parts["weekday"] ?? "") }
}

/** How many milliseconds Oslo is ahead of UTC at a moment (an hour, or two in summer). */
function offset(ms: number): number {
  const w = wall(ms)
  const second = Math.floor(ms / 1000) % 60
  const minute = Math.floor(ms / 60_000) % 60
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, minute, second) - Math.floor(ms / 1000) * 1000
}

/** The moment, in unix seconds, that a calendar date begins in Oslo. Midnight is never in the hour that summer time skips or repeats, so the guess is corrected once. */
export function osloMidnight(year: number, month: number, day: number): number {
  const utc = Date.UTC(year, month - 1, day)
  return (utc - offset(utc - offset(utc))) / 1000
}

const iso = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

/** The Monday of week 1 of an ISO year, as UTC milliseconds of that calendar date: the week with 4 January in it. */
function firstMonday(year: number): number {
  const jan4 = Date.UTC(year, 0, 4)
  return jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * DAY
}

/** The week of a calendar date (no time zone: the date is the date). */
function weekOfDate(year: number, month: number, day: number): Week {
  const date = Date.UTC(year, month - 1, day)
  const monday = date - ((new Date(date).getUTCDay() + 6) % 7) * DAY
  const thursday = monday + 3 * DAY
  const weekYear = new Date(thursday).getUTCFullYear()
  return build(weekYear, 1 + Math.round((monday - firstMonday(weekYear)) / (7 * DAY)))
}

function build(year: number, number: number): Week {
  const monday = firstMonday(year) + (number - 1) * 7 * DAY
  const [y, m, d] = iso(monday).split("-").map(Number) as [number, number, number]
  const [ny, nm, nd] = iso(monday + 7 * DAY).split("-").map(Number) as [number, number, number]
  return { id: `${year}-${String(number).padStart(2, "0")}`, year, number, start: osloMidnight(y, m, d), end: osloMidnight(ny, nm, nd), monday: iso(monday), sunday: iso(monday + 6 * DAY) }
}

/** The week with an id like `2026-47`, or `null` for anything that is no week (week 53 in a year that has 52, week 0, a made-up year). */
export function parseWeek(id: string): Week | null {
  const match = /^(\d{4})-(\d{2})$/.exec(id)
  if (match === null) return null
  const week = build(Number(match[1]), Number(match[2]))
  return week.number >= 1 && weekOfDate(...(week.monday.split("-").map(Number) as [number, number, number])).id === week.id ? week : null
}

/** The calendar date a moment is on in Oslo. */
export function dateAt(ms: number): { year: number; month: number; day: number } {
  const w = wall(ms)
  return { year: w.year, month: w.month, day: w.day }
}

/** The week a moment is in, by the calendar of Oslo. */
export function weekAt(ms: number): Week {
  const w = wall(ms)
  return weekOfDate(w.year, w.month, w.day)
}

export const previousWeek = (week: Week): Week => weekAt((week.start - 1) * 1000)
export const nextWeek = (week: Week): Week => weekAt(week.end * 1000)

/** The last week that is over: the one before the week `ms` is in. On a Monday morning that is the week that has just ended. */
export const lastCompletedWeek = (ms: number): Week => previousWeek(weekAt(ms))

/** Whether the week is over at `ms`. */
export const isComplete = (week: Week, ms: number): boolean => ms >= week.end * 1000

/** The week `ms` is in and the `count` before it, newest first: the weeks to choose between. */
export function recentWeeks(ms: number, count: number): Week[] {
  const weeks = [weekAt(ms)]
  while (weeks.length <= count) weeks.push(previousWeek(weeks[weeks.length - 1] as Week))
  return weeks
}

/** Where a unix time falls in the week of Oslo: the day (Monday is 0) and the hour of the day (0 to 23). */
export function slotOf(seconds: number): { day: number; hour: number } {
  const w = wall(seconds * 1000)
  return { day: w.weekday, hour: w.hour }
}

const MONTH = new Intl.DateTimeFormat("nb-NO", { month: "long", timeZone: "UTC" })

/** «16.–22. november 2026», «30. november – 6. desember 2026», «28. desember 2026 – 3. januar 2027»: the days a week covers. */
export function rangeText(week: Week): string {
  const [fy, fm, fd] = week.monday.split("-").map(Number) as [number, number, number]
  const [ty, tm, td] = week.sunday.split("-").map(Number) as [number, number, number]
  const month = (y: number, m: number) => MONTH.format(new Date(Date.UTC(y, m - 1, 15)))
  if (fy !== ty) return `${fd}. ${month(fy, fm)} ${fy} – ${td}. ${month(ty, tm)} ${ty}`
  if (fm !== tm) return `${fd}. ${month(fy, fm)} – ${td}. ${month(ty, tm)} ${ty}`
  return `${fd}.–${td}. ${month(ty, tm)} ${ty}`
}

export const WEEKDAY_NAMES = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"] as const
