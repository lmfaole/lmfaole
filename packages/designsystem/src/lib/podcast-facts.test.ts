import { strict as assert } from "node:assert"
import { test } from "node:test"

import { categoryWords, languageWords, podcastFacts, releaseFrequency } from "./podcast-facts.ts"

const every = (days: number, count: number, from = "2025-01-06T06:00:00Z"): string[] => Array.from({ length: count }, (_, index) => new Date(Date.parse(from) + index * days * 86_400_000).toISOString())

test("how often a podcast comes out is read from the median gap between its episodes", () => {
  assert.equal(releaseFrequency(every(1, 10)), "Hver dag")
  assert.equal(releaseFrequency(every(3, 10)), "Flere ganger i uken")
  assert.equal(releaseFrequency(every(7, 10)), "Hver uke")
  assert.equal(releaseFrequency([...every(7, 10), "2025-03-20T06:00:00Z"]), "Hver uke", "one odd gap does not change it")
  assert.equal(releaseFrequency(every(14, 6)), "Annenhver uke")
  assert.equal(releaseFrequency(every(30, 6)), "Hver måned")
  assert.equal(releaseFrequency(every(90, 6)), "Sjeldnere enn hver måned")
  assert.equal(releaseFrequency(every(7, 2)), null, "too few to tell")
  assert.equal(releaseFrequency(every(7, 5).toReversed()), "Hver uke", "in any order")
})

test("a podcast that has stopped says since when", () => {
  assert.equal(releaseFrequency(every(7, 5, "2024-01-01T06:00:00Z"), "2025-11-12T12:00:00Z"), "Ingen nye siden januar 2024")
  assert.equal(releaseFrequency(every(7, 5, "2025-10-01T06:00:00Z"), "2025-11-12T12:00:00Z"), "Hver uke")
})

test("categories and the language are in Norwegian", () => {
  assert.equal(categoryWords("Society & Culture"), "Samfunn og kultur")
  assert.equal(categoryWords(" news "), "Nyheter")
  assert.equal(categoryWords("Ukjent kategori"), "Ukjent kategori")
  assert.equal(languageWords("no"), "Norsk")
  assert.equal(languageWords("en-US"), "Engelsk")
  assert.equal(languageWords("sv_SE"), "Svensk")
  assert.equal(languageWords("not a language"), null)
})

test("a podcast's facts come in a fixed order, and what is not known is left out", () => {
  const dates = every(7, 12, "2023-04-03T06:00:00Z")
  assert.deepEqual(podcastFacts({ publisher: "NRK", categories: ["News", "Daily News", "news"], language: "nb-NO", episodeDates: dates, episodes: 1240, now: "2023-06-26T08:00:00Z" }), [
    ["Utgiver", "NRK"],
    ["Kategorier", ["Nyheter", "Dagsnytt"]],
    ["Språk", "Norsk bokmål"],
    ["Nye episoder", "Hver uke"],
    ["Episoder", "1\u00a0240"],
    ["Startet", "2023"],
  ])
  assert.deepEqual(podcastFacts({ categories: ["Comedy"] }), [["Kategori", ["Humor"]]])
  assert.deepEqual(podcastFacts({}), [])
})
