import { strict as assert } from "node:assert"
import { test } from "node:test"

import { periodLabel } from "./period.ts"

test("a period is its years, «nå» while it has no end, and one year when it starts and ends in it", () => {
  assert.equal(periodLabel("2023-04-01", "2025-03-31", 2023), "2023–2025")
  assert.equal(periodLabel("2025-04-01", null, 2025), "2025–nå")
  assert.equal(periodLabel("2021-06-01", "2021-08-31", 2021), "2021")
  assert.equal(periodLabel(null, "2021-08-31", 2019), "2019–2021")
})
