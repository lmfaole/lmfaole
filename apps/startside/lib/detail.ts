import { truncateMarkdown } from "./digest"
import { env, mocking } from "./env"
import { isPublicRepository } from "./github-query"
import type { Ref } from "./links"
import type { DiscussionComment, GitHubActor, Timeline, TimelineItem } from "./timeline"
import { throughRelay, upstream } from "./upstream"

/** A person's text under a pull request, an issue or a discussion, in Markdown. */
export interface Comment {
  author: string
  created: string
  text: string
}

/** A description in Markdown, cut for the page: its text, and whether the rest is left out. */
export interface Body {
  text: string
  cut: boolean
}

interface CommentNode {
  author: { login: string } | null
  createdAt: string
  body: string
}

interface Comments {
  totalCount: number
  nodes: (CommentNode | null)[]
}

const COMMENTS = "comments(last: 3) { totalCount nodes { author { login } createdAt body } }"

/** How much of a description or a comment is shown (Markdown, cut at a paragraph): enough to decide; the whole is on GitHub. */
const BODY_MAX = 6000
const COMMENT_MAX = 1200

const toComments = (comments: Comments): { total: number; latest: Comment[] } => ({
  total: comments.totalCount,
  latest: comments.nodes.flatMap((node) => (node === null ? [] : [{ author: node.author?.login ?? "ukjent", created: node.createdAt, text: truncateMarkdown(node.body, COMMENT_MAX).text }])),
})

const ACTOR = "actor { login }"

/** The fields of each kind of timeline item, as lib/timeline.ts reads them. */
const ITEMS = {
  ISSUE_COMMENT: "... on IssueComment { id url createdAt body author { login } }",
  PULL_REQUEST_REVIEW: "... on PullRequestReview { id url createdAt submittedAt state body author { login } }",
  PULL_REQUEST_COMMIT: "... on PullRequestCommit { id url commit { oid abbreviatedOid messageHeadline committedDate url author { name user { login } } statusCheckRollup { state } } }",
  REVIEW_REQUESTED_EVENT: `... on ReviewRequestedEvent { id createdAt ${ACTOR} requestedReviewer { ... on User { login } ... on Bot { login } ... on Mannequin { login } ... on Team { name } } }`,
  READY_FOR_REVIEW_EVENT: `... on ReadyForReviewEvent { id url createdAt ${ACTOR} }`,
  CONVERT_TO_DRAFT_EVENT: `... on ConvertToDraftEvent { id url createdAt ${ACTOR} }`,
  MERGED_EVENT: `... on MergedEvent { id url createdAt mergeRefName ${ACTOR} }`,
  CLOSED_EVENT: `... on ClosedEvent { id url createdAt stateReason ${ACTOR} closer { __typename ... on PullRequest { number title url } ... on Commit { title: messageHeadline url } } }`,
  REOPENED_EVENT: `... on ReopenedEvent { id createdAt ${ACTOR} }`,
  LABELED_EVENT: `... on LabeledEvent { id createdAt ${ACTOR} label { name color } }`,
  UNLABELED_EVENT: `... on UnlabeledEvent { id createdAt ${ACTOR} label { name color } }`,
  HEAD_REF_FORCE_PUSHED_EVENT: `... on HeadRefForcePushedEvent { id createdAt ${ACTOR} beforeCommit { abbreviatedOid } afterCommit { abbreviatedOid } }`,
  ASSIGNED_EVENT: `... on AssignedEvent { id createdAt ${ACTOR} assignee { ... on User { login } ... on Bot { login } ... on Mannequin { login } } }`,
  REVIEW_DISMISSED_EVENT: `... on ReviewDismissedEvent { id url createdAt ${ACTOR} review { author { login } } }`,
  CROSS_REFERENCED_EVENT: `... on CrossReferencedEvent { id url createdAt willCloseTarget ${ACTOR} source { __typename ... on PullRequest { number title url state } ... on Issue { number title url state } } }`,
  CONNECTED_EVENT: `... on ConnectedEvent { id createdAt ${ACTOR} source { __typename ... on PullRequest { number title url state } ... on Issue { number title url state } } }`,
} as const

const TIMELINE_MAX = 100

/** The newest items of a timeline, of the kinds asked for. */
const timelineQuery = (kinds: (keyof typeof ITEMS)[]): string =>
  `timelineItems(last: ${TIMELINE_MAX}, itemTypes: [${kinds.join(", ")}]) { totalCount pageInfo { hasPreviousPage } nodes { __typename ${kinds.map((kind) => ITEMS[kind]).join(" ")} } }`

interface TimelineNodes {
  totalCount: number
  pageInfo: { hasPreviousPage: boolean }
  nodes: (TimelineItem | null)[]
}

/** The timeline with each comment's and review's text cut as the comments are. */
function toTimeline(timeline: TimelineNodes): Timeline {
  const items = timeline.nodes.flatMap((node): TimelineItem[] => {
    if (node === null) return []
    if (node.__typename === "IssueComment" || node.__typename === "PullRequestReview") return [{ ...node, body: truncateMarkdown(node.body, COMMENT_MAX).text }]
    return [node]
  })
  return { items, total: timeline.totalCount, truncated: timeline.pageInfo.hasPreviousPage }
}

/** The repository where it is public (`isPrivate: false` and `visibility: PUBLIC`), `null` otherwise, so the page is a 404: should the token read private ones, those are never shown. */
function publicOnly<T extends { isPrivate: boolean; visibility?: string }>(repository: T | null | undefined): T | null {
  return repository !== null && repository !== undefined && repository.visibility !== undefined && isPublicRepository(repository) ? repository : null
}

async function ask<T>(query: string, ref: Ref): Promise<T> {
  const token = env("GITHUB_TOKEN")
  if (!token && !throughRelay() && !mocking()) throw new Error("GITHUB_TOKEN er ikke satt")
  const response = await upstream("https://api.github.com/graphql", {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "User-Agent": "startside" },
    json: { query, variables: { owner: ref.owner, name: ref.repo, number: ref.number } },
    revalidate: 60,
  })
  if (!response.ok) throw new Error(response.status === 500 ? await response.text() : `GitHub (GraphQL) svarte ${response.status}`)
  const body = (await response.json()) as { data?: T; errors?: { message: string }[] }
  if (body.data === undefined) throw new Error(body.errors?.[0]?.message ?? "GitHub svarte uten data")
  return body.data
}

export interface CheckLine {
  name: string
  /** What GitHub says: a conclusion (`SUCCESS`, `FAILURE`, `NEUTRAL`, `SKIPPED` …) or a state while it runs. */
  state: string
}

export interface PullDetail {
  title: string
  url: string
  /** `OPEN`, `CLOSED` or `MERGED`. */
  state: string
  draft: boolean
  author: string | null
  created: string
  updated: string
  /** When it was merged, or closed (also when merged); `null` while it is not. */
  merged: string | null
  closed: string | null
  body: Body
  head: string
  base: string
  size: { additions: number; deletions: number; files: number }
  checks: "SUCCESS" | "FAILURE" | "ERROR" | "PENDING" | "EXPECTED" | null
  checkLines: CheckLine[]
  review: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null
  mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN"
  openThreads: number
  labels: string[]
  requested: string[]
  reviews: { author: string; state: string }[]
  comments: { total: number; latest: Comment[] }
  /** What happened to it: commits, reviews, comments, review requests, labels, draft changes, merge and close (lib/timeline.ts makes events, steps and spans of it). */
  timeline: Timeline
}

const PULL_ITEMS: (keyof typeof ITEMS)[] = [
  "ISSUE_COMMENT", "PULL_REQUEST_REVIEW", "PULL_REQUEST_COMMIT", "REVIEW_REQUESTED_EVENT", "READY_FOR_REVIEW_EVENT", "CONVERT_TO_DRAFT_EVENT", "MERGED_EVENT",
  "CLOSED_EVENT", "REOPENED_EVENT", "LABELED_EVENT", "UNLABELED_EVENT", "HEAD_REF_FORCE_PUSHED_EVENT", "ASSIGNED_EVENT", "REVIEW_DISMISSED_EVENT",
]

/** One pull request with what is needed to decide what to do with it: its text, checks, reviewers and last comments. `null` where there is no such pull request. */
export async function getPull(ref: Ref): Promise<PullDetail | null> {
  type Node = {
    title: string; url: string; state: string; isDraft: boolean; body: string; createdAt: string; updatedAt: string; mergedAt: string | null; closedAt: string | null
    author: { login: string } | null; headRefName: string; baseRefName: string
    additions: number; deletions: number; changedFiles: number
    reviewDecision: PullDetail["review"]; mergeable: PullDetail["mergeable"]
    labels: { nodes: { name: string }[] }
    reviewRequests: { nodes: { requestedReviewer: { login?: string; name?: string } | null }[] }
    latestReviews: { nodes: { state: string; author: { login: string } | null }[] }
    reviewThreads: { nodes: { isResolved: boolean }[] }
    commits: { nodes: { commit: { statusCheckRollup: { state: NonNullable<PullDetail["checks"]>; contexts: { nodes: ({ __typename: string; name?: string; conclusion?: string | null; status?: string; context?: string; state?: string } | null)[] } } | null } }[] }
    comments: Comments
    timelineItems: TimelineNodes
  }
  const data = await ask<{ repository: { isPrivate: boolean; visibility: string; pullRequest: Node | null } | null }>(
    `query ($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) { isPrivate visibility pullRequest(number: $number) {
      title url state isDraft body createdAt updatedAt mergedAt closedAt author { login } headRefName baseRefName additions deletions changedFiles reviewDecision mergeable
      labels(first: 10) { nodes { name } }
      reviewRequests(first: 10) { nodes { requestedReviewer { ... on User { login } ... on Team { name } } } }
      latestReviews(first: 10) { nodes { state author { login } } }
      reviewThreads(first: 50) { nodes { isResolved } }
      commits(last: 1) { nodes { commit { statusCheckRollup { state contexts(first: 30) { nodes { __typename ... on CheckRun { name conclusion status } ... on StatusContext { context state } } } } } } }
      ${COMMENTS}
      ${timelineQuery(PULL_ITEMS)}
    } } }`,
    ref,
  )
  const pull = publicOnly(data.repository)?.pullRequest
  if (pull === null || pull === undefined) return null
  const rollup = pull.commits.nodes[0]?.commit.statusCheckRollup ?? null
  return {
    title: pull.title, url: pull.url, state: pull.state, draft: pull.isDraft, author: pull.author?.login ?? null, created: pull.createdAt, updated: pull.updatedAt,
    merged: pull.mergedAt, closed: pull.closedAt,
    body: truncateMarkdown(pull.body, BODY_MAX), head: pull.headRefName, base: pull.baseRefName,
    size: { additions: pull.additions, deletions: pull.deletions, files: pull.changedFiles },
    checks: rollup?.state ?? null,
    checkLines: (rollup?.contexts.nodes ?? []).flatMap((node) => (node === null ? [] : [node.__typename === "CheckRun" ? { name: node.name ?? "Sjekk", state: node.conclusion ?? node.status ?? "PENDING" } : { name: node.context ?? "Status", state: node.state ?? "PENDING" }])),
    review: pull.reviewDecision, mergeable: pull.mergeable, openThreads: pull.reviewThreads.nodes.filter((thread) => !thread.isResolved).length,
    labels: pull.labels.nodes.map((label) => label.name),
    requested: pull.reviewRequests.nodes.flatMap((request) => request.requestedReviewer?.login ?? request.requestedReviewer?.name ?? []),
    reviews: pull.latestReviews.nodes.map((review) => ({ author: review.author?.login ?? "ukjent", state: review.state })),
    comments: toComments(pull.comments),
    timeline: toTimeline(pull.timelineItems),
  }
}

export interface IssueDetail {
  title: string
  url: string
  /** `OPEN` or `CLOSED`. */
  state: string
  /** Why it was closed (`COMPLETED`, `NOT_PLANNED`, `DUPLICATE`), or `REOPENED`; `null` where GitHub does not say. */
  stateReason: string | null
  closed: string | null
  author: string | null
  created: string
  updated: string
  body: Body
  labels: string[]
  assignees: string[]
  comments: { total: number; latest: Comment[] }
  /** Comments, closes and reopenings, labels, assignments and references from elsewhere. */
  timeline: Timeline
}

const ISSUE_ITEMS: (keyof typeof ITEMS)[] = ["ISSUE_COMMENT", "CLOSED_EVENT", "REOPENED_EVENT", "LABELED_EVENT", "UNLABELED_EVENT", "ASSIGNED_EVENT", "CROSS_REFERENCED_EVENT", "CONNECTED_EVENT"]

/** One issue: its text, labels, who it is assigned to and the last comments. `null` where there is no such issue. */
export async function getIssue(ref: Ref): Promise<IssueDetail | null> {
  type Node = {
    title: string; url: string; state: string; stateReason: string | null; closedAt: string | null; body: string; createdAt: string; updatedAt: string; author: { login: string } | null
    labels: { nodes: { name: string }[] }; assignees: { nodes: { login: string }[] }; comments: Comments; timelineItems: TimelineNodes
  }
  const data = await ask<{ repository: { isPrivate: boolean; visibility: string; issue: Node | null } | null }>(
    `query ($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) { isPrivate visibility issue(number: $number) {
      title url state stateReason closedAt body createdAt updatedAt author { login }
      labels(first: 10) { nodes { name } }
      assignees(first: 5) { nodes { login } }
      ${COMMENTS}
      ${timelineQuery(ISSUE_ITEMS)}
    } } }`,
    ref,
  )
  const issue = publicOnly(data.repository)?.issue
  if (issue === null || issue === undefined) return null
  return {
    title: issue.title, url: issue.url, state: issue.state, stateReason: issue.stateReason, closed: issue.closedAt, author: issue.author?.login ?? null, created: issue.createdAt, updated: issue.updatedAt,
    body: truncateMarkdown(issue.body, BODY_MAX), labels: issue.labels.nodes.map((label) => label.name), assignees: issue.assignees.nodes.map((assignee) => assignee.login),
    comments: toComments(issue.comments),
    timeline: toTimeline(issue.timelineItems),
  }
}

export interface DiscussionDetail {
  title: string
  url: string
  category: string
  /** `true` or `false` in a category with answers, `null` in the others. */
  answered: boolean | null
  author: string | null
  created: string
  updated: string
  body: Body
  answer: Comment | null
  /** When the answer was chosen and by whom; when it was closed. */
  answerChosen: string | null
  answerChosenBy: string | null
  closed: string | null
  comments: { total: number; latest: Comment[] }
  /** The last 50 comments, oldest first, each with its number of replies and whether it is the answer; and the answer where it is a reply (`replyTo`). */
  thread: { items: DiscussionComment[]; total: number; truncated: boolean }
}

const THREAD_MAX = 50

interface ThreadNode {
  id: string; url: string; createdAt: string; body: string; author: GitHubActor; isAnswer: boolean; upvoteCount: number; replies: { totalCount: number }
}

const toThreadComment = (node: ThreadNode, replyTo?: string): DiscussionComment => ({
  id: node.id, url: node.url, createdAt: node.createdAt, body: truncateMarkdown(node.body, COMMENT_MAX).text, author: node.author, isAnswer: node.isAnswer, replies: node.replies.totalCount, upvotes: node.upvoteCount,
  ...(replyTo === undefined ? {} : { replyTo }),
})

/** The comments, and the answer where it is not one of them (a reply in a thread, or older than the last 50). */
function threadOf(nodes: (ThreadNode | null)[], answer: (ThreadNode & { replyTo: { id: string } | null }) | null): DiscussionComment[] {
  const items = nodes.flatMap((node) => (node === null ? [] : [toThreadComment(node)]))
  if (answer === null || items.some((item) => item.id === answer.id)) return items
  return [...items, toThreadComment(answer, answer.replyTo?.id)]
}

/** One discussion: its text, its answer if it has one, and the last comments. `null` where there is no such discussion. */
export async function getDiscussion(ref: Ref): Promise<DiscussionDetail | null> {
  type Node = {
    title: string; url: string; body: string; createdAt: string; updatedAt: string; isAnswered: boolean | null; author: { login: string } | null; category: { name: string } | null
    answer: (ThreadNode & { replyTo: { id: string } | null }) | null; answerChosenAt: string | null; answerChosenBy: { login: string } | null; closedAt: string | null
    comments: { totalCount: number; pageInfo: { hasPreviousPage: boolean }; nodes: (ThreadNode | null)[] }
  }
  const data = await ask<{ repository: { isPrivate: boolean; visibility: string; discussion: Node | null } | null }>(
    `query ($owner: String!, $name: String!, $number: Int!) { repository(owner: $owner, name: $name) { isPrivate visibility discussion(number: $number) {
      title url body createdAt updatedAt isAnswered author { login } category { name }
      answer { id url author { login } createdAt body isAnswer upvoteCount replies { totalCount } replyTo { id } } answerChosenAt answerChosenBy { login } closedAt
      comments(last: ${THREAD_MAX}) { totalCount pageInfo { hasPreviousPage } nodes { id url createdAt body isAnswer upvoteCount replies { totalCount } author { login } } }
    } } }`,
    ref,
  )
  const discussion = publicOnly(data.repository)?.discussion
  if (discussion === null || discussion === undefined) return null
  return {
    title: discussion.title, url: discussion.url, category: discussion.category?.name ?? "", answered: discussion.isAnswered, author: discussion.author?.login ?? null,
    created: discussion.createdAt, updated: discussion.updatedAt, body: truncateMarkdown(discussion.body, BODY_MAX),
    answer: discussion.answer === null ? null : { author: discussion.answer.author?.login ?? "ukjent", created: discussion.answer.createdAt, text: truncateMarkdown(discussion.answer.body, COMMENT_MAX).text },
    answerChosen: discussion.answerChosenAt, answerChosenBy: discussion.answerChosenBy?.login ?? null, closed: discussion.closedAt,
    comments: toComments({ totalCount: discussion.comments.totalCount, nodes: discussion.comments.nodes.slice(-3) }),
    thread: { items: threadOf(discussion.comments.nodes, discussion.answer), total: discussion.comments.totalCount, truncated: discussion.comments.pageInfo.hasPreviousPage },
  }
}
