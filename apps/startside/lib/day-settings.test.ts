import { strict as assert } from "node:assert"
import { test } from "node:test"

import { dayOf, partOfMinute } from "./day.ts"
import { DEFAULT_DAY_SETTINGS, type DaySettings } from "./day-settings.ts"
import { planFor } from "./plan.ts"

const PARTS = ["morgen", "arbeidsdag", "kveld", "natt"] as const
const with_ = (changes: Partial<DaySettings>): DaySettings => ({ ...DEFAULT_DAY_SETTINGS, ...changes })

test("the fixed plan, for every part, weekday and weekend", () => {
  const expected = {
    morgen: { sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" },
    arbeidsdag: { sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" },
    kveld: { sections: ["alerts", "pulls", "weather"], weatherWindow: "tomorrow", pulls: "mine" },
    natt: { sections: ["weather"], weatherWindow: "tomorrow", pulls: "mine" },
  }
  for (const part of PARTS) assert.deepEqual(planFor({ part, weekend: false }), { greeting: planFor({ part, weekend: false }).greeting, ...expected[part] })
  assert.deepEqual(planFor({ part: "morgen", weekend: true }).sections, ["alerts", "pulls", "weather"])
  assert.equal(planFor({ part: "kveld", weekend: true }).weatherWindow, "tomorrow")
})

test("the part of the day and the date follow the starts and the weekend days", () => {
  const late = with_({ starts: { morgen: 420, arbeidsdag: 720, kveld: 1080, natt: 60 }, weekendDays: [5, 6] })
  assert.equal(partOfMinute(6 * 60 + 59, late.starts), "natt")
  assert.equal(partOfMinute(7 * 60, late.starts), "morgen")
  assert.equal(partOfMinute(30, late.starts), "kveld")
  const friday = dayOf(new Date("2026-11-20T05:30:00Z"), late) // 06:30 CET Friday: still Thursday's night
  assert.deepEqual([friday.date, friday.part, friday.weekend], ["2026-11-19", "natt", false])
  const fridayMorning = dayOf(new Date("2026-11-20T06:15:00Z"), late) // 07:15 CET
  assert.deepEqual([fridayMorning.date, fridayMorning.part, fridayMorning.weekend], ["2026-11-20", "morgen", true])
})

test("the plan: sections, weather and pulls per part; weekends only when on; off is one page all day; the greeting can go", () => {
  const custom = with_({ greeting: "off", show: { ...DEFAULT_DAY_SETTINGS.show, kveld: ["issues", "weather"] }, weather: { ...DEFAULT_DAY_SETTINGS.weather, kveld: "today" }, pulls: { ...DEFAULT_DAY_SETTINGS.pulls, arbeidsdag: "mine" } })
  assert.deepEqual(planFor({ part: "kveld", weekend: false }, custom), { greeting: null, sections: ["issues", "weather"], weatherWindow: "today", pulls: "mine" })
  assert.equal(planFor({ part: "arbeidsdag", weekend: false }, custom).pulls, "mine")
  assert.deepEqual(planFor({ part: "kveld", weekend: true }, custom).sections, ["weather"])
  assert.deepEqual(planFor({ part: "morgen", weekend: true }, with_({ weekend: "off" })), planFor({ part: "morgen", weekend: false }))
  for (const part of PARTS) {
    for (const weekend of [false, true]) {
      assert.deepEqual(planFor({ part, weekend }, with_({ mode: "off" })), { greeting: planFor({ part, weekend }).greeting, sections: ["alerts", "pulls", "issues", "discussions", "weather"], weatherWindow: "today", pulls: "all" })
    }
  }
})
