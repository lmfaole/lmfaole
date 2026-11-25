import { strict as assert } from "node:assert"
import { test } from "node:test"

import { labelStep } from "./chart-format.ts"
import { datumRows } from "./chart-rows.ts"

test("one row per category in the chart's own order, labelled as the axis labels it", () => {
  const rows = datumRows([{ label: "1990", value: 12 }, { label: "2000", value: 7 }], (label) => `${label}-tallet`)
  assert.deepEqual(rows, [["1990-tallet", 12], ["2000-tallet", 7]])
})

test("an axis labels every category up to eight, then every nth, from the number of categories", () => {
  assert.deepEqual([0, 1, 7, 8, 12, 18, 24].map(labelStep), [1, 1, 1, 1, 2, 3, 3])
})
