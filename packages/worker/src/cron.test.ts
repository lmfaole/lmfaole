import assert from "node:assert/strict"
import { test } from "node:test"
import { matches } from "./cron.ts"

const at = (iso: string) => new Date(`${iso}Z`)

test("cron fields: steps, ranges, lists and Sunday as 7", () => {
  assert.equal(matches("*/15 * * * *", at("2026-11-25T09:45")), true)
  assert.equal(matches("*/15 * * * *", at("2026-11-25T09:50")), false)
  assert.equal(matches("0 */3 * * *", at("2026-11-25T09:00")), true)
  assert.equal(matches("0 */3 * * *", at("2026-11-25T10:00")), false)
  assert.equal(matches("0 5 * * 1", at("2026-11-30T05:00")), true)
  assert.equal(matches("0 5 * * 1", at("2026-11-25T05:00")), false)
  assert.equal(matches("0 3 * * 7", at("2026-11-29T03:00")), true)
  assert.equal(matches("10-20/5,59 * * * *", at("2026-11-25T09:15")), true)
  assert.equal(matches("10-20/5,59 * * * *", at("2026-11-25T09:25")), false)
  assert.throws(() => matches("61 * * * *", at("2026-11-25T09:00")))
  assert.throws(() => matches("* * *", at("2026-11-25T09:00")))
})

test("with both days restricted, either may match", () => {
  assert.equal(matches("0 0 1 * 1", at("2026-11-30T00:00")), true)
  assert.equal(matches("0 0 1 * 1", at("2026-12-01T00:00")), true)
  assert.equal(matches("0 0 1 * 1", at("2026-12-02T00:00")), false)
})
