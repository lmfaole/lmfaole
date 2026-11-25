import { strict as assert } from "node:assert"
import { test } from "node:test"

import { backWith, checkSettings, decodeProblems, encodeProblems, listOf, mergeChoices, parseReposCookie, readSettingsForm, refererPath, reposCookie, reposSummary, sectionsSummary, withoutSeen, type Checks } from "./settings.ts"

const form = (entries: [string, string][]): FormData => {
  const data = new FormData()
  for (const [name, value] of entries) data.append(name, value)
  return data
}

const checks: Checks = {
  user: async (login) => (login.toLowerCase() === "octocat" ? "octocat" : null),
  publicRepo: async (repo) => (["vercel/next.js", "lmfaole/startside"].includes(repo.toLowerCase()) ? repo.toLowerCase() : null),
}

test("the form is read field by field: what was not in it is absent, and an unknown value is not taken", () => {
  const read = readSettingsForm(form([["theme", "dark"], ["effects", "sideways"], ["tilt", "on"], ["sections-shown", "1"], ["sections", "pulls"], ["sections", "nope"], ["kilde", "first-run"]]))
  assert.deepEqual(read, { theme: "dark", tilt: "on", sections: ["pulls"], skip: false, rerun: false, fromWizard: true })
  assert.deepEqual(readSettingsForm(form([["sections-shown", "1"]])).sections, [])
  assert.equal(readSettingsForm(form([])).sections, undefined)
  assert.equal(readSettingsForm(form([["skip", "1"]])).skip, true)
  assert.equal(readSettingsForm(form([["validate", "github"], ["github", "x"]])).validate, "github")
})

test("the choices take what the form changed; every section ticked is the default again", () => {
  const current = { theme: "system", effects: "on", tilt: "off" } as const
  assert.deepEqual(mergeChoices(current, readSettingsForm(form([["effects", "off"]]))), { theme: "system", effects: "off", tilt: "off" })
  assert.deepEqual(mergeChoices(current, readSettingsForm(form([["sections-shown", "1"], ["sections", "weather"]]))).sections, ["weather"])
  const all = ["alerts", "pulls", "issues", "discussions", "weather"].map((id): [string, string] => ["sections", id])
  assert.equal(mergeChoices({ ...current, sections: ["weather"] }, readSettingsForm(form(all))).sections, undefined)
  // The reorder list's hidden field: known sections only, once each; kept when another form (without it) is saved.
  assert.deepEqual(readSettingsForm(form([["order", "weather, gone,pulls,weather"]])).order, ["weather", "pulls"])
  assert.deepEqual(mergeChoices({ ...current, order: ["weather", "pulls"] }, readSettingsForm(form([["theme", "dark"]]))).order, ["weather", "pulls"])
})

test("the username and the repositories are checked against GitHub; an empty name forgets it", async () => {
  assert.deepEqual(await checkSettings(readSettingsForm(form([["github", " @OctoCat "]])), checks), { errors: {}, github: "octocat" })
  assert.deepEqual(await checkSettings(readSettingsForm(form([["github", ""]])), checks), { errors: {}, github: null })
  assert.match((await checkSettings(readSettingsForm(form([["github", "nobody"]])), checks)).errors.github ?? "", /«nobody»/)
  assert.match((await checkSettings(readSettingsForm(form([["github", "me is:private"]])), checks)).errors.github ?? "", /Fant ingen/)
  assert.deepEqual(await checkSettings(readSettingsForm(form([["repos", "vercel/next.js\nhttps://github.com/lmfaole/startside, vercel/next.js"]])), checks), { errors: {}, repos: ["vercel/next.js", "lmfaole/startside"] })
  assert.deepEqual(await checkSettings(readSettingsForm(form([["repos", ""]])), checks), { errors: {}, repos: [] })
  assert.match((await checkSettings(readSettingsForm(form([["repos", "vercel/next.js\nsecret/private"]])), checks)).errors.repos ?? "", /«secret\/private»/)
  assert.match((await checkSettings(readSettingsForm(form([["repos", "not a repo"]])), checks)).errors.repos ?? "", /eier\/navn/)
  const many = Array.from({ length: 21 }, (_, index) => `a/r${index}`).join("\n")
  assert.match((await checkSettings(readSettingsForm(form([["repos", many]])), checks)).errors.repos ?? "", /opptil 20/)
})

test("the repositories cookie holds owner/name only, at most 20; none chosen is kept, and null removes it", () => {
  assert.deepEqual(parseReposCookie(encodeURIComponent("a/b,bad repo,c/d")), ["a/b", "c/d"])
  assert.deepEqual(parseReposCookie(undefined), [])
  assert.deepEqual(parseReposCookie(Array.from({ length: 25 }, (_, index) => `a/r${index}`).join(",")).length, 20)
  assert.match(reposCookie(["a/b", "c/d"]), /^github_repos=a%2Fb%2Cc%2Fd; Path=\/start; Max-Age=31536000; .*HttpOnly$/)
  assert.match(reposCookie([]), /^github_repos=-; .*Max-Age=31536000/)
  assert.deepEqual(parseReposCookie("-"), [])
  assert.match(reposCookie(null), /Max-Age=0/)
})

test("a failed submission's problems go there and back, and nothing else gets in", () => {
  const problems = { step: "github", errors: { github: "Fant ingen" }, values: { github: "nobody" } }
  assert.deepEqual(decodeProblems(encodeURIComponent(encodeProblems(problems))), problems)
  assert.equal(decodeProblems("step=github"), null)
  assert.equal(decodeProblems(encodeURIComponent("step=<script>&github-error=x"))?.step, undefined)
})

test("back to the page: the wizard's step as a parameter and an anchor; an earlier one goes", () => {
  assert.equal(backWith("/start/vaer?forste-gang=github#x", { step: "repos" }), "/start/vaer?forste-gang=repos#first-run-repos")
  assert.equal(backWith("/start/vaer?forste-gang=github"), "/start/vaer")
  assert.equal(backWith("/start/innstillinger#tema", { saved: true }), "/start/innstillinger?lagret=1")
  assert.equal(refererPath("https://lmfaole.party/start/transport?a=1", "https://lmfaole.party"), "/start/transport?a=1")
  assert.equal(refererPath("https://evil.example/start", "https://lmfaole.party"), null)
  assert.equal(refererPath("nonsense", "https://lmfaole.party"), null)
})

test("«Vis introen igjen» takes the wizard out of the seen cookie and keeps the rest", () => {
  assert.equal(withoutSeen(encodeURIComponent("intro-front@1,first-run@1,install@1"), "first-run"), "intro-front@1,install@1")
  assert.equal(withoutSeen(undefined, "first-run"), "")
  assert.deepEqual(listOf("a\n\nA, b"), ["a", "b"])
})

test("the overview's summaries: the shown sections in order and the repositories", () => {
  assert.equal(sectionsSummary(["weather", "alerts", "pulls"], ["pulls", "weather"]), "Været, Pull requests")
  assert.equal(sectionsSummary(["weather", "alerts"]), "Været, Følg opp")
  assert.equal(sectionsSummary(["weather"], []), "Ingen deler")
  assert.equal(reposSummary([]), "Ingen")
  assert.equal(reposSummary(["a/b", "c/d"]), "a/b og c/d")
  assert.equal(reposSummary(["a/b", "c/d", "e/f", "g/h"]), "a/b, c/d og 2 til")
})
