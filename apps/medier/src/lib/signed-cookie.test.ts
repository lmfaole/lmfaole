import { strict as assert } from "node:assert"
import { test } from "node:test"

import { readSignedUsers, sign, verify } from "./signed-cookie.ts"
import { NO_USERS } from "./users.ts"

const SECRET = "a secret for the tests"

test("a signed name is read back, a name with dots too", async () => {
  for (const name of ["ole", "first.last", "a.b.c-d_e"]) assert.equal(await verify("lastfm_user", await sign("lastfm_user", name, SECRET), SECRET), name)
})

test("a cookie made by hand, garbled, signed with another secret or for another service is none", async () => {
  const signed = await sign("lastfm_user", "ole", SECRET)
  assert.equal(await verify("lastfm_user", "ole", SECRET), null)
  assert.equal(await verify("lastfm_user", undefined, SECRET), null)
  assert.equal(await verify("lastfm_user", "ole.", SECRET), null)
  assert.equal(await verify("lastfm_user", ".abc", SECRET), null)
  assert.equal(await verify("lastfm_user", "ole.not+base64!", SECRET), null)
  assert.equal(await verify("lastfm_user", signed.replace(/^ole/, "olf"), SECRET), null)
  assert.equal(await verify("lastfm_user", `${signed.slice(0, -2)}AA`, SECRET), null)
  assert.equal(await verify("lastfm_user", signed, "another secret"), null)
  assert.equal(await verify("trakt_user", signed, SECRET), null)
  assert.equal(await verify("lastfm_user", `other.${signed}`, SECRET), null)
})

test("the usernames are the signed cookies only", async () => {
  const jar: Record<string, string> = { lastfm_user: await sign("lastfm_user", "ole", SECRET), trakt_user: "stranger", steam_user: await sign("steam_user", "76561197960287930", SECRET) }
  assert.deepEqual(await readSignedUsers((name) => jar[name], SECRET), { ...NO_USERS, lastfm: "ole", steam: "76561197960287930" })
  assert.deepEqual(await readSignedUsers(() => undefined, SECRET), NO_USERS)
})
