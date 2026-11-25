import { strict as assert } from "node:assert"
import { test } from "node:test"

import { countsOf, summaryItems } from "./summary.ts"
import type { Group, Entry } from "./pulls.ts"
import type { IssueGroup } from "./issues.ts"
import type { DiscussionGroup } from "./discussions.ts"

const entries = (n: number): Entry[] => Array.from({ length: n }, (_, i) => ({ whose: "mine" as const, item: { key: String(i), href: "h", title: "t", repo: "r", created: "", updated: "" } }))
const pull = (id: Group["id"], n: number): Group => ({ id, title: id, entries: entries(n) })
const issue = (id: IssueGroup["id"], n: number): IssueGroup => ({ id, title: id, items: Array.from({ length: n }, (_, i) => ({ key: String(i), href: "h", title: "t", repo: "r", created: "", updated: "", assignees: [] })) })
const discussion = (id: DiscussionGroup["id"], n: number): DiscussionGroup => ({ id, title: id, items: Array.from({ length: n }, (_, i) => ({ key: String(i), href: "h", title: "t", repo: "r", category: "", comments: 0, answered: null, created: "", updated: "" })) })

test("the counts that are for the reader, each a link to its group, and none for what is zero", () => {
  const items = summaryItems("/start", { pulls: [pull("blocked", 2), pull("review", 14), pull("waiting", 5)], issues: [issue("assigned", 1), issue("recent", 9)], discussions: [discussion("unanswered", 2), discussion("involved", 18)] })
  assert.deepEqual(items.map((item) => [item.key, item.count, item.href]), [
    ["blocked", 2, "/start/pull-requests#pulls-blocked"],
    ["review", 14, "/start/pull-requests#pulls-review"],
    ["assigned", 1, "/start/issues#issues-assigned"],
    ["unanswered", 2, "/start/discussions#discussions-unanswered"],
  ])
  assert.equal(items[0]?.tone, "destructive")
  assert.equal(items[1]?.tone, undefined)
})

test("what is red or new comes with the counts: failing CI first, as it stops something", () => {
  const items = summaryItems("/start", { pulls: [], issues: [], discussions: [], alerts: { ci: 2, replies: 3, dependabot: 5 } })
  assert.deepEqual(items.map((item) => [item.key, item.count, item.href]), [
    ["ci", 2, "/start/varsler#alerts-ci"],
    ["replies", 3, "/start/varsler#alerts-replies"],
    ["dependabot", 5, "/start/varsler#alerts-dependabot"],
  ])
  assert.equal(items[0]?.tone, "destructive")
  assert.deepEqual(summaryItems("/start", { pulls: [], issues: [], discussions: [], alerts: { ci: 0, replies: 0, dependabot: 0 } }), [])
})

test("nothing for the reader is nothing", () => {
  assert.deepEqual(summaryItems("/start", { pulls: [], issues: [], discussions: [] }), [])
  assert.deepEqual(summaryItems("/start", { pulls: [pull("waiting", 3), pull("drafts", 1)], issues: [issue("recent", 4)], discussions: [] }), [])
})

test("each part gets its own counts, so they stand in its section", () => {
  const items = summaryItems("/start", { pulls: [pull("blocked", 1), pull("review", 2)], issues: [issue("assigned", 3)], discussions: [], alerts: { ci: 1, replies: 0, dependabot: 4 } })
  assert.deepEqual(countsOf(items, "pulls").map((item) => item.key), ["blocked", "review"])
  assert.deepEqual(countsOf(items, "alerts").map((item) => item.key), ["ci", "dependabot"])
  assert.deepEqual(countsOf(items, "issues").map((item) => item.key), ["assigned"])
  assert.deepEqual(countsOf(items, "discussions"), [])
})
