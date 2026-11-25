/**
 * What the charts of the wrapped are made of: the periods a trend covers, and the columns made from their totals. Pure, so a test pins it.
 */

import { type Month, previousMonth } from "./months.ts"
import type { TrendPoint } from "./week-source.ts"
import { previousWeek, type Week } from "./weeks.ts"

export const TREND_LENGTH = 12

/** The `count` weeks that end with `week`, oldest first. */
export function weeksUpTo(week: Week, count: number): Week[] {
  const weeks = [week]
  while (weeks.length < count) weeks.unshift(previousWeek(weeks[0] as Week))
  return weeks
}

/** The `count` months that end with `month`, oldest first. */
export function monthsUpTo(month: Month, count: number): Month[] {
  const months = [month]
  while (months.length < count) months.unshift(previousMonth(months[0] as Month))
  return months
}

/** The columns of a trend: a period that could not be told is left out (a gap), never drawn as nothing. */
export function trendColumns(points: readonly TrendPoint[], label: (id: string) => string): { label: string; value: number }[] {
  return points.flatMap((point) => (point.total === null ? [] : [{ label: label(point.id), value: point.total }]))
}

/** A column for every day of a month, from its plays per date (a date with none is 0). */
export function dayColumns(byDate: Readonly<Record<string, number>>, first: string, days: number): { label: string; value: number }[] {
  const prefix = first.slice(0, 8)
  return Array.from({ length: days }, (_, index) => ({ label: String(index + 1), value: byDate[`${prefix}${String(index + 1).padStart(2, "0")}`] ?? 0 }))
}
