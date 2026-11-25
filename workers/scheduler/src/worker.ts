/** The Worker: the account's one cron (the free plan has five). Every quarter hour it calls `scheduled` on the Workers whose jobs are due (src/jobs.ts) through their service bindings, all at once, and fails the run if one of them failed. */

import { matches } from "@lmfaole/worker/cron"

import { JOBS, type Binding } from "./jobs.ts"

/** A service binding: calling `scheduled` runs that Worker's own `scheduled(controller, env, ctx)` as a new invocation. */
export interface Scheduled {
  scheduled(controller: { cron: string; scheduledTime: number }): Promise<unknown>
}

export type Env = Record<Binding, Scheduled>

export async function tick(env: Env, scheduledTime: number, log: (message: string) => void = console.log): Promise<void> {
  const due = JOBS.filter((job) => matches(job.cron, new Date(scheduledTime)))
  const results = await Promise.allSettled(due.map((job) => env[job.binding].scheduled({ cron: job.cron, scheduledTime })))
  const failed = results.flatMap((result, i) => (result.status === "rejected" ? [{ job: due[i]!.binding, error: result.reason as unknown }] : []))
  log(JSON.stringify({ ran: due.map((job) => job.binding), failed: failed.map((f) => f.job) }))
  for (const { job, error } of failed) console.error(job, error)
  if (failed.length > 0) throw new AggregateError(failed.map((f) => f.error), `failed: ${failed.map((f) => f.job).join(", ")}`)
}

export default {
  async scheduled(controller: { scheduledTime: number }, env: Env): Promise<void> {
    await tick(env, controller.scheduledTime)
  },
}
