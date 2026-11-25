import assert from "node:assert/strict"
import { test } from "node:test"

import { nextHours, summariseHours, type Timeseries } from "./forecast.ts"

const entry = (hour: number, hourly = true): Timeseries => ({
  time: `2026-11-20T${String(hour).padStart(2, "0")}:00:00Z`,
  data: {
    instant: { details: { air_temperature: hour, wind_speed: 1 } },
    ...(hourly ? { next_1_hours: { summary: { symbol_code: "rain" }, details: { precipitation_amount: 0.5 } } } : {}),
    next_6_hours: { summary: { symbol_code: "rain" }, details: { precipitation_amount: 2 } },
  },
})

test("the chart starts at the hour it is now and stops at the count", () => {
  const series = [8, 9, 10, 11, 12, 13].map((hour) => entry(hour))
  const points = nextHours(series, new Date("2026-11-20T10:20:00Z"), 3)
  assert.deepEqual(points.map((point) => point.temperature), [10, 11, 12])
  assert.equal(points[0]?.precipitation, 0.5)
})

test("the chart uses the hourly symbol, falls back to the six-hour symbol, or has none", () => {
  const hourly = entry(10)
  hourly.data.next_1_hours!.summary.symbol_code = "hourly"

  const fallback = entry(11)
  ;(fallback.data.next_1_hours!.summary as { symbol_code?: string }).symbol_code = undefined
  fallback.data.next_6_hours!.summary.symbol_code = "six-hour"

  const missing = entry(12)
  ;(missing.data.next_1_hours!.summary as { symbol_code?: string }).symbol_code = undefined
  missing.data.next_6_hours = undefined

  const points = nextHours([hourly, fallback, missing], new Date("2026-11-20T10:00:00Z"), 3)
  assert.deepEqual(points.map((point) => point.symbol), ["hourly", "six-hour", undefined])
})

test("the chart ends where the forecast has no more hourly entries", () => {
  const series = [entry(10), entry(11), entry(12, false), entry(18, false)]
  assert.equal(nextHours(series, new Date("2026-11-20T10:00:00Z"), 24).length, 2)
})

test("the hours come to a lowest and highest temperature, all the rain and the strongest wind", () => {
  const points = nextHours([entry(10), entry(11), entry(12)], new Date("2026-11-20T10:00:00Z"), 24)
  assert.deepEqual(summariseHours(points), { min: 10, max: 12, rain: 1.5, wind: 1 })
  assert.equal(summariseHours([]), null)
})
