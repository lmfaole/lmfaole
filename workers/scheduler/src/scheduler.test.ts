import assert from "node:assert/strict"
import { test } from "node:test"
import { matches } from "./cron.ts"
import { JOBS } from "./jobs.ts"
import { tick, type Env } from "./worker.ts"

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

test("every job runs as often as its cron says on the quarter-hour ticks", () => {
  const runs = new Map<string, number>()
  const week = Date.UTC(2026, 10, 23)
  for (let t = week; t < week + 7 * 86_400_000; t += 900_000) {
    for (const job of JOBS) if (matches(job.cron, new Date(t))) runs.set(job.binding, (runs.get(job.binding) ?? 0) + 1)
  }
  assert.deepEqual(Object.fromEntries(runs), { ACTIVITY: 56, LIKES_SYNC: 1, STARTSIDE: 672, CATALOG: 28 })
})

function env(fail: string[] = []) {
  const calls: { binding: string; cron: string; scheduledTime: number }[] = []
  const binding = (name: string) => ({
    scheduled: async (controller: { cron: string; scheduledTime: number }) => {
      calls.push({ binding: name, ...controller })
      if (fail.includes(name)) throw new Error(`${name} broke`)
    },
  })
  return { calls, env: { ACTIVITY: binding("ACTIVITY"), LIKES_SYNC: binding("LIKES_SYNC"), STARTSIDE: binding("STARTSIDE"), CATALOG: binding("CATALOG") } satisfies Env }
}

test("a tick calls the due Workers with their own cron and the tick's time", async () => {
  const { calls, env: bindings } = env()
  const time = at("2026-11-30T06:00").getTime()
  await tick(bindings, time, () => {})
  assert.deepEqual(calls, [
    { binding: "ACTIVITY", cron: "0 */3 * * *", scheduledTime: time },
    { binding: "STARTSIDE", cron: "*/15 * * * *", scheduledTime: time },
  ])
})

test("the catalog runs a quarter past every sixth hour", async () => {
  const { calls, env: bindings } = env()
  await tick(bindings, at("2026-11-25T06:15").getTime(), () => {})
  assert.deepEqual(calls.map((c) => [c.binding, c.cron]), [
    ["STARTSIDE", "*/15 * * * *"],
    ["CATALOG", "15 */6 * * *"],
  ])
})

test("one failing job does not stop the others, but fails the run", async () => {
  const { calls, env: bindings } = env(["ACTIVITY"])
  await assert.rejects(tick(bindings, at("2026-11-25T09:00").getTime(), () => {}), /failed: ACTIVITY/)
  assert.deepEqual(calls.map((c) => c.binding), ["ACTIVITY", "STARTSIDE"])
})
