import assert from "node:assert/strict"
import { test } from "node:test"
import { parseShelves, plan, ratingOf } from "./hardcover.ts"
import { syncHardcover } from "./hardcover-sync.ts"
import { database, fakeFetch, fixture } from "./testing.ts"
import { isHardcoverRun } from "./worker.ts"

test("the shelves: a status per shelf, half-step ratings, the day of the latest read, and no ignored book", () => {
  const { shelved, count } = parseShelves(fixture("hardcover-shelves.json"))
  assert.equal(count, 5)
  assert.deepEqual(shelved, [
    { source: "hardcover:7", title: "Dune", year: 1965, status: "done", rating: 4.5, onDate: "2024-03-05" },
    { source: "hardcover:8", title: "Emma", year: null, status: "reading", rating: null, onDate: "2024-04-02" },
    { source: "hardcover:9", title: "Ulysses", year: 1922, status: "want", rating: null, onDate: null },
    { source: "hardcover:10", title: "Moby-Dick", year: 1851, status: "dropped", rating: 2, onDate: "2026-10-01" },
  ])
})

test("a rating is rounded to a half step from 0.5 to 5", () => {
  assert.deepEqual([4.25, 4.2, 0.2, 0, 5.5, null, "3"].map(ratingOf), [4.5, 4, null, null, 5, null, null])
})

test("an expired token is an error, not an empty shelf", () => {
  assert.throws(() => parseShelves({ errors: [{ message: "Unable to verify token" }] }), /Unable to verify token/)
  assert.throws(() => parseShelves({ data: { me: [] } }), /no me.user_books/)
})

test("a book shelved twice is planned once", () => {
  const book = { source: "hardcover:1", title: "A", year: null, status: "done" as const, rating: null, onDate: "2024-01-01" }
  assert.equal(plan([book, { ...book, rating: 3 }], []).length, 1)
})

const shelvesFetch = () =>
  fakeFetch([[(c) => c.url === "https://api.hardcover.app/v1/graphql" && c.headers.authorization === "Bearer secret", () => fixture("hardcover-shelves.json")]])

test("Hardcover wins over the log, a started book leaves the want list, and a second run writes nothing", async () => {
  const { db, sqlite } = database("library")
  sqlite.exec(`INSERT INTO books (list, id, title, year, status, on_date, rating, format, source) VALUES
    ('log', 1, 'Dune (hand-written title)', 1965, 'reading', '2024-02-01', NULL, 'paperback', 'hardcover:7'),
    ('log', 2, 'Not on Hardcover', NULL, 'done', '2020-01-01', 3, NULL, 'applebooks:1'),
    ('collection', 1, 'Emma', NULL, 'want', NULL, NULL, NULL, 'hardcover:8'),
    ('collection', 2, 'Ulysses', 1922, 'want', NULL, 3, NULL, 'hardcover:9'),
    ('collection', 3, 'Owned', NULL, 'owned', NULL, NULL, NULL, NULL)`)
  const logs: string[] = []
  const { fetch, calls } = shelvesFetch()
  await syncHardcover(db, { token: "Bearer secret", fetch, log: (m) => logs.push(m) })

  assert.deepEqual(
    sqlite.prepare("SELECT list, id, title, year, status, on_date, rating, format, source FROM books ORDER BY list, id").all().map((r) => Object.values(r)),
    [
      ["collection", 2, "Ulysses", 1922, "want", null, null, null, "hardcover:9"],
      ["collection", 3, "Owned", null, "owned", null, null, null, null],
      ["log", 1, "Dune (hand-written title)", 1965, "done", "2024-03-05", 4.5, "paperback", "hardcover:7"],
      ["log", 2, "Not on Hardcover", null, "done", "2020-01-01", 3, null, "applebooks:1"],
      ["log", 3, "Emma", null, "reading", "2024-04-02", null, null, "hardcover:8"],
      ["log", 4, "Moby-Dick", 1851, "dropped", "2026-10-01", 2, null, "hardcover:10"],
    ],
  )
  assert.deepEqual(calls[0]?.body?.variables, { limit: 500, offset: 0 })
  assert.equal(logs[0], "hardcover: 4 shelved, 2 added, 2 changed, 1 left the want list, 5 rows")

  logs.length = 0
  await syncHardcover(db, { token: "secret", fetch, log: (m) => logs.push(m) })
  assert.equal(logs[0], "hardcover: 4 shelved, 0 added, 0 changed, 0 left the want list, 0 rows")
})

test("Hardcover is asked in the 06:15 run only", () => {
  assert.equal(isHardcoverRun(new Date("2026-11-25T06:15:00Z")), true)
  assert.deepEqual(["00:15", "12:15", "18:15"].map((t) => isHardcoverRun(new Date(`2026-11-25T${t}:00Z`))), [false, false, false])
})
