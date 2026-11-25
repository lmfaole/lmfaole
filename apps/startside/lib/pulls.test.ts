import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { PullStatus } from "./pr-status.ts"
import { classify, groupPulls, type PullItem } from "./pulls.ts"

const ok: PullStatus = { draft: false, checks: "SUCCESS", review: "APPROVED", mergeable: "MERGEABLE", openThreads: 0, author: "kari", size: null }
const pr = (n: number, status?: Partial<PullStatus> | null, when = { created: "2026-11-10T10:00:00Z", updated: "2026-11-17T10:00:00Z" }): PullItem => ({
  key: String(n), href: `https://github.com/o/r/pull/${n}`, title: `PR ${n}`, repo: "o/r", ...when, ...(status === null ? {} : { status: { ...ok, ...status } }),
})

test("one of mine: blocked, ready, waiting or a draft", () => {
  assert.equal(classify(pr(1, { checks: "FAILURE" }), "mine"), "blocked")
  assert.equal(classify(pr(1, { mergeable: "CONFLICTING" }), "mine"), "blocked")
  assert.equal(classify(pr(1, { review: "CHANGES_REQUESTED" }), "mine"), "blocked")
  assert.equal(classify(pr(1, { openThreads: 1 }), "mine"), "blocked")
  assert.equal(classify(pr(1), "mine"), "ready")
  assert.equal(classify(pr(1, { review: null, checks: "SUCCESS" }), "mine"), "ready")
  assert.equal(classify(pr(1, { review: "APPROVED", checks: null }), "mine"), "ready")
  assert.equal(classify(pr(1, { review: "REVIEW_REQUIRED" }), "mine"), "waiting")
  assert.equal(classify(pr(1, { review: "APPROVED", checks: "PENDING" }), "mine"), "waiting")
  assert.equal(classify(pr(1, { review: null, checks: null }), "mine"), "waiting")
  assert.equal(classify(pr(1, { draft: true, checks: "FAILURE" }), "mine"), "drafts")
})

test("one of mine that GitHub would not let the token read is just open", () => {
  assert.equal(classify(pr(1, null), "mine"), "open")
})

test("one waiting for my review: a review, unless it is a draft or red", () => {
  assert.equal(classify(pr(1), "theirs"), "review")
  assert.equal(classify(pr(1, { mergeable: "CONFLICTING" }), "theirs"), "review")
  assert.equal(classify(pr(1, { draft: true }), "theirs"), "notReady")
  assert.equal(classify(pr(1, { checks: "ERROR" }), "theirs"), "notReady")
  assert.equal(classify(pr(1, null), "theirs"), "review")
})

test("the groups come in the order of what needs me most, and empty ones are left out", () => {
  const groups = groupPulls({
    reviews: [pr(1), pr(2, { draft: true })],
    mine: [pr(3, { review: "REVIEW_REQUIRED" }), pr(4, { checks: "FAILURE" }), pr(5), pr(6, { draft: true }), pr(7, null)],
  })
  assert.deepEqual(groups.map((group) => [group.id, group.entries.map((entry) => entry.item.key)]), [
    ["blocked", ["4"]], ["ready", ["5"]], ["review", ["1"]], ["waiting", ["3"]], ["notReady", ["2"]], ["drafts", ["6"]], ["open", ["7"]],
  ])
  assert.deepEqual(groupPulls({ reviews: [], mine: [pr(5)] }).map((group) => group.id), ["ready"])
  assert.deepEqual(groupPulls({ reviews: [], mine: [] }), [])
})

test("reviews go oldest first, the blocked longest-stuck first, the rest newest first", () => {
  const at = (day: number) => ({ created: `2026-11-${String(day).padStart(2, "0")}T10:00:00Z`, updated: `2026-11-${String(day).padStart(2, "0")}T10:00:00Z` })
  const keys = (group: string, input: Parameters<typeof groupPulls>[0]) => groupPulls(input).find((g) => g.id === group)?.entries.map((e) => e.item.key)
  assert.deepEqual(keys("review", { reviews: [pr(1, {}, at(15)), pr(2, {}, at(11)), pr(3, {}, at(13))], mine: [] }), ["2", "3", "1"])
  assert.deepEqual(keys("blocked", { reviews: [], mine: [pr(1, { checks: "FAILURE" }, at(15)), pr(2, { checks: "FAILURE" }, at(11))] }), ["2", "1"])
  assert.deepEqual(keys("waiting", { reviews: [], mine: [pr(1, { review: "REVIEW_REQUIRED" }, at(11)), pr(2, { review: "REVIEW_REQUIRED" }, at(15))] }), ["2", "1"])
})
