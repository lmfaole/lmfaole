import { strict as assert } from "node:assert"
import { test } from "node:test"

import { countOf, excerpt, takeFirst, truncateMarkdown } from "./digest.ts"

test("the first few from lists already in the order of need", () => {
  assert.deepEqual(takeFirst([["a", "b"], [], ["c", "d", "e"]], 4), ["a", "b", "c", "d"])
  assert.deepEqual(takeFirst([["a"]], 4), ["a"])
  assert.deepEqual(takeFirst([], 4), [])
  assert.deepEqual(takeFirst([["a", "b"]], 0), [])
})

test("how many are in a group, zero where there is none", () => {
  const groups = [{ id: "blocked", items: [1, 2] }, { id: "ready", items: [3] }]
  assert.equal(countOf(groups, "blocked", (group) => group.items.length), 2)
  assert.equal(countOf(groups, "review" as never, (group) => group.items.length), 0)
})

test("an excerpt is cut at a word, with an ellipsis, and a short text is left alone", () => {
  assert.equal(excerpt("Kort tekst."), "Kort tekst.")
  assert.equal(excerpt(null), "")
  assert.equal(excerpt("  linje en\n\nlinje   to  "), "linje en linje to")
  const long = "Dette er en lang beskrivelse av en endring som går over flere ord og setninger, og den skal kuttes ved et ord. ".repeat(6)
  const short = excerpt(long, 100)
  assert.ok(short.length <= 101, String(short.length))
  assert.ok(short.endsWith("…"))
  assert.doesNotMatch(short, /\s…$/)
  assert.equal(excerpt("x".repeat(500), 50), `${"x".repeat(50)}…`)
})

test("a short Markdown text is left alone", () => {
  assert.deepEqual(truncateMarkdown("Kort **tekst**.", 100), { text: "Kort **tekst**.", cut: false })
  assert.deepEqual(truncateMarkdown(null, 100), { text: "", cut: false })
  assert.deepEqual(truncateMarkdown("a\r\nb", 100), { text: "a\nb", cut: false })
})

test("a long Markdown text is cut at a paragraph, and says it was cut", () => {
  const text = `Første avsnitt som er ganske langt og tar plass.\n\nAndre avsnitt som også er langt.\n\nTredje avsnitt som blir kuttet bort fordi det er for langt.`
  const result = truncateMarkdown(text, 90)
  assert.equal(result.cut, true)
  assert.equal(result.text, "Første avsnitt som er ganske langt og tar plass.\n\nAndre avsnitt som også er langt.\n\n…")
})

test("Markdown is never cut inside a fenced code block", () => {
  const text = "Før.\n\n```ts\nconst a = 1\nconst b = 2\nconst c = 3\n```\n\nEtter."
  const result = truncateMarkdown(text, 30)
  assert.equal(result.cut, true)
  assert.doesNotMatch(result.text, /```/)
  assert.ok(result.text.startsWith("Før."))
})

test("with no paragraph to cut at, it is cut at a line or a word", () => {
  const result = truncateMarkdown("en to tre fire fem seks sju åtte ni ti", 20)
  assert.equal(result.cut, true)
  assert.match(result.text, /^en to tre fire fem…$|^en to tre fire fem\n\n…$/)
})
