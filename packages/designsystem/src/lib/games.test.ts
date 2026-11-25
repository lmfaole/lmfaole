import { strict as assert } from "node:assert"
import { test } from "node:test"

import { deckCompatibility, deckStatus, gameFeatures, levelProgress, newSales, newsKind, onSale, presenceOf, presenceWords, priceWords, releaseWords, reviewSummary, statFacts } from "./games.ts"

const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, " ")

test("reviews are summed up in Steam's steps, by the share and by how many", () => {
  const label = (positive: number, total: number) => reviewSummary(positive, total)?.label
  assert.equal(label(960, 1000), "Overveldende positive")
  assert.equal(label(96, 100), "Svært positive", "95 % of fewer than 500 is not overwhelming")
  assert.equal(label(45, 50), "Svært positive")
  assert.equal(label(18, 20), "Positive", "80 % of fewer than 50")
  assert.equal(label(75, 100), "Stort sett positive")
  assert.equal(label(50, 100), "Blandede")
  assert.equal(label(25, 100), "Stort sett negative")
  assert.equal(label(10, 1000), "Overveldende negative")
  assert.equal(label(5, 100), "Svært negative")
  assert.equal(label(1, 20), "Negative")
  assert.equal(label(3, 4), "For få anmeldelser")
  assert.equal(reviewSummary(0, 0), null)
})

test("a review summary is one line with the percent and the count, and a sentiment for its colour and icon", () => {
  const summary = reviewSummary(11_604, 12_345)
  assert.equal(plain(summary?.words ?? ""), "Svært positive · 94 % av 12 345")
  assert.equal(summary?.sentiment, "positive")
  assert.equal(reviewSummary(50, 100)?.sentiment, "mixed")
  assert.equal(reviewSummary(30, 100)?.sentiment, "negative")
  assert.equal(reviewSummary(1, 1)?.words, "1 anmeldelse")
  assert.equal(reviewSummary(1, 1)?.sentiment, "few")
})

test("a price is in kroner without øre when whole, and a sale says the price before and the percent off with a real minus", () => {
  assert.equal(plain(priceWords({ final: 29_900 }).now), "299 kr")
  assert.equal(priceWords({ final: 29_900 }).before, null)
  const sale = priceWords({ final: 29_940, initial: 49_900, currency: "NOK" })
  assert.equal(plain(sale.now), "299,40 kr")
  assert.equal(plain(sale.before ?? ""), "499 kr")
  assert.equal(sale.discount, 40)
  assert.equal(plain(sale.discountWords ?? ""), "\u221240 %")
  assert.equal(plain(sale.words), "299,40 kr, før 499 kr, 40 % rabatt")
  assert.equal(priceWords({ final: 0, free: true }).now, "Gratis")
  assert.equal(onSale({ final: 100, initial: 200 }), true)
  assert.equal(onSale({ final: 200, initial: 200 }), false)
  assert.equal(onSale(null), false)
})

test("the games on sale since the last visit are those not seen then; the first visit has none", () => {
  assert.deepEqual(newSales([620, 440, 70], [440]), [620, 70])
  assert.deepEqual(newSales([620], null), [])
  assert.deepEqual(newSales([], [620]), [])
})

test("the Steam Deck's verdict follows Valve's category, and never stops anything", () => {
  assert.deepEqual([3, 2, 1, 0, null].map(deckCompatibility), ["verified", "playable", "unsupported", "unknown", "unknown"])
  assert.deepEqual(deckStatus("verified"), { text: "Steam Deck: Verifisert", icon: "success", tone: "default" })
  assert.equal(deckStatus("unsupported").text, "Steam Deck: Ikke støttet")
  assert.equal(deckStatus("unknown").tone, "muted")
})

test("how a game is played: the exact word over the general, in a fixed order, and its controller support", () => {
  assert.deepEqual(gameFeatures([1, 2, 9, 38, 28]), { players: ["Enspiller", "Samarbeid på nett"], controller: "Full støtte" })
  assert.deepEqual(gameFeatures([36, 1, 18]), { players: ["Flerspiller på nett"], controller: "Delvis støtte" })
  assert.deepEqual(gameFeatures([2, 24]), { players: ["Enspiller", "Delt skjerm"], controller: null })
  assert.deepEqual(gameFeatures([]), { players: [], controller: null })
})

test("a presence is read from Steam's state and game, in words, live when in a game or online", () => {
  assert.deepEqual(presenceWords(presenceOf(1, "Hades II")), { words: "Spiller Hades II", live: true })
  assert.deepEqual(presenceWords(presenceOf(1)), { words: "På nett", live: true })
  assert.deepEqual(presenceWords(presenceOf(3)), { words: "Borte", live: false })
  assert.deepEqual(presenceOf(0, null, 1_700_000_000, "2023-11-15T00:00:00Z"), { state: "offline", lastOnline: { at: "2023-11-14T22:13:20.000Z", now: "2023-11-15T00:00:00Z" } })
  assert.deepEqual(presenceOf(0, null, 1_700_000_000), { state: "offline" })
  assert.deepEqual(presenceOf(6), { state: "online" })
})

test("a level's progress is the XP of this level against what it takes", () => {
  const progress = levelProgress({ level: 42, xp: 9_312, xpAtLevel: 9_000, xpToNext: 188 })
  assert.equal(progress.value, 312)
  assert.equal(progress.max, 500)
  assert.equal(progress.label, "Nivå 42")
  assert.equal(progress.valueText, "312 av 500 XP til nivå 43")
})

test("stats keep the game's names and order, leave out nothing-values, format in Norwegian and stop at the limit", () => {
  const facts = statFacts([{ label: "Fiender beseiret", value: 12_345 }, { label: "Nøyaktighet", value: 0.4567 }, { label: "Dødsfall", value: 0 }, { label: " ", value: 3 }, { label: "Avstand", value: Number.NaN }, { label: "Hopp", value: 7 }], 2)
  assert.deepEqual(facts.map(([label, value]) => [label, plain(value)]), [["Fiender beseiret", "12 345"], ["Nøyaktighet", "0,46"]])
})

test("a news item is patch notes or an event by its tags", () => {
  assert.equal(newsKind(["patchnotes"]), "patch-notes")
  assert.equal(newsKind(["event_major"]), "event")
  assert.equal(newsKind([]), null)
  assert.equal(newsKind(undefined), null)
})

test("a release date is a day in words, and nothing where the store has no date", () => {
  assert.equal(releaseWords("2024-03-12"), "12. mars 2024")
  assert.equal(releaseWords("Kommer snart"), null)
  assert.equal(releaseWords(""), null)
})
