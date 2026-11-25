// The snapshot: what every visitor shares (the forecast for the site's place, the northern lights' Kp, the suggested repositories), fetched by the
// scheduled job every 15 minutes (`scheduled` in worker.mjs, called by workers/scheduler) and kept in Workers KV (`SNAPSHOT`), so a page has it at once, and still has it when a source is down.
// Pure: the store, the fetch and the clock are given, so a test pins what is fetched, when it is written and what a page may use.

import { isPublicRepository } from "./github-query.ts"
import { fingerprint } from "./summarize.ts"

/** How often the job runs (`STARTSIDE` in workers/scheduler/src/jobs.ts): a snapshot entry is good at least this long. */
export const CRON_SECONDS = 15 * 60
/** How old a snapshot entry may be and still stand in for a source that fails. */
export const FALLBACK_SECONDS = 24 * 60 * 60
/** The most bodies one run writes (the index and the summaries, lib/summaries.ts, are one more each): 96 runs a day × 5 stays under KV's 1000 free writes a day. */
export const MAX_WRITES = 3
/** The most watched repositories kept in the snapshot (two requests each). */
export const MAX_REPOS = 2
/** A body that has not changed is written again after this long, so its `expirationTtl` never runs out while it is in use. */
const REWRITE_SECONDS = 3 * 24 * 60 * 60
/** A body no longer in the index is gone after this long (removed sources are not deleted one by one). */
const BODY_TTL_SECONDS = 7 * 24 * 60 * 60
/** How long one source may take in the cron. */
const TIMEOUT_MS = 10_000

export const INDEX_KEY = "index"
export const bodyKey = (key: string): string => `body:${key}`

const MET_HEADERS = { "User-Agent": "startside github.com/lmfaole/lmfaole" }
const GITHUB_HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "startside", "X-GitHub-Api-Version": "2022-11-28" }

/** MET's complete forecast for a place (`lib/yr.ts` asks for the same address, so the page and the snapshot share it). */
export const forecastUrl = (lat: number, lon: number): string => `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`
export const KP_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
export const repoUrl = (repo: string): string => `https://api.github.com/repos/${repo}`
export const repoIssuesUrl = (repo: string): string => `https://api.github.com/repos/${repo}/issues?state=open&sort=updated&direction=desc&per_page=50`

/** The key of a question to a source: the address and the body, whoever asks (the edge cache in `lib/upstream.ts` uses the same). */
export const requestKey = (url: string, json?: unknown, body?: string): Promise<string> => fingerprint([url, JSON.stringify(json ?? null), body ?? ""])

export interface Job {
  url: string
  headers?: Record<string, string>
  /** How often the source may be asked (the same `revalidate` the page asks it with). */
  revalidate: number
  /** A repository's facts: kept only when it says the repository is public. */
  mustBePublic?: boolean
  /** Kept only while the snapshot has this address (a repository's issues, only while the repository is kept as public). */
  requires?: string
}

/** Whether a repository's facts say it is public (`private: false`, and `visibility: public` where it is there): nothing private is kept. */
function isPublicRepo(body: string): boolean {
  try {
    return isPublicRepository(JSON.parse(body) as { private?: unknown; visibility?: unknown })
  } catch {
    return false
  }
}

/** The shared questions, bounded: the forecast for `WEATHER_LAT`/`WEATHER_LON`, the Kp index, and the first `MAX_REPOS` of `GITHUB_WATCH_REPOS`, each one public repository's facts and its issues. */
export function sharedJobs(vars: { WEATHER_LAT?: string; WEATHER_LON?: string; GITHUB_WATCH_REPOS?: string }): Job[] {
  const jobs: Job[] = [
    { url: forecastUrl(Number(vars.WEATHER_LAT || "59.91"), Number(vars.WEATHER_LON || "10.75")), headers: MET_HEADERS, revalidate: 1800 },
    { url: KP_URL, revalidate: 1800 },
  ]
  const repos = (vars.GITHUB_WATCH_REPOS ?? "")
    .split(",")
    .map((repo) => repo.trim())
    .filter((repo) => /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
    .slice(0, MAX_REPOS)
  for (const repo of repos) {
    jobs.push({ url: repoUrl(repo), headers: GITHUB_HEADERS, revalidate: 3600, mustBePublic: true }, { url: repoIssuesUrl(repo), headers: GITHUB_HEADERS, revalidate: 60, requires: repoUrl(repo) })
  }
  return jobs
}

export interface Entry {
  url: string
  /** A hash of the body, to tell a change. */
  hash: string
  /** When the cron last fetched it and found it so (ms). */
  checkedAt: number
  /** When the body was last written (ms). */
  writtenAt: number
  revalidate: number
  status: number
  type: string
  lastModified?: string
}

export interface SnapshotIndex {
  version: 1
  entries: Record<string, Entry>
}

/** The part of Workers KV the snapshot uses. */
export interface Store {
  get(key: string, options: { type: "text"; cacheTtl?: number }): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export async function readIndex(store: Store, cacheTtl?: number): Promise<SnapshotIndex> {
  const text = await store.get(INDEX_KEY, cacheTtl === undefined ? { type: "text" } : { type: "text", cacheTtl })
  try {
    const index = text === null ? null : (JSON.parse(text) as SnapshotIndex)
    if (index?.version === 1 && typeof index.entries === "object" && index.entries !== null) return index
  } catch {
    // A broken index is started anew.
  }
  return { version: 1, entries: {} }
}

const hashOf = (body: string): Promise<string> => fingerprint([body])

/** What a run did, for the log and the test. */
export interface RunReport {
  fetched: number
  written: number
  unchanged: number
  failed: number
  deferred: number
}

/**
 * One run of the cron: asks each shared source that is due (its `revalidate` since it was last checked), and writes a body only when its hash changed (or
 * it is about to expire), at most `MAX_WRITES` of them; the rest wait for the next run. The index (when each was checked) is written once, and only when the run checked anything.
 * A source that fails keeps what the snapshot had.
 */
export async function refreshSnapshot(store: Store, jobs: readonly Job[], ask: (job: Job, signal: AbortSignal) => Promise<Response>, now: number = Date.now()): Promise<RunReport> {
  const index = await readIndex(store)
  const report: RunReport = { fetched: 0, written: 0, unchanged: 0, failed: 0, deferred: 0 }
  const keys = await Promise.all(jobs.map((job) => requestKey(job.url)))
  const due = jobs.map((job, i) => ({ job, key: keys[i] })).filter(({ job, key }) => {
    const entry = index.entries[key]
    // A minute's slack, so a source due every 30 minutes is asked every second run, not every third.
    return entry === undefined || now - entry.checkedAt >= Math.max(job.revalidate, CRON_SECONDS) * 1000 - 60_000
  })
  const answers = await Promise.all(
    due.map(async ({ job, key }) => {
      try {
        const response = await ask(job, AbortSignal.timeout(TIMEOUT_MS))
        if (!response.ok) return { job, key, response: null }
        return { job, key, response, body: await response.text() }
      } catch {
        return { job, key, response: null }
      }
    }),
  )
  let changed = false
  const requiredKeys = new Map(await Promise.all(jobs.filter((job) => job.requires !== undefined).map(async (job) => [job.url, await requestKey(job.requires as string)] as const)))
  for (const answer of answers) {
    const notPublic = answer.body !== undefined && answer.job.mustBePublic === true && !isPublicRepo(answer.body)
    const required = requiredKeys.get(answer.job.url)
    if (notPublic || (required !== undefined && index.entries[required] === undefined)) {
      if (index.entries[answer.key] !== undefined) {
        delete index.entries[answer.key]
        changed = true
      }
      report.failed++
      continue
    }
    if (answer.response === null || answer.body === undefined) {
      report.failed++
      continue
    }
    report.fetched++
    const hash = await hashOf(answer.body)
    const entry = index.entries[answer.key]
    const fields = { url: answer.job.url, revalidate: answer.job.revalidate, status: answer.response.status, type: answer.response.headers.get("Content-Type") ?? "application/json", lastModified: answer.response.headers.get("Last-Modified") ?? undefined }
    if (entry !== undefined && entry.hash === hash && now - entry.writtenAt < REWRITE_SECONDS * 1000) {
      index.entries[answer.key] = { ...entry, ...fields, checkedAt: now }
      report.unchanged++
      changed = true
      continue
    }
    if (report.written >= MAX_WRITES) {
      report.deferred++
      continue
    }
    await store.put(bodyKey(answer.key), answer.body, { expirationTtl: BODY_TTL_SECONDS })
    index.entries[answer.key] = { ...fields, hash, checkedAt: now, writtenAt: now }
    report.written++
    changed = true
  }
  // Sources no longer asked for are left out of the index; their bodies expire.
  const wanted = new Set(keys)
  for (const key of Object.keys(index.entries)) {
    if (!wanted.has(key)) {
      delete index.entries[key]
      changed = true
    }
  }
  if (changed) await store.put(INDEX_KEY, JSON.stringify(index))
  return report
}

export interface Snapshot {
  body: string
  status: number
  type: string
  lastModified?: string
  /** When the cron last found it so (ms). */
  checkedAt: number
  /** How long after `checkedAt` it is as good as a fresh answer (s): its `revalidate`, and at least the time to the next run. */
  freshFor: number
}

/** The snapshot's answer to a question, or `null` where it has none, or one older than `FALLBACK_SECONDS`. */
export async function readSnapshot(store: Store, key: string, now: number = Date.now(), index?: SnapshotIndex): Promise<Snapshot | null> {
  const entry = (index ?? (await readIndex(store, 60))).entries[key]
  if (entry === undefined || !(now - entry.checkedAt < FALLBACK_SECONDS * 1000)) return null
  const body = await store.get(bodyKey(key), { type: "text", cacheTtl: 300 })
  if (body === null) return null
  return { body, status: entry.status, type: entry.type, lastModified: entry.lastModified, checkedAt: entry.checkedAt, freshFor: Math.max(entry.revalidate, CRON_SECONDS) + 60 }
}

/** Whether a snapshot may be shown in place of asking the source: checked recently enough. Older ones only stand in when the source fails. */
export const isFresh = (snapshot: Snapshot, now: number = Date.now()): boolean => now - snapshot.checkedAt >= 0 && now - snapshot.checkedAt < snapshot.freshFor * 1000
