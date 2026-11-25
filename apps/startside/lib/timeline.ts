/**
 * What happened to a pull request, an issue or a discussion, in the shapes the design system's timeline components take: the events
 * (`Timeline`), the steps it has been through (`StateSteps`) and the time it spent waiting (`DurationBars`). Pure: GitHub's GraphQL
 * timeline items in, Norwegian text out; the page passes `now`.
 */
import type { IconName } from "@lmfaole/designsystem/lib/icons"
import type { DurationSpan, StateStep, TimelineActor, TimelineEvent, TimelineTone } from "@lmfaole/designsystem/lib/timeline"

import { avatarUrl } from "./avatar.ts"
import type { DiscussionDetail, IssueDetail, PullDetail } from "./detail.ts"

export type { DurationSpan, StateStep, TimelineEvent }

/** A timeline event whose body is Markdown, for the page to render (`body: <Markdown source={markdown} />`): this file makes no elements. */
export type GitHubEvent = Omit<TimelineEvent, "body"> & { markdown?: string }

// GitHub's timeline items ------------------------------------------------------------------------------------------------------------------------------------

/** Someone on GitHub; `null` where the account is deleted («ghost»). */
export type GitHubActor = { login: string } | null

type At = { id: string; createdAt: string; actor: GitHubActor }
type Source = { __typename: string; number?: number; title?: string; url?: string; state?: string } | null

/** The items of `timelineItems` that lib/detail.ts asks for, as GitHub's GraphQL API has them (bodies in Markdown, already cut). */
export type TimelineItem =
  | { __typename: "IssueComment"; id: string; url: string; createdAt: string; body: string; author: GitHubActor }
  | { __typename: "PullRequestReview"; id: string; url: string; createdAt: string; submittedAt: string | null; state: string; body: string; author: GitHubActor }
  | { __typename: "PullRequestCommit"; id: string; url: string; commit: { oid: string; abbreviatedOid: string; messageHeadline: string; committedDate: string; url: string; author: { name: string | null; user: GitHubActor } | null; statusCheckRollup: { state: string } | null } }
  | (At & { __typename: "ReviewRequestedEvent"; requestedReviewer: { login?: string; name?: string } | null })
  | (At & { __typename: "ReadyForReviewEvent" | "ConvertToDraftEvent"; url: string })
  | (At & { __typename: "MergedEvent"; url: string; mergeRefName: string | null })
  | (At & { __typename: "ClosedEvent"; url: string; stateReason: string | null; closer?: Source })
  | (At & { __typename: "ReopenedEvent" })
  | (At & { __typename: "LabeledEvent" | "UnlabeledEvent"; label: { name: string; color: string } })
  | (At & { __typename: "HeadRefForcePushedEvent"; beforeCommit: { abbreviatedOid: string } | null; afterCommit: { abbreviatedOid: string } | null })
  | (At & { __typename: "AssignedEvent"; assignee: { login?: string } | null })
  | (At & { __typename: "ReviewDismissedEvent"; url: string; review: { author: GitHubActor } | null })
  | (At & { __typename: "CrossReferencedEvent"; url: string; willCloseTarget: boolean; source: Source })
  | (At & { __typename: "ConnectedEvent"; source: Source })

/** Up to 100 of the newest items; `truncated` where there are older ones that are not there (`total` of them in all). */
export interface Timeline {
  items: TimelineItem[]
  total: number
  truncated: boolean
}

/** A comment in a discussion, with how many replies it has and whether it is the chosen answer. */
export interface DiscussionComment {
  id: string
  url: string
  createdAt: string
  body: string
  author: GitHubActor
  isAnswer: boolean
  replies: number
  upvotes: number
  /** The comment this is a reply to, for a reply (only the answer is fetched as one). */
  replyTo?: string
}

export type PullInput = Pick<PullDetail, "url" | "author" | "created" | "state" | "draft" | "merged" | "closed" | "timeline">
export type IssueInput = Pick<IssueDetail, "url" | "author" | "created" | "state" | "stateReason" | "closed" | "assignees" | "timeline">
export type DiscussionInput = Pick<DiscussionDetail, "url" | "author" | "created" | "answered" | "closed" | "answerChosen" | "answerChosenBy" | "thread">

// Helpers ----------------------------------------------------------------------------------------------------------------------------------------------------

const UNKNOWN = "ukjent"
const time = (iso: string): number => Date.parse(iso)
const loginOf = (actor: GitHubActor | undefined): string => actor?.login ?? UNKNOWN

function person(login: string | null | undefined): TimelineActor {
  if (login === null || login === undefined || login === "" || login === UNKNOWN) return { name: UNKNOWN }
  const avatar = avatarUrl(login)
  return avatar === null ? { name: login } : { name: login, avatar }
}

/** When an item happened: a review when it was sent, a commit when it was made. */
export function itemTime(item: TimelineItem): string {
  if (item.__typename === "PullRequestCommit") return item.commit.committedDate
  if (item.__typename === "PullRequestReview") return item.submittedAt ?? item.createdAt
  return item.createdAt
}

/** The items oldest first, also where GitHub has them out of order (a commit's time is when it was made, not pushed); ties keep GitHub's order. */
export function sortItems(items: readonly TimelineItem[]): TimelineItem[] {
  return items.map((item, index) => ({ item, index })).sort((a, b) => time(itemTime(a.item)) - time(itemTime(b.item)) || a.index - b.index).map(({ item }) => item)
}

const sortEvents = (events: GitHubEvent[]): GitHubEvent[] => events.map((event, index) => ({ event, index })).sort((a, b) => time(a.event.at) - time(b.event.at) || a.index - b.index).map(({ event }) => event)

const sourceLabel = (source: NonNullable<Source>): string => [source.number === undefined ? "" : `#${source.number}`, source.title ?? ""].join(" ").trim() || "en annen sak"

/** A note for a timeline that does not reach back to the start, or `null`. */
export function truncatedNote(timeline: { items: readonly unknown[]; total: number; truncated: boolean }): string | null {
  if (!timeline.truncated) return null
  return `Viser de siste ${timeline.items.length} av ${timeline.total} hendelser.`
}

// Events -----------------------------------------------------------------------------------------------------------------------------------------------------

function reviewEvent(item: Extract<TimelineItem, { __typename: "PullRequestReview" }>): GitHubEvent | null {
  const text = item.body.trim() !== ""
  const base = { id: item.id, at: itemTime(item), actor: person(item.author?.login), href: item.url, kind: text ? ("comment" as const) : ("event" as const), ...(text ? { markdown: item.body } : {}) }
  switch (item.state) {
    case "APPROVED": return { ...base, icon: "success", tone: "success", summary: "godkjente" }
    case "CHANGES_REQUESTED": return { ...base, icon: "changes", tone: "warning", summary: "ba om endringer" }
    case "COMMENTED": return { ...base, icon: "comment", summary: text ? "kommenterte" : "kommenterte i koden" }
    case "DISMISSED": return { ...base, icon: "cancelled", summary: "la igjen en review", badge: "Avvist" }
    default: return null
  }
}

function itemEvent(item: TimelineItem, kind: "pull" | "issue"): GitHubEvent | null {
  const at = itemTime(item)
  switch (item.__typename) {
    case "IssueComment":
      return { id: item.id, at, kind: "comment", icon: "comment", actor: person(item.author?.login), summary: "kommenterte", href: item.url, markdown: item.body }
    case "PullRequestReview":
      return reviewEvent(item)
    case "PullRequestCommit": {
      const { commit } = item
      const failed = commit.statusCheckRollup?.state === "FAILURE" || commit.statusCheckRollup?.state === "ERROR"
      return {
        id: item.id, at, kind: "event", icon: "commit", group: "commit", actor: person(commit.author?.user?.login ?? commit.author?.name), summary: "dyttet commit",
        target: { label: `${commit.messageHeadline} (${commit.abbreviatedOid})`, href: commit.url }, href: commit.url,
        ...(failed ? { tone: "danger" as const, badge: "Sjekker feilet" } : {}),
      }
    }
    case "ReviewRequestedEvent": {
      const who = item.requestedReviewer?.login ?? item.requestedReviewer?.name ?? UNKNOWN
      return { id: item.id, at, kind: "event", icon: "review", actor: person(item.actor?.login), summary: `ba ${who} om review` }
    }
    case "ReadyForReviewEvent":
      return { id: item.id, at, kind: "event", icon: "pull-request", actor: person(item.actor?.login), summary: "markerte som klar for review", href: item.url }
    case "ConvertToDraftEvent":
      return { id: item.id, at, kind: "event", icon: "draft", actor: person(item.actor?.login), summary: "gjorde om til utkast", href: item.url }
    case "MergedEvent":
      return { id: item.id, at, kind: "event", icon: "merge", tone: "accent", actor: person(item.actor?.login), summary: item.mergeRefName ? `merget inn i ${item.mergeRefName}` : "merget", href: item.url }
    case "ClosedEvent": {
      const actor = person(item.actor?.login)
      const closer = item.closer
      const target = closer === null || closer === undefined || closer.url === undefined ? {} : { target: { label: sourceLabel(closer), href: closer.url } }
      if (kind === "pull") return { id: item.id, at, kind: "event", icon: "pull-request-closed", tone: "danger", actor, summary: "lukket", href: item.url }
      if (item.stateReason === "NOT_PLANNED") return { id: item.id, at, kind: "event", icon: "closed", actor, summary: "lukket som ikke planlagt", href: item.url, ...target }
      if (item.stateReason === "DUPLICATE") return { id: item.id, at, kind: "event", icon: "closed", actor, summary: "lukket som duplikat", href: item.url, ...target }
      return { id: item.id, at, kind: "event", icon: "done", tone: "success", actor, summary: "lukket som fullført", href: item.url, ...target }
    }
    case "ReopenedEvent":
      return { id: item.id, at, kind: "event", icon: "reopen", actor: person(item.actor?.login), summary: "åpnet på nytt" }
    case "LabeledEvent":
      return { id: item.id, at, kind: "event", icon: "label", group: "label", actor: person(item.actor?.login), summary: `la til etiketten ${item.label.name}` }
    case "UnlabeledEvent":
      return { id: item.id, at, kind: "event", icon: "label", group: "label", actor: person(item.actor?.login), summary: `fjernet etiketten ${item.label.name}` }
    case "HeadRefForcePushedEvent": {
      const before = item.beforeCommit?.abbreviatedOid
      const after = item.afterCommit?.abbreviatedOid
      return { id: item.id, at, kind: "event", icon: "force-push", actor: person(item.actor?.login), summary: "force-pushet", ...(before && after ? { target: { label: `${before} → ${after}` } } : {}) }
    }
    case "AssignedEvent": {
      const who = item.assignee?.login ?? UNKNOWN
      return { id: item.id, at, kind: "event", icon: "assign", actor: person(item.actor?.login), summary: item.actor !== null && who === item.actor.login ? "tildelte seg selv" : `tildelte ${who}` }
    }
    case "ReviewDismissedEvent":
      return { id: item.id, at, kind: "event", icon: "cancelled", actor: person(item.actor?.login), summary: `avviste reviewen til ${loginOf(item.review?.author)}`, href: item.url }
    case "CrossReferencedEvent":
    case "ConnectedEvent": {
      if (item.source === null) return null
      const summary = item.__typename === "ConnectedEvent" ? "koblet til" : item.willCloseTarget ? "lenket en pull request som lukker saken:" : "viste til denne fra"
      return { id: item.id, at, kind: "event", icon: "link", actor: person(item.actor?.login), summary, target: { label: sourceLabel(item.source), ...(item.source.url ? { href: item.source.url } : {}) } }
    }
    default:
      return null
  }
}

const events = (items: readonly TimelineItem[], kind: "pull" | "issue"): GitHubEvent[] => items.flatMap((item) => itemEvent(item, kind) ?? [])

/** A pull request's closing that is its merge is said once, as the merge. */
function isMergeClose(item: TimelineItem, merged: string | null): boolean {
  return item.__typename === "ClosedEvent" && merged !== null && Math.abs(time(item.createdAt) - time(merged)) < 60_000
}

/** Everything that happened to a pull request, oldest first: its opening, commits, reviews, comments, labels and its merge or close. */
export function prTimeline(detail: PullInput): GitHubEvent[] {
  const opened: GitHubEvent = { id: "opened", at: detail.created, kind: "event", icon: "pull-request", actor: person(detail.author), summary: "åpnet", href: detail.url }
  return sortEvents([opened, ...events(detail.timeline.items.filter((item) => !isMergeClose(item, detail.merged)), "pull")])
}

/** Everything that happened to an issue, oldest first. */
export function issueTimeline(detail: IssueInput): GitHubEvent[] {
  const opened: GitHubEvent = { id: "opened", at: detail.created, kind: "event", icon: "issue", actor: person(detail.author), summary: "åpnet", href: detail.url }
  return sortEvents([opened, ...events(detail.timeline.items, "issue")])
}

/** A discussion from its opening: its comments (the chosen one marked «Svar»), the choice of the answer and its closing. */
export function discussionTimeline(detail: DiscussionInput): GitHubEvent[] {
  const list: GitHubEvent[] = [{ id: "opened", at: detail.created, kind: "event", icon: "discussion", actor: person(detail.author), summary: "åpnet", href: detail.url }]
  for (const comment of detail.thread.items) {
    list.push({
      id: comment.id, at: comment.createdAt, kind: "comment", icon: comment.replyTo === undefined ? "comment" : "reply", actor: person(comment.author?.login), summary: comment.replyTo === undefined ? "kommenterte" : "svarte i en tråd", href: comment.url, markdown: comment.body,
      ...(comment.isAnswer ? { badge: "Svar", tone: "success" as const } : {}),
      ...(comment.replies > 0 ? { target: { label: `${comment.replies} svar i tråden`, href: comment.url } } : {}),
    })
  }
  if (detail.answerChosen !== null) {
    const answer = detail.thread.items.find((comment) => comment.isAnswer)
    list.push({ id: "answer-chosen", at: detail.answerChosen, kind: "event", icon: "success", tone: "success", actor: person(detail.answerChosenBy), summary: answer === undefined ? "valgte et svar" : `valgte svaret til ${loginOf(answer.author)}`, ...(answer === undefined ? {} : { href: answer.url }) })
  }
  if (detail.closed !== null) list.push({ id: "closed", at: detail.closed, kind: "event", icon: "closed", summary: "ble lukket" })
  return sortEvents(list)
}

// Steps ------------------------------------------------------------------------------------------------------------------------------------------------------

type Reached = { label: string; at?: string; reached: boolean; icon: IconName; failed?: boolean }

/**
 * Reached steps are done; a step that is not reached while a later one is was skipped (a merge without approval). On a thing that is still
 * open, the first step not reached is the current one; on a closed one, the rest are skipped.
 */
function settleSteps(steps: Reached[], open: boolean): StateStep[] {
  const lastReached = steps.findLastIndex((step) => step.reached)
  let current = open
  return steps.map((step, index): StateStep => {
    const at = step.at === undefined ? {} : { at: step.at }
    if (step.failed) return { label: step.label, ...at, state: "failed", icon: step.icon }
    if (step.reached) return { label: step.label, ...at, state: "done", icon: step.icon }
    if (index < lastReached || !open) return { label: step.label, state: "skipped", icon: step.icon }
    if (current) {
      current = false
      return { label: step.label, state: "current", icon: step.icon }
    }
    return { label: step.label, state: "upcoming", icon: step.icon }
  })
}

const until = (items: readonly TimelineItem[], now: string): TimelineItem[] => sortItems(items).filter((item) => time(itemTime(item)) <= time(now))
type Review = Extract<TimelineItem, { __typename: "PullRequestReview" }>
/** A bot's account (Copilot, dependabot[bot]): its reviews come in minutes and are not what a pull request waits for. */
const isBot = (login: string | null | undefined): boolean => login !== null && login !== undefined && (/\[bot\]$/.test(login) || /^copilot$/i.test(login))
const isReview = (item: TimelineItem, author: string | null): item is Review =>
  item.__typename === "PullRequestReview" && item.state !== "PENDING" && !isBot(item.author?.login) && (author === null || item.author?.login !== author)

/** Whether a pull request was opened as a draft: its first draft event says, or else whether it is a draft now. */
function openedAsDraft(items: readonly TimelineItem[], draftNow: boolean): boolean {
  const first = items.find((item) => item.__typename === "ReadyForReviewEvent" || item.__typename === "ConvertToDraftEvent")
  return first === undefined ? draftNow : first.__typename === "ReadyForReviewEvent"
}

/** When a pull request was first ready for review: opened ready, or marked so later; `null` while it never was. */
function readyAt(detail: PullInput, items: readonly TimelineItem[]): string | null {
  if (!openedAsDraft(items, detail.draft)) return detail.created
  const ready = items.find((item) => item.__typename === "ReadyForReviewEvent")
  return ready === undefined ? null : itemTime(ready)
}

/** The first approval after the last request for changes (a dismissed request no longer counts: GitHub says `DISMISSED` for it). */
function approvedAt(items: readonly TimelineItem[], author: string | null): string | null {
  const reviews = items.filter((item): item is Review => isReview(item, author))
  const lastChanges = reviews.findLast((review) => review.state === "CHANGES_REQUESTED")
  const after = lastChanges === undefined ? -Infinity : time(itemTime(lastChanges))
  const approval = reviews.find((review) => review.state === "APPROVED" && time(itemTime(review)) > after)
  return approval === undefined ? null : itemTime(approval)
}

/** Åpnet → Klar for review → Review → Godkjent → Merget (or Lukket, failed, where it was closed without a merge). */
export function prSteps(detail: PullInput, now: string): StateStep[] {
  const items = until(detail.timeline.items, now)
  const ready = readyAt(detail, items)
  const review = items.find((item) => isReview(item, detail.author))
  const approved = approvedAt(items, detail.author)
  const mergedEvent = items.find((item) => item.__typename === "MergedEvent")
  const merged = detail.merged ?? (mergedEvent === undefined ? null : itemTime(mergedEvent))
  const closed = detail.state === "CLOSED" && merged === null
  const steps: Reached[] = [
    { label: "Åpnet", at: detail.created, reached: true, icon: "pull-request" },
    { label: "Klar for review", ...(ready === null ? {} : { at: ready }), reached: ready !== null, icon: "review" },
    { label: "Review", ...(review === undefined ? {} : { at: itemTime(review) }), reached: review !== undefined, icon: "review" },
    { label: "Godkjent", ...(approved === null ? {} : { at: approved }), reached: approved !== null, icon: "success" },
    closed
      ? { label: "Lukket", ...(detail.closed === null ? {} : { at: detail.closed }), reached: false, icon: "pull-request-closed", failed: true }
      : { label: "Merget", ...(merged === null ? {} : { at: merged }), reached: merged !== null, icon: "merge" },
  ]
  return settleSteps(steps, detail.state === "OPEN")
}

/** Åpnet → Tildelt → Lukket som fullført / ikke planlagt. */
export function issueSteps(detail: IssueInput, now: string): StateStep[] {
  const items = until(detail.timeline.items, now)
  const assigned = items.find((item) => item.__typename === "AssignedEvent")
  const closed = detail.state === "CLOSED"
  const reason = closed ? detail.stateReason : null
  const closeLabel = !closed ? "Lukket" : reason === "NOT_PLANNED" ? "Lukket som ikke planlagt" : reason === "DUPLICATE" ? "Lukket som duplikat" : "Lukket som fullført"
  const steps: Reached[] = [
    { label: "Åpnet", at: detail.created, reached: true, icon: "issue" },
    { label: "Tildelt", ...(assigned === undefined ? {} : { at: itemTime(assigned) }), reached: assigned !== undefined || detail.assignees.length > 0, icon: "person" },
    { label: closeLabel, ...(closed && detail.closed !== null ? { at: detail.closed } : {}), reached: closed, icon: reason === "NOT_PLANNED" || reason === "DUPLICATE" ? "closed" : "done" },
  ]
  return settleSteps(steps, !closed)
}

const firstReply = (detail: DiscussionInput): DiscussionComment | undefined =>
  [...detail.thread.items].sort((a, b) => time(a.createdAt) - time(b.createdAt)).find((comment) => detail.author === null || comment.author?.login !== detail.author)

/** Åpnet → Første svar → Besvart (in a category with answers) or Lukket (where it is closed). */
export function discussionSteps(detail: DiscussionInput, now: string): StateStep[] {
  const reply = firstReply(detail)
  const replied = reply !== undefined && time(reply.createdAt) <= time(now)
  const steps: Reached[] = [
    { label: "Åpnet", at: detail.created, reached: true, icon: "discussion" },
    { label: "Første svar", ...(replied ? { at: reply.createdAt } : {}), reached: replied, icon: "comment" },
  ]
  if (detail.answered !== null) steps.push({ label: "Besvart", ...(detail.answerChosen === null ? {} : { at: detail.answerChosen }), reached: detail.answerChosen !== null || detail.answered, icon: "success" })
  else if (detail.closed !== null) steps.push({ label: "Lukket", at: detail.closed, reached: true, icon: "closed" })
  return settleSteps(steps, detail.closed === null)
}

// Spans ------------------------------------------------------------------------------------------------------------------------------------------------------

/** Spans with a start and maybe an end; each key runs at most once at a time, and spans of one label share a lane. */
class Spans {
  private readonly done: (DurationSpan & { seq: number })[] = []
  private readonly running = new Map<string, { start: string; label: string; seq: number; tone?: TimelineTone }>()
  private count = 0

  open(key: string, label: string, start: string, tone?: TimelineTone): void {
    if (!this.running.has(key)) this.running.set(key, { start, label, seq: this.count++, ...(tone === undefined ? {} : { tone }) })
  }

  isOpen(key: string): boolean {
    return this.running.has(key)
  }

  close(key: string, end?: string): void {
    const span = this.running.get(key)
    if (span === undefined) return
    this.running.delete(key)
    if (end !== undefined && time(end) < time(span.start)) return
    this.done.push({ key: `${key}-${span.seq}`, seq: span.seq, label: span.label, start: span.start, ...(end === undefined ? {} : { end }), row: span.label, ...(span.tone === undefined ? {} : { tone: span.tone }) })
  }

  closeAll(end: string): void {
    for (const key of [...this.running.keys()]) this.close(key, end)
  }

  /** The spans by start (then in the order they began): the ones still running have no end while the thing is open, and end at `end` where it is not. */
  finish(open: boolean, end: string | null): DurationSpan[] {
    for (const key of [...this.running.keys()]) this.close(key, open || end === null ? undefined : end)
    return [...this.done].sort((a, b) => time(a.start) - time(b.start) || a.seq - b.seq).map(({ seq: _, ...span }) => span)
  }
}

/**
 * How long a pull request spent in each state, on lanes: «Åpen» (again after a reopening), «Utkast», «Venter på review» (from ready or a
 * request for review until the next review; bots' requests and reviews do not count) and «Endringer etterspurt» (from a request for changes until the next commit or review).
 */
export function prSpans(detail: PullInput, now: string): DurationSpan[] {
  const items = until(detail.timeline.items, now)
  const spans = new Spans()
  let draft = openedAsDraft(items, detail.draft)
  let open = true
  spans.open("open", "Åpen", detail.created)
  if (draft) spans.open("draft", "Utkast", detail.created)
  else spans.open("waiting", "Venter på review", detail.created, "warning")
  for (const item of items) {
    const at = itemTime(item)
    if (time(at) < time(detail.created)) continue
    switch (item.__typename) {
      case "ReadyForReviewEvent":
        draft = false
        spans.close("draft", at)
        if (open && !spans.isOpen("changes")) spans.open("waiting", "Venter på review", at, "warning")
        break
      case "ConvertToDraftEvent":
        draft = true
        spans.close("waiting", at)
        if (open) spans.open("draft", "Utkast", at)
        break
      case "ReviewRequestedEvent":
        if (open && !draft && !isBot(item.requestedReviewer?.login)) spans.open("waiting", "Venter på review", at, "warning")
        break
      case "PullRequestReview":
        if (!isReview(item, detail.author) || item.state === "DISMISSED") break
        spans.close("waiting", at)
        if (item.state === "CHANGES_REQUESTED") {
          if (open) spans.open("changes", "Endringer etterspurt", at, "danger")
        } else spans.close("changes", at)
        break
      case "PullRequestCommit":
      case "HeadRefForcePushedEvent":
        spans.close("changes", at)
        break
      case "MergedEvent":
      case "ClosedEvent":
        if (!open) break
        open = false
        spans.closeAll(at)
        break
      case "ReopenedEvent":
        if (open) break
        open = true
        spans.open("open", "Åpen", at)
        if (draft) spans.open("draft", "Utkast", at)
        else spans.open("waiting", "Venter på review", at, "warning")
        break
    }
  }
  return spans.finish(detail.state === "OPEN", detail.merged ?? detail.closed)
}

/** How long an issue was open (again after a reopening), and «Uten eier» until somebody was assigned to it. */
export function issueSpans(detail: IssueInput, now: string): DurationSpan[] {
  const items = until(detail.timeline.items, now)
  const spans = new Spans()
  let open = true
  spans.open("open", "Åpen", detail.created)
  // Assigned with no event for it (older than the items there are): when is not known, so there is no span.
  if (detail.assignees.length === 0 || items.some((item) => item.__typename === "AssignedEvent")) spans.open("unowned", "Uten eier", detail.created, "warning")
  for (const item of items) {
    const at = itemTime(item)
    if (item.__typename === "AssignedEvent") spans.close("unowned", at)
    else if (item.__typename === "ClosedEvent" && open) {
      open = false
      spans.closeAll(at)
    } else if (item.__typename === "ReopenedEvent" && !open) {
      open = true
      spans.open("open", "Åpen", at)
    }
  }
  return spans.finish(detail.state === "OPEN", detail.closed)
}

/** How long a discussion was open, «Venter på svar» until somebody other than its author replied, and «Ubesvart» until an answer was chosen. */
export function discussionSpans(detail: DiscussionInput, now: string): DurationSpan[] {
  const spans = new Spans()
  spans.open("open", "Åpen", detail.created)
  spans.open("reply", "Venter på svar", detail.created, "warning")
  if (detail.answered === false || detail.answerChosen !== null) spans.open("answer", "Ubesvart", detail.created, "warning")
  const reply = firstReply(detail)
  if (reply !== undefined && time(reply.createdAt) <= time(now)) spans.close("reply", reply.createdAt)
  if (detail.answerChosen !== null) spans.close("answer", detail.answerChosen)
  if (detail.closed !== null) spans.closeAll(detail.closed)
  return spans.finish(detail.closed === null, detail.closed)
}
