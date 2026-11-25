import { ciFailures, fromOthers, type CiFailure, type InvolvedNode, type RepoNode, type Reply } from "./alerts"
import { osloDateDaysAgo } from "./day"
import { discussionNodes, type DiscussionItem } from "./discussions"
import { githubUser, isPublicRepository, isWatched, parseRepos, publicSearch, repliesQuery, userQueries } from "./github-query"
import { env, mocking } from "./env"
import { readStatuses, withStatus, type PullStatus, type Statuses } from "./pr-status"
import { repoIssuesUrl, repoUrl } from "./snapshot"
import { throughRelay, upstream } from "./upstream"

/** The user the page is about: `GITHUB_USER`, else lmfaole. Fixed, the same for every visitor. */
export const githubLogin = (): string => githubUser(env("GITHUB_USER") ?? "lmfaole")

/** The watched repositories (`GITHUB_WATCH_REPOS`), as the comma-separated list `parseRepos` reads. */
const watchedRepoList = (): string => env("GITHUB_WATCH_REPOS") ?? ""

export interface Item {
  key: string
  href: string
  title: string
  repo: string
  created: string
  updated: string
  /** The logins it is assigned to. */
  assignees: string[]
  /** For a pull request: its checks, review and so on. */
  status?: PullStatus
}

interface SearchResult {
  items: { id: number; html_url: string; title: string; repository_url: string; created_at: string; updated_at: string; assignees?: { login: string }[] }[]
}

async function search(token: string | undefined, query: string, perPage = 15): Promise<Item[]> {
  const response = await upstream(`https://api.github.com/search/issues?per_page=${perPage}&sort=updated&q=${encodeURIComponent(publicSearch(query))}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), Accept: "application/vnd.github+json", "User-Agent": "startside", "X-GitHub-Api-Version": "2022-11-28" },
    revalidate: 60,
  })
  if (!response.ok) throw new Error(response.status === 500 ? await response.text() : `GitHub svarte ${response.status}`)
  const body = (await response.json()) as SearchResult
  return body.items.map((item) => ({
    key: String(item.id),
    href: item.html_url,
    title: item.title,
    repo: item.repository_url.replace("https://api.github.com/repos/", ""),
    created: item.created_at,
    updated: item.updated_at,
    assignees: (item.assignees ?? []).map((assignee) => assignee.login),
  }))
}

const PULLS = `query ($q: String!) {
  search(query: $q, type: ISSUE, first: 15) {
    nodes {
      ... on PullRequest {
        databaseId url title updatedAt isDraft reviewDecision mergeable additions deletions changedFiles
        repository { nameWithOwner isPrivate visibility }
        author { login }
        commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
        reviewThreads(first: 50) { nodes { isResolved } }
      }
    }
  }
}`

/**
 * Pull requests: the list from the search, and their status from GraphQL where the token may read the pull requests
 * themselves. An organisation can block the one and not the other, so the list never depends on it: what GraphQL could
 * not read is shown without a status.
 */
async function pulls(token: string | undefined, query: string): Promise<Item[]> {
  const [items, statuses] = await Promise.all([search(token, `${query} is:pr`), graphql(token, query).catch((): Statuses => new Map())])
  return withStatus(items, statuses)
}

async function graphql(token: string | undefined, query: string): Promise<Statuses> {
  const response = await upstream("https://api.github.com/graphql", {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "User-Agent": "startside" },
    json: { query: PULLS, variables: { q: publicSearch(`${query} is:pr sort:updated-desc`) } },
    revalidate: 60,
  })
  if (!response.ok) throw new Error(`GitHub (GraphQL) svarte ${response.status}`)
  type Body = Parameters<typeof readStatuses>[0] & { data?: { search?: { nodes?: ({ repository?: unknown } | null)[] } } }
  const body = (await response.json()) as Body
  const nodes = body.data?.search?.nodes
  if (nodes !== undefined) body.data!.search!.nodes = nodes.filter((node) => node !== null && isPublicRepository(node.repository as Parameters<typeof isPublicRepository>[0]))
  return readStatuses(body)
}

function token(): string | undefined {
  const value = env("GITHUB_TOKEN")
  // Through the relay, the relay holds the token.
  if (!value && !throughRelay() && !mocking()) throw new Error("GITHUB_TOKEN er ikke satt")
  return value
}

/** The user's pull requests and the ones waiting for their review (public repositories only, see `userQueries`); `mine` leaves the reviews out. */
export async function getPulls(user: string, which: "all" | "mine"): Promise<{ reviews: Item[]; mine: Item[] }> {
  const queries = userQueries(user, env("GITHUB_EXCLUDE_ORGS"))
  const accessToken = token()
  const [reviews, mine] = await Promise.all([which === "all" ? pulls(accessToken, queries.reviews) : Promise.resolve([]), pulls(accessToken, queries.mine)])
  return { reviews, mine }
}

interface RepoIssue {
  id: number
  html_url: string
  title: string
  created_at: string
  updated_at: string
  assignees?: { login: string }[]
  pull_request?: unknown
}

/**
 * The 50 open issues of a repository that moved last, straight from the repository (pull requests are in the same list and left out).
 * Only from a public repository: the token may read the owner's private ones too, and the page shows only what anyone may see.
 */
async function repoIssues(token: string | undefined, repo: string): Promise<Item[]> {
  const about = await upstream(repoUrl(repo), {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), Accept: "application/vnd.github+json", "User-Agent": "startside", "X-GitHub-Api-Version": "2022-11-28" },
    revalidate: 3600,
  })
  if (!about.ok) throw new Error(about.status === 500 ? await about.text() : `GitHub svarte ${about.status}`)
  if (!isPublicRepository((await about.json()) as { private?: unknown; visibility?: unknown })) return []
  const response = await upstream(repoIssuesUrl(repo), {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), Accept: "application/vnd.github+json", "User-Agent": "startside", "X-GitHub-Api-Version": "2022-11-28" },
    revalidate: 60,
  })
  if (!response.ok) throw new Error(response.status === 500 ? await response.text() : `GitHub svarte ${response.status}`)
  return ((await response.json()) as RepoIssue[])
    .filter((issue) => issue.pull_request === undefined)
    .map((issue) => ({ key: String(issue.id), href: issue.html_url, title: issue.title, repo, created: issue.created_at, updated: issue.updated_at, assignees: (issue.assignees ?? []).map((assignee) => assignee.login) }))
}

/**
 * Issues, for `groupIssues`: the ones assigned to the user in any public repository, the ones they are involved in in the
 * watched repositories (`GITHUB_WATCH_REPOS`), and in them the 50 that moved last, from which the new ones nobody owns come.
 * Searching on a repository or an organisation is blocked by SAML single sign-on for the token, so «involved» searches by
 * you and is filtered to the repositories here, and the repositories' own issues are read straight from them.
 */
export async function getIssues(user: string): Promise<{ assigned: Item[]; involved: Item[]; recent: Item[] }> {
  const accessToken = token()
  const queries = userQueries(user, env("GITHUB_EXCLUDE_ORGS"))
  const watchedRepos = watchedRepoList()
  const [assigned, involved, recent] = await Promise.all([
    search(accessToken, queries.assigned),
    search(accessToken, queries.involved, 50).then((items) => items.filter((item) => isWatched(item.repo, watchedRepos))),
    Promise.all(parseRepos(watchedRepos).map((repo) => repoIssues(accessToken, repo))).then((lists) => lists.flat()),
  ])
  return { assigned, involved, recent }
}

const DISCUSSION = `fragment D on Discussion {
  id url title createdAt updatedAt isAnswered
  category { name }
  comments { totalCount }
  repository { nameWithOwner isPrivate visibility }
}`

/**
 * Discussions in the watched (public) repositories: the ones the user is in, and the 30 that moved last in each. GitHub has them in
 * GraphQL only; searching on a repository is blocked by SAML single sign-on for the token, so «involved» searches by you
 * and is filtered to the repositories here, and the repositories' own discussions are read straight from them.
 */
export async function getDiscussions(user: string): Promise<{ involved: DiscussionItem[]; recent: DiscussionItem[] }> {
  const watchedRepos = watchedRepoList()
  const repos = parseRepos(watchedRepos)
  if (repos.length === 0) return { involved: [], recent: [] }
  const accessToken = token()
  // The names are checked by `parseRepos` (letters, digits, dots, dashes and underscores), so they can go into the query.
  const perRepo = repos.map((repo, index) => {
    const [owner, name] = repo.split("/")
    return `r${index}: repository(owner: "${owner}", name: "${name}") { isPrivate discussions(first: 30, orderBy: { field: UPDATED_AT, direction: DESC }) { nodes { ...D } } }`
  })
  const response = await upstream("https://api.github.com/graphql", {
    headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), "User-Agent": "startside" },
    json: { query: `query Discussions($q: String!) { involved: search(query: $q, type: DISCUSSION, first: 30) { nodes { ...D } } ${perRepo.join(" ")} } ${DISCUSSION}`, variables: { q: publicSearch(userQueries(user, env("GITHUB_EXCLUDE_ORGS")).discussions) } },
    revalidate: 60,
  })
  if (!response.ok) throw new Error(response.status === 500 ? await response.text() : `GitHub (GraphQL) svarte ${response.status}`)
  type Nodes = Parameters<typeof discussionNodes>[0]
  const body = (await response.json()) as { data?: Record<string, { nodes: Nodes } | { isPrivate?: boolean; discussions: { nodes: Nodes } } | null>; errors?: { message: string }[] }
  if (body.data === undefined) throw new Error(body.errors?.[0]?.message ?? "GitHub svarte uten data")
  const involved = (body.data.involved as { nodes: Nodes } | null)?.nodes ?? []
  const recent = repos.flatMap((_, index) => {
    const repo = body.data?.[`r${index}`] as { isPrivate?: boolean; discussions: { nodes: Nodes } } | null
    return repo === null || repo === undefined || repo.isPrivate !== false ? [] : repo.discussions.nodes
  })
  const open = (nodes: Nodes) => nodes.filter((node) => node !== null && isPublicRepository((node as { repository?: Parameters<typeof isPublicRepository>[0] }).repository))
  return { involved: discussionNodes(open(involved)).filter((item) => isWatched(item.repo, watchedRepos)), recent: discussionNodes(open(recent)) }
}

async function askGraphql<T>(token: string | undefined, query: string, variables: Record<string, string> = {}, revalidate = 60): Promise<T> {
  const response = await upstream("https://api.github.com/graphql", {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "User-Agent": "startside" },
    json: { query, variables },
    revalidate,
  })
  if (!response.ok) throw new Error(response.status === 500 ? await response.text() : `GitHub (GraphQL) svarte ${response.status}`)
  const body = (await response.json()) as { data?: T; errors?: { message: string }[] }
  if (body.data === undefined) throw new Error(body.errors?.[0]?.message ?? "GitHub svarte uten data")
  return body.data
}

const REPO = `fragment R on Repository { nameWithOwner isArchived isPrivate visibility defaultBranchRef { name target { ... on Commit { oid url messageHeadline committedDate statusCheckRollup { state } } } } }`

/** An aliased `repository(...)` of the answer, as a repository, or nothing where it is not one or is not public. */
function asRepo(value: unknown): RepoNode | null {
  return typeof value === "object" && value !== null && "nameWithOwner" in value && isPublicRepository(value as { isPrivate?: unknown; visibility?: unknown }) ? (value as RepoNode) : null
}

/** The repositories whose default branch is red: the user's own public ones that moved last, and the watched public ones (`GITHUB_WATCH_REPOS`). */
export async function getCiFailures(user: string): Promise<CiFailure[]> {
  const accessToken = token()
  const watched = parseRepos(watchedRepoList())
  const aliases = watched.map((repo, index) => {
    const [owner, name] = repo.split("/")
    return `w${index}: repository(owner: "${owner}", name: "${name}") { ...R }`
  })
  type Data = { user: { repositories: { nodes: (RepoNode | null)[] } } | null } & Record<string, unknown>
  const data = await askGraphql<Data>(
    accessToken,
    `query CiRepos($login: String!) { user(login: $login) { repositories(first: 30, privacy: PUBLIC, isFork: false, ownerAffiliations: OWNER, orderBy: { field: PUSHED_AT, direction: DESC }) { nodes { ...R } } } ${aliases.join(" ")} } ${REPO}`,
    { login: user },
  )
  const own = (data.user?.repositories.nodes ?? []).map(asRepo)
  const watchedNodes = watched.map((_, index) => asRepo(data[`w${index}`]))
  return ciFailures([...own, ...watchedNodes])
}

/** Dependabot's open pull requests in the user's own public repositories, with their checks: what is waiting to be merged or closed. */
export async function getDependabot(user: string): Promise<Item[]> {
  return pulls(token(), userQueries(user, env("GITHUB_EXCLUDE_ORGS")).dependabot)
}

/** Things the user is involved in (public) that have moved in the last days, where somebody else wrote last: the replies and reviews that are for them to read. */
export async function getReplies(user: string, instant: Date): Promise<Reply[]> {
  const since = osloDateDaysAgo(instant, 3)
  type Data = { search: { nodes: (InvolvedNode | null)[] } }
  const data = await askGraphql<Data>(
    token(),
    `query Replies($q: String!) { search(query: $q, type: ISSUE, first: 30) { nodes {
      ... on Issue { id url title repository { nameWithOwner isPrivate visibility } comments(last: 1) { nodes { author { login } createdAt } } }
      ... on PullRequest { id url title repository { nameWithOwner isPrivate visibility } comments(last: 1) { nodes { author { login } createdAt } } reviews(last: 1) { nodes { author { login } submittedAt state } } }
    } } }`,
    { q: publicSearch(repliesQuery(user, since, env("GITHUB_EXCLUDE_ORGS"))) },
  )
  return fromOthers(data.search.nodes.filter((node) => node !== null && isPublicRepository(node.repository as Parameters<typeof isPublicRepository>[0])), user, instant, 3)
}
