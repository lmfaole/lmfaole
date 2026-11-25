import assert from "node:assert/strict"
import { test } from "node:test"

import { MET_WARNINGS_PAGE, byUrgency, metLevel, nveLevel, nveTime, parseAvalanche, parseMetAlerts, parseNveWarnings, warningIcon, warningWhen } from "./warnings.ts"

const now = new Date("2026-11-21T10:00:00Z")
const feature = (level: string, domain = "land", interval = ["2026-11-21T12:00:00+00:00", "2026-11-22T06:00:00+00:00"], web = " https://www.yr.no/nb/farevarsler/2.49.0.1.578.0.x ") => ({
  properties: { id: `id-${level}-${domain}`, awareness_level: level, eventAwarenessName: "Kraftige vindkast", event: "wind", area: "Oslo", description: "Lokalt vindkast 25 m/s.", consequences: "Fare for skader.", geographicDomain: domain, web },
  when: { interval },
})

test("MET's awareness level is read by its colour; green is no warning", () => {
  assert.equal(metLevel("2; yellow; Moderate"), "yellow")
  assert.equal(metLevel("3; orange; Severe"), "orange")
  assert.equal(metLevel("4; red; Extreme"), "red")
  assert.equal(metLevel("1; green; Minor"), null)
  assert.equal(metLevel(undefined), null)
})

test("MET's warnings keep land, yellow or worse, not yet over, with the trimmed link", () => {
  const warnings = parseMetAlerts({ features: [feature("2; yellow; Moderate"), feature("3; orange; Severe", "marine"), feature("1; green; Minor"), feature("3; orange; Severe", "land", ["2026-11-20T00:00:00Z", "2026-11-21T09:00:00Z"])] }, now)
  assert.equal(warnings.length, 1)
  assert.equal(warnings[0]?.level, "yellow")
  assert.equal(warnings[0]?.href, "https://www.yr.no/nb/farevarsler/2.49.0.1.578.0.x")
  assert.equal(warnings[0]?.description, "Lokalt vindkast 25 m/s. Fare for skader.")
  assert.equal(parseMetAlerts({ features: [feature("2; yellow; Moderate", "land", undefined, "")] }, now)[0]?.href, MET_WARNINGS_PAGE)
  assert.deepEqual(parseMetAlerts(null, now), [])
})

test("NVE's levels: 2 yellow, 3 orange, 4 and 5 red, 1 and 0 nothing", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(nveLevel), [null, null, "yellow", "orange", "red", "red"])
  assert.equal(nveLevel("3"), "orange")
})

test("NVE's zoneless times are Norwegian time, winter and summer", () => {
  assert.equal(nveTime("2026-11-21T07:00:00"), "2026-11-21T06:00:00.000Z")
  assert.equal(nveTime("2026-07-01T07:00:00"), "2026-07-01T05:00:00.000Z")
  assert.equal(nveTime("2026-11-21T07:00:00Z"), "2026-11-21T07:00:00.000Z")
})

test("NVE's flood and landslide warnings keep yellow and worse, with the municipalities", () => {
  const body = [
    { Id: "1", ActivityLevel: "2", DangerTypeName: "Jordskredfare", MainText: "Moderat jordskredfare.", ValidFrom: "2026-11-21T07:00:00", ValidTo: "2026-11-22T06:59:00", MunicipalityList: [{ Id: "0301", Name: "Oslo" }] },
    { Id: "2", ActivityLevel: "1", ValidFrom: "2026-11-21T07:00:00", ValidTo: "2026-11-22T06:59:00" },
    { Id: "3", ActivityLevel: "3", ValidFrom: "2026-11-20T07:00:00", ValidTo: "2026-11-21T06:59:00" },
  ]
  const warnings = parseNveWarnings(body, "landslide", now)
  assert.equal(warnings.length, 1)
  assert.deepEqual([warnings[0]?.level, warnings[0]?.area, warnings[0]?.source, warnings[0]?.from], ["yellow", "Oslo", "Varsom", "2026-11-21T06:00:00.000Z"])
  assert.deepEqual(parseNveWarnings({}, "flood", now), [])
})

test("an avalanche warning from level 2 links to its region's page", () => {
  const body = [{ RegionId: 3011, RegionName: "Tromsø", DangerLevel: "3", MainText: "Ferske flakskred.", ValidFrom: "2026-11-21T00:00:00", ValidTo: "2026-11-21T23:59:59" }]
  const [warning] = parseAvalanche(body, now)
  assert.equal(warning?.level, "orange")
  assert.equal(warning?.href, "https://www.varsom.no/snoskred/varsling/varsel/Troms%C3%B8/2026-11-21")
  assert.deepEqual(parseAvalanche([{ ...body[0], DangerLevel: "0" }], now), [])
})

test("the most serious and then the soonest come first", () => {
  const base = { key: "", kind: "weather", area: "", to: "", title: "", source: "MET", href: "" } as const
  const sorted = [{ ...base, level: "yellow", from: "a" }, { ...base, level: "red", from: "b" }, { ...base, level: "yellow", from: "0" }].toSorted(byUrgency as never) as { level: string; from: string }[]
  assert.deepEqual(sorted.map((one) => `${one.level}${one.from}`), ["redb", "yellow0", "yellowa"])
})

test("when a warning is in force, in words", () => {
  assert.equal(warningWhen("2026-11-21T11:00:00Z", "2026-11-22T05:00:00Z", now), "i dag 12:00 – i morgen 06:00")
  assert.equal(warningWhen("2026-11-21T06:00:00Z", "2026-11-21T17:00:00Z", now), "nå – i dag 18:00")
})

test("the icon follows what the warning is about", () => {
  assert.equal(warningIcon({ kind: "weather", event: "wind" }), "wind")
  assert.equal(warningIcon({ kind: "weather", event: "forestFire" }), "temperature")
  assert.equal(warningIcon({ kind: "avalanche" }), "snow")
  assert.equal(warningIcon({ kind: "flood" }), "rain")
})
