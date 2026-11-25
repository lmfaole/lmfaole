/** What a Worker's `scheduled` run does around its jobs: wait for all of them and fail the run when one failed (so the dashboard and the scheduler see
 *  it), and count the subrequests the run made. Pure apart from `settle`'s log lines. */

import type { Database, Statement } from "./d1.ts"
import type { Fetch } from "./fetch.ts"

/** Waits for every job; each failure is logged, and the run fails (`AggregateError` with `message`) when one did, after the others are done. */
export async function settle(jobs: Promise<unknown>[], message = "sync failed"): Promise<void> {
  const failed = (await Promise.allSettled(jobs)).filter((result) => result.status === "rejected")
  for (const result of failed) console.error(result.reason)
  if (failed.length > 0) throw new AggregateError(failed.map((result) => result.reason), message)
}

/** Counts the subrequests of a run (the free plan allows 50; a fetch, a D1 query or a batch is one), so the log shows how close a run came. */
export function counted(fetch: Fetch, databases: Database[]): { fetch: Fetch; databases: Database[]; count: () => number } {
  let count = 0
  const statement = (inner: Statement): Statement =>
    ({
      bind: (...values) => statement(inner.bind(...values)),
      first: (...args) => (count++, inner.first(...args)),
      all: (...args) => (count++, inner.all(...args)),
      run: () => (count++, inner.run()),
      raw: inner,
    }) as Statement & { raw: Statement }
  const database = (db: Database): Database => ({
    prepare: (sql) => statement(db.prepare(sql)),
    batch: (statements) => (count++, db.batch(statements.map((s) => (s as Statement & { raw: Statement }).raw))),
  })
  return {
    fetch: (input, init) => (count++, fetch(input, init)),
    databases: databases.map(database),
    count: () => count,
  }
}
