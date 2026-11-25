import assert from "node:assert/strict"
import { test } from "node:test"

import type { AuroraSlot } from "./aurora.ts"
import { auroraFigures, daylightByMonth, sunFigures } from "./sky.ts"

test("the sun as figures: the times and the daylight with its change, or the dark time and when it ends", () => {
  const oslo = sunFigures("2026-11-21", 59.91, 10.75)
  assert.deepEqual(oslo.map((figure) => figure.label.split(",")[0]), ["soloppgang", "solnedgang", "dagslys"])
  assert.match(oslo[2]!.label, /^dagslys, \d+ min kortere$/)
  const tromso = sunFigures("2026-12-10", 69.65, 18.96)
  assert.equal(tromso[0]!.value, "Mørketid")
  assert.match(tromso[1]!.value, /januar/)
  assert.equal(sunFigures("2026-06-21", 69.65, 18.96)[0]!.value, "Midnattssol")
})

test("the daylight of each month, short in December and long in June", () => {
  const year = daylightByMonth(2026, 59.91, 10.75)
  assert.equal(year.length, 12)
  assert.deepEqual([year[0]!.month, year[0]!.label], ["2026-01", "jan"])
  assert.ok(year[5]!.hours > 18 && year[11]!.hours < 7)
  assert.equal(daylightByMonth(2026, 69.65, 18.96)[11]!.hours, 0)
})

test("the night as figures: the best time, the chance, the Kp it takes and the moon", () => {
  const slot: AuroraSlot = { from: "2026-11-21T21:00:00Z", to: "2026-11-22T00:00:00Z", kp: 4, clouds: 80, chance: "liten", sky: "god" }
  const figures = auroraFigures(slot, 59.91, 0.5)
  assert.deepEqual(figures.map((figure) => figure.value), ["22–01", "Liten", figures[2]!.value, "50 %"])
  assert.equal(figures[1]!.label, "sjanse, skyene skjuler")
  assert.match(figures[2]!.value, /^Kp /)
  assert.deepEqual(auroraFigures(undefined, 59.91, null).map((figure) => figure.value)[0], "For lyst")
  assert.equal(auroraFigures(undefined, 59.91, null).length, 2)
})
