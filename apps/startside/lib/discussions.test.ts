import { strict as assert } from "node:assert"
import { test } from "node:test"

import { discussionNodes, groupDiscussions, LIMIT, type DiscussionItem, type DiscussionNode } from "./discussions.ts"

const item = (n: number, updated = `2026-11-${String(10 + n).padStart(2, "0")}T10:00:00Z`): DiscussionItem => ({
  key: String(n), href: `https://github.com/o/r/discussions/${n}`, title: `D${n}`, repo: "o/r", category: "Q&A", comments: n, answered: null, created: "2026-11-01T10:00:00Z", updated,
})
const keys = (groups: ReturnType<typeof groupDiscussions>) => groups.map((group) => [group.id, group.items.map((i) => i.key)])

const question = (n: number, answered: boolean): DiscussionItem => ({ ...item(n), answered })

test("the ones you are in first, then the unanswered questions, then what moved lately, each in the first group it belongs to", () => {
  const groups = groupDiscussions({ involved: [item(1), question(2, false)], recent: [question(2, false), question(3, false), question(4, true), item(5)] })
  assert.deepEqual(keys(groups), [["involved", ["2", "1"]], ["unanswered", ["3"]], ["recent", ["5", "4"]]])
  assert.deepEqual(groups.map((group) => group.title), ["Du er med i", "Ubesvarte spørsmål", "Nylig aktive"])
})

test("only a question can be unanswered: an idea or a change has no answer to wait for", () => {
  assert.deepEqual(keys(groupDiscussions({ involved: [], recent: [item(1), item(2)] })), [["recent", ["2", "1"]]])
})

test("empty groups are left out, and a group shows at most ten, the most recently moved first", () => {
  assert.deepEqual(groupDiscussions({ involved: [], recent: [] }), [])
  const many = Array.from({ length: 14 }, (_, i) => item(i + 1, new Date(Date.UTC(2026, 10, 1 + i)).toISOString()))
  const [group] = groupDiscussions({ involved: many, recent: [] })
  assert.equal(group?.items.length, LIMIT)
  assert.equal(group?.items[0]?.key, "14")
})

test("GraphQL's answer: hidden results and results that are not discussions are left out", () => {
  const node: DiscussionNode = { id: "D_1", url: "https://github.com/o/r/discussions/1", title: "T", createdAt: "2026-11-01T10:00:00Z", updatedAt: "2026-11-02T10:00:00Z", isAnswered: false, category: { name: "Ideer" }, comments: { totalCount: 3 }, repository: { nameWithOwner: "o/r" } }
  assert.deepEqual(discussionNodes([null, {}, node]), [{ key: "D_1", href: node.url, title: "T", repo: "o/r", category: "Ideer", comments: 3, answered: false, created: node.createdAt, updated: node.updatedAt }])
  assert.equal(discussionNodes([{ ...node, category: null }])[0]?.category, "")
  assert.deepEqual(discussionNodes([]), [])
})
