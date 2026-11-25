/** The Worker. Every six hours (workers/scheduler calls `scheduled`, at :15) it copies the owner's public GitHub into the `site` database,
 *  and in the run at 06:15 UTC the Hardcover shelves into `books` in the `library` database. It has no address. */

import type { Database } from "@lmfaole/worker/d1"
import { workerFetch } from "@lmfaole/worker/fetch"
import { counted, settle } from "@lmfaole/worker/scheduled"

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

export default {
  async scheduled(controller: { scheduledTime: number }, env: Env): Promise<void> {
    const run = counted(workerFetch(), [env.SITE, env.LIBRARY])
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
