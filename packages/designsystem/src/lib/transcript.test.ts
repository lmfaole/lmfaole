import { strict as assert } from "node:assert"
import { test } from "node:test"

import { cueTurns, currentCue, findMatches, markParts, matchWords, paragraphsOf, type TranscriptCue } from "./transcript.ts"

const cues: TranscriptCue[] = [
  { start: 0, end: 4, text: "Velkommen til Ekko.", speaker: "Anne" },
  { start: 4, end: 9, text: "I dag snakker vi om strøm.", speaker: "Anne" },
  { start: 12, end: 18, text: "Strømprisen har steget igjen.", speaker: "Per" },
  { start: 18, end: 20, text: "Takk for nå.", speaker: "Anne" },
]

test("the current cue is the one said at the time; a pause belongs to the cue before; none before the first or after the last", () => {
  assert.equal(currentCue(cues, 0), 0)
  assert.equal(currentCue(cues, 3.99), 0)
  assert.equal(currentCue(cues, 4), 1)
  assert.equal(currentCue(cues, 10), 1, "the pause between 9 and 12 keeps the cue before")
  assert.equal(currentCue(cues, 12), 2)
  assert.equal(currentCue(cues, 19.5), 3)
  assert.equal(currentCue(cues, 20), -1, "the last has ended")
  assert.equal(currentCue([{ start: 5, end: 8, text: "Sent" }], 2), -1)
  assert.equal(currentCue([], 2), -1)
  assert.equal(currentCue(cues, Number.NaN), -1)
})

test("the current cue is found in a long transcript too", () => {
  const long = Array.from({ length: 5000 }, (_, index) => ({ start: index * 3, end: index * 3 + 2.5, text: `Linje ${index}` }))
  assert.equal(currentCue(long, 3 * 4321 + 1), 4321)
  assert.equal(currentCue(long, 3 * 4321 + 2.7), 4321)
})

test("cues are grouped in turns where the speaker changes, each keeping its index", () => {
  const turns = cueTurns(cues)
  assert.deepEqual(
    turns.map((turn) => [turn.speaker, turn.cues.map(({ index }) => index)]),
    [
      ["Anne", [0, 1]],
      ["Per", [2]],
      ["Anne", [3]],
    ],
  )
  assert.deepEqual(cueTurns([{ start: 0, end: 1, text: "a" }, { start: 1, end: 2, text: "b", speaker: " " }]).map((turn) => turn.cues.length), [2], "no speaker, or a blank one, is one turn")
})

test("a search finds every match in reading order, without regard to case; an empty query finds none", () => {
  const texts = cues.map((cue) => cue.text)
  assert.deepEqual(findMatches(texts, "strøm"), [
    { item: 1, from: 20, to: 25 },
    { item: 2, from: 0, to: 5 },
  ])
  assert.deepEqual(findMatches(texts, "  STRØM "), findMatches(texts, "strøm"))
  assert.deepEqual(findMatches(["aaaa"], "aa"), [
    { item: 0, from: 0, to: 2 },
    { item: 0, from: 2, to: 4 },
  ])
  assert.deepEqual(findMatches(texts, ""), [])
  assert.deepEqual(findMatches(texts, "   "), [])
})

test("a text is cut at its matches, each numbered as among all the matches", () => {
  const texts = ["Strøm og strøm", "Ingen", "mer strøm"]
  const matches = findMatches(texts, "strøm")
  assert.deepEqual(markParts(texts[0] ?? "", 0, matches), [{ text: "Strøm", match: 0 }, { text: " og " }, { text: "strøm", match: 1 }])
  assert.deepEqual(markParts(texts[1] ?? "", 1, matches), [{ text: "Ingen" }])
  assert.deepEqual(markParts(texts[2] ?? "", 2, matches), [{ text: "mer " }, { text: "strøm", match: 2 }])
})

test("a transcript without times is split in paragraphs at blank lines", () => {
  assert.deepEqual(paragraphsOf("Første linje\nfortsetter her.\n\n  \nAndre avsnitt.\n"), ["Første linje fortsetter her.", "Andre avsnitt."])
  assert.deepEqual(paragraphsOf("   "), [])
})

test("the count of matches is said in words", () => {
  assert.equal(matchWords(0, -1), "Ingen treff")
  assert.equal(matchWords(3, -1), "3 treff")
  assert.equal(matchWords(5, 1), "Treff 2 av 5")
})
