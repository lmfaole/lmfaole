import { strict as assert } from "node:assert"
import { test } from "node:test"

import { githubUser, isPublicRepository, isWatched, parseLogin, publicSearch, repliesQuery, repoQualifiers, scope, userQueries } from "./github-query.ts"

test("only public repositories, without the excluded organisations", () => {
  assert.equal(scope(undefined), "is:public")
  assert.equal(scope(""), "is:public")
  assert.equal(scope("fremtind"), "is:public -org:fremtind")
  assert.equal(scope(" fremtind , other-org ,"), "is:public -org:fremtind -org:other-org")
})

test("anything that is not an organisation name is dropped, so it cannot add search terms", () => {
  assert.equal(scope("fremtind archived:false, -is:public, a/b"), "is:public")
  assert.equal(scope("ok,bad org,also-ok"), "is:public -org:ok -org:also-ok")
})

test("the watched repositories as qualifiers, and nothing else", () => {
  assert.equal(repoQualifiers(undefined), "")
  assert.equal(repoQualifiers(""), "")
  assert.equal(repoQualifiers("fremtind/jokul"), "repo:fremtind/jokul")
  assert.equal(repoQualifiers(" fremtind/jokul , lmfaole/startside.v2 ,"), "repo:fremtind/jokul repo:lmfaole/startside.v2")
  assert.equal(repoQualifiers("jokul, a/b archived:false, -x/y, a/b/c"), "")
})

test("whether a repository is watched, whatever its case; with none watched, all are", () => {
  assert.equal(isWatched("fremtind/jokul", "fremtind/jokul"), true)
  assert.equal(isWatched("Fremtind/Jokul", "fremtind/jokul, a/b"), true)
  assert.equal(isWatched("lmfaole/startside", "fremtind/jokul"), false)
  assert.equal(isWatched("lmfaole/startside", undefined), true)
  assert.equal(isWatched("lmfaole/startside", "not a repo"), true)
})

test("every search is by the username and limited to public repositories, never @me", () => {
  const queries = userQueries("Kari-N", "fremtind")
  assert.deepEqual(queries, {
    reviews: "is:open review-requested:Kari-N archived:false is:public -org:fremtind",
    mine: "is:open author:Kari-N archived:false is:public -org:fremtind",
    assigned: "is:open is:issue assignee:Kari-N archived:false is:public -org:fremtind",
    involved: "is:open is:issue involves:Kari-N archived:false is:public -org:fremtind",
    discussions: "involves:Kari-N is:public -org:fremtind",
    dependabot: "is:open author:app/dependabot user:Kari-N archived:false is:public -org:fremtind",
  })
  for (const query of [...Object.values(queries), repliesQuery("Kari-N", "2026-11-18", undefined)]) {
    assert.ok(query.includes("is:public"), query)
    assert.ok(!query.includes("@me"), query)
  }
  assert.equal(repliesQuery("kari", "2026-11-18", undefined), "involves:kari is:public archived:false updated:>=2026-11-18 sort:updated-desc")
})

test("a username that is not a login cannot get into a query", () => {
  assert.throws(() => userQueries("kari is:private", undefined))
  assert.throws(() => repliesQuery("kari", "2026-11-18 is:private", undefined))
})

test("a login is letters, digits and dashes, with an @ in front allowed; anything that could add search terms is not one", () => {
  assert.equal(parseLogin(" lmfaole "), "lmfaole")
  assert.equal(parseLogin("@Ole-Jorgen"), "Ole-Jorgen")
  for (const bad of ["", "-x", "a b", "me is:private", "a".repeat(40), undefined]) assert.equal(parseLogin(bad), null, String(bad))
  assert.equal(githubUser("lmfaole"), "lmfaole")
  assert.throws(() => githubUser(undefined))
  assert.throws(() => githubUser("me is:private"))
})

test("a repository is public only when every field GitHub gave says so, and at least one is there", () => {
  assert.equal(isPublicRepository({ isPrivate: false, visibility: "PUBLIC" }), true)
  assert.equal(isPublicRepository({ private: false, visibility: "public" }), true)
  assert.equal(isPublicRepository({ isPrivate: false }), true)
  for (const repo of [{ isPrivate: true, visibility: "PUBLIC" }, { isPrivate: false, visibility: "INTERNAL" }, { private: true }, { visibility: "private" }, { isPrivate: null }, {}, null, undefined]) {
    assert.equal(isPublicRepository(repo), false, JSON.stringify(repo))
  }
})

test("no search goes out without is:public", () => {
  for (const query of Object.values(userQueries("lmfaole", "fremtind"))) assert.equal(publicSearch(query), query)
  assert.equal(publicSearch(repliesQuery("lmfaole", "2026-11-18", undefined)), repliesQuery("lmfaole", "2026-11-18", undefined))
  for (const bad of ["author:lmfaole", "author:lmfaole is:publicx", "author:lmfaole -is:public", "is:private"]) assert.throws(() => publicSearch(bad), bad)
})
