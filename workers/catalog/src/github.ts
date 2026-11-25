/** What GitHub says about the owner, in the shape of the `site` tables: public repositories, the pull requests and issues they opened,
 *  the contribution calendar and the latest commit in each CV project's repository. This file parses the answers and builds the requests;
 *  it never touches the network (`github-sync.ts` does), so every shape is tested against a fixture. A private repository never gets
 *  through: the repository list drops one, the search asks for `is:public` only, and a project commit needs GitHub to say the repository
 *  is public (a 404 without a token, `isPrivate: false` in GraphQL). */

export interface Repo {
  fullName: string
  description: string | null
  language: string | null
  stars: number
  fork: boolean
  archived: boolean
  createdAt: number | null
  pushedAt: number | null
}

export interface Item {
  id: number
  kind: "pr" | "issue"
  repo: string
  number: number
  title: string
  state: string
  merged: boolean
  createdAt: number
  closedAt: number | null
}

export interface Day {
  day: string
  contributions: number
}

export interface ProjectCommit {
  repo: string
  sha: string
  message: string
  committedAt: number
}

type Json = Record<string, unknown>

const object = (value: unknown, what: string): Json => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`github: ${what} is not an object`)
  return value as Json
}
const list = (value: unknown, what: string): unknown[] => {
  if (!Array.isArray(value)) throw new Error(`github: ${what} is not a list`)
  return value
}
const text = (value: unknown, what: string): string => {
  if (typeof value !== "string") throw new Error(`github: ${what} is not text`)
  return value
}
const integer = (value: unknown, what: string): number => {
  if (typeof value !== "number" || !Number.isInteger(value)) throw new Error(`github: ${what} is not a whole number`)
  return value
}
const optionalText = (value: unknown): string | null => (typeof value === "string" && value !== "" ? value : null)

/** Seconds since 1970, or none for a missing time. */
export const epoch = (iso: unknown): number | null => {
  if (typeof iso !== "string" || iso === "") return null
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000)
}

/** A page of `GET /users/{user}/repos`. That list is public repositories only; a private one is dropped all the same. */
export function parseRepos(json: unknown): Repo[] {
  return list(json, "the repository list").flatMap((entry) => {
    const repo = object(entry, "a repository")
    if (repo.private !== false) return []
    return [
      {
        fullName: text(repo.full_name, "full_name"),
        description: optionalText(repo.description),
        language: optionalText(repo.language),
        stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
        fork: repo.fork === true,
        archived: repo.archived === true,
        createdAt: epoch(repo.created_at),
        pushedAt: epoch(repo.pushed_at),
      },
    ]
  })
}

const REPOSITORY_URL = "https://api.github.com/repos/"

/** A page of `GET /search/issues`. `incomplete` is GitHub's search giving up part of the way: what came is not all there is. */
export function parseSearch(json: unknown): { items: Item[]; total: number; incomplete: boolean } {
  const answer = object(json, "the search answer")
  const items = list(answer.items, "the search items").map((entry): Item => {
    const item = object(entry, "a search item")
    const url = text(item.repository_url, "repository_url")
    if (!url.startsWith(REPOSITORY_URL)) throw new Error(`github: ${url} is not a repository address`)
    const pull = item.pull_request === undefined || item.pull_request === null ? null : object(item.pull_request, "pull_request")
    const createdAt = epoch(item.created_at)
    if (createdAt === null) throw new Error("github: a search item has no created_at")
    return {
      id: integer(item.id, "id"),
      kind: pull === null ? "issue" : "pr",
      repo: url.slice(REPOSITORY_URL.length),
      number: integer(item.number, "number"),
      title: text(item.title, "title"),
      state: text(item.state, "state"),
      merged: pull !== null && typeof pull.merged_at === "string",
      createdAt,
      closedAt: epoch(item.closed_at),
    }
  })
  return { items, total: typeof answer.total_count === "number" ? answer.total_count : items.length, incomplete: answer.incomplete_results === true }
}

/** The errors of a GraphQL answer other than those `allowed` (by `type`), as an error: a failed query must not look like an empty answer. */
function graphqlErrors(answer: Json, allowed: string[] = []): void {
  if (!Array.isArray(answer.errors)) return
  const errors = answer.errors.filter((error) => !allowed.includes(String((error as Json | null)?.type)))
  if (errors.length === 0) return
  throw new Error(`github: GraphQL answered: ${errors.map((error) => String((error as Json | null)?.message ?? "an error")).join("; ")}`)
}

export const CALENDAR_QUERY =
  "query($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) { contributionsCollection(from: $from, to: $to) { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }"

/** The calendar's days that have contributions; a day with none has no row. It counts what the public profile shows. */
export function parseCalendar(json: unknown): Day[] {
  const answer = object(json, "the calendar answer")
  graphqlErrors(answer)
  const user = object(object(answer.data, "data").user, "the user")
  const calendar = object(object(user.contributionsCollection, "contributionsCollection").contributionCalendar, "contributionCalendar")
  return list(calendar.weeks, "weeks").flatMap((week) =>
    list(object(week, "a week").contributionDays, "contributionDays").flatMap((entry) => {
      const day = object(entry, "a day")
      const contributions = integer(day.contributionCount, "contributionCount")
      return contributions > 0 ? [{ day: text(day.date, "date"), contributions }] : []
    }),
  )
}

/** The latest commit of `GET /repos/{repo}/commits?author=…&per_page=1`, its message's first line; none for an empty list. */
export function parseRestCommit(repo: string, json: unknown): ProjectCommit | null {
  const [first] = list(json, "the commit list")
  if (first === undefined) return null
  const entry = object(first, "a commit")
  const commit = object(entry.commit, "commit")
  const committedAt = epoch(object(commit.author, "commit.author").date)
  if (committedAt === null) throw new Error(`github: the latest commit in ${repo} has no date`)
  return { repo, sha: text(entry.sha, "sha"), message: (text(commit.message, "message").split("\n")[0] ?? "").trim(), committedAt }
}

/** `owner/name` and nothing that could change the request it goes into. */
export function isRepoName(name: string): boolean {
  const part = (s: string | undefined) => s !== undefined && s !== "" && !s.startsWith(".") && /^[A-Za-z0-9_.-]+$/.test(s)
  const parts = name.split("/")
  return parts.length === 2 && part(parts[0]) && part(parts[1])
}

export const USER_ID_QUERY = "query($login: String!) { user(login: $login) { id } }"

export function parseUserId(json: unknown): string {
  const answer = object(json, "the user answer")
  graphqlErrors(answer)
  return text(object(object(answer.data, "data").user, "the user").id, "the user's id")
}

/** One query for every repository (`r0`, `r1`, … in the order given): whether it is private and the owner's latest commit on its default branch.
 *  GraphQL finds commits in an old history that the REST list misses. The names must pass `isRepoName`. */
export function commitsQuery(repos: string[]): string {
  const fields = repos.map((repo, i) => {
    if (!isRepoName(repo)) throw new Error(`github: ${JSON.stringify(repo)} is not an owner/name repository`)
    const [owner, name] = repo.split("/")
    return `r${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { isPrivate defaultBranchRef { target { ... on Commit { history(author: { id: $user }, first: 1) { nodes { oid committedDate messageHeadline } } } } } }`
  })
  return `query($user: ID!) { ${fields.join(" ")} }`
}

/** Each repository's latest commit by the owner; none for a private repository (whatever it holds), one GitHub does not find, or one with no commit by the owner. */
export function parseGraphqlCommits(repos: string[], json: unknown): Map<string, ProjectCommit | null> {
  const answer = object(json, "the commits answer")
  graphqlErrors(answer, ["NOT_FOUND"])
  const data = object(answer.data, "data")
  const found = new Map<string, ProjectCommit | null>()
  repos.forEach((repo, i) => {
    const repository = data[`r${i}`]
    if (repository === null || repository === undefined || (repository as Json).isPrivate !== false) return found.set(repo, null)
    const target = ((repository as Json).defaultBranchRef as Json | null)?.target as Json | undefined
    const node = ((target?.history as Json | undefined)?.nodes as unknown[] | undefined)?.[0] as Json | undefined
    const committedAt = epoch(node?.committedDate)
    if (node === undefined || committedAt === null) return found.set(repo, null)
    found.set(repo, { repo, sha: text(node.oid, "oid"), message: text(node.messageHeadline, "messageHeadline").trim(), committedAt })
  })
  return found
}

/** What the owner opened, in public repositories only (the search sees only those without a token; with one, `is:public` keeps it so). */
export const searchQuery = (user: string, qualifier: string): string => `author:${user} is:public ${qualifier}`

/** The calendar year a run refreshes in full, in turn: every year from the first is refreshed every `years × hours` hours. */
export function yearOfRun(firstYear: number, scheduledTime: number, everyHours = 6): number {
  const current = new Date(scheduledTime).getUTCFullYear()
  const years = Math.max(1, current - firstYear + 1)
  return firstYear + (Math.floor(scheduledTime / (everyHours * 3_600_000)) % years)
}
