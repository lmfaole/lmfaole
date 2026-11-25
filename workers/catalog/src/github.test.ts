import assert from "node:assert/strict"
import { test } from "node:test"
import {
  commitsQuery,
  isRepoName,
  parseCalendar,
  parseGraphqlCommits,
  parseRepos,
  parseRestCommit,
  parseSearch,
  yearOfRun,
} from "./github.ts"
import { syncGithub } from "./github-sync.ts"
import { type Call, database, fakeFetch, fixture } from "./testing.ts"

const at = (iso: string) => Date.parse(iso) / 1000

test("a private repository is dropped from the list", () => {
  const repos = fixture("github-repos.json") as Record<string, unknown>[]
  const parsed = parseRepos([...repos, { ...repos[0], full_name: "lmfaole/secret", private: true }])
  assert.deepEqual(parsed.map((r) => r.fullName), ["lmfaole/lmfaole", "lmfaole/podkast", "lmfaole/medier"])
  assert.equal(parsed[0]?.language, "TypeScript")
  assert.equal(parsed[0]?.pushedAt, at("2026-11-25T13:45:14Z"))
})

test("a search item is a pull request when it has one, merged when that was merged", () => {
  const { items, total, incomplete } = parseSearch(fixture("github-search.json"))
  assert.equal(total, 3)
  assert.equal(incomplete, false)
  assert.deepEqual(
    items.map((i) => [i.id, i.kind, i.repo, i.number, i.state, i.merged, i.closedAt]),
    [
      [6605995157, "pr", "fremtind/jokul", 6888, "open", false, null],
      [6604251693, "pr", "fremtind/jokul", 6886, "closed", true, at("2026-11-25T12:18:06Z")],
      [6605452255, "issue", "fremtind/jokul", 6887, "open", false, null],
    ],
  )
})

test("the calendar keeps the days with contributions, and an error is not an empty calendar", () => {
  assert.deepEqual(parseCalendar(fixture("github-calendar.json")), [
    { day: "2024-01-02", contributions: 3 },
    { day: "2024-01-08", contributions: 2 },
  ])
  assert.throws(() => parseCalendar({ data: null, errors: [{ type: "RATE_LIMITED", message: "slow down" }] }), /slow down/)
})

test("a project commit needs a public repository: private, missing and commitless ones have none", () => {
  const repos = ["fremtind/jokul", "lmfaole/hemmelig", "navikt/aksel", "slettet/gone"]
  const found = parseGraphqlCommits(repos, fixture("github-graphql-commits.json"))
  assert.deepEqual(found.get("fremtind/jokul"), {
    repo: "fremtind/jokul",
    sha: "5f1fb0a4a1c00fd13f64745f899eff4978f86ddc",
    message: "Ikon label og tekstendringer (#1798)",
    committedAt: at("2023-02-09T13:29:23Z"),
  })
  assert.deepEqual([...found.values()].slice(1), [null, null, null])
  assert.throws(() => parseGraphqlCommits(repos, { data: null, errors: [{ type: "FORBIDDEN", message: "no" }] }), /no/)
})

test("a REST commit is its message's first line", () => {
  const commit = parseRestCommit("fremtind/jokul", fixture("github-commits.json"))
  assert.equal(commit?.message, "fix(portal): sett maksbredde på innhold i artikler")
  assert.equal(commit?.committedAt, at("2026-11-24T13:27:49Z"))
  assert.equal(parseRestCommit("fremtind/jokul", []), null)
})

test("only owner/name goes into a query", () => {
  assert.ok(isRepoName("navikt/mangfold-i-mai"))
  assert.ok(isRepoName("lmfaole/lmfaole.party"))
  for (const bad of ["navikt", "a/b/c", "../x", "a/.git", 'a/b") { x', "a/b c", ""]) assert.equal(isRepoName(bad), false, bad)
  assert.throws(() => commitsQuery(['a/b") { x']))
  assert.match(commitsQuery(["fremtind/jokul"]), /r0: repository\(owner: "fremtind", name: "jokul"\)/)
})

test("every year from the first comes round in turn", () => {
  const sixHours = 6 * 3_600_000
  const start = Date.UTC(2026, 5, 1)
  const years = new Set(Array.from({ length: 9 }, (_, i) => yearOfRun(2018, start + i * sixHours)))
  assert.deepEqual([...years].toSorted(), [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026])
  assert.equal(yearOfRun(2026, start), 2026)
})

const empty = { total_count: 0, incomplete_results: false, items: [] }
const graphql = (call: Call, word: string) => call.url.endsWith("/graphql") && call.body?.query.includes(word) === true

/** GitHub as the fixtures have it; the year the run refreshes has one item, made in that year. */
function github(year: number) {
  const search = fixture("github-search.json") as { items: Record<string, unknown>[] }
  const old = { ...search.items[2], id: 1, number: 1, title: "old", created_at: `${year}-03-01T00:00:00Z`, state: "closed", closed_at: `${year}-03-02T00:00:00Z` }
  return fakeFetch([
    [(c) => c.url.includes("/users/lmfaole/repos"), () => fixture("github-repos.json")],
    [(c) => c.url.includes("/search/issues") && c.url.includes("updated%3A%3E%3D"), () => fixture("github-search.json")],
    [(c) => c.url.includes("/search/issues") && c.url.includes(`created%3A${year}`), () => ({ total_count: 1, incomplete_results: false, items: [old] })],
    [(c) => c.url.includes("/search/issues"), () => empty],
    [(c) => graphql(c, "contributionsCollection"), () => fixture("github-calendar.json")],
    [(c) => graphql(c, "user(login: $login) { id }"), () => ({ data: { user: { id: "MDQ6VXNlcjM3OTQwMDQ4" } } })],
    [(c) => graphql(c, "history"), () => fixture("github-graphql-commits.json")],
    [(c) => c.url.includes("/repos/fremtind/jokul/commits"), () => fixture("github-commits.json")],
    [(c) => c.url.includes("/repos/navikt/aksel/commits"), () => []],
    [(c) => c.url.includes("/commits"), () => new Response("Not Found", { status: 404 })],
  ])
}

function site() {
  const { db, sqlite } = database("site")
  sqlite.exec(`INSERT INTO cv_project (id, stilling_id, aar, navn, repo) VALUES
    (1, 1, 2023, 'Jøkul', 'fremtind/jokul'), (2, 1, 2022, 'Hemmelig', 'lmfaole/hemmelig'), (3, 2, 2024, 'Aksel', 'navikt/aksel'), (4, 2, 2024, 'Borte', 'slettet/gone'),
    (5, 2, 2024, 'Uten', NULL), (6, 2, 2024, 'Rart', 'not a repo')`)
  return { db, sqlite }
}

const scheduledTime = Date.parse("2026-11-25T06:15:00Z")

test("a run copies GitHub into site, and a second run writes nothing", async () => {
  const year = yearOfRun(2018, scheduledTime)
  const { db, sqlite } = site()
  sqlite.exec(`INSERT INTO github_repos (full_name) VALUES ('lmfaole/slettet');
    INSERT INTO github_items (id, kind, repo, number, title, state, created_at) VALUES
      (2, 'pr', 'a/b', 2, 'gone from GitHub', 'closed', ${Date.UTC(year, 6, 1) / 1000}),
      (3, 'pr', 'a/b', 3, 'another year', 'closed', ${Date.UTC(year === 2018 ? 2019 : 2018, 6, 1) / 1000});
    INSERT INTO github_days VALUES ('2026-01-01', 4);
    INSERT INTO github_project_commits VALUES ('lmfaole/hemmelig', 'aaaa', 'secret', 1), ('lmfaole/fjernet', 'bbbb', 'old', 1)`)
  const logs: string[] = []
  const { fetch, calls } = github(year)
  await syncGithub(db, { user: "lmfaole", firstYear: 2018, token: "t", fetch, scheduledTime, log: (m) => logs.push(m) })

  assert.deepEqual(sqlite.prepare("SELECT full_name FROM github_repos ORDER BY full_name").all().map((r) => r.full_name), ["lmfaole/lmfaole", "lmfaole/medier", "lmfaole/podkast"])
  assert.deepEqual(sqlite.prepare("SELECT id, kind, merged FROM github_items ORDER BY id").all().map((r) => [r.id, r.kind, r.merged]), [
    [1, "issue", 0],
    [3, "pr", 0],
    [6604251693, "pr", 1],
    [6605452255, "issue", 0],
    [6605995157, "pr", 0],
  ])
  assert.deepEqual(sqlite.prepare("SELECT day, contributions FROM github_days ORDER BY day").all().map((r) => [r.day, r.contributions]), [
    ["2024-01-02", 3],
    ["2024-01-08", 2],
  ])
  assert.deepEqual(sqlite.prepare("SELECT repo, sha FROM github_project_commits").all().map((r) => [r.repo, r.sha]), [["fremtind/jokul", "5f1fb0a4a1c00fd13f64745f899eff4978f86ddc"]])
  assert.ok(calls.every((c) => c.headers.authorization === "Bearer t" && c.headers["user-agent"]?.startsWith("lmfaole-catalog")))
  assert.ok(calls.filter((c) => c.url.includes("/search/")).every((c) => decodeURIComponent(c.url).includes("author:lmfaole is:public ")))
  assert.ok(calls.length <= 12, `${calls.length} calls`)

  const again: string[] = []
  await syncGithub(db, { user: "lmfaole", firstYear: 2018, token: "t", fetch, scheduledTime, log: (m) => again.push(m) })
  assert.ok(again.every((m) => m.endsWith(" 0 rows")), again.join("\n"))
})

test("without a token there is no calendar, commits come over REST, and a failed repository keeps its row", async () => {
  const year = yearOfRun(2018, scheduledTime)
  const { db, sqlite } = site()
  sqlite.exec(`INSERT INTO github_project_commits VALUES ('navikt/aksel', 'cccc', 'kept', 1)`)
  const { fetch: answers } = github(year)
  const { fetch, calls } = fakeFetch([
    [(c) => c.url.includes("/repos/navikt/aksel/commits"), () => new Response("boom", { status: 502 })],
    [() => true, (c) => answers(c.url, { headers: c.headers })],
  ])
  const logs: string[] = []
  await assert.rejects(syncGithub(db, { user: "lmfaole", firstYear: 2018, fetch, scheduledTime, log: (m) => logs.push(m) }), (error: AggregateError) => {
    assert.match(String(error.errors[0]), /no answer for navikt\/aksel/)
    return true
  })
  assert.ok(logs.includes("github: calendar skipped: no GITHUB_TOKEN"))
  assert.ok(calls.every((c) => !c.url.endsWith("/graphql") && c.headers.authorization === undefined))
  assert.deepEqual(sqlite.prepare("SELECT repo, sha, message FROM github_project_commits ORDER BY repo").all().map((r) => [r.repo, r.sha, r.message]), [
    ["fremtind/jokul", "79ce0d3c69973b45fa534c717fdca59d61b77508", "fix(portal): sett maksbredde på innhold i artikler"],
    ["navikt/aksel", "cccc", "kept"],
  ])
})

test("a rate limit says until when, and nothing is written", async () => {
  const { db, sqlite } = site()
  const reset = String(Date.parse("2026-11-25T07:00:00Z") / 1000)
  const { fetch } = fakeFetch([[() => true, () => new Response("{}", { status: 403, headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": reset } })]])
  await assert.rejects(syncGithub(db, { user: "lmfaole", firstYear: 2018, fetch, scheduledTime, log: () => {} }), (error: AggregateError) => {
    assert.match(String(error.errors[0]), /rate limited on .* until 2026-11-25T07:00:00.000Z/)
    return true
  })
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM github_repos").get()?.n, 0)
})
