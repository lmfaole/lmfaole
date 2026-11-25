import { strict as assert } from "node:assert"
import { test } from "node:test"

import { ageOn, lengthText, longDay, releaseText } from "./days.ts"

test("a calendar date is written out in Norwegian and no time zone moves it", () => {
  assert.equal(longDay("1940-04-25"), "25. april 1940")
  assert.equal(longDay("2026-01-01"), "1. januar 2026")
})

test("an age is whole years: a day before the birthday is a year less, on it and after it is not", () => {
  assert.equal(ageOn("1940-04-25", "2026-04-24"), 85)
  assert.equal(ageOn("1940-04-25", "2026-04-25"), 86)
  assert.equal(ageOn("1940-04-25", "1994-12-31"), 54)
  assert.equal(ageOn("2026-04-25", "2020-01-01"), null)
  assert.equal(ageOn("junk", "2020-01-01"), null)
})

test("a release date is as exact as it is known, and no date at all is nothing", () => {
  assert.equal(releaseText("2023-05-12"), "12. mai 2023")
  assert.equal(releaseText("2023-05"), "mai 2023")
  assert.equal(releaseText("2023"), "2023")
  assert.equal(releaseText("soon"), null)
})

test("a length is minutes and seconds, and hours only when it is that long", () => {
  assert.equal(lengthText(215), "3:35")
  assert.equal(lengthText(59.6), "1:00")
  assert.equal(lengthText(5), "0:05")
  assert.equal(lengthText(3723), "1:02:03")
})
