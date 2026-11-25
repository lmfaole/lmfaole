import { strict as assert } from "node:assert"
import { test } from "node:test"

import { dayOf, partOfMinute } from "./day.ts"
import { DAY_COOKIE, dayCookieString, daySummary, partSpan, partSummary, showSummary, startsSummary, weekendSummary, DEFAULT_DAY_SETTINGS, parseDaySettings, parseTime, readDayForm, serializeDaySettings, startsInOrder, type DaySettings } from "./day-settings.ts"
import { planFor } from "./plan.ts"

const PARTS = ["morgen", "arbeidsdag", "kveld", "natt"] as const
const settings = (cookie: string): DaySettings => parseDaySettings(cookie)
const form = (fields: [string, string][]): FormData => {
  const data = new FormData()
  for (const [name, value] of fields) data.append(name, value)
  return data
}

test("no cookie, an empty one and garbage are the defaults", () => {
  for (const value of [undefined, null, "", "%E0%A4%A", "mode=sometimes&greeting=maybe&starts=25:00&weekend=1&weather.kveld=snow&pulls.natt=x"]) {
    assert.deepEqual(parseDaySettings(value), DEFAULT_DAY_SETTINGS, String(value))
  }
})

test("the defaults are the plan before there were settings, for every part, weekday and weekend", () => {
  const expected = {
    morgen: { sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" },
    arbeidsdag: { sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" },
    kveld: { sections: ["alerts", "pulls", "weather"], weatherWindow: "tomorrow", pulls: "mine" },
    natt: { sections: ["weather"], weatherWindow: "tomorrow", pulls: "mine" },
  }
  for (const part of PARTS) assert.deepEqual(planFor({ part, weekend: false }, settings("")), { greeting: planFor({ part, weekend: false }).greeting, ...expected[part] })
  assert.deepEqual(planFor({ part: "morgen", weekend: true }, settings("")).sections, ["alerts", "pulls", "weather"])
  assert.equal(planFor({ part: "kveld", weekend: true }, settings("")).weatherWindow, "tomorrow")
})

test("each field falls back on its own", () => {
  const read = settings("mode=off&greeting=nope&starts=06:00,10:00,17:00,23:00&weekenddays=5,x,6&show.natt=weather,nonsense,pulls&show.kveld=&weather.morgen=tomorrow&pulls.kveld=bad")
  assert.equal(read.mode, "off")
  assert.equal(read.greeting, "on")
  assert.deepEqual(read.starts, { morgen: 360, arbeidsdag: 600, kveld: 1020, natt: 1380 })
  assert.deepEqual(read.weekendDays, [5, 6])
  assert.deepEqual(read.show.natt, ["pulls", "weather"])
  assert.deepEqual(read.show.kveld, [])
  assert.deepEqual(read.show.morgen, DEFAULT_DAY_SETTINGS.show.morgen)
  assert.equal(read.weather.morgen, "tomorrow")
  assert.equal(read.pulls.kveld, "mine")
  assert.deepEqual(settings("weekenddays=").weekendDays, [])
  assert.deepEqual(settings("weekenddays=x,9").weekendDays, [6, 0])
})

test("starts out of order, short or off the quarter are the default starts", () => {
  for (const starts of ["09:00,05:00,16:00,22:00", "05:00,09:00,16:00", "05:00,09:00,16:00,16:00", "05:10,09:00,16:00,22:00", "05:00,09:00,16:00,05:00"]) {
    assert.deepEqual(settings(`starts=${starts}`).starts, DEFAULT_DAY_SETTINGS.starts, starts)
  }
  // Around midnight: the night may start after it, and the morning before it.
  assert.deepEqual(settings("starts=07:00,12:00,18:00,01:30").starts, { morgen: 420, arbeidsdag: 720, kveld: 1080, natt: 90 })
  assert.equal(startsInOrder({ morgen: 23 * 60, arbeidsdag: 60, kveld: 120, natt: 180 }), true)
  assert.equal(parseTime("7"), 420)
  assert.equal(parseTime("24:00"), null)
})

test("serialised, only what differs from the default; read back the same", () => {
  assert.equal(serializeDaySettings(DEFAULT_DAY_SETTINGS), "")
  const changed: DaySettings = { ...DEFAULT_DAY_SETTINGS, greeting: "off", starts: { ...DEFAULT_DAY_SETTINGS.starts, natt: 23 * 60 }, weekendDays: [0, 6], show: { ...DEFAULT_DAY_SETTINGS.show, natt: ["weather", "pulls"] } }
  assert.equal(decodeURIComponent(serializeDaySettings(changed)), "greeting=off&starts=05:00,09:00,16:00,23:00&show.natt=pulls,weather")
  assert.deepEqual(parseDaySettings(encodeURIComponent(serializeDaySettings(changed))), { ...changed, weekendDays: [6, 0], show: { ...changed.show, natt: ["pulls", "weather"] } })
  assert.match(dayCookieString("greeting=off", "/start"), new RegExp(`^${DAY_COOKIE}=greeting%3Doff; Path=/start; Max-Age=31536000; SameSite=Lax; Secure$`))
  assert.match(dayCookieString("", "/start"), /Max-Age=0/)
})

test("the part of the day and the date follow the starts and the weekend days", () => {
  const late = settings("starts=07:00,12:00,18:00,01:00&weekenddays=5,6")
  assert.equal(partOfMinute(6 * 60 + 59, late.starts), "natt")
  assert.equal(partOfMinute(7 * 60, late.starts), "morgen")
  assert.equal(partOfMinute(30, late.starts), "kveld")
  const friday = dayOf(new Date("2026-11-20T05:30:00Z"), late) // 06:30 CET Friday: still Thursday's night
  assert.deepEqual([friday.date, friday.part, friday.weekend], ["2026-11-19", "natt", false])
  const fridayMorning = dayOf(new Date("2026-11-20T06:15:00Z"), late) // 07:15 CET
  assert.deepEqual([fridayMorning.date, fridayMorning.part, fridayMorning.weekend], ["2026-11-20", "morgen", true])
})

test("the plan: sections, weather and pulls per part; weekends only when on; off is one page all day; the greeting can go", () => {
  const custom = settings("show.kveld=issues,weather&weather.kveld=today&pulls.arbeidsdag=mine&greeting=off")
  assert.deepEqual(planFor({ part: "kveld", weekend: false }, custom), { greeting: null, sections: ["issues", "weather"], weatherWindow: "today", pulls: "mine" })
  assert.equal(planFor({ part: "arbeidsdag", weekend: false }, custom).pulls, "mine")
  assert.deepEqual(planFor({ part: "kveld", weekend: true }, custom).sections, ["weather"])
  const noWeekend = settings("weekend=off")
  assert.deepEqual(planFor({ part: "morgen", weekend: true }, noWeekend), planFor({ part: "morgen", weekend: false }))
  for (const part of PARTS) {
    for (const weekend of [false, true]) {
      assert.deepEqual(planFor({ part, weekend }, settings("mode=off&show.natt=")), { greeting: planFor({ part, weekend }).greeting, sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" })
    }
  }
})

test("the form: absent radios are kept, checkbox groups it has are what is ticked, starts are checked", () => {
  const current = settings("weather.natt=today")
  const read = readDayForm(form([["day", "1"], ["has", "weekenddays"], ["has", "show"], ["mode", "off"], ["weekenddays", "0"], ["show.morgen", "weather"], ["show.morgen", "pulls"], ["pulls.kveld", "all"], ["starts.morgen", "06:00"], ["starts.arbeidsdag", "08:00"], ["starts.kveld", "17:00"], ["starts.natt", "23:00"]]), current)
  assert.deepEqual(read.errors, {})
  assert.equal(read.settings.mode, "off")
  assert.equal(read.settings.greeting, "on")
  assert.equal(read.settings.weather.natt, "today")
  assert.deepEqual(read.settings.weekendDays, [0])
  assert.deepEqual(read.settings.show.morgen, ["pulls", "weather"])
  assert.deepEqual(read.settings.show.natt, [])
  assert.equal(read.settings.pulls.kveld, "all")
  assert.deepEqual(read.settings.starts, { morgen: 360, arbeidsdag: 480, kveld: 1020, natt: 1380 })

  const backwards = readDayForm(form([["starts.morgen", "10:00"], ["starts.arbeidsdag", "09:00"], ["starts.kveld", "17:00"], ["starts.natt", "23:00"]]), current)
  assert.match(backwards.errors.starts ?? "", /etter hverandre/)
  assert.equal(backwards.written.starts, "10:00,09:00,17:00,23:00")
  assert.deepEqual(backwards.settings.starts, current.starts)
  assert.match(readDayForm(form([["starts.morgen", "kl 7"]]), current).errors.starts ?? "", /«kl 7» er ikke et klokkeslett/)
})

test("a subpage's form leaves the checkbox groups it does not have as they are", () => {
  const current = settings("weekenddays=5,6&show.natt=weather")
  const read = readDayForm(form([["day", "1"], ["weather.kveld", "today"]]), current)
  assert.deepEqual(read.settings.weekendDays, [5, 6])
  assert.deepEqual(read.settings.show, current.show)
  assert.equal(read.settings.weather.kveld, "today")
  const onlyDays = readDayForm(form([["day", "1"], ["has", "weekenddays"]]), current)
  assert.deepEqual(onlyDays.settings.weekendDays, [])
  assert.deepEqual(onlyDays.settings.show, current.show)
})

test("the overview's summary: off, or when the morning starts and what is turned off", () => {
  assert.equal(daySummary(DEFAULT_DAY_SETTINGS), "Automatisk · morgen fra 05:00")
  assert.equal(daySummary({ ...DEFAULT_DAY_SETTINGS, starts: { ...DEFAULT_DAY_SETTINGS.starts, morgen: 6 * 60 + 30 }, weekend: "off", greeting: "off" }), "Automatisk · morgen fra 06:30 · ingen egen helg · uten hilsen")
  assert.equal(daySummary({ ...DEFAULT_DAY_SETTINGS, mode: "off" }), "Av · samme forside hele dagen")
})

test("the time-of-day overview's lines: spans over midnight, weekend days Monday first, sections per part", () => {
  const day = DEFAULT_DAY_SETTINGS
  assert.equal(partSpan(day.starts, "morgen"), "05:00–09:00")
  assert.equal(partSpan(day.starts, "natt"), "22:00–05:00")
  assert.equal(startsSummary(day.starts), "Morgen 05:00 · arbeidsdag 09:00 · kveld 16:00 · natt 22:00")
  assert.equal(weekendSummary({ weekend: "on", weekendDays: [0, 5, 6] }), "Fredag, lørdag og søndag")
  assert.equal(weekendSummary({ weekend: "on", weekendDays: [] }), "Ingen helgedager valgt")
  assert.equal(weekendSummary({ weekend: "off", weekendDays: [6, 0] }), "Av · alle dager er like")
  const all = ["alerts", "pulls", "issues", "discussions", "weather"] as const
  assert.equal(showSummary({ morgen: [...all], arbeidsdag: [...all], kveld: [...all], natt: [...all] }, 5), "Alt hele døgnet")
  assert.equal(showSummary({ morgen: [...all], arbeidsdag: [...all], kveld: ["weather"], natt: [] }, 5), "Morgen 5 · arbeidsdag 5 · kveld 1 · natt 0 av 5")
  assert.equal(partSummary({ ...day, weather: { ...day.weather, kveld: "tomorrow" }, pulls: { ...day.pulls, kveld: "mine" } }, "kveld"), "16:00–22:00 · været i morgen · bare dine pull requests")
})
