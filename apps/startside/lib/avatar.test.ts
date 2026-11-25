import { strict as assert } from "node:assert"
import { test } from "node:test"

import { avatarUrl } from "./avatar.ts"

test("a login has a picture at github.com, a bot's without [bot]", () => {
  assert.equal(avatarUrl("lmfaole"), "https://github.com/lmfaole.png?size=40")
  assert.equal(avatarUrl("dependabot[bot]", 64), "https://github.com/dependabot.png?size=64")
  assert.equal(avatarUrl("Copilot"), "https://github.com/copilot-pull-request-reviewer.png?size=40")
})

test("what is not a login has none", () => {
  assert.equal(avatarUrl("ukjent person"), null)
  assert.equal(avatarUrl("a/b"), null)
  assert.equal(avatarUrl(""), null)
})
