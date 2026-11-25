import assert from "node:assert/strict"
import { test } from "node:test"
import { migratedSqlite, sqliteD1 } from "./testing.ts"

// node:sqlite's rows have no prototype.
const rows = (answer: { results: object[] }) => answer.results.map((row) => ({ ...row }))

const fresh = () => {
  const sqlite = migratedSqlite(new URL("file:///nowhere/"), false)
  sqlite.exec("CREATE TABLE t (n INTEGER PRIMARY KEY, name TEXT)")
  return { sqlite, db: sqliteD1(sqlite) }
}

test("the SQLite D1 reads and writes, a statement alone or bound", async () => {
  const { db } = fresh()
  assert.equal(Number((await db.prepare("INSERT INTO t VALUES (?, ?)").bind(1, "a").run()).changes), 1)
  assert.deepEqual({ ...(await db.prepare("SELECT name FROM t WHERE n = ?").bind(1).first()) }, { name: "a" })
  assert.equal(await db.prepare("SELECT name FROM t WHERE n = ?").bind(2).first(), null)
  assert.deepEqual(rows(await db.prepare("SELECT n FROM t").all()), [{ n: 1 }])
})

test("a batch answers each statement as D1 does, and is all or nothing", async () => {
  const { db } = fresh()
  const insert = db.prepare("INSERT INTO t VALUES (?, ?)")
  const answers = await db.batch([insert.bind(1, "a"), insert.bind(2, "b"), db.prepare("SELECT n FROM t ORDER BY n")])
  assert.deepEqual(answers.map((answer) => ({ ...answer, results: rows(answer) })), [
    { results: [], meta: { rows_written: 1 } },
    { results: [], meta: { rows_written: 1 } },
    { results: [{ n: 1 }, { n: 2 }], meta: { rows_written: 0 } },
  ])
  await assert.rejects(db.batch([insert.bind(3, "c"), insert.bind(1, "again")]))
  assert.deepEqual(rows(await db.prepare("SELECT n FROM t ORDER BY n").all()), [{ n: 1 }, { n: 2 }])
})
