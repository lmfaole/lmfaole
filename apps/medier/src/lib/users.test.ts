import { strict as assert } from "node:assert"
import { test } from "node:test"

import { backWithError, backWithoutError, fieldAction, formError, readUsers, safeBack, whoOf } from "./users.ts"

test("back is a path on this site, never another site's", () => {
  assert.equal(safeBack("/musikk/?a=1#x"), "/musikk/?a=1#x")
  for (const bad of ["//evil.example/", "/\\evil.example", "https://evil.example/", "javascript:alert(1)", "musikk/", "/a\nb", "", undefined, 42]) assert.equal(safeBack(bad), "/", String(bad))
  assert.equal(safeBack("//x", "/film/"), "/film/")
})

test("an error goes on the way back and off again once the username is found", () => {
  const sent = backWithError("/musikk/?side=2&brukernavn-feil=trakt&brukernavn-verdi=old", "lastfm", "nobody here")
  assert.deepEqual(formError(new URL(sent, "https://x").searchParams), { service: "lastfm", value: "nobody here" })
  assert.equal(new URL(sent, "https://x").searchParams.get("side"), "2")
  assert.equal(backWithoutError(sent), "/musikk/?side=2")
  assert.equal(formError(new URLSearchParams("brukernavn-feil=spotify&brukernavn-verdi=x")), null)
})

test("a field is kept when missing, cleared when empty, and only a username is set", () => {
  assert.deepEqual(fieldAction(null), { kind: "keep" })
  assert.deepEqual(fieldAction("  "), { kind: "clear" })
  assert.deepEqual(fieldAction(" snowpony69 "), { kind: "set", user: "snowpony69" })
  assert.deepEqual(fieldAction("a b"), { kind: "invalid", value: "a b" })
})

test("the cookies are read as usernames, and anything else is none", () => {
  const jar: Record<string, string> = { lastfm_user: "snowpony69", trakt_user: "<script>", steam_user: "76561197960287930" }
  const users = readUsers((name) => jar[name])
  assert.deepEqual(users, { lastfm: "snowpony69", trakt: null, listenbrainz: null, steam: "76561197960287930", retroachievements: null })
  assert.equal(whoOf(users), "snowpony69|||76561197960287930|")
})
