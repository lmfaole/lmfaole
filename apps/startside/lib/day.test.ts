import { strict as assert } from "node:assert"
import { test } from "node:test"

import { addDays, dayOf, now, osloDateDaysAgo, partOfHour } from "./day.ts"
import { chosenSections, planFor } from "./plan.ts"

// 2026-11-18 is a Wednesday, CET (UTC+1); 2026-07-15 is a Wednesday, CEST (UTC+2).
const at = (iso: string) => dayOf(new Date(iso))

test("the four parts of the day, with their edges, in Oslo time", () => {
  for (const [hour, part] of [[4, "natt"], [5, "morgen"], [8, "morgen"], [9, "arbeidsdag"], [15, "arbeidsdag"], [16, "kveld"], [21, "kveld"], [22, "natt"], [0, "natt"]] as const) {
    assert.equal(partOfHour(hour), part, `${hour}:00`)
  }
})

test("Oslo time, not UTC: winter is UTC+1 and summer UTC+2", () => {
  assert.equal(at("2026-11-18T07:59:00Z").part, "morgen") // 08:59 CET
  assert.equal(at("2026-11-18T08:00:00Z").part, "arbeidsdag") // 09:00 CET
  assert.equal(at("2026-07-15T06:59:00Z").part, "morgen") // 08:59 CEST
  assert.equal(at("2026-07-15T07:00:00Z").part, "arbeidsdag") // 09:00 CEST
})

test("the clocks changing: 29 March 2026 (summer time) and 25 October 2026 (winter time)", () => {
  assert.equal(at("2026-03-29T02:59:00Z").part, "natt") // 04:59 CEST (the clocks went forward at 01:00Z)
  assert.equal(at("2026-03-29T03:00:00Z").part, "morgen") // 05:00 CEST
  assert.equal(at("2026-10-25T03:59:00Z").part, "natt") // 04:59 CET
  assert.equal(at("2026-10-25T04:00:00Z").part, "morgen") // 05:00 CET
})

test("a day belongs to the date before 05:00 and weekends include the night after Saturday and Sunday", () => {
  assert.equal(at("2026-11-21T23:30:00Z").date, "2026-11-21") // 00:30 Sunday CET: still Saturday's night
  assert.equal(at("2026-11-20T23:30:00Z").date, "2026-11-20") // Fri 20 Nov, 00:30 Sat CET: still Friday's night
  assert.equal(at("2026-11-20T23:30:00Z").weekend, false)
  assert.equal(at("2026-11-21T10:00:00Z").weekend, true) // Saturday
  assert.equal(at("2026-11-22T23:30:00Z").weekend, true) // 00:30 Monday: Sunday's night
  assert.equal(at("2026-11-23T04:30:00Z").weekend, false) // 05:30 Monday
  assert.equal(at("2026-11-18T10:00:00Z").weekend, false)
})

test("addDays crosses months and years", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01")
  assert.equal(addDays("2026-03-01", -1), "2026-02-28")
})

test("the plan for each time of day", () => {
  const weekday = (part: Parameters<typeof planFor>[0]["part"]) => planFor({ part, weekend: false })
  assert.deepEqual(weekday("morgen"), { greeting: "God morgen", sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" })
  assert.deepEqual(weekday("arbeidsdag"), { greeting: "God dag", sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" })
  assert.deepEqual(weekday("kveld"), { greeting: "God kveld", sections: ["alerts", "pulls", "weather"], weatherWindow: "tomorrow", pulls: "mine" })
  assert.deepEqual(weekday("natt"), { greeting: "God natt", sections: ["weather"], weatherWindow: "tomorrow", pulls: "mine" })
})

test("a weekend leaves out reviews and assigned issues", () => {
  assert.deepEqual(planFor({ part: "morgen", weekend: true }), { greeting: "God morgen", sections: ["alerts", "pulls", "weather"], weatherWindow: "today", pulls: "mine" })
  assert.deepEqual(planFor({ part: "arbeidsdag", weekend: true }), { greeting: "God dag", sections: ["alerts", "pulls", "weather"], weatherWindow: "today", pulls: "mine" })
  assert.deepEqual(planFor({ part: "kveld", weekend: true }), { greeting: "God kveld", sections: ["alerts", "pulls", "weather"], weatherWindow: "tomorrow", pulls: "mine" })
  assert.deepEqual(planFor({ part: "natt", weekend: true }), { greeting: "God natt", sections: ["weather"], weatherWindow: "tomorrow", pulls: "mine" })
})

test("NOW stands in for the clock, and nonsense is ignored", () => {
  assert.equal(now("2026-11-18T07:00:00+01:00").toISOString(), "2026-11-18T06:00:00.000Z")
  assert.ok(Math.abs(now("not a date").getTime() - Date.now()) < 5000)
  assert.ok(Math.abs(now(undefined).getTime() - Date.now()) < 5000)
})

import { dailyOutlook, dayHours, dayLabel, forecastDates, pickHours, weatherIcon, type Timeseries } from "./forecast.ts"

const series = (isos: string[]): Timeseries[] => isos.map((time) => ({ time, data: { instant: { details: { air_temperature: 1, wind_speed: 1 } } } }))
const hourly = (from: string, count: number) => series(Array.from({ length: count }, (_, i) => new Date(Date.parse(from) + i * 3_600_000).toISOString().replace(".000Z", "Z")))

test("the forecast for the rest of today stops at midnight in Oslo, not in UTC", () => {
  // Wed 18 Nov 2026, 20:00 CET = 19:00Z. Oslo midnight is 23:00Z, so 22:00Z (23:00 CET) is in, 23:00Z (Thursday 00:00) is out.
  const picked = pickHours(hourly("2026-11-18T19:00:00Z", 8), "today", "2026-11-18", new Date("2026-11-18T19:00:00Z"))
  assert.deepEqual(picked.map((entry) => entry.time), ["2026-11-18T19:00:00Z", "2026-11-18T21:00:00Z"])
})

test("tomorrow is the whole next Oslo day, every third hour", () => {
  const picked = pickHours(hourly("2026-11-18T20:00:00Z", 30), "tomorrow", "2026-11-18", new Date("2026-11-18T20:00:00Z"))
  const hours = picked.map((entry) => new Date(entry.time).toLocaleTimeString("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }))
  assert.deepEqual(hours, ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"])
})

test("after midnight the night still belongs to the day before, so tomorrow is today's calendar date", () => {
  const day = dayOf(new Date("2026-11-19T00:30:00Z")) // 01:30 CET on Thursday 19 Nov
  assert.equal(day.date, "2026-11-18")
  const picked = pickHours(hourly("2026-11-18T23:00:00Z", 26), "tomorrow", day.date, new Date("2026-11-19T00:30:00Z"))
  assert.equal(picked[0]?.time, "2026-11-18T23:00:00Z") // 00:00 CET on Thursday 19 Nov: the whole of the 19th, and nothing of the 18th
})

test("a number of days ago, counted in Oslo dates", () => {
  assert.equal(osloDateDaysAgo(new Date("2026-11-18T12:00:00Z"), 7), "2026-11-11")
  // 23:30 UTC on 17 Nov is 00:30 on 18 Nov in Oslo.
  assert.equal(osloDateDaysAgo(new Date("2026-11-17T23:30:00Z"), 0), "2026-11-18")
  assert.equal(osloDateDaysAgo(new Date("2026-03-02T10:00:00Z"), 7), "2026-02-23")
})

test("the icon for Yr's symbol codes", () => {
  assert.equal(weatherIcon("clearsky_day"), "sun")
  assert.equal(weatherIcon("clearsky_night"), "moon")
  assert.equal(weatherIcon("fair_day"), "weather")
  assert.equal(weatherIcon("partlycloudy_night"), "clouds")
  assert.equal(weatherIcon("cloudy"), "clouds")
  assert.equal(weatherIcon("lightrain"), "rain")
  assert.equal(weatherIcon("heavyrainshowers_day"), "rain")
  assert.equal(weatherIcon("lightsleet"), "snow")
  assert.equal(weatherIcon("snow"), "snow")
  assert.equal(weatherIcon("fog"), "fog")
  assert.equal(weatherIcon("rainandthunder"), "thunder")
  assert.equal(weatherIcon("lightrainshowersandthunder_day"), "thunder")
})

test("the coming days in one line each, from the day after tomorrow", () => {
  const entry = (time: string, temperature: number, hourly?: number, sixHourly?: number, symbol = "cloudy"): Timeseries => ({
    time,
    data: {
      instant: { details: { air_temperature: temperature, wind_speed: 1 } },
      ...(hourly === undefined ? {} : { next_1_hours: { summary: { symbol_code: symbol }, details: { precipitation_amount: hourly } } }),
      ...(sixHourly === undefined ? {} : { next_6_hours: { summary: { symbol_code: symbol }, details: { precipitation_amount: sixHourly } } }),
    },
  })
  const series = [
    entry("2026-11-19T11:00:00Z", 1, 0, 0), // tomorrow: not in the outlook
    // The 20th in Oslo (CET): 00:00 is 23:00Z on the 19th.
    entry("2026-11-19T23:00:00Z", -2, undefined, 0.2), entry("2026-11-20T05:00:00Z", -4, undefined, 0.5), entry("2026-11-20T11:00:00Z", 3, undefined, 1.1, "rain"), entry("2026-11-20T17:00:00Z", 1, undefined, 0.2),
    entry("2026-11-21T11:00:00Z", 5, 0.4, undefined, "lightrain"), entry("2026-11-21T12:00:00Z", 6, 0.1, undefined, "lightrain"),
  ]
  const outlook = dailyOutlook(series, "2026-11-18", 3)
  assert.deepEqual(outlook.map((day) => day.date), ["2026-11-20", "2026-11-21"])
  assert.deepEqual(outlook[0], { date: "2026-11-20", min: -4, max: 3, precipitation: 2, symbol: "rain" })
  assert.deepEqual(outlook[1], { date: "2026-11-21", min: 5, max: 6, precipitation: 0.5, symbol: "lightrain" })
  assert.deepEqual(dailyOutlook([], "2026-11-18", 3), [])
})

test("a day's own chart has its hours while there are hours, then its six-hour entries with their rain, and leaves out the hours gone", () => {
  const entry = (time: string, one?: number, six?: number): Timeseries => ({ time, data: { instant: { details: { air_temperature: 2, wind_speed: 3 } }, ...(one === undefined ? {} : { next_1_hours: { summary: { symbol_code: "rain" }, details: { precipitation_amount: one } } }), ...(six === undefined ? {} : { next_6_hours: { summary: { symbol_code: "cloudy" }, details: { precipitation_amount: six } } }) } })
  const series = [entry("2026-11-19T21:00:00Z", 0.1, 1), entry("2026-11-19T22:00:00Z", 0.3, 1), entry("2026-11-19T23:00:00Z", undefined, 2), entry("2026-11-20T05:00:00Z", undefined, 4)]
  assert.deepEqual(dayHours(series, "2026-11-19").map((hour) => [hour.precipitation, hour.symbol]), [[0.1, "rain"], [0.3, "rain"]])
  assert.deepEqual(dayHours(series, "2026-11-20").map((hour) => [hour.precipitation, hour.symbol]), [[2, "cloudy"], [4, "cloudy"]])
  assert.deepEqual(dayHours(series, "2026-11-19", new Date("2026-11-19T22:10:00Z")).map((hour) => hour.time), ["2026-11-19T22:00:00Z"])
})

test("the days with a page are the Oslo dates the forecast reaches, from today", () => {
  assert.deepEqual(forecastDates(hourly("2026-11-18T22:00:00Z", 3), "2026-11-18"), ["2026-11-18", "2026-11-19"])
  assert.deepEqual(forecastDates(hourly("2026-11-18T22:00:00Z", 3), "2026-11-19"), ["2026-11-19"])
})

test("the front page leaves out the sections the visitor turned off", () => {
  const plan = planFor({ part: "morgen", weekend: false })
  assert.deepEqual(chosenSections(plan.sections, undefined), plan.sections)
  assert.deepEqual(chosenSections(plan.sections, ["weather", "pulls"]), ["pulls", "weather"])
  assert.deepEqual(chosenSections(plan.sections, []), [])
})

test("a day in a row of days is today, tomorrow, or its weekday and date", () => {
  assert.deepEqual(["2026-11-18", "2026-11-19", "2026-11-21"].map((date) => dayLabel(date, "2026-11-18")), ["I dag", "I morgen", "lør. 21."])
})
