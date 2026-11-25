import { strict as assert } from "node:assert"
import { test } from "node:test"

import { CLIENTS, rotation } from "./rotation.ts"

test("the relay takes the new key before any app asks with it, and drops the old one only after every app has it", () => {
  const steps = rotation(CLIENTS)
  const at = (match: (step: (typeof steps)[number]) => boolean): number => steps.findIndex(match)
  const next = at((step) => step.do === "put" && step.secret === "UPSTREAM_KEY_NEXT" && step.worker === null)
  const promoted = at((step) => step.do === "put" && step.secret === "UPSTREAM_KEY" && step.worker === null)
  const apps = CLIENTS.map((name) => at((step) => step.do === "put" && step.worker === name))
  assert.equal(next, 0)
  for (const app of apps) assert.ok(next < app && app < promoted)
  assert.deepEqual(steps.at(-1), { do: "delete", secret: "UPSTREAM_KEY_NEXT", worker: null })
})
