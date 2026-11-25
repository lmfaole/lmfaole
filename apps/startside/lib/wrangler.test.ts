// The Worker is an app of lmfaole.party like the others (`@lmfaole/worker/conventions`): only its path, no other address, the shared compatibility date.
import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { parseJsonc, wranglerProblems } from "@lmfaole/worker/conventions"

test("wrangler.jsonc is as every app's: the route /start and nothing else, no preview address, observability on", () => {
  const config = parseJsonc(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")) as Record<string, unknown>
  assert.deepEqual(wranglerProblems(config, "/start"), [])
})
