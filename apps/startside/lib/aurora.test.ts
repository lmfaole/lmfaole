import assert from "node:assert/strict"
import { test } from "node:test"

import { auroraNight, bestSlot, chanceFromKp, kpNeeded, parseKp } from "./aurora.ts"
import { nightWord } from "./sky.ts"

test("SWPC's times have no zone and are UTC; measured and forecast are told apart", () => {
  const slots = parseKp([
    { time_tag: "2026-11-21T18:00:00", kp: 3.33, observed: "observed", noaa_scale: null },
    { time_tag: "2026-11-21T21:00:00", kp: 4.67, observed: "predicted", noaa_scale: "G1" },
    { nonsense: true },
  ])
  assert.deepEqual(slots, [
    { time: "2026-11-21T18:00:00.000Z", kp: 3.33, observed: true },
    { time: "2026-11-21T21:00:00.000Z", kp: 4.67, observed: false },
  ])
})

test("the further south, the more Kp it takes: none in Tromsø, about five in Oslo", () => {
  assert.equal(kpNeeded(69.65), 0)
  assert.ok(kpNeeded(59.91) > 4 && kpNeeded(59.91) < 5.5)
  assert.equal(chanceFromKp(1, 69.65), "god")
  assert.equal(chanceFromKp(3.7, 59.91), "mulig")
  assert.equal(chanceFromKp(2, 59.91), "liten")
})

test("the night keeps only the dark slots, and clouds take the chance down", () => {
  const kp = ["12", "15", "18", "21"].map((hour) => ({ time: `2026-11-21T${hour}:00:00.000Z`, kp: 5, observed: false }))
  const clouds = [
    { time: "2026-11-21T18:00:00Z", clouds: 90 },
    { time: "2026-11-21T19:00:00Z", clouds: 80 },
    { time: "2026-11-21T21:00:00Z", clouds: 10 },
  ]
  const night = auroraNight(kp, clouds, new Date("2026-11-21T11:00:00Z"), 59.91, 10.75)
  assert.deepEqual(night.map((slot) => [slot.from.slice(11, 13), slot.clouds, slot.chance]), [["15", null, "god"], ["18", 85, "liten"], ["21", 10, "god"]])
  assert.equal(bestSlot(night)?.from, "2026-11-21T15:00:00.000Z", "a tie goes to the earliest")
})

test("the night is one night: the next evening is left out", () => {
  const kp = ["2026-11-21T21", "2026-11-22T00", "2026-11-22T18"].map((hour) => ({ time: `${hour}:00:00.000Z`, kp: 2, observed: false }))
  const night = auroraNight(kp, [], new Date("2026-11-21T20:00:00Z"), 69.65, 18.96)
  assert.deepEqual(night.map((slot) => slot.from.slice(0, 13)), ["2026-11-21T21", "2026-11-22T00"])
})

test("an aurora slot is said as tonight before midnight in Oslo and as the night after it", () => {
  assert.equal(nightWord({ from: "2026-11-21T20:00:00Z" }), "i kveld")
  assert.equal(nightWord({ from: "2026-11-21T23:00:00Z" }), "i natt")
})
