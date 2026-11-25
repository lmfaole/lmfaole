/**
 * What every upstream the page asks (GitHub, Entur, Yr, Nominatim) answers with `MOCK_DATA=1` (see lib/upstream.ts), so the whole site runs in `next dev`
 * with no keys and no network. The answers are real ones, captured once from public, keyless endpoints by `scripts/fetch-mock-data.mjs` into `lib/mock-data/*.json`,
 * put in the shape of each source's own answer here, and moved in time to now, so they never look stale.
 * Pure: no environment, no network.
 */
import { now } from "./day.ts"
import enturData from "./mock-data/entur.json" with { type: "json" }
import githubData from "./mock-data/github.json" with { type: "json" }
import nominatimData from "./mock-data/nominatim.json" with { type: "json" }
import yrData from "./mock-data/yr.json" with { type: "json" }

export interface MockInit {
  json?: unknown
  body?: string
}

const HOUR = 3_600_000
const DAY = 24 * HOUR
const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(Z|[+-]\d\d:\d\d)$/

const reply = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
const notFound = (address: string): Response => reply({ message: `Ingen mock for ${address}` }, 404)

/** The same value with every timestamp in it moved by `ms`. */
function shift<T>(value: T, ms: number): T {
  if (typeof value === "string") return (ISO.test(value) ? new Date(Date.parse(value) + ms).toISOString() : value) as T
  if (Array.isArray(value)) return value.map((item) => shift(item, ms)) as T
  if (typeof value === "object" && value !== null) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shift(item, ms)])) as T
  return value
}

function newest(value: unknown): number {
  if (typeof value === "string") return ISO.test(value) ? Date.parse(value) : 0
  if (Array.isArray(value)) return value.reduce<number>((latest, item) => Math.max(latest, newest(item)), 0)
  if (typeof value === "object" && value !== null) return Object.values(value).reduce<number>((latest, item) => Math.max(latest, newest(item)), 0)
  return 0
}

// GitHub ---------------------------------------------------------------------------------------------------------------------------------------------------

type Checks = "SUCCESS" | "FAILURE" | "PENDING" | null
type Decision = "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null
interface Run { name: string; status: string; conclusion: string | null }
interface Pull {
  id: number; number: number; url: string; title: string; author: string | null; created: string; updated: string; draft: boolean; mergeableState: string | null
  additions: number; deletions: number; files: number; head: string; base: string; labels: string[]; body: string; requested: string[]; comments: number
  reviews: { author: string; state: string; submitted: string; body: string }[]
  checks: { state: Checks; runs: Run[] }
  timeline?: Item[]
  /** Only on the closed ones: `MERGED` or `CLOSED`, and when. */
  state?: string; merged?: string | null; closed?: string | null
}
interface Issue {
  id: number; number: number; url: string; title: string; author: string | null; created: string; updated: string; assignees: string[]; labels: string[]; comments: number; body: string
  timeline?: Item[]
  state?: string; stateReason?: string | null; closed?: string | null
}
interface Comment { author: string; created: string; body: string }
interface ThreadComment { id: string; url: string; created: string; author: string | null; body: string; isAnswer: boolean; replies: number; upvotes: number; replyTo?: string }
interface Discussion {
  number: number; title: string; url: string; author: string; created: string; updated: string; category: string; comments: number; answered: boolean | null; body: string
  thread?: ThreadComment[]; answerChosen?: string | null; answerChosenBy?: string | null; closed?: string | null
}
/** A timeline item as scripts/fetch-mock-data.mjs keeps it: GraphQL's name for it, and the few fields there are of it. */
interface Item {
  type: string; id: string; at: string; actor: string | null; url?: string; body?: string; state?: string; name?: string | null; sha?: string; headline?: string
  label?: string; color?: string; subject?: string | null; reason?: string | null; merge?: string | null
  source?: { kind: string; number: number; title: string; url: string; state: string }
}
interface Repo {
  branch: string
  commit: { sha: string; url: string; headline: string; date: string; checks: { state: Checks } }
  issues: Issue[]
  pulls: Pull[]
  /** A merged pull request and a closed issue, found only by their detail pages. */
  closedPulls?: Pull[]
  closedIssues?: Issue[]
  issueComments: Record<string, Comment[]>
  discussions: Discussion[]
}
interface Github { me: string; repos: Record<string, Repo> }

/** The captured GitHub data, moved so that the newest thing in it happened two hours ago; the one that holds the repositories and what you do in them. */
function github(): { me: string; repos: [string, Repo][] } {
  const data = githubData as unknown as Github
  const moved = shift(data.repos, Date.now() - 2 * HOUR - newest(data.repos))
  const authors = Object.values(moved).flatMap((repo) => [...repo.issues.map((issue) => issue.author), ...repo.pulls.map((pull) => pull.author)])
  return { me: authors.includes("lmfaole") ? "lmfaole" : data.me, repos: Object.entries(moved) }
}

const isBot = (login: string | null): boolean => login?.includes("[bot]") === true
const asChecks = (state: Checks) => (state === null ? null : { state })
const nameOf = (repo: string, repos: [string, Repo][]): Repo | undefined => repos.find(([name]) => name.toLowerCase() === repo.toLowerCase())?.[1]

function decisionOf(pull: Pull): Decision {
  const latest = new Map(pull.reviews.map((review) => [review.author, review.state]))
  const states = [...latest.values()]
  if (states.includes("CHANGES_REQUESTED")) return "CHANGES_REQUESTED"
  if (states.includes("APPROVED")) return "APPROVED"
  return pull.requested.length > 0 ? "REVIEW_REQUIRED" : null
}
const mergeableOf = (pull: Pull): "MERGEABLE" | "CONFLICTING" | "UNKNOWN" => (pull.mergeableState === "dirty" ? "CONFLICTING" : pull.mergeableState === null || pull.mergeableState === "unknown" ? "UNKNOWN" : "MERGEABLE")

function pullsFor(query: string): { repo: string; pull: Pull }[] {
  const { me, repos } = github()
  const all = repos.flatMap(([repo, data]) => data.pulls.map((pull) => ({ repo, pull })))
  if (query.includes("author:app/dependabot")) return all.filter(({ pull }) => isBot(pull.author))
  if (query.includes("review-requested")) return all.filter(({ pull }) => pull.author !== me && !isBot(pull.author))
  return all.filter(({ pull }) => pull.author === me)
}

/** Issues assigned to you or made by you; with none of those in the captured data, the ones somebody is assigned to, so the lists are not empty. */
function issuesFor(kind: "assigned" | "involved"): { repo: string; issue: Issue }[] {
  const { me, repos } = github()
  const all = repos.flatMap(([repo, data]) => data.issues.map((issue) => ({ repo, issue })))
  const mine = all.filter(({ issue }) => issue.assignees.includes(me) || (kind === "involved" && issue.author === me))
  return mine.length > 0 ? mine : all.filter(({ issue }) => issue.assignees.length > 0 || kind === "involved").slice(0, 4)
}

const searchItem = (repo: string, item: { id: number; url: string; title: string; created: string; updated: string }, assignees: string[]) => ({
  id: item.id, html_url: item.url, title: item.title, repository_url: `https://api.github.com/repos/${repo}`, created_at: item.created, updated_at: item.updated, assignees: assignees.map((login) => ({ login })),
})

function search(q: string): unknown {
  if (q.includes("is:pr")) return { items: pullsFor(q).map(({ repo, pull }) => searchItem(repo, pull, [])) }
  return { items: issuesFor(/(^|\s)assignee:/.test(q) ? "assigned" : "involved").map(({ repo, issue }) => searchItem(repo, issue, issue.assignees)) }
}

const repoIssues = (repo: string): unknown => (nameOf(repo, github().repos)?.issues ?? []).map((issue) => ({ id: issue.id, html_url: issue.url, title: issue.title, created_at: issue.created, updated_at: issue.updated, assignees: issue.assignees.map((login) => ({ login })) }))

const prNode = ({ repo, pull }: { repo: string; pull: Pull }) => ({
  databaseId: pull.id, url: pull.url, title: pull.title, updatedAt: pull.updated, isDraft: pull.draft, reviewDecision: decisionOf(pull), mergeable: mergeableOf(pull),
  additions: pull.additions, deletions: pull.deletions, changedFiles: pull.files, repository: { nameWithOwner: repo }, author: pull.author === null ? null : { login: pull.author },
  commits: { nodes: [{ commit: { statusCheckRollup: asChecks(pull.checks.state) } }] }, reviewThreads: { nodes: [] },
})

const discussionNode = (repo: string, d: Discussion) => ({ id: `D_${repo}_${d.number}`, url: d.url, title: d.title, createdAt: d.created, updatedAt: d.updated, isAnswered: d.answered, category: { name: d.category }, comments: { totalCount: d.comments }, repository: { nameWithOwner: repo } })

const ALIAS = /(\w+): repository\(owner: "([^"]+)", name: "([^"]+)"\)/g

function discussions(query: string): unknown {
  const { me, repos } = github()
  const data: Record<string, unknown> = { involved: { nodes: repos.flatMap(([repo, entry]) => entry.discussions.filter((d) => d.author === me).map((d) => discussionNode(repo, d))) } }
  for (const [, alias, owner, name] of query.matchAll(ALIAS)) data[alias as string] = { discussions: { nodes: (nameOf(`${owner}/${name}`, repos)?.discussions ?? []).map((d) => discussionNode(`${owner}/${name}`, d)) } }
  return { data }
}

const repoNode = (repo: string, data: Repo) => ({
  nameWithOwner: repo, isArchived: false,
  defaultBranchRef: { name: data.branch, target: { oid: data.commit.sha, url: data.commit.url, messageHeadline: data.commit.headline, committedDate: data.commit.date, statusCheckRollup: asChecks(data.commit.checks.state) } },
})

function ci(query: string): unknown {
  const { repos } = github()
  const data: Record<string, unknown> = { user: { repositories: { nodes: repos.map(([repo, entry]) => repoNode(repo, entry)) } } }
  for (const [, alias, owner, name] of query.matchAll(ALIAS)) {
    const entry = nameOf(`${owner}/${name}`, repos)
    data[alias as string] = entry === undefined ? null : repoNode(`${owner}/${name}`, entry)
  }
  return { data }
}

/** The last comment of an issue and the last review of a pull request, as «involved» finds them: the replies are for the page to filter on who wrote them and when. */
function replies(): unknown {
  const { me, repos } = github()
  const issues = repos.flatMap(([repo, entry]) => Object.entries(entry.issueComments).flatMap(([number, comments]) => {
    const issue = entry.issues.find((candidate) => candidate.number === Number(number))
    const last = comments.at(-1)
    return issue === undefined || last === undefined ? [] : [{ id: `I_${repo}_${number}`, url: issue.url, title: issue.title, repository: { nameWithOwner: repo }, comments: { nodes: [{ author: { login: last.author }, createdAt: last.created }] } }]
  }))
  const pulls = repos.flatMap(([repo, entry]) => entry.pulls.flatMap((pull) => {
    const review = pull.reviews.at(-1)
    return review === undefined ? [] : [{ id: `PR_${repo}_${pull.number}`, url: pull.url, title: pull.title, repository: { nameWithOwner: repo }, comments: { nodes: [] }, reviews: { nodes: [{ author: { login: review.author }, submittedAt: review.submitted, state: review.state }] } }]
  }))
  return { data: { viewer: { login: me }, search: { nodes: [...issues, ...pulls] } } }
}

const toComment = (comment: Comment) => ({ author: { login: comment.author }, createdAt: comment.created, body: comment.body })
const login = (name: string | null | undefined) => (name === null || name === undefined ? null : { login: name })

/** A captured timeline item in the shape of GraphQL's `timelineItems` node. */
function timelineNode(item: Item): unknown {
  const actor = login(item.actor)
  const event = { __typename: item.type, id: item.id, createdAt: item.at, actor }
  switch (item.type) {
    case "IssueComment": return { __typename: item.type, id: item.id, url: item.url, createdAt: item.at, body: item.body ?? "", author: actor }
    case "PullRequestReview": return { __typename: item.type, id: item.id, url: item.url, createdAt: item.at, submittedAt: item.at, state: item.state, body: item.body ?? "", author: actor }
    case "PullRequestCommit": {
      const sha = item.sha ?? ""
      return { __typename: item.type, id: item.id, url: item.url, commit: { oid: sha, abbreviatedOid: sha.slice(0, 7), messageHeadline: item.headline ?? "", committedDate: item.at, url: item.url, author: { name: item.name ?? null, user: actor }, statusCheckRollup: null } }
    }
    case "ReviewRequestedEvent": return { ...event, requestedReviewer: item.subject ? { login: item.subject } : null }
    case "AssignedEvent": return { ...event, assignee: login(item.subject) }
    case "MergedEvent": return { ...event, url: item.url, mergeRefName: item.merge ?? null }
    case "ClosedEvent": return { ...event, url: item.url, stateReason: item.reason ?? null, closer: null }
    case "LabeledEvent":
    case "UnlabeledEvent": return { ...event, label: { name: item.label, color: item.color } }
    case "HeadRefForcePushedEvent": return { ...event, beforeCommit: null, afterCommit: null }
    case "ReviewDismissedEvent": return { ...event, url: item.url, review: null }
    case "CrossReferencedEvent": return { ...event, url: item.url, willCloseTarget: false, source: item.source === undefined ? null : { __typename: item.source.kind, number: item.source.number, title: item.source.title, url: item.source.url, state: item.source.state } }
    default: return { ...event, url: item.url }
  }
}

/** The newest 100 items, as `timelineItems(last: 100)` has them. */
function timelineItems(items: Item[] = []): unknown {
  return { totalCount: items.length, pageInfo: { hasPreviousPage: items.length > 100 }, nodes: items.slice(-100).map(timelineNode) }
}

function pullDetail(repo: string, number: number): unknown {
  const entry = nameOf(repo, github().repos)
  const pull = [...(entry?.pulls ?? []), ...(entry?.closedPulls ?? [])].find((candidate) => candidate.number === number)
  if (pull === undefined) return { data: { repository: { pullRequest: null } } }
  const state = pull.checks.state
  const reviews = pull.reviews
  return {
    data: {
      repository: {
        isPrivate: false,
        pullRequest: {
          title: pull.title, url: pull.url, state: pull.state ?? "OPEN", isDraft: pull.draft, body: pull.body, createdAt: pull.created, updatedAt: pull.updated, mergedAt: pull.merged ?? null, closedAt: pull.closed ?? null, author: pull.author === null ? null : { login: pull.author },
          headRefName: pull.head, baseRefName: pull.base, additions: pull.additions, deletions: pull.deletions, changedFiles: pull.files, reviewDecision: decisionOf(pull), mergeable: mergeableOf(pull),
          labels: { nodes: pull.labels.map((name) => ({ name })) }, reviewRequests: { nodes: pull.requested.map((login) => ({ requestedReviewer: { login } })) },
          latestReviews: { nodes: [...new Map(reviews.map((review) => [review.author, review])).values()].map((review) => ({ state: review.state, author: { login: review.author } })) },
          reviewThreads: { nodes: [] },
          commits: { nodes: [{ commit: { statusCheckRollup: state === null ? null : { state, contexts: { nodes: pull.checks.runs.map((run) => ({ __typename: "CheckRun", name: run.name, conclusion: run.conclusion?.toUpperCase() ?? null, status: run.status.toUpperCase() })) } } } }] },
          comments: { totalCount: pull.comments, nodes: reviews.filter((review) => review.body !== "").map((review) => toComment({ author: review.author, created: review.submitted, body: review.body })) },
          timelineItems: timelineItems(pull.timeline),
        },
      },
    },
  }
}

function issueDetail(repo: string, number: number): unknown {
  const entry = nameOf(repo, github().repos)
  const issue = [...(entry?.issues ?? []), ...(entry?.closedIssues ?? [])].find((candidate) => candidate.number === number)
  if (entry === undefined || issue === undefined) return { data: { repository: { issue: null } } }
  const closing = { stateReason: issue.stateReason ?? null, closedAt: issue.closed ?? null, timelineItems: timelineItems(issue.timeline) }
  return { data: { repository: { isPrivate: false, issue: { ...closing, title: issue.title, url: issue.url, state: issue.state ?? "OPEN", body: issue.body, createdAt: issue.created, updatedAt: issue.updated, author: issue.author === null ? null : { login: issue.author }, labels: { nodes: issue.labels.map((name) => ({ name })) }, assignees: { nodes: issue.assignees.map((login) => ({ login })) }, comments: { totalCount: issue.comments, nodes: (entry.issueComments[String(number)] ?? []).map(toComment) } } } } }
}

function discussionDetail(repo: string, number: number): unknown {
  const d = nameOf(repo, github().repos)?.discussions.find((candidate) => candidate.number === number)
  if (d === undefined) return { data: { repository: { discussion: null } } }
  const all = d.thread ?? []
  const thread = all.filter((comment) => comment.replyTo === undefined)
  const answer = all.find((comment) => comment.isAnswer)
  const node = (comment: ThreadComment) => ({ id: comment.id, url: comment.url, createdAt: comment.created, body: comment.body, isAnswer: comment.isAnswer, upvoteCount: comment.upvotes, replies: { totalCount: comment.replies }, author: login(comment.author) })
  return {
    data: {
      repository: {
        isPrivate: false,
        discussion: {
          title: d.title, url: d.url, body: d.body, createdAt: d.created, updatedAt: d.updated, isAnswered: d.answered, author: { login: d.author }, category: { name: d.category },
          answer: answer === undefined ? null : { ...node(answer), replyTo: answer.replyTo === undefined ? null : { id: answer.replyTo } },
          answerChosenAt: d.answerChosen ?? null, answerChosenBy: login(d.answerChosenBy), closedAt: d.closed ?? null,
          comments: {
            totalCount: Math.max(d.comments, thread.length), pageInfo: { hasPreviousPage: d.comments > thread.length },
            nodes: thread.map(node),
          },
        },
      },
    },
  }
}

function graphql(init: MockInit): Response {
  const { query = "", variables = {} } = (init.json ?? {}) as { query?: string; variables?: Record<string, unknown> }
  const ref = (): [string, number] => [`${String(variables["owner"])}/${String(variables["name"])}`, Number(variables["number"])]
  if (query.includes("pullRequest(number:")) return reply(pullDetail(...ref()))
  if (query.includes("issue(number:")) return reply(issueDetail(...ref()))
  if (query.includes("discussion(number:")) return reply(discussionDetail(...ref()))
  if (query.includes("type: DISCUSSION")) return reply(discussions(query))
  if (query.includes("user(login: $login)")) return reply(ci(query))
  if (query.startsWith("query Replies")) return reply(replies())
  if (query.includes("viewer { login }")) return reply({ data: { viewer: { login: github().me } } })
  if (query.includes("search(query: $q")) return reply({ data: { search: { nodes: pullsFor(String(variables["q"] ?? "")).map(prNode) } } })
  return reply({ errors: [{ message: "Ingen mock for denne spørringen" }] })
}

function githubAnswer(target: URL, init: MockInit): Response {
  if (target.pathname === "/graphql") return graphql(init)
  if (target.pathname === "/search/issues") return reply(search(target.searchParams.get("q") ?? ""))
  const user = /^\/users\/([^/]+)$/.exec(target.pathname)
  // Any username is a user in mock data: the lists come from the captured data, whoever is asked for.
  if (user !== null) return reply({ login: user[1], type: "User" })
  const repo = /^\/repos\/([^/]+\/[^/]+)$/.exec(target.pathname)
  if (repo !== null) return reply({ full_name: repo[1], private: false })
  const issues = /^\/repos\/([^/]+\/[^/]+)\/issues$/.exec(target.pathname)
  return issues === null ? notFound(target.href) : reply(repoIssues(issues[1] as string))
}

// Entur ----------------------------------------------------------------------------------------------------------------------------------------------------

const near = (lat: number, lon: number, spot: { lat: number; lon: number }): number => (lat - spot.lat) ** 2 + (lon - spot.lon) ** 2

interface Call {
  expectedDepartureTime: string
  aimedDepartureTime: string
  cancellation: boolean
  realtime: boolean
  quay: { publicCode: string | null } | null
  situations: { summary: { value: string; language: string }[] }[]
  destinationDisplay: { frontText: string } | null
  serviceJourney: { id?: string; line: { publicCode: string | null; transportMode: string | null } }
}
interface Nearest { nearest: { edges: { node: { distance: number; place: { id?: string; name?: string; latitude?: number; longitude?: number; estimatedCalls?: Call[] } } }[] } }

const MINUTE = 60_000
const at = (now: number, minutes: number): string => new Date(now + minutes * MINUTE).toISOString()
const notice = (value: string) => [{ summary: [{ value: `${value} `, language: "en" }, { value, language: "no" }] }]

function call(now: number, minutes: number, line: string, mode: string, destination: string, quay: string, late = 0): Call {
  return { expectedDepartureTime: at(now, minutes + late), aimedDepartureTime: at(now, minutes), cancellation: false, realtime: true, quay: { publicCode: quay }, situations: [], destinationDisplay: { frontText: destination }, serviceJourney: { line: { publicCode: line, transportMode: mode } } }
}

/**
 * What the departure board has to show that a real capture seldom has: the captured answer at Grünerløkka with, at the nearest stop, a departure 4 minutes late, a
 * cancelled one with a notice, one only by the timetable and the platforms; and a made-up stop at the edge of the search with metro and trains, several of each
 * line within the hour, the first ones gone before the reader could walk there.
 */
export function enturDressed(captured: Nearest, now: number): Nearest {
  const edges = captured.nearest.edges.map((edge, index) => {
    const calls = edge.node.place.estimatedCalls
    if (index !== 0 || calls === undefined) return edge
    const estimatedCalls = calls.map((original, position): Call => {
      const dressed = { ...original, quay: { publicCode: original.quay?.publicCode || (position % 2 === 0 ? "A" : "B") } }
      if (position === 1) return { ...dressed, realtime: true, cancellation: false, expectedDepartureTime: new Date(Date.parse(original.aimedDepartureTime) + 4 * MINUTE).toISOString() }
      if (position === 2) return { ...dressed, cancellation: true, situations: notice("Innstilt på grunn av mangel på førere.") }
      if (position === 3) return { ...dressed, realtime: false, expectedDepartureTime: original.aimedDepartureTime }
      return dressed
    })
    estimatedCalls.sort((a, b) => a.expectedDepartureTime.localeCompare(b.expectedDepartureTime))
    return { node: { ...edge.node, place: { ...edge.node.place, estimatedCalls } } }
  })
  const station = [
    ...[2, 9, 17, 24, 32, 39, 47, 54].map((minutes) => call(now, minutes, "5", "metro", "Vestli", "1")),
    ...[4, 19, 34, 49].map((minutes) => call(now, minutes, "L1", "rail", "Spikkestad", "4")),
    call(now, 12, "R14", "rail", "Kongsberg", "8", 4),
    { ...call(now, 42, "R14", "rail", "Kongsberg", "8"), realtime: false },
    { ...call(now, 27, "RE11", "rail", "Skien", "9"), cancellation: true, situations: notice("Toget er innstilt på grunn av sporarbeid. Buss for tog fra Oslo S.") },
  ].sort((a, b) => a.expectedDepartureTime.localeCompare(b.expectedDepartureTime))
  edges.push({ node: { distance: 590, place: { id: "MOCK:StopPlace:grunerlokka-stasjon", name: "Grünerløkka stasjon", latitude: 59.9279, longitude: 10.7601, estimatedCalls: station } } })
  return { nearest: { edges } }
}

/** A made-up trip for a captured departure: its stop, line, way and time in the id, so the trip can be made again from it alone. */
function journeyId(stop: string, one: Call): string {
  return `MOCK:ServiceJourney:${Buffer.from(JSON.stringify([stop, one.serviceJourney.line.publicCode, one.destinationDisplay?.frontText, one.aimedDepartureTime, one.expectedDepartureTime])).toString("base64url")}`
}

/** Twelve stops two minutes apart: five made of the captured stops before the one asked from, then it, then more on to the destination, late as the departure is. */
function tripCalls(journey: string, places: { id?: string; name?: string }[]) {
  const [stop, , destination, aimed, expected] = JSON.parse(Buffer.from(journey, "base64url").toString()) as [string, string, string, string, string]
  const late = Date.parse(expected) - Date.parse(aimed)
  const others = places.filter((place): place is { id: string; name: string } => place.id !== undefined && place.name !== undefined && place.id !== stop)
  const here = places.find((place) => place.id === stop)
  const named = [...others.slice(0, 5), { id: stop, name: here?.name ?? "Her" }, ...others.slice(5, 10), { id: "MOCK:StopPlace:end", name: destination }]
  return named.map((place, index) => {
    const planned = new Date(Date.parse(aimed) + (index - 5) * 2 * MINUTE).toISOString()
    const real = new Date(Date.parse(planned) + late).toISOString()
    return { expectedDepartureTime: real, aimedDepartureTime: planned, expectedArrivalTime: real, aimedArrivalTime: planned, cancellation: false, quay: { stopPlace: place } }
  })
}

function entur(query: string): Response {
  const moved = shift(enturData, Date.now() - Date.parse(enturData.capturedAt))
  const { grunerlokka, sentrum } = moved.spots
  const stop = /stopPlace\(id:"([^"]+)"\)/.exec(query)?.[1]
  if (stop !== undefined) {
    const places = [...moved.nearest.sentrum.nearest.edges, ...enturDressed(moved.nearest.grunerlokka as Nearest, Date.now()).nearest.edges].map((edge) => edge.node.place)
    const place = places.find((one) => one.id === stop)
    const journeys = (place?.estimatedCalls ?? []).map((one): Call => ({ ...one, serviceJourney: { ...one.serviceJourney, id: journeyId(stop, one) } }))
    return reply({ data: { stopPlace: place === undefined ? null : { ...place, estimatedCalls: journeys } } })
  }
  const journey = /serviceJourney\(id:"MOCK:ServiceJourney:([\w-]+)"\)/.exec(query)?.[1]
  if (journey !== undefined) {
    const places = [...moved.nearest.sentrum.nearest.edges, ...moved.nearest.grunerlokka.nearest.edges].map((edge) => edge.node.place)
    return reply({ data: { serviceJourney: { estimatedCalls: tripCalls(journey, places) } } })
  }
  if (!query.includes("nearest(")) return notFound(`Entur: ${query.slice(0, 40)}`)
  // Any position gets the stations of the captured place it is closest to.
  const [, lat, lon] = /latitude:([\d.-]+),longitude:([\d.-]+)/.exec(query) ?? []
  return reply({ data: near(Number(lat), Number(lon), sentrum) < near(Number(lat), Number(lon), grunerlokka) ? moved.nearest.sentrum : enturDressed(moved.nearest.grunerlokka as Nearest, Date.now()) })
}

// Yr and Nominatim -----------------------------------------------------------------------------------------------------------------------------------------

/** The forecast moved by whole days, so each hour keeps its time of day (night stays night) and the series starts no later than now. */
function yr(): Response {
  const days = Math.max(0, Math.floor((Date.now() - Date.parse(yrData.capturedAt)) / DAY))
  const answer = shift(yrData.answer, days * DAY) as { properties: { timeseries: { time: string; data: { instant: { details: Record<string, number> } } }[] } }
  // The complete forecast's UV index, which the captured compact one has not: highest at noon, moderate, so the weather shows it.
  for (const entry of answer.properties.timeseries) {
    const hour = new Date(entry.time).getUTCHours() + new Date(entry.time).getUTCMinutes() / 60
    entry.data.instant.details.ultraviolet_index_clear_sky = Math.max(0, Math.round(3.6 * Math.cos(((hour - 11) / 6) * (Math.PI / 2)) * 10) / 10)
  }
  return reply(answer)
}

/** NOAA's Kp index every three hours from yesterday to three days on, rising to a small storm in the evenings, so the aurora has something to show. */
function kp(): Response {
  const start = Math.floor(Date.now() / (3 * 3_600_000)) * 3 * 3_600_000 - DAY
  const evening = [1.33, 1.67, 2, 2.33, 2.67, 3.67, 4.67, 4]
  return reply(
    Array.from({ length: 32 }, (_, index) => {
      const time = new Date(start + index * 3 * 3_600_000)
      return { time_tag: time.toISOString().slice(0, 19), kp: evening[time.getUTCHours() / 3] ?? 2, observed: time.getTime() < Date.now() ? "observed" : "predicted", noaa_scale: null }
    }),
  )
}

// MET's other services, prices, NVE and Oslo Bysykkel -------------------------------------------------------------------------------------------------------

/** The time these answer for: `NOW` when it is set (so a page can be seen at noon in the evening), else now. */
const clock = (): number => now().getTime()

/** MET by service: the forecast (with a made-up UV index, which the captured compact one lacks), warnings, the radar, the air and the moon. */
function met(target: URL): Response {
  const path = target.pathname
  if (path.includes("/metalerts/")) return metAlerts()
  if (path.includes("/nowcast/")) return nowcast()
  if (path.includes("/airqualityforecast/")) return air()
  if (path.includes("/sunrise/")) return moon(target)
  return yr()
}

const hourStart = (ms = clock()): number => Math.floor(ms / HOUR) * HOUR

/** One yellow warning for strong wind that began two hours ago and lasts until tomorrow morning. */
function metAlerts(): Response {
  const from = new Date(hourStart() - 2 * HOUR).toISOString()
  const to = new Date(hourStart() + 18 * HOUR).toISOString()
  return reply({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "2.49.0.1.578.0.mock.1", awareness_level: "2; yellow; Moderate", awareness_type: "1; Wind", eventAwarenessName: "Kraftige vindkast", event: "gale", area: "Oslo og Akershus", description: "Sørvestlig vind med vindkast på 20-25 m/s.", consequences: "Løse gjenstander kan blåse rundt.", instruction: "Sikre løse gjenstander.", geographicDomain: "land", web: " https://www.yr.no/nb/farevarsler " },
        when: { interval: [from, to] },
      },
      { type: "Feature", properties: { id: "2.49.0.1.578.0.mock.2", awareness_level: "2; yellow; Moderate", eventAwarenessName: "Kuling", event: "gale", area: "Oslofjorden", geographicDomain: "marine" }, when: { interval: [from, to] } },
    ],
  })
}

/** The radar: dry now, rain from about twenty-five minutes on, hardest after an hour. */
function nowcast(): Response {
  const start = Math.floor(clock() / 300_000) * 300_000
  const rates = [0, 0, 0, 0, 0, 0.2, 0.6, 1.1, 1.8, 2.4, 2.9, 3.2, 2.6, 2.1, 1.5, 1.2, 0.8, 0.6, 0.4, 0.3]
  return reply({ type: "Feature", properties: { meta: { radar_coverage: "ok" }, timeseries: rates.map((rate, index) => ({ time: new Date(start + index * 300_000).toISOString().replace(".000", ""), data: { instant: { details: { precipitation_rate: rate, air_temperature: 6 } } } })) } })
}

/** The air: low at night, moderate in the afternoon rush (NO₂). */
function air(): Response {
  const start = hourStart() - 2 * HOUR
  return reply({
    meta: { location: { name: "Grünerløkka" }, superlocation: { name: "Grünerløkka" } },
    data: {
      time: Array.from({ length: 48 }, (_, index) => {
        const at = new Date(start + index * HOUR)
        const hour = (at.getUTCHours() + 1) % 24
        const no2 = hour >= 7 && hour <= 9 ? 2.2 : hour >= 15 && hour <= 18 ? 2.4 : 1.3
        return { from: at.toISOString().replace(".000", ""), to: new Date(at.getTime() + HOUR).toISOString().replace(".000", ""), variables: { AQI: { value: no2, units: "1" }, AQI_no2: { value: no2 }, AQI_pm10: { value: 1.1 }, AQI_pm25: { value: 1.2 }, AQI_o3: { value: 1 } } }
      }),
    },
  })
}

/** The moon's real phase for the date asked (from a known new moon), and a rise and set that move with it. */
function moon(target: URL): Response {
  const date = target.searchParams.get("date") ?? new Date().toISOString().slice(0, 10)
  const noon = Date.parse(`${date}T12:00:00Z`)
  const phase = ((((noon - Date.parse("2000-01-06T18:14:00Z")) / (29.530588 * DAY)) % 1) + 1) % 1 * 360
  const rise = new Date(Date.parse(`${date}T06:00:00Z`) + (phase / 360) * DAY)
  const set = new Date(rise.getTime() + 12 * HOUR)
  const at = (instant: Date) => ({ time: instant.toISOString().slice(0, 16) + "+00:00" })
  return reply({ type: "Feature", properties: { body: "Moon", moonrise: at(rise), moonset: at(set), moonphase: Math.round(phase * 10) / 10 } })
}

/** A day of spot prices in an area: cheap at night, dear in the morning and the afternoon. */
function prices(target: URL): Response {
  const [, year, month, day, area] = /(\d{4})\/(\d\d)-(\d\d)_(NO\d)/.exec(target.pathname) ?? []
  if (year === undefined) return notFound(target.href)
  const base = { NO1: 1, NO2: 0.9, NO3: 0.45, NO4: 0.2, NO5: 0.85 }[area as "NO1"] ?? 1
  const shape = [0.55, 0.5, 0.48, 0.47, 0.5, 0.6, 0.85, 1.25, 1.4, 1.2, 1.0, 0.95, 0.9, 0.88, 0.9, 1.0, 1.2, 1.45, 1.5, 1.3, 1.05, 0.9, 0.75, 0.62]
  const midnight = Date.parse(`${year}-${month}-${day}T00:00:00+01:00`)
  const local = (ms: number) => new Date(ms + HOUR).toISOString().slice(0, 19) + "+01:00"
  return reply(shape.map((factor, hour) => ({ NOK_per_kWh: Math.round(base * factor * 10_000) / 10_000, EUR_per_kWh: Math.round((base * factor * 10_000) / 11.7) / 10_000, EXR: 11.7, time_start: local(midnight + hour * HOUR), time_end: local(midnight + (hour + 1) * HOUR) })))
}

/** NVE: a yellow landslide warning for Oslo today, no flood, and avalanche danger 0 (Oslo is a region with no forecast in the city). */
function nve(target: URL): Response {
  const path = target.pathname
  const today = new Date(clock() + HOUR).toISOString().slice(0, 10)
  const tomorrow = new Date(clock() + HOUR + DAY).toISOString().slice(0, 10)
  if (path.includes("/landslide/")) {
    return reply([{ Id: 900001, ActivityLevel: "2", DangerTypeName: "Jordskredfare", MainText: "Moderat jordskredfare i Oslo og deler av Akershus.", WarningText: "Mye regn og snøsmelting gir fare for jord- og flomskred.", ValidFrom: `${today}T07:00:00`, ValidTo: `${tomorrow}T06:59:59`, MunicipalityList: [{ Id: "0301", Name: "Oslo" }] }])
  }
  if (path.includes("/avalanche/")) return reply([{ RegionId: 3017, RegionName: "Oslo", DangerLevel: "0", MainText: "Ikke vurdert", ValidFrom: `${today}T00:00:00`, ValidTo: `${today}T23:59:59` }])
  if (path.includes("/flood/")) return reply([{ Id: 900002, ActivityLevel: "1", MainText: "Ingen varsel", ValidFrom: `${today}T07:00:00`, ValidTo: `${tomorrow}T06:59:59`, MunicipalityList: [{ Id: "0301", Name: "Oslo" }] }])
  return notFound(target.href)
}

/** Oslo Bysykkel's stations near the two captured places (real names and places, made-up numbers). */
const BIKE_STATIONS: [id: string, name: string, lat: number, lon: number, bikes: number, docks: number][] = [
  ["551", "Olaf Ryes plass", 59.922425, 10.758182, 7, 28],
  ["455", "Sofienbergparken sør", 59.922337, 10.7617503, 0, 12],
  ["542", "Grünerhagen Nord", 59.9224256, 10.7554274, 4, 16],
  ["463", "Schous plass trikkestopp", 59.9207284, 10.7594857, 11, 9],
  ["424", "Birkelunden", 59.9256113, 10.760926, 2, 8],
  ["437", "Sentrum Scene", 59.91546786564256, 10.751140873016311, 9, 15],
  ["527", "Biskop Gunnerus' gate", 59.9123341, 10.752292, 3, 9],
  ["478", "Jernbanetorget", 59.91188166348664, 10.749962544694341, 12, 3],
]

function bikes(target: URL): Response {
  const updated = Math.floor(Date.now() / 1000)
  if (target.pathname.endsWith("station_information.json")) return reply({ last_updated: updated, ttl: 15, data: { stations: BIKE_STATIONS.map(([id, name, lat, lon, bikes, docks]) => ({ station_id: id, name, address: name, lat, lon, capacity: bikes + docks })) } })
  if (target.pathname.endsWith("station_status.json")) return reply({ last_updated: updated, ttl: 15, data: { stations: BIKE_STATIONS.map(([id, , , , bikes, docks]) => ({ station_id: id, is_installed: true, is_renting: true, is_returning: true, last_reported: updated, num_bikes_available: bikes, num_docks_available: docks })) } })
  return notFound(target.href)
}

const PLACES = [
  { name: "Bergen", display_name: "Bergen, Vestland, Norge", lat: "60.3943055", lon: "5.3259192" },
  { name: "Bergen", display_name: "Bergen, Noord-Holland, Nederland", lat: "52.6698", lon: "4.6970" },
  { name: "Tromsø", display_name: "Tromsø, Troms, Norge", lat: "69.6496", lon: "18.9560" },
  { name: "Trondheim", display_name: "Trondheim, Trøndelag, Norge", lat: "63.4305", lon: "10.3951" },
  { name: "Oslo", display_name: "Oslo, Norge", lat: "59.9133", lon: "10.7389" },
  { name: "Lillehammer", display_name: "Lillehammer, Innlandet, Norge", lat: "61.1153", lon: "10.4662" },
]

/** Nominatim's search, over a handful of places: those whose name starts with the search. */
function placeSearch(target: URL): Response {
  const q = (target.searchParams.get("q") ?? "").trim().toLowerCase()
  return reply(q === "" ? [] : PLACES.filter((place) => place.name.toLowerCase().startsWith(q)))
}

/** A short summary in Norwegian for a page, in place of the model that only runs on Cloudflare. */
export function mockSummary(): string {
  return "Dette er en lokal eksempeltekst: endringen er liten, testene går gjennom, og det eneste som gjenstår er en gjennomgang. Ingenting er hentet fra en KI-modell."
}

/** The answer a source would have given, for `MOCK_DATA=1`: by host and path, from the captured fixtures. */
export function mockFetch(address: string, init: MockInit = {}): Response {
  const target = new URL(address)
  switch (target.host) {
    case "api.github.com":
      return githubAnswer(target, init)
    case "api.entur.io":
      return entur(String((init.json as { query?: string } | undefined)?.query ?? ""))
    case "api.met.no":
      return met(target)
    case "nominatim.openstreetmap.org":
      return target.pathname === "/search" ? placeSearch(target) : reply(nominatimData)
    case "services.swpc.noaa.gov":
      return kp()
    case "www.hvakosterstrommen.no":
      return prices(target)
    case "api01.nve.no":
      return nve(target)
    case "ws.geonorge.no":
      return reply({ kommunenummer: "0301", kommunenavn: "Oslo", fylkesnummer: "03", fylkesnavn: "Oslo" })
    case "gbfs.urbansharing.com":
      return bikes(target)
    default:
      return notFound(address)
  }
}
