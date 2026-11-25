import assert from "node:assert/strict"
import { test } from "node:test"
import { counted, settle } from "./scheduled.ts"
import { fakeFetch, migratedSqlite, sqliteD1 } from "./testing.ts"

test("settle waits for every job and fails the run with each failure", async () => {
  let done = false
  const late = new Promise((resolve) => setTimeout(resolve, 5)).then(() => (done = true))
  const errors: unknown[] = []
  const log = console.error
  console.error = (error: unknown) => void errors.push(error)
  try {
    await assert.rejects(settle([Promise.reject(new Error("a")), late, Promise.reject(new Error("b"))]), (error: AggregateError) => error.message === "sync failed" && error.errors.length === 2)
  } finally {
    console.error = log
  }
  assert.equal(done, true)
  assert.equal(errors.length, 2)
  await settle([Promise.resolve(1)])
})

test("counted counts each fetch, query and batch once, and the batch still reaches the database", async () => {
  const sqlite = migratedSqlite(new URL("file:///nowhere/"), false)
  sqlite.exec("CREATE TABLE t (n INTEGER)")
  const { fetch } = fakeFetch([[() => true, () => ({})]])
  const run = counted(fetch, [sqliteD1(sqlite)])
  const [db] = run.databases
  await run.fetch("https://example.com")
  await db!.batch([db!.prepare("INSERT INTO t VALUES (?)").bind(1), db!.prepare("INSERT INTO t VALUES (?)").bind(2)])
  assert.deepEqual({ ...(await db!.prepare("SELECT count(*) AS n FROM t").first()) }, { n: 2 })
  assert.equal(run.count(), 3)
})
