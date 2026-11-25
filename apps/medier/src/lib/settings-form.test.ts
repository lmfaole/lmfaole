import { strict as assert } from "node:assert"
import { test } from "node:test"

import { NO_USERS } from "./users.ts"
import { formPrefs, frontSections, type Ordering, planUsernames, settingsPageBack, settingsRedirect, settingsSummary, shownSections, stepErrors, withoutSeen } from "./settings-form.ts"

const form = (entries: [string, string][]): FormData => {
  const data = new FormData()
  for (const [name, value] of entries) data.append(name, value)
  return data
}
const current = { theme: "system", effects: "on", tilt: "off" } as const

test("a form's choices replace the prefs, the rest are kept, and only valid values count", () => {
  assert.deepEqual(formPrefs({ ...current, sections: ["musikk"] }, form([["theme", "dark"], ["effects", "off"], ["tilt", "sideways"]])), { theme: "dark", effects: "off", tilt: "off", sections: ["musikk"] })
  assert.deepEqual(formPrefs(current, form([["theme", "purple"]])), current)
})

test("the sections are those ticked, in the front page's order; none ticked is none, and a form without the field leaves them be", () => {
  assert.deepEqual(formPrefs(current, form([["sections", ""], ["sections", "artister"], ["sections", "na"], ["sections", "reklame"]])).sections, ["na", "artister"])
  assert.deepEqual(formPrefs(current, form([["sections", ""]])).sections, [])
  assert.equal(formPrefs(current, form([["theme", "light"]])).sections, undefined)
})

test("the front page shows every section until some are chosen, and never one it does not know", () => {
  assert.deepEqual([...shownSections({})], ["na", "musikk", "film", "tv", "artister", "spill"])
  assert.deepEqual([...shownSections({ sections: ["tv", "reklame"] })], ["tv"])
})

test("a cookie from before Film and TV were apart keeps working: «film-og-tv» is both", () => {
  assert.deepEqual([...shownSections({ sections: ["artister", "film-og-tv"] })], ["film", "tv", "artister"])
  assert.deepEqual([...shownSections({ sections: ["film-og-tv", "tv"] })], ["film", "tv"])
  assert.equal(shownSections({ sections: [] }).size, 0)
})

test("the usernames are checked with their service: kept when found, forgotten when emptied, said when not found, left when absent", async () => {
  const asked: string[] = []
  const plan = await planUsernames(form([["lastfm", " snowpony69 "], ["trakt", "nobody"]]), async (service, user) => {
    asked.push(`${service}:${user}`)
    return user !== "nobody"
  })
  assert.deepEqual(plan, { set: { lastfm: "snowpony69" }, clear: [], invalid: { trakt: "nobody" } })
  assert.deepEqual(asked.sort(), ["lastfm:snowpony69", "trakt:nobody"])
  assert.deepEqual(stepErrors(plan), { trakt: "Fant ingen offentlig profil som heter «nobody» på Trakt. Sjekk stavingen, og at profilen ikke er privat." })
  assert.deepEqual(await planUsernames(form([["lastfm", ""], ["trakt", "a b"]]), async () => true), { set: {}, clear: ["lastfm"], invalid: { trakt: "a b" } })
  assert.deepEqual(stepErrors(await planUsernames(form([["theme", "dark"]]), async () => false)), {})
})

test("back is clean when all was well, and to the field (in the wizard, its step) when a username was not found", () => {
  const none = { set: {}, clear: [], invalid: {} }
  assert.equal(settingsRedirect("/musikk/?forste-gang=lastfm&brukernavn-feil=lastfm&brukernavn-verdi=x", none, true), "/musikk/")
  assert.equal(settingsRedirect("/innstillinger/?lagret=1", { ...none, invalid: { lastfm: "x y" } }, false), "/innstillinger/?lagret=1&brukernavn-feil=lastfm&brukernavn-verdi=x+y")
  assert.equal(settingsRedirect("/", { ...none, invalid: { trakt: "z" } }, true), "/?brukernavn-feil=trakt&brukernavn-verdi=z&forste-gang=trakt#first-run-trakt")
})

test("«Vis introen igjen» takes the wizard out of seen, and nothing else", () => {
  assert.equal(withoutSeen("intro-musikk@1,first-run@1,install@1", "first-run"), "intro-musikk@1,install@1")
  assert.equal(withoutSeen(encodeURIComponent("first-run@2"), "first-run"), "")
  assert.equal(withoutSeen(undefined, "first-run"), "")
})

// Stand-ins for the design system's `orderSections` and `applyMove` (which `node --test` cannot load), recording what the form handed them.
const calls: unknown[][] = []
const ordering: Ordering = {
  orderSections: (ids, order = []) => {
    calls.push(["orderSections", [...ids], [...order]])
    return [...order.filter((id) => ids.includes(id)), ...ids.filter((id) => !order.includes(id))]
  },
  applyMove: (order, move) => {
    calls.push(["applyMove", [...order], move])
    return move === "tv:up" ? ["na", "musikk", "tv", "film", "artister", "spill"] : [...order]
  },
}
const sorted = <T extends string>(ids: readonly T[], order?: readonly string[]): T[] => (order === undefined ? [...ids] : [...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b)))

test("the order comes from the list's hidden field, with a no-JS move applied to it; a form without it leaves the order be", () => {
  calls.length = 0
  const next = formPrefs({ ...current, order: ["artister"] }, form([["order", "tv, film,reklame"], ["move", "tv:up"]]), ordering)
  assert.deepEqual(next.order, ["na", "musikk", "tv", "film", "artister", "spill"])
  assert.deepEqual(calls[0], ["orderSections", ["na", "musikk", "film", "tv", "artister", "spill"], ["tv", "film", "reklame"]])
  assert.deepEqual(calls[1], ["applyMove", ["tv", "film", "na", "musikk", "artister", "spill"], "tv:up"])
  assert.deepEqual(formPrefs({ ...current, order: ["artister"] }, form([["theme", "dark"]]), ordering).order, ["artister"])
  assert.deepEqual(formPrefs(current, form([["order", "tv"]]), ordering).order?.[0], "tv")
})

test("the front page has the chosen sections in the visitor's order", () => {
  assert.deepEqual(frontSections({ sections: ["musikk", "tv", "artister"], order: ["artister", "tv", "na", "musikk", "film"] }, sorted), ["artister", "tv", "musikk"])
  assert.deepEqual(frontSections({}, sorted), ["na", "musikk", "film", "tv", "artister", "spill"])
})

test("the overview says what is chosen on each subpage", () => {
  assert.deepEqual(settingsSummary(["tv", "musikk"], { ...NO_USERS, lastfm: "snowpony69", trakt: "lmfaole" }), {
    kontoer: "snowpony69 og lmfaole",
    forside: "TV, Musikk",
  })
  assert.deepEqual(settingsSummary([], NO_USERS).kontoer, "Ingen brukernavn ennå")
  assert.deepEqual(settingsSummary([], { ...NO_USERS, lastfm: "Ole", trakt: "ole" }).forside, "Ingen seksjoner")
  assert.deepEqual(settingsSummary([], { ...NO_USERS, lastfm: "Ole", trakt: "ole" }).kontoer, "Ole")
  assert.deepEqual(settingsSummary([], { lastfm: "Ole", trakt: "seer", listenbrainz: "ole", steam: "gaben", retroachievements: null }).kontoer, "Ole, seer og gaben")
})

test("a subpage's form comes back to it saved, and keeps the page the visitor came from", () => {
  assert.equal(settingsPageBack("/", "forside", null), "/innstillinger/forside/?lagret=1")
  assert.equal(settingsPageBack("/", "kontoer", "/musikk/?uke=1"), "/innstillinger/kontoer/?tilbake=%2Fmusikk%2F%3Fuke%3D1&lagret=1")
})
