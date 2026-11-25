/** The Worker. Every six hours (workers/scheduler calls `scheduled`, at :15) it copies the owner's public GitHub into the `site` database,
 *  and in the run at 06:15 UTC the Hardcover shelves into `books` in the `library` database. It has no address. */

import type { Database, Fetch, Statement } from "./db.ts"
import { syncGithub } from "./github-sync.ts"
import { syncHardcover } from "./hardcover-sync.ts"

interface Env {
  SITE: Database
  LIBRARY: Database
  GITHUB_USER: string
  GITHUB_FIRST_YEAR: string
  /** Fine-grained, public repositories read-only. Without it the calendar is skipped and GitHub is asked without a name, from addresses others share. */
  GITHUB_TOKEN?: string
  HARDCOVER_TOKEN?: string
  /** `wrangler dev --test-scheduled --var FORCE_HARDCOVER:1` asks Hardcover whatever the hour. */
  FORCE_HARDCOVER?: string
}

export const isHardcoverRun = (at: Date): boolean => at.getUTCHours() === 6

/** Counts the subrequests of a run (the free plan allows 50; a D1 query or batch is one), so the log shows how close a run came. */
export function counted(fetch: Fetch, databases: Database[]): { fetch: Fetch; databases: Database[]; count: () => number } {
  let count = 0
  const statement = (inner: Statement): Statement => ({
    bind: (...values) => statement(inner.bind(...values)),
    first: (...args) => (count++, inner.first(...args)),
    all: (...args) => (count++, inner.all(...args)),
    run: () => (count++, inner.run()),
    raw: inner,
  } as Statement & { raw: Statement })
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

async function settle(jobs: Promise<unknown>[]): Promise<void> {
  const failed = (await Promise.allSettled(jobs)).filter((result) => result.status === "rejected")
  for (const result of failed) console.error(result.reason)
  if (failed.length > 0) throw new AggregateError(failed.map((result) => result.reason), "sync failed")
}

export default {
  async scheduled(controller: { scheduledTime: number }, env: Env): Promise<void> {
    // fetch is wrapped: called as options.fetch, workerd throws «Illegal invocation».
    const run = counted((input, init) => fetch(input, init), [env.SITE, env.LIBRARY])
    const [site, library] = run.databases as [Database, Database]
    const jobs: Promise<unknown>[] = [
      syncGithub(site, {
        user: env.GITHUB_USER,
        firstYear: Number(env.GITHUB_FIRST_YEAR),
        token: env.GITHUB_TOKEN?.trim() || undefined,
        fetch: run.fetch,
        scheduledTime: controller.scheduledTime,
        log: console.log,
      }),
    ]
    if (isHardcoverRun(new Date(controller.scheduledTime)) || env.FORCE_HARDCOVER === "1") {
      if (env.HARDCOVER_TOKEN?.trim()) jobs.push(syncHardcover(library, { token: env.HARDCOVER_TOKEN, fetch: run.fetch, log: console.log }))
      else console.log("hardcover: no HARDCOVER_TOKEN")
    }
    try {
      await settle(jobs)
    } finally {
      console.log(`catalog: ${run.count()} subrequests`)
    }
  },
}
