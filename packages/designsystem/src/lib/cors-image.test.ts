import { strict as assert } from "node:assert"
import { test } from "node:test"

import { corsRetryUrl } from "./cors-image.ts"

test("a picture is asked for again under an address of its own, keeping its query and fragment", () => {
  assert.equal(corsRetryUrl("https://image.tmdb.org/t/p/w342/a.jpg"), "https://image.tmdb.org/t/p/w342/a.jpg?cors=1")
  assert.equal(corsRetryUrl("https://x.test/a.png?w=300"), "https://x.test/a.png?w=300&cors=1")
  assert.equal(corsRetryUrl("/mock/a.jpg#x"), "/mock/a.jpg?cors=1#x")
})
