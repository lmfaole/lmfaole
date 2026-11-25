import { strict as assert } from "node:assert"
import { test } from "node:test"

import { ageLabels, compactLabels, checkLook, reviewStateText, pullNodes, readStatuses, statusLabels, toStatus, withStatus, type PullNode, type PullStatus } from "./pr-status.ts"

const base: PullStatus = { draft: false, checks: null, review: null, mergeable: "MERGEABLE", openThreads: 0, author: "kari", size: null }
const texts = (status: Partial<PullStatus>, whose: "mine" | "theirs") => statusLabels({ ...base, ...status }, whose).map((label) => label.text)

test("my pull request: checks, conflicts, review and open conversations", () => {
  assert.deepEqual(texts({ checks: "SUCCESS", review: "APPROVED" }, "mine"), ["Tester OK", "Godkjent"])
  assert.deepEqual(texts({ checks: "FAILURE", mergeable: "CONFLICTING", review: "CHANGES_REQUESTED", openThreads: 2 }, "mine"), ["Tester feilet", "Konflikter", "Endringer ønskes", "2 åpne kommentarer"])
  assert.deepEqual(texts({ checks: "PENDING", review: "REVIEW_REQUIRED", openThreads: 1 }, "mine"), ["Tester kjører", "Venter på review", "1 åpen kommentar"])
  assert.deepEqual(texts({ checks: "ERROR" }, "mine"), ["Tester feilet"])
})

test("a draft says so, and is not waiting for a review", () => {
  assert.deepEqual(texts({ draft: true, review: "REVIEW_REQUIRED" }, "mine"), ["Utkast"])
})

test("no checks and no decision say nothing", () => {
  assert.deepEqual(texts({}, "mine"), [])
})

test("a pull request waiting for my review: who wrote it, and whether it is ready", () => {
  assert.deepEqual(texts({ checks: "SUCCESS", review: "REVIEW_REQUIRED", openThreads: 3 }, "theirs"), ["av kari", "Tester OK"])
  assert.deepEqual(texts({ draft: true, checks: "FAILURE", author: null }, "theirs"), ["Utkast", "Tester feilet"])
})

test("what stops a pull request is marked, the rest is not", () => {
  const tones = (status: Partial<PullStatus>) => Object.fromEntries(statusLabels({ ...base, ...status }, "mine").map((label) => [label.text, label.tone]))
  assert.deepEqual(tones({ checks: "FAILURE", mergeable: "CONFLICTING", review: "APPROVED" }), { "Tester feilet": "destructive", Konflikter: "destructive", Godkjent: "default" })
})

test("GraphQL's answer becomes a status", () => {
  const node: PullNode = {
    databaseId: 1, url: "https://github.com/o/r/pull/1", title: "T", updatedAt: "2026-11-18T10:00:00Z", isDraft: false, reviewDecision: "APPROVED", mergeable: "UNKNOWN",
    repository: { nameWithOwner: "o/r" }, author: { login: "ola" },
    commits: { nodes: [{ commit: { statusCheckRollup: { state: "SUCCESS" } } }] },
    reviewThreads: { nodes: [{ isResolved: true }, { isResolved: false }, { isResolved: false }] },
    additions: 120, deletions: 30, changedFiles: 8,
  }
  assert.deepEqual(toStatus(node), { draft: false, checks: "SUCCESS", review: "APPROVED", mergeable: "UNKNOWN", openThreads: 2, author: "ola", size: { additions: 120, deletions: 30, files: 8 } })
  assert.equal(toStatus({ ...node, commits: { nodes: [] }, author: null }).checks, null)
  assert.equal(toStatus({ ...node, commits: { nodes: [{ commit: { statusCheckRollup: null } }] } }).checks, null)
})

test("hidden results (null) and results that are not pull requests are left out", () => {
  const node = { databaseId: 7 } as Partial<PullNode>
  assert.deepEqual(pullNodes([null, {}, node, null]), [node])
  assert.deepEqual(pullNodes([]), [])
})

const node = (n: number): PullNode => ({
  databaseId: n, url: `https://github.com/o/r/pull/${n}`, title: `T${n}`, updatedAt: "2026-11-18T10:00:00Z", isDraft: n === 2, reviewDecision: null, mergeable: "MERGEABLE",
  repository: { nameWithOwner: "o/r" }, author: null, commits: { nodes: [] }, reviewThreads: { nodes: [] }, additions: 0, deletions: 0, changedFiles: 0,
})

test("the list comes from the search, and GraphQL adds a status where it could read the pull request", () => {
  const items = [1, 2, 3].map((n) => ({ href: `https://github.com/o/r/pull/${n}`, title: `T${n}` }))
  const merged = withStatus(items, readStatuses({ data: { search: { nodes: [node(1), null, node(3)] } } }))
  assert.deepEqual(merged.map((item) => item.title), ["T1", "T2", "T3"])
  assert.deepEqual(merged.map((item) => item.status !== undefined), [true, false, true])
})

test("an answer without data leaves every item as it was", () => {
  const items = [{ href: "https://github.com/o/r/pull/1" }]
  assert.deepEqual(withStatus(items, readStatuses({})), items)
})

test("how big a pull request waiting for review is", () => {
  assert.deepEqual(texts({ size: { additions: 120, deletions: 30, files: 8 } }, "theirs"), ["av kari", "+120 −30 · 8 filer"])
  assert.deepEqual(texts({ size: { additions: 1, deletions: 0, files: 1 }, author: null }, "theirs"), ["+1 −0 · 1 fil"])
  assert.deepEqual(texts({ size: { additions: 5, deletions: 5, files: 2 } }, "mine"), [])
})

test("how long a review has waited, and how long one of mine has been quiet", () => {
  const now = new Date("2026-11-18T12:00:00Z")
  const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()
  const waited = (days: number) => ageLabels({ created: ago(days), updated: ago(0) }, "theirs", now)[0]
  assert.deepEqual(waited(0), { text: "Ny i dag", tone: "muted", icon: "time" })
  assert.deepEqual(waited(1), { text: "Venter 1 dag", tone: "default", icon: "time" })
  assert.deepEqual(waited(2), { text: "Venter 2 dager", tone: "default", icon: "time" })
  assert.deepEqual(waited(3), { text: "Venter 3 dager", tone: "destructive", icon: "time" })
  assert.deepEqual(ageLabels({ created: ago(9), updated: ago(2) }, "mine", now), [])
  assert.deepEqual(ageLabels({ created: ago(9), updated: ago(4) }, "mine", now), [{ text: "Stille i 4 dager", tone: "muted", icon: "time" }])
})

test("every status has a symbol that means what it says", () => {
  const icons = (status: Partial<PullStatus>, whose: "mine" | "theirs") => Object.fromEntries(statusLabels({ ...base, ...status }, whose).map((label) => [label.text, label.icon]))
  assert.deepEqual(icons({ checks: "FAILURE", mergeable: "CONFLICTING", review: "CHANGES_REQUESTED", openThreads: 1 }, "mine"), { "Tester feilet": "failure", Konflikter: "warning", "Endringer ønskes": "changes", "1 åpen kommentar": "discussion" })
  assert.deepEqual(icons({ checks: "SUCCESS", review: "APPROVED" }, "mine"), { "Tester OK": "success", Godkjent: "success" })
  assert.deepEqual(icons({ checks: "PENDING", review: "REVIEW_REQUIRED" }, "mine"), { "Tester kjører": "pending", "Venter på review": "waiting" })
  assert.deepEqual(icons({ draft: true }, "mine"), { Utkast: "pull-request-draft" })
})

test("what a reviewer did, in words", () => {
  assert.equal(reviewStateText("APPROVED"), "godkjent")
  assert.equal(reviewStateText("CHANGES_REQUESTED"), "ønsker endringer")
  assert.equal(reviewStateText("COMMENTED"), "kommenterte")
  assert.equal(reviewStateText("PENDING"), "venter")
})

test("a check as a symbol and words: what failed is marked, the rest is quiet", () => {
  assert.deepEqual(checkLook("SUCCESS"), { icon: "success", text: "OK", tone: "muted" })
  for (const failed of ["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED"]) assert.deepEqual(checkLook(failed), { icon: "failure", text: "Feilet", tone: "destructive" }, failed)
  for (const running of ["PENDING", "IN_PROGRESS", "QUEUED", "EXPECTED"]) assert.equal(checkLook(running).icon, "pending", running)
  assert.equal(checkLook("SKIPPED").text, "Hoppet over")
})

test("a compact row keeps what stops something first, then the rest in order", () => {
  const label = (text: string, tone: "default" | "muted" | "destructive") => ({ text, tone, icon: "info" as const })
  const labels = [label("av kari", "muted"), label("+1 −1", "muted"), label("Tester OK", "default"), label("Venter 5 dager", "destructive")]
  assert.deepEqual(compactLabels(labels, 2).map((l) => l.text), ["Venter 5 dager", "av kari"])
  assert.deepEqual(compactLabels(labels, 1).map((l) => l.text), ["Venter 5 dager"])
  assert.deepEqual(compactLabels(labels.slice(0, 2), 2).map((l) => l.text), ["av kari", "+1 −1"])
  assert.deepEqual(compactLabels([], 2), [])
})
