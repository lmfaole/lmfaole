/** Copies what GitHub says about the owner into the `site` database: public repositories, pull requests and issues, the contribution calendar
 *  and the latest commit in each CV project's repository. A row is only written when GitHub says something new; a run writes a handful.
 *  Each step goes on when another fails, and the run fails at the end if one did, so the log shows it. */

import { type Database, type Fetch, rowsWritten, type Statement } from "./db.ts"
import {
  CALENDAR_QUERY,
  commitsQuery,
  type Day,
  isRepoName,
  type Item,
  parseCalendar,
  parseGraphqlCommits,
  parseRepos,
  parseRestCommit,
  parseSearch,
  parseUserId,
  type ProjectCommit,
  type Repo,
  searchQuery,
  USER_ID_QUERY,
  yearOfRun,
} from "./github.ts"

export interface GithubOptions {
  user: string
  /** The first year with anything on GitHub: the year refreshed in turn goes back to it. */
  firstYear: number
  /** A fine-grained token that can read public repositories and nothing else. Without one the calendar is skipped and the rest is unauthenticated. */
  token?: string | undefined
  fetch: Fetch
  /** When the run was scheduled (ms): which year it refreshes, and what "lately" means. */
  scheduledTime: number
  log: (message: string) => void
  repoPages?: number
  recentPages?: number
  yearPages?: number
  maxProjects?: number
}

const API = "https://api.github.com"
const PAGE = 100

class RateLimited extends Error {}

/** A GitHub answer that was not what was asked for. A rate limit says so, with when it resets; the next run tries again. */
async function failure(response: Response, what: string): Promise<Error> {
  const remaining = response.headers.get("x-ratelimit-remaining")
  if (response.status === 429 || (response.status === 403 && remaining === "0")) {
    const reset = Number(response.headers.get("x-ratelimit-reset"))
    return new RateLimited(`github: rate limited on ${what} until ${Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000).toISOString() : "later"}`)
  }
  return new Error(`github: ${what} answered ${response.status} ${(await response.text()).slice(0, 200)}`)
}

function client(options: GithubOptions) {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "lmfaole-catalog (+https://lmfaole.party)",
  }
  if (options.token) headers.authorization = `Bearer ${options.token}`
  return {
    /** GET a REST address; `missing` statuses come back as none. */
    async get(path: string, missing: number[] = []): Promise<unknown | null> {
      const response = await options.fetch(`${API}${path}`, { headers })
      if (missing.includes(response.status)) return null
      if (!response.ok) throw await failure(response, path)
      return response.json()
    },
    async graphql(query: string, variables: Record<string, unknown>): Promise<unknown> {
      const response = await options.fetch(`${API}/graphql`, { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ query, variables }) })
      if (!response.ok) throw await failure(response, "graphql")
      return response.json()
    },
  }
}

type Client = ReturnType<typeof client>

const upsert = (table: string, key: string, columns: string[]): string =>
  `INSERT INTO ${table} (${[key, ...columns].join(", ")}) VALUES (${[key, ...columns].map(() => "?").join(", ")})
ON CONFLICT (${key}) DO UPDATE SET ${columns.map((c) => `${c} = excluded.${c}`).join(", ")}
WHERE (${columns.map((c) => `${table}.${c}`).join(", ")}) IS NOT (${columns.map((c) => `excluded.${c}`).join(", ")})`

const REPO_UPSERT = upsert("github_repos", "full_name", ["description", "language", "stars", "fork", "archived", "created_at", "pushed_at"])
const ITEM_UPSERT = upsert("github_items", "id", ["kind", "repo", "number", "title", "state", "merged", "created_at", "closed_at"])
const DAY_UPSERT = upsert("github_days", "day", ["contributions"])
const COMMIT_UPSERT = upsert("github_project_commits", "repo", ["sha", "message", "committed_at"])

async function write(db: Database, statements: Statement[]): Promise<number> {
  return statements.length === 0 ? 0 : rowsWritten(await db.batch(statements))
}

/** Every public repository the owner has (their own and those they are in), and none that GitHub no longer lists — when the list came whole. */
async function syncRepos(db: Database, github: Client, options: GithubOptions): Promise<string> {
  const repos: Repo[] = []
  let whole = false
  for (let page = 1; page <= (options.repoPages ?? 3); page++) {
    const json = await github.get(`/users/${encodeURIComponent(options.user)}/repos?type=all&sort=created&per_page=${PAGE}&page=${page}`)
    const count = Array.isArray(json) ? json.length : 0
    repos.push(...parseRepos(json))
    if (count < PAGE) {
      whole = true
      break
    }
  }
  const statements = repos.map((r) =>
    db.prepare(REPO_UPSERT).bind(r.fullName, r.description, r.language, r.stars, r.fork ? 1 : 0, r.archived ? 1 : 0, r.createdAt, r.pushedAt),
  )
  if (whole && repos.length > 0) {
    statements.push(db.prepare("DELETE FROM github_repos WHERE full_name NOT IN (SELECT value FROM json_each(?))").bind(JSON.stringify(repos.map((r) => r.fullName))))
  }
  return `repos ${repos.length}${whole ? "" : " (not all)"}, ${await write(db, statements)} rows`
}

async function search(github: Client, qualifier: string, user: string, pages: number): Promise<{ items: Item[]; whole: boolean }> {
  const items: Item[] = []
  for (let page = 1; page <= pages; page++) {
    const q = encodeURIComponent(searchQuery(user, qualifier))
    const answer = parseSearch(await github.get(`/search/issues?q=${q}&sort=updated&order=desc&per_page=${PAGE}&page=${page}`))
    items.push(...answer.items)
    if (answer.incomplete) return { items, whole: false }
    if (answer.items.length < PAGE || items.length >= answer.total) return { items, whole: items.length >= answer.total }
  }
  return { items, whole: false }
}

const day = (ms: number): string => new Date(ms).toISOString().slice(0, 10)
const yearStart = (year: number): number => Date.UTC(year, 0, 1) / 1000

/** What changed in the last week, and every item of the year this run refreshes; that year loses the items GitHub no longer has (deleted, or made private). */
async function syncItems(db: Database, github: Client, options: GithubOptions, year: number): Promise<string> {
  const recent = await search(github, `updated:>=${day(options.scheduledTime - 7 * 86_400_000)}`, options.user, options.recentPages ?? 2)
  const refresh = await search(github, `created:${year}-01-01..${year}-12-31`, options.user, options.yearPages ?? 5)
  const items = new Map<number, Item>()
  for (const item of [...refresh.items, ...recent.items]) items.set(item.id, item)
  const statements = [...items.values()].map((i) =>
    db.prepare(ITEM_UPSERT).bind(i.id, i.kind, i.repo, i.number, i.title, i.state, i.merged ? 1 : 0, i.createdAt, i.closedAt),
  )
  if (refresh.whole) {
    statements.push(
      db
        .prepare("DELETE FROM github_items WHERE created_at >= ? AND created_at < ? AND id NOT IN (SELECT value FROM json_each(?))")
        .bind(yearStart(year), yearStart(year + 1), JSON.stringify(refresh.items.map((i) => i.id))),
    )
  }
  return `items ${recent.items.length} lately + ${refresh.items.length} from ${year}${refresh.whole ? "" : " (not all)"}, ${await write(db, statements)} rows`
}

/** The calendar of this year and of the year this run refreshes, days that have lost their contributions included. GraphQL needs a token. */
async function syncCalendar(db: Database, github: Client, options: GithubOptions, years: number[]): Promise<string> {
  const statements: Statement[] = []
  let count = 0
  for (const year of years) {
    const days: Day[] = parseCalendar(await github.graphql(CALENDAR_QUERY, { login: options.user, from: `${year}-01-01T00:00:00Z`, to: `${year}-12-31T23:59:59Z` }))
    count += days.length
    statements.push(...days.map((d) => db.prepare(DAY_UPSERT).bind(d.day, d.contributions)))
    statements.push(
      db
        .prepare("DELETE FROM github_days WHERE day >= ? AND day <= ? AND day NOT IN (SELECT value FROM json_each(?))")
        .bind(`${year}-01-01`, `${year}-12-31`, JSON.stringify(days.map((d) => d.day))),
    )
  }
  return `days ${count} in ${years.join(", ")}, ${await write(db, statements)} rows`
}

/** The latest commit by the owner in each CV project's repository. With a token GraphQL asks every repository at once and says whether it is
 *  private (a token can see a private one); without, REST sees public repositories only and answers 404 for the rest. A repository whose
 *  request failed keeps the row it had; one with no public commit by the owner, or no longer in the CV, loses it. */
async function syncProjectCommits(db: Database, github: Client, options: GithubOptions): Promise<string> {
  const rows = (await db.prepare("SELECT DISTINCT repo FROM cv_project WHERE repo IS NOT NULL ORDER BY repo").all<{ repo: string }>()).results
  const repos = rows.map((r) => r.repo.trim()).filter(isRepoName).slice(0, options.maxProjects ?? 10)
  const found = new Map<string, ProjectCommit | null>()
  const failed: string[] = []
  if (repos.length > 0 && options.token) {
    const user = parseUserId(await github.graphql(USER_ID_QUERY, { login: options.user }))
    for (const [repo, commit] of parseGraphqlCommits(repos, await github.graphql(commitsQuery(repos), { user }))) found.set(repo, commit)
  } else {
    for (const [i, repo] of repos.entries()) {
      try {
        const json = await github.get(`/repos/${repo}/commits?author=${encodeURIComponent(options.user)}&per_page=1`, [404, 409])
        found.set(repo, json === null ? null : parseRestCommit(repo, json))
      } catch (error) {
        options.log(`github: ${repo}: ${error instanceof Error ? error.message : String(error)}`)
        // Rate limited, the rest would be too: they wait for the next run.
        if (error instanceof RateLimited) {
          failed.push(...repos.slice(i))
          break
        }
        failed.push(repo)
      }
    }
  }
  const commits = [...found.values()].filter((c): c is ProjectCommit => c !== null)
  const keep = [...commits.map((c) => c.repo), ...failed]
  const statements = commits.map((c) => db.prepare(COMMIT_UPSERT).bind(c.repo, c.sha, c.message, c.committedAt))
  statements.push(db.prepare("DELETE FROM github_project_commits WHERE repo NOT IN (SELECT value FROM json_each(?))").bind(JSON.stringify(keep)))
  const written = await write(db, statements)
  if (failed.length > 0) throw new Error(`github: no answer for ${failed.join(", ")} (${written} rows written for the rest)`)
  return `project commits ${commits.length} of ${repos.length}, ${written} rows`
}

export async function syncGithub(db: Database, options: GithubOptions): Promise<void> {
  const github = client(options)
  const year = yearOfRun(options.firstYear, options.scheduledTime)
  const current = new Date(options.scheduledTime).getUTCFullYear()
  const steps: [string, () => Promise<string>][] = [
    ["repos", () => syncRepos(db, github, options)],
    ["items", () => syncItems(db, github, options, year)],
    ["calendar", () => (options.token ? syncCalendar(db, github, options, year === current ? [current] : [current, year]) : Promise.resolve("calendar skipped: no GITHUB_TOKEN"))],
    ["project commits", () => syncProjectCommits(db, github, options)],
  ]
  const errors: unknown[] = []
  for (const [, step] of steps) {
    try {
      options.log(`github: ${await step()}`)
    } catch (error) {
      errors.push(error)
    }
  }
  if (errors.length > 0) throw new AggregateError(errors, `github: ${errors.length} of ${steps.length} steps failed`)
}
