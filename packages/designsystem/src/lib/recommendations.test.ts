import { strict as assert } from "node:assert"
import { test } from "node:test"

import { namesInWords, reasonWords } from "./recommendations.ts"

test("a reason is said in fixed words; one that names no one is not said", () => {
  assert.equal(reasonWords({ by: "Ekko" }), "Anbefalt av Ekko")
  assert.equal(reasonWords({ follows: "Lørdagsrevyen" }), "Fordi du følger Lørdagsrevyen")
  assert.equal(reasonWords({ with: "Anne Lindmo" }), "Med Anne Lindmo")
  assert.equal(reasonWords({ with: ["Anne", "Per", "Kari"] }), "Med Anne, Per og Kari")
  assert.equal(reasonWords({ by: " " }), null)
  assert.equal(reasonWords({ with: [] }), null)
})

test("names are joined as in a sentence", () => {
  assert.equal(namesInWords(["A"]), "A")
  assert.equal(namesInWords(["A", "B"]), "A og B")
  assert.equal(namesInWords(["A", "", "B", "C"]), "A, B og C")
})
