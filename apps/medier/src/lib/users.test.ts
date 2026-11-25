import { strict as assert } from "node:assert"
import { test } from "node:test"

import { hasMusic, usersFrom } from "./users.ts"

test("the usernames are the settings', trimmed, and an empty or missing one is none", () => {
  const users = usersFrom({ LASTFM_USER: " snowpony69 ", TRAKT_USER: "", STEAM_USER: "76561198871653749", LASTFM_API_KEY: "k" })
  assert.deepEqual(users, { lastfm: "snowpony69", trakt: null, listenbrainz: null, steam: "76561198871653749", retroachievements: null })
  assert.equal(hasMusic(users), true)
  assert.equal(hasMusic(usersFrom({ LISTENBRAINZ_USER: "lmfaole" })), true)
  assert.equal(hasMusic(usersFrom({})), false)
})
