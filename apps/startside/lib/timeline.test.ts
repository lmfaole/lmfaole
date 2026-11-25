import { strict as assert } from "node:assert"
import { test } from "node:test"

import {
  discussionSpans, discussionSteps, discussionTimeline, issueSpans, issueSteps, issueTimeline, prSpans, prSteps, prTimeline, truncatedNote,
  type DiscussionComment, type DiscussionInput, type IssueInput, type PullInput, type TimelineItem,
} from "./timeline.ts"

const at = (hour: number): string => new Date(Date.UTC(2026, 10, 2, hour)).toISOString()
const NOW = at(100)
const actor = (login: string | null) => (login === null ? null : { login })
let n = 0
const id = () => `I${n++}`

const comment = (hour: number, login: string | null, body = "Hei"): TimelineItem => ({ __typename: "IssueComment", id: id(), url: "u", createdAt: at(hour), body, author: actor(login) })
const review = (hour: number, login: string, state: string, body = ""): TimelineItem => ({ __typename: "PullRequestReview", id: id(), url: "u", createdAt: at(hour), submittedAt: at(hour), state, body, author: actor(login) })
const commit = (hour: number, headline = "Fiks", login: string | null = "kari"): TimelineItem => ({
  __typename: "PullRequestCommit", id: id(), url: "u",
  commit: { oid: "abcdef1234", abbreviatedOid: "abcdef1", messageHeadline: headline, committedDate: at(hour), url: "c", author: { name: "Kari", user: actor(login) }, statusCheckRollup: null },
})
const event = <T extends TimelineItem["__typename"]>(__typename: T, hour: number, extra: Record<string, unknown> = {}, login: string | null = "kari"): TimelineItem =>
  ({ __typename, id: id(), url: "u", createdAt: at(hour), actor: actor(login), ...extra }) as TimelineItem

const pull = (items: TimelineItem[], over: Partial<PullInput> = {}): PullInput => ({
  url: "https://github.com/o/r/pull/1", author: "kari", created: at(0), state: "OPEN", draft: false, merged: null, closed: null,
  timeline: { items, total: items.length, truncated: false }, ...over,
})
const summaries = (events: { summary: string; actor?: { name: string } }[]) => events.map((e) => `${e.actor?.name ?? "-"} ${e.summary}`)
const states = (steps: { label: string; state: string }[]) => steps.map((step) => `${step.label}:${step.state}`)

test("a pull request's events read in Norwegian, oldest first, also where GitHub has them out of order", () => {
  const events = prTimeline(pull([
    review(5, "ola", "CHANGES_REQUESTED", "Se på dette"),
    commit(3, "Første"),
    event("ReviewRequestedEvent", 2, { requestedReviewer: { login: "ola" } }),
    event("LabeledEvent", 1, { label: { name: "bug", color: "f00" } }),
    event("UnlabeledEvent", 6, { label: { name: "bug", color: "f00" } }),
    event("HeadRefForcePushedEvent", 7, { beforeCommit: { abbreviatedOid: "aaa" }, afterCommit: { abbreviatedOid: "bbb" } }),
    review(8, "ola", "APPROVED"),
    event("AssignedEvent", 9, { assignee: { login: "kari" } }),
    event("AssignedEvent", 9, { assignee: { login: "ola" } }),
    comment(10, null),
  ]))
  assert.deepEqual(summaries(events), [
    "kari åpnet", "kari la til etiketten bug", "kari ba ola om review", "kari dyttet commit", "ola ba om endringer", "kari fjernet etiketten bug",
    "kari force-pushet", "ola godkjente", "kari tildelte seg selv", "kari tildelte ola", "ukjent kommenterte",
  ])
  const byText = Object.fromEntries(events.map((e) => [e.summary, e]))
  assert.equal(byText["ba om endringer"]?.kind, "comment")
  assert.equal(byText["ba om endringer"]?.markdown, "Se på dette")
  assert.equal(byText["ba om endringer"]?.tone, "warning")
  assert.equal(byText["godkjente"]?.kind, "event")
  assert.equal(byText["godkjente"]?.tone, "success")
  assert.deepEqual(byText["dyttet commit"]?.target, { label: "Første (abcdef1)", href: "c" })
  assert.equal(byText["dyttet commit"]?.group, "commit")
  assert.equal(byText["force-pushet"]?.target?.label, "aaa → bbb")
  assert.equal(byText["kommenterte"]?.actor?.avatar, undefined)
  assert.equal(events[0]?.actor?.avatar, "https://github.com/kari.png?size=40")
})

test("a merge is said once, a close without one is danger, and a dismissed review is marked", () => {
  const merged = prTimeline(pull([event("MergedEvent", 5, { mergeRefName: "main" }), event("ClosedEvent", 5, { stateReason: null })], { state: "MERGED", merged: at(5), closed: at(5) }))
  assert.deepEqual(summaries(merged), ["kari åpnet", "kari merget inn i main"])
  assert.equal(merged[1]?.tone, "accent")
  const closed = prTimeline(pull([event("ClosedEvent", 5, { stateReason: null }), event("ReopenedEvent", 6), review(7, "ola", "DISMISSED", "Nei")], { state: "OPEN" }))
  assert.deepEqual(summaries(closed), ["kari åpnet", "kari lukket", "kari åpnet på nytt", "ola la igjen en review"])
  assert.equal(closed[1]?.tone, "danger")
  assert.equal(closed[3]?.badge, "Avvist")
})

test("steps: an open pull request ready for review waits for one", () => {
  assert.deepEqual(states(prSteps(pull([commit(1)]), NOW)), ["Åpnet:done", "Klar for review:done", "Review:current", "Godkjent:upcoming", "Merget:upcoming"])
})

test("steps: a draft is not ready, and is ready from when it is marked so", () => {
  assert.deepEqual(states(prSteps(pull([], { draft: true }), NOW)), ["Åpnet:done", "Klar for review:current", "Review:upcoming", "Godkjent:upcoming", "Merget:upcoming"])
  const steps = prSteps(pull([event("ReadyForReviewEvent", 3), event("ConvertToDraftEvent", 4)], { draft: true }), NOW)
  assert.equal(steps[1]?.at, at(3))
  assert.equal(steps[2]?.state, "current")
})

test("steps: approval counts only after the last request for changes, the first of several", () => {
  const items = [review(2, "ola", "APPROVED"), review(3, "per", "CHANGES_REQUESTED"), commit(4), review(5, "per", "APPROVED"), review(6, "ola", "APPROVED")]
  const steps = prSteps(pull(items, { state: "MERGED", merged: at(7), closed: at(7) }), NOW)
  assert.deepEqual(states(steps), ["Åpnet:done", "Klar for review:done", "Review:done", "Godkjent:done", "Merget:done"])
  assert.equal(steps[2]?.at, at(2))
  assert.equal(steps[3]?.at, at(5))
  assert.equal(prSteps(pull([review(2, "ola", "APPROVED"), review(3, "per", "CHANGES_REQUESTED")]), NOW)[3]?.state, "current")
})

test("steps: a merge without review skips them; a close without merge fails and skips the rest", () => {
  assert.deepEqual(states(prSteps(pull([], { state: "MERGED", merged: at(3), closed: at(3) }), NOW)), ["Åpnet:done", "Klar for review:done", "Review:skipped", "Godkjent:skipped", "Merget:done"])
  assert.deepEqual(states(prSteps(pull([event("ClosedEvent", 3, { stateReason: null })], { state: "CLOSED", closed: at(3) }), NOW)), ["Åpnet:done", "Klar for review:done", "Review:skipped", "Godkjent:skipped", "Lukket:failed"])
  const reopened = pull([event("ClosedEvent", 3, { stateReason: null }), event("ReopenedEvent", 4)])
  assert.deepEqual(states(prSteps(reopened, NOW)), ["Åpnet:done", "Klar for review:done", "Review:current", "Godkjent:upcoming", "Merget:upcoming"])
})

const lanes = (spans: { label: string; start: string; end?: string }[]) => spans.map((span) => `${span.label} ${span.start.slice(11, 13)}-${span.end?.slice(11, 13) ?? "nå"}`)

test("spans: draft, ready, draft again; waiting is open until now", () => {
  const spans = prSpans(pull([event("ReadyForReviewEvent", 2), event("ConvertToDraftEvent", 4), event("ReadyForReviewEvent", 6)], { draft: false }), NOW)
  assert.deepEqual(lanes(spans), ["Åpen 00-nå", "Utkast 00-02", "Venter på review 02-04", "Utkast 04-06", "Venter på review 06-nå"])
})

test("spans: changes requested until the next commit, review requests wait until the next review, all end at the merge", () => {
  const items = [event("ReviewRequestedEvent", 1, { requestedReviewer: { name: "team" } }), review(2, "ola", "CHANGES_REQUESTED"), commit(4), event("ReviewRequestedEvent", 5, { requestedReviewer: { login: "ola" } }), review(7, "ola", "APPROVED"), event("MergedEvent", 8, { mergeRefName: "main" })]
  const spans = prSpans(pull(items, { state: "MERGED", merged: at(8), closed: at(8) }), NOW)
  assert.deepEqual(lanes(spans), ["Åpen 00-08", "Venter på review 00-02", "Endringer etterspurt 02-04", "Venter på review 05-07"])
})

test("spans and steps: a bot's review request and review neither start nor end the wait", () => {
  const items = [event("ReviewRequestedEvent", 1, { requestedReviewer: { login: "Copilot" } }), review(2, "Copilot", "COMMENTED", "Oversikt"), review(6, "ola", "APPROVED")]
  assert.deepEqual(lanes(prSpans(pull(items), NOW)), ["Åpen 00-nå", "Venter på review 00-06"])
  assert.equal(prSteps(pull(items), NOW).find((step) => step.label === "Review")?.at, at(6))
})

test("spans: a reopened pull request has two open spans, and the time it was closed waits for nothing", () => {
  const spans = prSpans(pull([event("ClosedEvent", 2, { stateReason: null }), event("ReopenedEvent", 5)]), NOW)
  assert.deepEqual(lanes(spans), ["Åpen 00-02", "Venter på review 00-02", "Åpen 05-nå", "Venter på review 05-nå"])
})

const issue = (items: TimelineItem[], over: Partial<IssueInput> = {}): IssueInput => ({
  url: "https://github.com/o/r/issues/1", author: "kari", created: at(0), state: "OPEN", stateReason: null, closed: null, assignees: [],
  timeline: { items, total: items.length, truncated: false }, ...over,
})

test("an issue: references, closes with a reason, steps and how long it had no owner", () => {
  const items = [
    event("CrossReferencedEvent", 1, { willCloseTarget: true, source: { __typename: "PullRequest", number: 7, title: "Fiks", url: "p" } }),
    event("AssignedEvent", 2, { assignee: { login: "ola" } }),
    event("ClosedEvent", 3, { stateReason: "NOT_PLANNED" }, null),
  ]
  const closed = issue(items, { state: "CLOSED", stateReason: "NOT_PLANNED", closed: at(3), assignees: ["ola"] })
  const events = issueTimeline(closed)
  assert.deepEqual(summaries(events), ["kari åpnet", "kari lenket en pull request som lukker saken:", "kari tildelte ola", "ukjent lukket som ikke planlagt"])
  assert.deepEqual(events[1]?.target, { label: "#7 Fiks", href: "p" })
  assert.deepEqual(states(issueSteps(closed, NOW)), ["Åpnet:done", "Tildelt:done", "Lukket som ikke planlagt:done"])
  assert.deepEqual(lanes(issueSpans(closed, NOW)), ["Åpen 00-03", "Uten eier 00-02"])
  assert.equal(issueTimeline(issue([event("ClosedEvent", 3, { stateReason: "COMPLETED" })]))[1]?.summary, "lukket som fullført")
})

test("an open issue with nobody on it: no owner until now; one closed without assignment skips that step", () => {
  assert.deepEqual(states(issueSteps(issue([]), NOW)), ["Åpnet:done", "Tildelt:current", "Lukket:upcoming"])
  assert.deepEqual(lanes(issueSpans(issue([]), NOW)), ["Åpen 00-nå", "Uten eier 00-nå"])
  assert.deepEqual(states(issueSteps(issue([], { state: "CLOSED", stateReason: "COMPLETED", closed: at(4) }), NOW)), ["Åpnet:done", "Tildelt:skipped", "Lukket som fullført:done"])
  // Assigned before the oldest item there is: reached, but when is not known, and no span is made up.
  const old = issue([], { assignees: ["ola"] })
  assert.equal(issueSteps(old, NOW)[1]?.state, "done")
  assert.deepEqual(lanes(issueSpans(old, NOW)), ["Åpen 00-nå"])
})

test("a timeline that does not reach back says so", () => {
  assert.equal(truncatedNote({ items: [comment(1, "a")], total: 230, truncated: true }), "Viser de siste 1 av 230 hendelser.")
  assert.equal(truncatedNote({ items: [], total: 0, truncated: false }), null)
})

const reply = (hour: number, login: string | null, over: Partial<DiscussionComment> = {}): DiscussionComment => ({ id: id(), url: "d", createdAt: at(hour), body: "Svar", author: actor(login), isAnswer: false, replies: 0, upvotes: 0, ...over })
const discussion = (items: DiscussionComment[], over: Partial<DiscussionInput> = {}): DiscussionInput => ({
  url: "https://github.com/o/r/discussions/1", author: "kari", created: at(0), answered: null, closed: null, answerChosen: null, answerChosenBy: null,
  thread: { items, total: items.length, truncated: false }, ...over,
})

test("a discussion: its answer is marked, and it waits for a reply from somebody else", () => {
  const answered = discussion([reply(1, "kari"), reply(3, "ola", { isAnswer: true, replies: 2 })], { answered: true, answerChosen: at(5), answerChosenBy: "kari" })
  const events = discussionTimeline(answered)
  assert.deepEqual(summaries(events), ["kari åpnet", "kari kommenterte", "ola kommenterte", "kari valgte svaret til ola"])
  assert.equal(events[2]?.badge, "Svar")
  assert.equal(events[2]?.target?.label, "2 svar i tråden")
  assert.deepEqual(states(discussionSteps(answered, NOW)), ["Åpnet:done", "Første svar:done", "Besvart:done"])
  assert.equal(discussionSteps(answered, NOW)[1]?.at, at(3))
  assert.deepEqual(lanes(discussionSpans(answered, NOW)), ["Åpen 00-nå", "Venter på svar 00-03", "Ubesvart 00-05"])
})

test("a discussion with no answer yet, and one in a category without answers that was closed", () => {
  const waiting = discussion([], { answered: false })
  assert.deepEqual(states(discussionSteps(waiting, NOW)), ["Åpnet:done", "Første svar:current", "Besvart:upcoming"])
  assert.deepEqual(lanes(discussionSpans(waiting, NOW)), ["Åpen 00-nå", "Venter på svar 00-nå", "Ubesvart 00-nå"])
  const closed = discussion([reply(2, null)], { closed: at(4) })
  assert.deepEqual(states(discussionSteps(closed, NOW)), ["Åpnet:done", "Første svar:done", "Lukket:done"])
  assert.deepEqual(summaries(discussionTimeline(closed)), ["kari åpnet", "ukjent kommenterte", "- ble lukket"])
  assert.deepEqual(lanes(discussionSpans(closed, NOW)), ["Åpen 00-04", "Venter på svar 00-02"])
})
