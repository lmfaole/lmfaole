import { strict as assert } from "node:assert"
import { test } from "node:test"

import { lastCompletedMonth, monthAt, monthRange, monthText, monthTitle, nextMonth, parseMonth, previousMonth, recentMonths } from "./months.ts"

const at = (iso: string): number => Date.parse(iso)

test("a month is a calendar month: an id is read back to the same month, and an id that is no month is nothing", () => {
  const month = parseMonth("2026-11")
  assert.equal(month?.first, "2026-11-01")
  assert.equal(month?.last, "2026-11-30")
  assert.equal(month?.days, 30)
  assert.equal(monthAt(at("2026-11-19T10:00:00Z")).id, "2026-11")
  for (const bad of ["2026-00", "2026-13", "26-11", "2026-1", "nonsense", ""]) assert.equal(parseMonth(bad), null, bad)
})

test("a month begins and ends at midnight in Oslo, so no moment is in two months or none, and the 1st just after midnight is in the new month", () => {
  const month = parseMonth("2026-11")
  assert.equal(month?.start, at("2026-10-31T23:00:00Z") / 1000)
  assert.equal(month?.end, at("2026-11-30T23:00:00Z") / 1000)
  assert.equal(previousMonth(month as NonNullable<typeof month>).end, month?.start)
  assert.equal(nextMonth(month as NonNullable<typeof month>).start, month?.end)
  assert.equal(monthAt(at("2026-12-01T00:30:00+01:00")).id, "2026-12")
  assert.equal(monthAt(at("2026-11-30T23:59:59+01:00")).id, "2026-11")
})

test("the month summer time begins is a day short of an hour and the one it ends a day and an hour, and February has the days it has", () => {
  const hours = (id: string) => {
    const month = parseMonth(id)
    return month === null ? 0 : (month.end - month.start) / 3600
  }
  assert.equal(hours("2026-03"), 31 * 24 - 1)
  assert.equal(hours("2026-10"), 31 * 24 + 1)
  assert.equal(parseMonth("2026-02")?.days, 28)
  assert.equal(parseMonth("2028-02")?.days, 29)
})

test("December is followed by January of the next year, and the last completed month is the one before the month it is", () => {
  assert.equal(nextMonth(parseMonth("2026-12") as NonNullable<ReturnType<typeof parseMonth>>).id, "2027-01")
  assert.equal(previousMonth(parseMonth("2027-01") as NonNullable<ReturnType<typeof parseMonth>>).id, "2026-12")
  assert.equal(lastCompletedMonth(at("2026-12-01T00:10:00+01:00")).id, "2026-11")
  assert.equal(lastCompletedMonth(at("2026-11-30T22:00:00+01:00")).id, "2026-10")
})

test("the months to choose between are this month and the ones before it, newest first, across a year", () => {
  assert.deepEqual(recentMonths(at("2027-02-10T10:00:00Z"), 3).map((month) => month.id), ["2027-02", "2027-01", "2026-12", "2026-11"])
})

test("a month is written as it is said, and its days as far as they go", () => {
  const month = parseMonth("2026-11") as NonNullable<ReturnType<typeof parseMonth>>
  assert.equal(monthText(month), "november 2026")
  assert.equal(monthTitle(month), "November 2026")
  assert.equal(monthRange(month), "1.–30. november 2026")
})
