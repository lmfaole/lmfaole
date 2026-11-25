import assert from "node:assert/strict"
import { test } from "node:test"

import { airLevel, parseAir } from "./air.ts"
import { bikeLine, metresBetween, nearbyBikes } from "./bikes.ts"
import { uvHours, uvLevel, uvPeak } from "./forecast.ts"
import { litFraction, moonForAurora, moonUrl, parseMoon, phaseName } from "./moon.ts"
import { parseNowcast, rainSummary } from "./nowcast.ts"

test("the moon's phase in words and how much of it is lit", () => {
  assert.deepEqual([0, 45, 90, 135, 180, 225, 270, 315, 359].map(phaseName), ["Nymåne", "Voksende månesigd", "Første kvarter", "Voksende måne", "Fullmåne", "Minkende måne", "Siste kvarter", "Minkende månesigd", "Nymåne"])
  assert.equal(litFraction(0), 0)
  assert.equal(litFraction(180), 1)
  assert.ok(Math.abs(litFraction(90) - 0.5) < 1e-9)
  assert.match(moonForAurora(180) ?? "", /Sterkt måneskinn/)
  assert.match(moonForAurora(10) ?? "", /gode forhold/)
  assert.equal(moonForAurora(60), null)
  assert.deepEqual(parseMoon({ properties: { moonphase: 123.4, moonrise: { time: "2026-11-21T13:00+01:00" }, moonset: { time: null } } }), { phase: 123.4, rise: "2026-11-21T13:00+01:00", set: null })
  assert.equal(parseMoon({}), null)
  assert.match(moonUrl(59.91, 10.75, "2026-11-21", "+01:00"), /offset=%2B01%3A00$/)
})

const cast = (rates: number[], coverage = "ok") => ({ properties: { meta: { radar_coverage: coverage }, timeseries: rates.map((rate, index) => ({ time: new Date(Date.parse("2026-11-21T10:00:00Z") + index * 300_000).toISOString(), data: { instant: { details: { precipitation_rate: rate } } } })) } })
const at = new Date("2026-11-21T10:00:00Z")

test("the next ninety minutes in a sentence", () => {
  assert.deepEqual(rainSummary(parseNowcast(cast([0, 0, 0, 0, 0, 0.5, 2, 1])), at), { kind: "starts", text: "Nedbør om 25 min", minutes: 25, heaviest: 2 })
  assert.equal(rainSummary(parseNowcast(cast([0.4, 0.3, 0, 0])), at)?.text, "Litt nedbør nå, opphold om 10 min")
  assert.equal(rainSummary(parseNowcast(cast([6, 6, 6])), at)?.text, "Kraftig nedbør de neste 10 min")
  assert.equal(rainSummary(parseNowcast(cast(Array(19).fill(0))), at)?.text, "Opphold de neste 90 min")
})

test("no radar, no sentence", () => {
  assert.equal(rainSummary(parseNowcast(cast([1, 1], "no coverage")), at), null)
  assert.equal(rainSummary(parseNowcast(cast([1, 1], "temporarily unavailable")), at), null)
  assert.equal(rainSummary(null, at), null)
  assert.equal(parseNowcast(null), null)
})

test("the worst air of the rest of today, its level and cause", () => {
  const hour = (from: string, aqi: number, no2: number) => ({ from, variables: { AQI: { value: aqi }, AQI_no2: { value: no2 }, AQI_pm10: { value: 1 }, AQI_pm25: { value: 1.2 }, AQI_o3: { value: 1 } } })
  const body = { meta: { superlocation: { name: "Grünerløkka" } }, data: { time: [hour("2026-11-21T06:00:00Z", 3.5, 3.5), hour("2026-11-21T15:00:00Z", 2.4, 2.4), hour("2026-11-21T16:00:00Z", 1.8, 1), hour("2026-11-22T08:00:00Z", 4, 4)] } }
  const air = parseAir(body, at)
  assert.deepEqual(air, { level: "moderate", aqi: 2.4, time: "2026-11-21T15:00:00Z", cause: "nitrogendioksid (NO₂)", place: "Grünerløkka", hours: [{ time: "2026-11-21T15:00:00Z", aqi: 2.4 }, { time: "2026-11-21T16:00:00Z", aqi: 1.8 }] })
  assert.deepEqual([1.9, 2, 3, 4.2].map(airLevel), ["low", "moderate", "high", "very-high"])
  assert.equal(parseAir({ data: { time: [] } }, at), null)
})

test("UV: the peak of a day and its words", () => {
  const entry = (time: string, uv?: number) => ({ time, data: { instant: { details: { air_temperature: 10, wind_speed: 1, ...(uv === undefined ? {} : { ultraviolet_index_clear_sky: uv }) } } } })
  assert.deepEqual(uvPeak([entry("2026-06-21T09:00:00Z", 4.2), entry("2026-06-21T11:00:00Z", 5.6), entry("2026-06-22T11:00:00Z", 7)], "2026-06-21"), { uv: 5.6, time: "2026-06-21T11:00:00Z" })
  assert.equal(uvPeak([entry("2026-06-21T09:00:00Z")], "2026-06-21"), null)
  assert.deepEqual(uvHours([entry("2026-06-21T02:00:00Z", 0), entry("2026-06-21T09:00:00Z", 4.24), entry("2026-06-21T10:00:00Z"), entry("2026-06-22T11:00:00Z", 7)], "2026-06-21"), [{ time: "2026-06-21T09:00:00Z", uv: 4.2 }])
  assert.deepEqual([2.4, 3, 6, 8, 11].map((uv) => uvLevel(uv).name), ["Lav", "Moderat", "Høy", "Svært høy", "Ekstrem"])
})

test("bike stations within reach, nearest first, closed ones said so", () => {
  const here = { lat: 59.9225, lon: 10.7585 }
  const information = { data: { stations: [{ station_id: "a", name: "Olaf Ryes plass", lat: 59.9229, lon: 10.7586 }, { station_id: "b", name: "Birkelunden", lat: 59.9262, lon: 10.7605 }, { station_id: "c", name: "Bjørvika", lat: 59.9076, lon: 10.7563 }, { station_id: "d", name: "Uten status", lat: 59.9226, lon: 10.7585 }] } }
  const status = { data: { stations: [{ station_id: "a", num_bikes_available: 3, num_docks_available: 12, is_renting: true, is_returning: true, is_installed: true }, { station_id: "b", num_bikes_available: 0, num_docks_available: 1, is_renting: true, is_returning: true }, { station_id: "c", num_bikes_available: 9, num_docks_available: 9 }] } }
  const stations = nearbyBikes(information, status, here)
  assert.deepEqual(stations.map((one) => one.name), ["Olaf Ryes plass", "Birkelunden"])
  assert.deepEqual([stations[0]?.lat, stations[0]?.lon], [59.9229, 10.7586], "a station keeps where it is, for its map")
  assert.equal(nearbyBikes(information, status, { lat: 60.39, lon: 5.32 }).length, 0)
  assert.equal(bikeLine(stations[0]!), "3 sykler · 12 ledige plasser")
  assert.equal(bikeLine(stations[1]!), "ingen sykler · 1 ledig plass")
  assert.equal(bikeLine({ bikes: 1, docks: 0, renting: false, returning: true }), "utlån stengt · ingen ledige plasser")
  assert.ok(Math.abs(metresBetween({ lat: 59.91, lon: 10.75 }, { lat: 60.39, lon: 5.32 }) - 305_000) < 5_000)
})
