/**
 * The months of the monthly wrapped: calendar months in Oslo time, from the 1st at 00:00 to the 1st of the next month at 00:00 (a half-open range of seconds, like a week, so nothing falls in two months or none). Pure, so a test
 * pins it; the weeks are `weeks.ts`.
 */

import { dateAt, osloMidnight } from "./weeks.ts"

export interface Month {
  /** `2026-11`, in the address. */
  id: string
  year: number
  /** 1 to 12. */
  number: number
  /** Unix seconds: the month begins at this moment. */
  start: number
  /** Unix seconds: the next month begins at this moment (the month does not include it). */
  end: number
  /** The calendar dates of its first and its last day, `YYYY-MM-DD`. */
  first: string
  last: string
  /** How many days it has. */
  days: number
}

const two = (n: number): string => String(n).padStart(2, "0")

function build(year: number, number: number): Month {
  const nextYear = number === 12 ? year + 1 : year
  const nextNumber = number === 12 ? 1 : number + 1
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate()
  return { id: `${year}-${two(number)}`, year, number, start: osloMidnight(year, number, 1), end: osloMidnight(nextYear, nextNumber, 1), first: `${year}-${two(number)}-01`, last: `${year}-${two(number)}-${two(days)}`, days }
}

/** The month with an id like `2026-11`, or `null` for anything that is no month (month 13, month 0, a year that is not four digits). */
export function parseMonth(id: string): Month | null {
  const match = /^(\d{4})-(\d{2})$/.exec(id)
  if (match === null) return null
  const number = Number(match[2])
  return number >= 1 && number <= 12 ? build(Number(match[1]), number) : null
}

/** The month a moment is in, by the calendar of Oslo. */
export function monthAt(ms: number): Month {
  const date = dateAt(ms)
  return build(date.year, date.month)
}

export const previousMonth = (month: Month): Month => monthAt((month.start - 1) * 1000)
export const nextMonth = (month: Month): Month => monthAt(month.end * 1000)

/** The last month that is over: the one before the month `ms` is in. On the 1st just after midnight that is the month that has just ended. */
export const lastCompletedMonth = (ms: number): Month => previousMonth(monthAt(ms))

/** The month `ms` is in and the `count` before it, newest first: the months to choose between. */
export function recentMonths(ms: number, count: number): Month[] {
  const months = [monthAt(ms)]
  while (months.length <= count) months.push(previousMonth(months[months.length - 1] as Month))
  return months
}

const NAME = new Intl.DateTimeFormat("nb-NO", { month: "long", timeZone: "UTC" })
const monthName = (number: number): string => NAME.format(new Date(Date.UTC(2000, number - 1, 15)))

/** «november 2026». */
export const monthText = (month: Month): string => `${monthName(month.number)} ${month.year}`

/** «okt.»: the month's short name, for under a column (twelve months in a row never repeat one). */
export const monthShort = (month: Month): string => new Intl.DateTimeFormat("nb-NO", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2000, month.number - 1, 15)))

/** «November 2026», for a title. */
export const monthTitle = (month: Month): string => monthText(month).replace(/^./, (letter) => letter.toUpperCase())

/** «1.–30. november 2026»: the days a month covers. */
export const monthRange = (month: Month): string => `1.–${month.days}. ${monthText(month)}`
