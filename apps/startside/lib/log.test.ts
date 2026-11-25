import { strict as assert } from "node:assert"
import { test } from "node:test"

import { checkEntry, countryName, entryLine, formValues, fromLogPage, keyOf, parseDate, parseDecimal, parseKey, problemsCookie, readProblems, rowValues } from "./log.ts"

const today = "2026-11-25"
const values = (entries: Record<string, string>) => entries

test("a date is read Norwegian or ISO, and must be on the calendar", () => {
  assert.equal(parseDate("25.11.2026"), "2026-11-25")
  assert.equal(parseDate("5.3.26"), "2026-03-05")
  assert.equal(parseDate("05/03/2026"), "2026-03-05")
  assert.equal(parseDate("2026-03-05"), "2026-03-05")
  assert.equal(parseDate("31.02.2026"), null)
  assert.equal(parseDate("2026-13-01"), null)
  assert.equal(parseDate("i går"), null)
})

test("a decimal takes a comma or a point", () => {
  assert.equal(parseDecimal("1,5"), 1.5)
  assert.equal(parseDecimal("2"), 2)
  assert.equal(parseDecimal("1.25"), 1.25)
  assert.equal(parseDecimal("-1"), null)
  assert.equal(parseDecimal("1,5 t"), null)
})

test("a film is checked field by field, empty text is null, and the cinema must be known", () => {
  const ok = checkEntry("film", values({ watched_on: "24.11.2026", title: "Flow", year: "2024", tmdb_id: "", cinema: "Vega kino", seat: "Sal 1, rad 6, sete 13", note: "" }), { today, cinemas: ["Vega kino"] })
  assert.deepEqual(ok, { ok: true, row: { watched_on: "2026-11-24", title: "Flow", year: 2024, tmdb_id: null, cinema: "Vega kino", seat: "Sal 1, rad 6, sete 13", note: null } })

  const bad = checkEntry("film", values({ watched_on: "27.11.2026", title: "", year: "24", tmdb_id: "tt123", cinema: "Saga", seat: "", note: "" }), { today, cinemas: ["Vega kino"] })
  assert.equal(bad.ok, false)
  if (bad.ok) return
  assert.deepEqual(Object.keys(bad.errors).sort(), ["cinema", "title", "tmdb_id", "watched_on", "year"])
  assert.match(bad.errors.watched_on!, /fram i tid/)
  assert.equal(bad.values.tmdb_id, "tt123")
})

test("tomorrow is allowed (the owner may be a time zone ahead), the day after is not", () => {
  const film = (date: string) => checkEntry("film", values({ watched_on: date, title: "Flow" }), { today })
  assert.equal(film("26.11.2026").ok, true)
  assert.equal(film("27.11.2026").ok, false)
})

test("an episode needs its season and episode, 0 being a special", () => {
  assert.equal(checkEntry("tv", values({ show: "Severance", season: "0", episode: "1" }), { today }).ok, true)
  const missing = checkEntry("tv", values({ show: "Severance", season: "", episode: "x" }), { today })
  assert.ok(!missing.ok && missing.errors.season && missing.errors.episode)
})

test("a game's status is one of three and its hours a number", () => {
  const ok = checkEntry("spill", values({ on_date: "", title: "Hades", status: "done", hours: "12,5", platform: "steam", note: "" }), { today })
  assert.ok(ok.ok && ok.row.hours === 12.5 && ok.row.on_date === null && ok.row.status === "done")
  const bad = checkEntry("spill", values({ title: "Hades", status: "finished", hours: "mye" }), { today })
  assert.ok(!bad.ok && bad.errors.status && bad.errors.hours)
})

test("a book's status names its list, and its rating is in halves from 0.5 to 5", () => {
  const ok = checkEntry("boker", values({ "list:status": "collection:want", title: "Brødrene Løvehjerte", year: "", on_date: "", rating: "4,5", format: "lydbok" }), { today })
  assert.ok(ok.ok)
  if (!ok.ok) return
  assert.equal(ok.row.list, "collection")
  assert.equal(ok.row.status, "want")
  assert.equal(ok.row.rating, 4.5)
  assert.equal("list:status" in ok.row, false)
  for (const rating of ["0", "4,3", "5,5"]) assert.equal(checkEntry("boker", values({ "list:status": "log:done", title: "X", rating }), { today }).ok, false, rating)
  assert.equal(checkEntry("boker", values({ "list:status": "log:owned", title: "X" }), { today }).ok, false)
})

test("a cinema's country is a code with a name, and its website an address", () => {
  const ok = checkEntry("kinoer", values({ name: "Vega kino", city: "Oslo", country: "no", website: "https://www.vegakino.no/" }), { today })
  assert.ok(ok.ok && ok.row.country === "NO")
  const bad = checkEntry("kinoer", values({ name: "Vega kino", country: "XX", website: "javascript:alert(1)" }), { today })
  assert.ok(!bad.ok && bad.errors.country && bad.errors.website)
  assert.equal(countryName("SE"), "Sverige")
})

test("a form's values are only its kind's fields, trimmed", () => {
  const read = (name: string) => ({ title: "  Flow ", same_as: "trakt:1", id: "4" })[name]
  const out = formValues("film", read)
  assert.equal(out.title, "Flow")
  assert.equal("same_as" in out, false)
  assert.equal(out.note, "")
})

test("a row is shown again as the form writes it", () => {
  assert.deepEqual(rowValues("boker", { list: "log", id: 3, title: "X", year: 2021, status: "done", on_date: "2026-01-02", rating: 3.5, format: null }), {
    "list:status": "log:done",
    title: "X",
    year: "2021",
    on_date: "02.01.2026",
    rating: "3,5",
    format: "",
  })
})

test("a key in an address names one row or nothing", () => {
  assert.deepEqual(parseKey("film", "12"), { id: 12 })
  assert.equal(parseKey("film", "012"), null)
  assert.equal(parseKey("film", "1; DROP"), null)
  assert.deepEqual(parseKey("boker", "collection-3"), { list: "collection", id: 3 })
  assert.equal(parseKey("brettspill", "wish-3"), null)
  assert.deepEqual(parseKey("kinoer", "Vega kino"), { name: "Vega kino" })
  assert.equal(keyOf("brettspill", { list: "log", id: 9 }), "log-9")
})

test("the problems of a failed form come back to that form only, and the cookie never leaves /start/logg", () => {
  const problems = { form: "/start/logg/film/ny", errors: { title: "Skriv tittelen på filmen." }, values: { title: "" } }
  const cookie = problemsCookie(problems)
  assert.match(cookie, /; Path=\/start\/logg;/)
  assert.match(cookie, /HttpOnly/)
  const value = decodeURIComponent(cookie.slice(cookie.indexOf("=") + 1, cookie.indexOf(";")))
  assert.deepEqual(readProblems(encodeURIComponent(value), "/start/logg/film/ny"), problems)
  assert.equal(readProblems(encodeURIComponent(value), "/start/logg/tv/ny"), null)
  assert.equal(readProblems("%7Bnot json", "/start/logg/film/ny"), null)
  assert.match(problemsCookie(null), /Max-Age=0/)
  const long = problemsCookie({ ...problems, values: { note: "æ".repeat(1000) } })
  assert.ok(long.length < 4000)
})

test("a POST is taken only from the log's own pages on the same origin", () => {
  const url = "https://lmfaole.party/start/api/logg"
  const from = (origin: string | null, fetchSite: string | null, referer: string | null) => fromLogPage({ url, origin, fetchSite, referer })
  assert.equal(from("https://lmfaole.party", "same-origin", "https://lmfaole.party/start/logg/film/ny"), true)
  assert.equal(from(null, "same-origin", "https://lmfaole.party/start/logg"), true)
  assert.equal(from("https://evil.example", "cross-site", "https://evil.example/start/logg"), false)
  assert.equal(from(null, null, "https://lmfaole.party/start/logg/film/ny"), false)
  assert.equal(from("https://lmfaole.party", "same-origin", "https://lmfaole.party/medier/"), false)
  assert.equal(from("https://lmfaole.party", "same-origin", "https://lmfaole.party/start/logger"), false)
  assert.equal(from("https://lmfaole.party", "same-origin", null), false)
  assert.equal(from("https://lmfaole.party", "same-site", "https://lmfaole.party/start/logg"), false)
})

test("a row in a list says what is looked for first", () => {
  assert.deepEqual(entryLine("spill", { title: "Hades", status: "done", on_date: "2026-11-20", hours: 40.5, platform: "steam" }), { title: "Hades", meta: ["Ferdig", "20. nov. 2026", "40,5\u00a0t", "steam"] })
  assert.deepEqual(entryLine("tv", { show: "Severance", season: 2, episode: 7, episode_title: null, watched_on: null }), { title: "Severance", meta: [], episode: { season: 2, number: 7 } })
  assert.deepEqual(entryLine("boker", { list: "collection", status: "want", title: "X", rating: null }).meta, ["Vil ha"])
  assert.deepEqual(entryLine("kinoer", { name: "Vega kino", city: "Oslo", country: "NO" }).meta, ["Oslo", "Norge"])
})

test("problems come back whether the cookie is handed over decoded or not", () => {
  const problems = { form: "/start/logg/film/ny", errors: { title: "Skriv tittelen." }, values: { note: "100% bra" } }
  const raw = JSON.stringify(problems)
  assert.deepEqual(readProblems(raw, problems.form), problems)
  assert.deepEqual(readProblems(encodeURIComponent(raw), problems.form), problems)
})
