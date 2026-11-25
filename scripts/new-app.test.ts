import assert from "node:assert/strict"
import { test } from "node:test"

import { parseJsonc, wranglerProblems } from "@lmfaole/worker/conventions"
import { headersFileRules, SECURITY_HEADERS } from "@lmfaole/web/headers"

import { appFiles, refusal, withReadmeRow } from "./new-app.ts"

test("a name that is not one, or is taken by an app, a Worker, a page of the front page or another Worker's route, is refused", () => {
  for (const name of ["Notater", "1notater", "-notater", "no_tater", ""]) assert.match(refusal(name) ?? "", /is not a name/, name)
  assert.match(refusal("cv") ?? "", /apps\/cv is there already/)
  assert.match(refusal("work") ?? "", /the Worker work is there already/)
  assert.match(refusal("kilder") ?? "", /a page of the front page/)
  assert.match(refusal("medierx") ?? "", /taken by the route lmfaole\.party\/medier\*/)
  assert.equal(refusal("zz-not-an-app-yet"), null)
})

test("the app's Worker and _headers are as the conventions say", () => {
  const files = appFiles("notater", "Notater", "Notatene mine")
  assert.deepEqual(wranglerProblems(parseJsonc(files["wrangler.jsonc"] ?? "") as Record<string, unknown>, "/notater"), [])
  assert.deepEqual(headersFileRules(files["public/_headers"] ?? "", "/notater/*"), SECURITY_HEADERS)
  assert.match(files["src/pages/index.astro"] ?? "", /const DESCRIPTION = 'Notatene mine'/)
})

test("the README row goes among the apps, in order", () => {
  const readme = "| Path | What |\n| --- | --- |\n| `packages/x` | x |\n| `apps/cv` | CV |\n| `apps/presentasjoner` | P |\n| `workers/y` | y |\n"
  assert.deepEqual(withReadmeRow(readme, "notater", "N").split("\n").slice(3, 7), ["| `apps/cv` | CV |", "| `apps/notater` | N (Astro on Workers) | lmfaole.party/notater |", "| `apps/presentasjoner` | P |", "| `workers/y` | y |"])
  assert.equal(withReadmeRow(readme, "aaa", "A").split("\n")[3], "| `apps/aaa` | A (Astro on Workers) | lmfaole.party/aaa |")
})
