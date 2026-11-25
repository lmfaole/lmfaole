import assert from "node:assert/strict"
import { test } from "node:test"

import { darkEnough, darkSpans, daylightMinutes, sunDay } from "./sun.ts"

const minutes = (date: Date): number => date.getUTCHours() * 60 + date.getUTCMinutes()

test("the sun in Oslo rises about half past eight and sets about half past three in late November", () => {
  const day = sunDay("2026-11-21", 59.91, 10.75)
  assert.equal(day.kind, "normal")
  if (day.kind !== "normal") return
  assert.ok(Math.abs(minutes(day.rise) - (7 * 60 + 30)) <= 10)
  assert.ok(Math.abs(minutes(day.set) - (14 * 60 + 39)) <= 10)
  assert.ok(daylightMinutes(day) > 6 * 60 && daylightMinutes(day) < 8 * 60)
})

test("Tromsø has the polar night in December and the midnight sun in June; the sun still rises briefly the day before the dark time", () => {
  assert.equal(sunDay("2026-12-10", 69.65, 18.96).kind, "polar-night")
  assert.equal(sunDay("2026-06-21", 69.65, 18.96).kind, "midnight-sun")
  assert.equal(sunDay("2026-11-26", 69.65, 18.96).kind, "normal")
  assert.equal(daylightMinutes(sunDay("2026-12-10", 69.65, 18.96)), 0)
})

test("the dark spans run from each sunset to the next sunrise, and the polar night is one span over the whole window", () => {
  const oslo = darkSpans(new Date("2026-11-21T21:00:00Z"), new Date("2026-11-22T21:00:00Z"), 59.91, 10.75)
  const night = oslo.find((span) => span.from.startsWith("2026-11-21T14"))
  assert.ok(night?.to.startsWith("2026-11-22T07"))
  const tromso = darkSpans(new Date("2026-12-10T10:00:00Z"), new Date("2026-12-11T10:00:00Z"), 69.65, 18.96)
  assert.equal(tromso.length, 1)
  assert.equal(darkSpans(new Date("2026-06-21T10:00:00Z"), new Date("2026-06-22T10:00:00Z"), 69.65, 18.96).length, 0)
})

test("it is dark enough for the aurora at night but not at dusk", () => {
  assert.equal(darkEnough(new Date("2026-11-21T21:00:00Z"), 59.91, 10.75), true)
  assert.equal(darkEnough(new Date("2026-11-21T14:50:00Z"), 59.91, 10.75), false)
})
