import { strict as assert } from "node:assert"
import { test } from "node:test"

import { detailPath, internalHref, parseGithubUrl, parseRef, withBase } from "./links.ts"

test("what a GitHub address names", () => {
  assert.deepEqual(parseGithubUrl("https://github.com/fremtind/jokul/pull/6849"), { kind: "pull-requests", owner: "fremtind", repo: "jokul", number: 6849 })
  assert.deepEqual(parseGithubUrl("https://github.com/fremtind/jokul/issues/12"), { kind: "issues", owner: "fremtind", repo: "jokul", number: 12 })
  assert.deepEqual(parseGithubUrl("https://github.com/lmfaole/startside.v2/discussions/3/"), { kind: "discussions", owner: "lmfaole", repo: "startside.v2", number: 3 })
})

test("any other address names nothing", () => {
  for (const bad of ["https://github.com/fremtind/jokul", "https://github.com/fremtind/jokul/pull/x", "https://gitlab.com/a/b/pull/1", "https://github.com/a/b/commit/1", "http://github.com/a/b/pull/1", "https://github.com/a/b/pull/1/files"]) {
    assert.equal(parseGithubUrl(bad), null, bad)
  }
})

test("a list links to the app's own page, with the base in front", () => {
  assert.equal(internalHref("https://github.com/fremtind/jokul/pull/6849"), "/start/pull-requests/fremtind/jokul/6849")
  assert.equal(internalHref("https://github.com/fremtind/jokul/discussions/7"), "/start/discussions/fremtind/jokul/7")
  assert.equal(internalHref("https://example.com/x"), null)
  assert.equal(withBase("/issues"), "/start/issues")
  assert.equal(detailPath("issues", { owner: "o", repo: "r", number: 5 }), "/issues/o/r/5")
})

test("a detail page's address is checked before it is used in a query", () => {
  assert.deepEqual(parseRef({ owner: "fremtind", repo: "jokul", number: "12" }), { owner: "fremtind", repo: "jokul", number: 12 })
  for (const bad of [{ owner: "a b", repo: "r", number: "1" }, { owner: "o", repo: "r\"){", number: "1" }, { owner: "o", repo: "r", number: "0" }, { owner: "o", repo: "r", number: "1.5" }, { owner: "o", repo: "r", number: "abc" }, { owner: "-o", repo: "r", number: "1" }]) {
    assert.equal(parseRef(bad), null, JSON.stringify(bad))
  }
})
