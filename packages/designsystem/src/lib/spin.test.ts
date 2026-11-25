import assert from "node:assert/strict"
import { test } from "node:test"

import { dragSpin, isStill, PITCH_LIMIT, REST, restingYaw, stepSpin, type SpinState } from "./spin.ts"

const run = (state: SpinState, ms: number): SpinState => {
  let next = state
  for (let t = 0; t < ms; t += 16) next = stepSpin(next, 16)
  return next
}

test("let go mid-turn, it coasts on and comes to rest face on, on a whole turn", () => {
  let state = REST
  for (let i = 0; i < 10; i += 1) state = dragSpin(state, 30, 0, 16, 300)
  assert.ok(state.held && state.velocity > 0)
  const thrown = { ...state, held: false }
  const later = run(thrown, 300)
  assert.ok(later.yaw > thrown.yaw, "it coasts on in the way it was thrown")
  assert.deepEqual(run(thrown, 6000), REST)
})

test("let go just past a half turn, it settles on the turn ahead; just short of one, on the turn behind", () => {
  assert.equal(restingYaw(Math.PI * 1.1), Math.PI * 2)
  assert.equal(restingYaw(Math.PI * 0.9), 0)
  assert.equal(restingYaw(-Math.PI * 1.1), -Math.PI * 2)
  assert.ok(isStill(run({ ...REST, yaw: Math.PI * 0.9 }, 6000)))
})

test("dragged up or down it tips only so far, and springs back flat when let go", () => {
  let state = REST
  for (let i = 0; i < 40; i += 1) state = dragSpin(state, 0, 40, 16, 300)
  assert.equal(state.pitch, PITCH_LIMIT)
  assert.deepEqual(run({ ...state, held: false, velocity: 0 }, 6000), REST)
})

test("held, it does not move on its own", () => {
  const held = dragSpin(REST, 50, 0, 16, 300)
  assert.deepEqual(stepSpin(held, 16), held)
})
