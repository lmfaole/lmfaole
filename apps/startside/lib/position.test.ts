import { strict as assert } from "node:assert"
import { test } from "node:test"

import { coarsePosition, formatPosition, movedFar, parsePosition, positionParam, positionQuery, roundPosition } from "./position.ts"

test("a position from the address, rounded to three decimals", () => {
  assert.deepEqual(parsePosition("59.91394,10.75228"), { lat: 59.914, lon: 10.752 })
  assert.deepEqual(parsePosition("59.91%2C10.75"), { lat: 59.91, lon: 10.75 })
  assert.deepEqual(parsePosition("-33.87,151.21"), { lat: -33.87, lon: 151.21 })
  assert.deepEqual(parsePosition("0,0"), { lat: 0, lon: 0 })
})
test("anything that is not a position is nothing", () => {
  for (const bad of [undefined, "", "abc", "59.91", "59.91,", "91,10", "59,181", "59.91,10.75,3", "59.91;10.75", "NaN,NaN", "1e3,2", "59.91, 10.75; x"]) {
    assert.equal(parsePosition(bad), null, String(bad))
  }
})

test("a position is written with three decimals and read back the same", () => {
  const written = formatPosition(roundPosition({ lat: 59.9139, lon: 10.7522 }))
  assert.equal(written, "59.914,10.752")
  assert.deepEqual(parsePosition(written), { lat: 59.914, lon: 10.752 })
})

test("the forecast is asked for to two decimals", () => {
  assert.deepEqual(coarsePosition({ lat: 59.929, lon: 10.765 }), { lat: 59.93, lon: 10.77 })
})

test("moving about two hundred metres counts as moving", () => {
  assert.equal(movedFar({ lat: 59.929, lon: 10.765 }, { lat: 59.93, lon: 10.767 }), false)
  assert.equal(movedFar({ lat: 59.929, lon: 10.765 }, { lat: 59.931, lon: 10.765 }), true)
  assert.equal(movedFar({ lat: 59.929, lon: 10.765 }, { lat: 59.929, lon: 10.769 }), true)
})

test("the position is the address's ?pos=, and goes on to the next page the same way", () => {
  assert.deepEqual(positionParam({ pos: "59.91394,10.75228" }), { lat: 59.914, lon: 10.752 })
  assert.deepEqual(positionParam({ pos: ["59.9,10.7", "1,1"] }), { lat: 59.9, lon: 10.7 })
  assert.equal(positionParam({}), null)
  assert.equal(positionParam({ pos: "x" }), null)
  assert.equal(positionQuery({ lat: 59.9, lon: 10.75 }), "?pos=59.900,10.750")
  assert.equal(positionQuery(null), "")
})
