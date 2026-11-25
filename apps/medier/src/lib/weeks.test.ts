import { strict as assert } from "node:assert"
import { test } from "node:test"

import { isComplete, lastCompletedWeek, nextWeek, parseWeek, previousWeek, rangeText, recentWeeks, slotOf, weekAt } from "./weeks.ts"

const at = (iso: string): number => Date.parse(iso)

test("a week is ISO's: week 47 of 2026 is Monday 16 to Sunday 22 November, and an id is read back to the same week", () => {
  const week = parseWeek("2026-47")
  assert.equal(week?.monday, "2026-11-16")
  assert.equal(week?.sunday, "2026-11-22")
  assert.equal(weekAt(at("2026-11-19T10:00:00Z")).id, "2026-47")
  assert.equal(weekAt(at("2026-11-16T00:00:00+01:00")).id, "2026-47")
  assert.equal(weekAt(at("2026-11-15T23:59:59+01:00")).id, "2026-46")
})

test("a week begins and ends at midnight in Oslo, so no moment is in two weeks or none", () => {
  const week = parseWeek("2026-47")
  assert.equal(week?.start, at("2026-11-15T23:00:00Z") / 1000)
  assert.equal(week?.end, at("2026-11-22T23:00:00Z") / 1000)
  assert.equal(previousWeek(week as NonNullable<typeof week>).end, week?.start)
  assert.equal(nextWeek(week as NonNullable<typeof week>).start, week?.end)
})

test("the week summer time begins is an hour short and the one it ends an hour long", () => {
  const hours = (id: string) => {
    const week = parseWeek(id)
    return week === null ? 0 : (week.end - week.start) / 3600
  }
  assert.equal(hours("2026-13"), 167)
  assert.equal(hours("2026-43"), 169)
  assert.equal(hours("2026-47"), 168)
})

test("the weeks around New Year follow ISO: 1 January 2027 is in week 53 of 2026, and week 53 is only in a year that has one", () => {
  assert.equal(weekAt(at("2027-01-01T12:00:00Z")).id, "2026-53")
  assert.equal(weekAt(at("2021-01-01T12:00:00Z")).id, "2020-53")
  assert.equal(weekAt(at("2027-01-04T12:00:00Z")).id, "2027-01")
  assert.equal(weekAt(at("2025-12-29T12:00:00Z")).id, "2026-01")
  assert.notEqual(parseWeek("2026-53"), null)
  assert.equal(parseWeek("2025-53"), null)
  for (const bad of ["2026-00", "2026-54", "26-47", "2026-4", "nonsense", ""]) assert.equal(parseWeek(bad), null, bad)
})

test("the last completed week is the one before the week it is: on Monday just after midnight it is the week that has ended, and on Sunday evening the one before", () => {
  assert.equal(lastCompletedWeek(at("2026-11-23T00:30:00+01:00")).id, "2026-47")
  assert.equal(lastCompletedWeek(at("2026-11-22T22:00:00+01:00")).id, "2026-46")
  const week = parseWeek("2026-47")
  assert.ok(week !== null && !isComplete(week, at("2026-11-22T22:59:59Z")) && isComplete(week, at("2026-11-22T23:00:00Z")))
})

test("the weeks to choose between are this week and the ones before it, newest first", () => {
  assert.deepEqual(recentWeeks(at("2026-11-19T10:00:00Z"), 3).map((week) => week.id), ["2026-47", "2026-46", "2026-45", "2026-44"])
})

test("a time is placed in the day and the hour of Oslo: Monday is 0, and late Sunday evening in Norway is still Sunday", () => {
  assert.deepEqual(slotOf(at("2026-11-16T08:30:00Z") / 1000), { day: 0, hour: 9 })
  assert.deepEqual(slotOf(at("2026-07-19T21:30:00Z") / 1000), { day: 6, hour: 23 })
  assert.deepEqual(slotOf(at("2026-07-19T22:30:00Z") / 1000), { day: 0, hour: 0 })
})

test("a week's days are written out as far as they differ", () => {
  assert.equal(rangeText(parseWeek("2026-47") as NonNullable<ReturnType<typeof parseWeek>>), "16.–22. november 2026")
  assert.equal(rangeText(parseWeek("2026-49") as NonNullable<ReturnType<typeof parseWeek>>), "30. november – 6. desember 2026")
  assert.equal(rangeText(parseWeek("2026-53") as NonNullable<ReturnType<typeof parseWeek>>), "28. desember 2026 – 3. januar 2027")
})
