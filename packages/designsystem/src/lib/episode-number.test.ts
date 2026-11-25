import { strict as assert } from "node:assert"
import { test } from "node:test"

import { episodeNumberWords, episodeTypeWord } from "./episode-number.ts"

test("an episode's number is short for the eye and whole for the ear; nothing without a season or a number", () => {
  assert.deepEqual(episodeNumberWords({ season: 2, number: 14 }), { short: "S2 E14", spoken: "Sesong 2, episode 14" })
  assert.deepEqual(episodeNumberWords({ number: 7 }), { short: "E7", spoken: "Episode 7" })
  assert.deepEqual(episodeNumberWords({ season: 3 }), { short: "S3", spoken: "Sesong 3" })
  assert.equal(episodeNumberWords({}), null)
  assert.equal(episodeNumberWords({ season: 0, number: -1 }), null, "a feed's 0 or a negative is no number")
  assert.equal(episodeNumberWords({ number: 1.5 }), null)
})

test("only a trailer and a bonus episode have a word", () => {
  assert.equal(episodeTypeWord("trailer"), "Trailer")
  assert.equal(episodeTypeWord("bonus"), "Bonus")
  assert.equal(episodeTypeWord("full"), null)
  assert.equal(episodeTypeWord(undefined), null)
})
