import { strict as assert } from "node:assert"
import { test } from "node:test"

import { formState, parseLogin, safeBack, sameLogin, userCookie, withError, withoutError } from "./username.ts"

test("a login is letters, digits and dashes, with an @ in front allowed; anything that could add search terms is not one", () => {
  assert.equal(parseLogin(" lmfaole "), "lmfaole")
  assert.equal(parseLogin("@Ole-Jorgen"), "Ole-Jorgen")
  assert.equal(parseLogin(""), null)
  assert.equal(parseLogin("-x"), null)
  assert.equal(parseLogin("a b"), null)
  assert.equal(parseLogin("me is:private"), null)
  assert.equal(parseLogin("a".repeat(40)), null)
  assert.equal(parseLogin(undefined), null)
  assert.equal(sameLogin("LmFaole", "lmfaole"), true)
})

test("the way back is a path in the app, never another site", () => {
  assert.equal(safeBack("/start"), "/start")
  assert.equal(safeBack("/start/issues?x=1#a"), "/start/issues?x=1#a")
  assert.equal(safeBack("/start?brukernavn-feil=github"), "/start?brukernavn-feil=github")
  for (const bad of ["//evil.example", "/start//evil.example", "/startfoo", "https://evil.example/start", "/start/\\evil", "/start/x\nLocation: y", "", "/", "/other"]) {
    assert.equal(safeBack(bad), "/start", bad)
  }
  assert.equal(safeBack(null), "/start")
})

test("a failed submission comes back with the service and what was written, and a new try starts clean", () => {
  const failed = withError("/start/issues?tab=1#top", "github", "nobody here")
  assert.equal(failed, "/start/issues?tab=1&brukernavn-feil=github&brukernavn-verdi=nobody+here#top")
  assert.equal(withoutError(failed), "/start/issues?tab=1#top")
  assert.equal(withoutError("/start?brukernavn-feil=github&brukernavn-verdi=x"), "/start")
  assert.deepEqual(formState({ "brukernavn-feil": "github", "brukernavn-verdi": "nobody" }, "github"), { value: "nobody", error: "Fant ingen GitHub-bruker som heter «nobody». Sjekk stavemåten." })
  assert.deepEqual(formState({ "brukernavn-feil": "lastfm", "brukernavn-verdi": "x" }, "github"), {})
  assert.deepEqual(formState({}, "github"), {})
})

test("the cookie is kept a year under the base path, and removed by an empty value", () => {
  assert.equal(userCookie("lmfaole"), "github_user=lmfaole; Path=/start; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly")
  assert.equal(userCookie(null), "github_user=; Path=/start; Max-Age=0; SameSite=Lax; Secure; HttpOnly")
})
