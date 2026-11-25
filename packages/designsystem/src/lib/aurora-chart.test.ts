import assert from "node:assert/strict"
import { test } from "node:test"

import { darkAt, formatSlot, summariseAurora } from "./aurora-chart.ts"

const slot = (time: string, kp: number) => ({ time, kp })

test("a slot is named by its day and its three hours in Oslo, midnight as 24", () => {
  assert.equal(formatSlot("2026-11-21T20:00:00Z"), "lør. 21–24")
  assert.equal(formatSlot("2026-11-21T20:00:00Z", false), "21–24")
})

test("the summary says the highest Kp and the dark slots that reach what the place needs", () => {
  const slots = [slot("2026-11-21T14:00:00Z", 5.33), slot("2026-11-21T17:00:00Z", 3), slot("2026-11-21T20:00:00Z", 4.67)]
  const dark = slots.map((_, index) => darkAt(index, [{ from: 0.8, to: 10 }]))
  assert.deepEqual(dark, [false, true, true])
  assert.equal(summariseAurora(slots, 4.5, dark), "Høyest Kp 5,3 lør. 15–18. Kp 4,5, som trengs her, nås i mørket lør. 21–24.")
  assert.equal(summariseAurora(slots, 6, dark), "Høyest Kp 5,3 lør. 15–18. Ingen mørke timer når Kp 6, som trengs her.")
})

test("dark slots that reach one after another are said as one span", () => {
  const slots = [slot("2026-11-21T17:00:00Z", 4.67), slot("2026-11-21T20:00:00Z", 5.33), slot("2026-11-21T23:00:00Z", 3)]
  assert.equal(summariseAurora(slots, 4.5, [true, true, true]), "Høyest Kp 5,3 lør. 21–24. Kp 4,5, som trengs her, nås i mørket lør. 18–24.")
})
