import assert from "node:assert/strict"
import { test } from "node:test"

import { monthAt } from "./months.ts"
import { dayColumns, monthsUpTo, trendColumns, weeksUpTo } from "./trend.ts"
import { weekAt } from "./weeks.ts"

test("the weeks of a trend end with the one asked for, oldest first", () => {
  const weeks = weeksUpTo(weekAt(Date.parse("2027-01-06T12:00:00Z")), 4)
  assert.deepEqual(weeks.map((week) => week.id), ["2026-51", "2026-52", "2026-53", "2027-01"])
})

test("the months of a trend cross a year", () => {
  assert.deepEqual(monthsUpTo(monthAt(Date.parse("2027-02-10T12:00:00Z")), 3).map((month) => month.id), ["2026-12", "2027-01", "2027-02"])
})

test("a period that could not be told is a gap, and one with no plays is a zero", () => {
  const columns = trendColumns([{ id: "a", total: 5 }, { id: "b", total: null }, { id: "c", total: 0 }], (id) => id.toUpperCase())
  assert.deepEqual(columns, [{ label: "A", value: 5 }, { label: "C", value: 0 }])
})

test("every day of a month has a column", () => {
  const columns = dayColumns({ "2026-11-03": 7, "2026-11-30": 2 }, "2026-11-01", 30)
  assert.equal(columns.length, 30)
  assert.equal(columns[2]?.value, 7)
  assert.equal(columns[29]?.value, 2)
  assert.equal(columns[0]?.value, 0)
})
