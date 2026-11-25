// Captures real, public, keyless answers into lib/mock-data/*.json, which lib/mock.ts serves when MOCK_DATA=1.
// Run it by hand now and then: `node scripts/fetch-mock-data.mjs [github] [yr] [entur] [nominatim]` (all of them by default).
// Nothing private is read: only public repositories. GitHub is asked without authentication (60 requests an hour) unless GITHUB_TOKEN is set; `github` needs
// about 100 requests for the timelines, so run it as `GITHUB_TOKEN=$(gh auth token) node scripts/fetch-mock-data.mjs github` (the token is only sent, never saved).
// The threads of discussions come from the GraphQL API, which needs the token; without one they are left out.
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dataDir = join(root, "lib", "mock-data")
mkdirSync(dataDir, { recursive: true })

const UA = "startside-mock-capture github.com/lmfaole/startside"
// Two places in Oslo to capture the stations around: Grünerløkka (also the forecast and the place name) and the centre.
const GRUNERLOKKA = { lat: 59.9226, lon: 10.7586 }
const SENTRUM = { lat: 59.915013, lon: 10.751613 }
const REPOS = ["fremtind/jokul", "navikt/aksel"]
const ARTISTS = ["Sigrid", "AURORA", "Kygo", "Alan Walker", "girl in red"]

const save = (name, value) => writeFileSync(join(dataDir, `${name}.json`), `${JSON.stringify(value, null, 1)}\n`)

async function get(url, init = {}) {
  const response = await fetch(url, { ...init, headers: { "User-Agent": UA, ...init.headers } })
  if (!response.ok) throw new Error(`${response.status} ${url}${response.status === 403 ? " (GitHub's limit for requests without a token, wait an hour)" : ""}`)
  return response
}
const TOKEN = process.env.GITHUB_TOKEN
const auth = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
const github = async (path) => (await get(`https://api.github.com${path}`, { headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...auth } })).json()
async function graphql(query, variables) {
  const body = await (await get("https://api.github.com/graphql", { method: "POST", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ query, variables }) })).json()
  if (body.errors) throw new Error(body.errors[0].message)
  return body.data
}
const clip = (text, length) => (text ?? "").slice(0, length)
const names = (list) => (list ?? []).map((item) => item.login ?? item.name)

function checksOf(runs) {
  if (runs.length === 0) return { state: null, runs }
  const conclusions = runs.map((run) => run.conclusion)
  const state = conclusions.some((c) => ["failure", "timed_out", "cancelled", "startup_failure", "action_required"].includes(c)) ? "FAILURE" : runs.some((run) => run.status !== "completed") ? "PENDING" : "SUCCESS"
  return { state, runs }
}
const runsOf = async (repo, ref) => {
  const { check_runs } = await github(`/repos/${repo}/commits/${ref}/check-runs?per_page=30`)
  return check_runs.map((run) => ({ name: run.name, status: run.status, conclusion: run.conclusion }))
}

// A timeline (REST, /issues/{n}/timeline) as small items named as GitHub's GraphQL timeline items are; lib/mock.ts gives them GraphQL's shape.
function timelineOf(events, { url, base, logins = new Map() }) {
  return events.flatMap((event, index) => {
    const actor = event.actor?.login ?? event.user?.login ?? null
    const id = event.node_id ?? `${event.event}-${index}`
    const at = event.created_at
    switch (event.event) {
      case "commented": return [{ type: "IssueComment", id, at, actor, url: event.html_url, body: clip(event.body, 1200) }]
      case "reviewed": return event.state === "pending" ? [] : [{ type: "PullRequestReview", id, at: event.submitted_at, actor, url: event.html_url, state: event.state.toUpperCase(), body: clip(event.body, 1200) }]
      case "committed": return [{ type: "PullRequestCommit", id, at: event.committer?.date ?? event.author?.date, actor: logins.get(event.sha) ?? null, name: event.author?.name ?? null, sha: event.sha, headline: (event.message ?? "").split("\n")[0], url: event.html_url }]
      case "review_requested": return [{ type: "ReviewRequestedEvent", id, at, actor, subject: event.requested_reviewer?.login ?? event.requested_team?.name ?? null }]
      case "ready_for_review": return [{ type: "ReadyForReviewEvent", id, at, actor, url }]
      case "convert_to_draft": return [{ type: "ConvertToDraftEvent", id, at, actor, url }]
      case "merged": return [{ type: "MergedEvent", id, at, actor, url, merge: base ?? null }]
      case "closed": return [{ type: "ClosedEvent", id, at, actor, url, reason: event.state_reason?.toUpperCase() ?? null }]
      case "reopened": return [{ type: "ReopenedEvent", id, at, actor }]
      case "labeled": return [{ type: "LabeledEvent", id, at, actor, label: event.label.name, color: event.label.color }]
      case "unlabeled": return [{ type: "UnlabeledEvent", id, at, actor, label: event.label.name, color: event.label.color }]
      case "head_ref_force_pushed": return [{ type: "HeadRefForcePushedEvent", id, at, actor }]
      case "assigned": return [{ type: "AssignedEvent", id, at, actor, subject: event.assignee?.login ?? null }]
      case "review_dismissed": return [{ type: "ReviewDismissedEvent", id, at, actor, url }]
      case "cross-referenced": {
        const source = event.source?.issue
        return source === undefined ? [] : [{ type: "CrossReferencedEvent", id, at, actor, url, source: { kind: source.pull_request ? "PullRequest" : "Issue", number: source.number, title: source.title, url: source.html_url, state: source.state.toUpperCase() } }]
      }
      default: return []
    }
  })
}
// Every page of a list, up to 500 (a timeline has many events the page does not show, as subscriptions and mentions).
async function pages(path) {
  const all = []
  for (let page = 1; page <= 5; page++) {
    const part = await github(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`)
    all.push(...part)
    if (part.length < 100) break
  }
  return all
}
const issueTimeline = async (repo, issue) => timelineOf(await pages(`/repos/${repo}/issues/${issue.number}/timeline`), { url: issue.html_url ?? issue.url })
async function pullTimeline(repo, pr) {
  const commits = await pages(`/repos/${repo}/pulls/${pr.number}/commits`)
  const logins = new Map(commits.map((commit) => [commit.sha, commit.author?.login ?? null]))
  return timelineOf(await pages(`/repos/${repo}/issues/${pr.number}/timeline`), { url: pr.html_url, base: pr.base.ref, logins })
}

// A discussion's last 50 comments, its answer and when it was closed (GraphQL, with a token only).
async function threadOf(repo, number) {
  const [owner, name] = repo.split("/")
  const { repository } = await graphql(`query ($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) { discussion(number: $number) {
    answerChosenAt answerChosenBy { login } closedAt answer { id url createdAt body isAnswer upvoteCount replies { totalCount } replyTo { id } author { login } }
    comments(last: 50) { nodes { id url createdAt body isAnswer upvoteCount replies { totalCount } author { login } } }
  } } }`, { owner, name, number })
  const d = repository.discussion
  const comment = (c) => ({ id: c.id, url: c.url, created: c.createdAt, author: c.author?.login ?? null, body: clip(c.body, 1200), isAnswer: c.isAnswer, replies: c.replies.totalCount, upvotes: c.upvoteCount })
  const answer = d.answer === null || d.comments.nodes.some((c) => c.id === d.answer.id) ? [] : [{ ...comment(d.answer), ...(d.answer.replyTo ? { replyTo: d.answer.replyTo.id } : {}) }]
  return {
    answerChosen: d.answerChosenAt, answerChosenBy: d.answerChosenBy?.login ?? null, closed: d.closedAt,
    // The answer where it is a reply (and so not one of the comments) comes last, with what it replies to.
    thread: [...d.comments.nodes.map(comment), ...answer],
  }
}
async function answeredOf(repo) {
  const [owner, name] = repo.split("/")
  const { repository } = await graphql(`query ($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { discussions(first: 1, answered: true, orderBy: { field: UPDATED_AT, direction: DESC }) {
    nodes { number title url body createdAt updatedAt author { login } category { name } comments { totalCount } }
  } } }`, { owner, name })
  const d = repository.discussions.nodes[0]
  return d === undefined ? null : { number: d.number, title: d.title, url: d.url, author: d.author?.login ?? "ukjent", created: d.createdAt, updated: d.updatedAt, category: d.category.name, comments: d.comments.totalCount, answered: true, body: clip(d.body, 1500) }
}

const decode = (html) => html.replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()
const decodeEntities = (text) => text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")

async function discussionsOf(repo) {
  const atom = await (await get(`https://github.com/${repo}/discussions.atom`)).text()
  const page = await (await get(`https://github.com/${repo}/discussions`, { headers: { "User-Agent": "Mozilla/5.0" } })).text()
  const updated = new Map()
  for (const entry of atom.split("<entry>").slice(1)) {
    const number = /discussions\/(\d+)"/.exec(entry)?.[1]
    if (number === undefined) continue
    updated.set(number, { updated: /<updated>([^<]+)</.exec(entry)?.[1], body: clip(decode(decodeEntities(/<content[^>]*>([\s\S]*?)<\/content>/.exec(entry)?.[1] ?? "")), 1500) })
  }
  const rows = page.split('class="markdown-title').slice(1)
  return rows.flatMap((row) => {
    const number = /href="\/[^"]+\/discussions\/(\d+)"/.exec(row)?.[1]
    const title = />([^<]+)<\/a><\/h3>/.exec(row)?.[1]
    if (number === undefined || title === undefined) return []
    const next = updated.get(number)
    const created = /datetime="([^"]+)"/.exec(row)?.[1]
    const comments = /(\d+) comments?/.exec(row)?.[1]
    const category = /aria-label="([^"]+) \(category\)"/.exec(row)?.[1] ?? ""
    return [{ number: Number(number), title: decodeEntities(title), url: `https://github.com/${repo}/discussions/${number}`, author: /aria-label="([^"]+) \(author\)"/.exec(row)?.[1] ?? "ukjent", created, updated: next?.updated ?? created, category: decodeEntities(category), comments: Number(comments ?? 0), answered: /Answered/.test(row) ? true : /Question|Spørsmål|Q&amp;A|Q&A/.test(category) ? false : null, body: next?.body ?? "" }]
  }).slice(0, 12)
}

async function captureGithub() {
  const result = { capturedAt: new Date().toISOString(), me: "", repos: {} }
  const counts = new Map()
  const count = (login) => login && !login.includes("[bot]") && counts.set(login, (counts.get(login) ?? 0) + 1)
  for (const repo of REPOS) {
    const list = await github(`/repos/${repo}/issues?state=open&sort=updated&direction=desc&per_page=40`)
    const issues = list.filter((item) => item.pull_request === undefined).slice(0, 20)
    const pulls = await github(`/repos/${repo}/pulls?state=open&sort=updated&direction=desc&per_page=30`)
    for (const item of [...issues, ...pulls]) {
      count(item.user?.login)
      for (const assignee of item.assignees ?? []) count(assignee.login)
    }
    const commit = (await github(`/repos/${repo}/commits?per_page=1`))[0]
    const info = await github(`/repos/${repo}`)
    result.repos[repo] = {
      branch: info.default_branch,
      commit: { sha: commit.sha, url: commit.html_url, headline: commit.commit.message.split("\n")[0], date: commit.commit.committer.date, checks: checksOf(await runsOf(repo, commit.sha)) },
      issues: issues.map((issue) => ({ id: issue.id, number: issue.number, url: issue.html_url, title: issue.title, author: issue.user?.login ?? null, created: issue.created_at, updated: issue.updated_at, assignees: names(issue.assignees), labels: names(issue.labels), comments: issue.comments, body: clip(issue.body, 3000) })),
      pulls: [],
      issueComments: {},
      discussions: await discussionsOf(repo),
      listed: pulls,
    }
  }
  result.me = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
  for (const repo of REPOS) {
    const entry = result.repos[repo]
    const ordered = [...entry.listed.filter((pr) => pr.user?.login === result.me).slice(0, 1), ...entry.listed.filter((pr) => pr.user?.login !== result.me && !pr.user?.login.includes("[bot]")).slice(0, 2), ...entry.listed.filter((pr) => pr.user?.login.includes("[bot]")).slice(0, 1)]
    for (const item of ordered) {
      const pr = await github(`/repos/${repo}/pulls/${item.number}`)
      const reviews = await github(`/repos/${repo}/pulls/${item.number}/reviews?per_page=20`)
      entry.pulls.push({
        timeline: await pullTimeline(repo, pr),
        id: pr.id, number: pr.number, url: pr.html_url, title: pr.title, author: pr.user?.login ?? null, created: pr.created_at, updated: pr.updated_at, draft: pr.draft, mergeableState: pr.mergeable_state,
        additions: pr.additions, deletions: pr.deletions, files: pr.changed_files, head: pr.head.ref, base: pr.base.ref, labels: names(pr.labels), body: clip(pr.body, 3000), requested: names(pr.requested_reviewers), comments: pr.comments + pr.review_comments,
        reviews: reviews.filter((review) => review.state !== "PENDING").map((review) => ({ author: review.user?.login ?? "ukjent", state: review.state, submitted: review.submitted_at, body: clip(review.body, 600) })),
        checks: checksOf(await runsOf(repo, pr.head.sha)),
      })
    }
    delete entry.listed
    for (const issue of entry.issues.filter((candidate) => candidate.comments > 0).slice(0, 3)) {
      const last = await github(`/repos/${repo}/issues/${issue.number}/comments?per_page=3&page=${Math.ceil(issue.comments / 3)}`)
      entry.issueComments[issue.number] = last.map((comment) => ({ author: comment.user?.login ?? "ukjent", created: comment.created_at, body: clip(comment.body, 1200) }))
    }
    for (const issue of entry.issues) issue.timeline = await issueTimeline(repo, issue)
    // A merged pull request (with changes requested on the way if there is one) and a closed issue, for their detail pages.
    const search = async (q) => (await github(`/search/issues?q=${encodeURIComponent(`repo:${repo} ${q}`)}&sort=updated&order=desc&per_page=1`)).items[0]
    const done = (await search("is:pr is:merged review:changes_requested")) ?? (await search("is:pr is:merged"))
    if (done !== undefined) {
      const pr = await github(`/repos/${repo}/pulls/${done.number}`)
      const reviews = await github(`/repos/${repo}/pulls/${done.number}/reviews?per_page=50`)
      entry.closedPulls = [{
        id: pr.id, number: pr.number, url: pr.html_url, title: pr.title, author: pr.user?.login ?? null, created: pr.created_at, updated: pr.updated_at, draft: pr.draft, mergeableState: null,
        additions: pr.additions, deletions: pr.deletions, files: pr.changed_files, head: pr.head.ref, base: pr.base.ref, labels: names(pr.labels), body: clip(pr.body, 3000), requested: names(pr.requested_reviewers), comments: pr.comments + pr.review_comments,
        reviews: reviews.filter((review) => review.state !== "PENDING").map((review) => ({ author: review.user?.login ?? "ukjent", state: review.state, submitted: review.submitted_at, body: clip(review.body, 600) })),
        checks: { state: null, runs: [] }, state: pr.merged_at ? "MERGED" : "CLOSED", merged: pr.merged_at, closed: pr.closed_at,
        timeline: await pullTimeline(repo, pr),
      }]
    }
    const closedIssue = await search("is:issue is:closed reason:completed")
    entry.closedIssues = closedIssue === undefined ? [] : [{
      id: closedIssue.id, number: closedIssue.number, url: closedIssue.html_url, title: closedIssue.title, author: closedIssue.user?.login ?? null, created: closedIssue.created_at, updated: closedIssue.updated_at,
      assignees: names(closedIssue.assignees), labels: names(closedIssue.labels), comments: closedIssue.comments, body: clip(closedIssue.body, 3000),
      state: "CLOSED", stateReason: closedIssue.state_reason?.toUpperCase() ?? null, closed: closedIssue.closed_at, timeline: await issueTimeline(repo, closedIssue),
    }]
    if (TOKEN) {
      const answered = await answeredOf(repo)
      if (answered !== null && !entry.discussions.some((d) => d.number === answered.number)) entry.discussions.push(answered)
      for (const d of entry.discussions.filter((candidate) => candidate.comments > 0)) Object.assign(d, await threadOf(repo, d.number))
    }
  }
  save("github", result)
}

async function captureYr() {
  const body = await (await get(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${GRUNERLOKKA.lat.toFixed(2)}&lon=${GRUNERLOKKA.lon.toFixed(2)}`)).json()
  save("yr", { capturedAt: body.properties.meta.updated_at, answer: body })
}

async function entur(query) {
  const response = await get("https://api.entur.io/journey-planner/v3/graphql", { method: "POST", headers: { "Content-Type": "application/json", "ET-Client-Name": "lmfaole-startside" }, body: JSON.stringify({ query }) })
  return (await response.json()).data
}
async function captureEntur() {
  const nearest = (spot) => entur(`{ nearest(latitude:${spot.lat},longitude:${spot.lon},maximumDistance:1000,maximumResults:8,filterByPlaceTypes:[stopPlace]){ edges{ node{ distance place{ ... on StopPlace{ id name latitude longitude estimatedCalls(numberOfDepartures:20,timeRange:3600){ expectedDepartureTime aimedDepartureTime cancellation realtime quay{publicCode} situations{ summary{value language} } destinationDisplay{frontText} serviceJourney{ line{publicCode transportMode} } } } } } } } }`)
  save("entur", { capturedAt: new Date().toISOString(), spots: { grunerlokka: GRUNERLOKKA, sentrum: SENTRUM }, nearest: { grunerlokka: await nearest(GRUNERLOKKA), sentrum: await nearest(SENTRUM) } })
}

async function captureNominatim() {
  save("nominatim", await (await get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=nb&lat=${GRUNERLOKKA.lat}&lon=${GRUNERLOKKA.lon}`)).json())
}

const steps = { github: captureGithub, yr: captureYr, entur: captureEntur, nominatim: captureNominatim }
const wanted = process.argv.slice(2)
for (const [name, run] of Object.entries(steps)) {
  if (wanted.length > 0 && !wanted.includes(name)) continue
  await run()
  console.log(`captured ${name}`)
}
