import { strict as assert } from "node:assert"
import { test } from "node:test"

import { groupIssues, LIMIT, type IssueItem } from "./issues.ts"

const NOW = new Date("2026-11-18T10:00:00Z")
const day = (daysAgo: number) => new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString()
const issue = (n: number, o: Partial<IssueItem> & { created?: string; updated?: string } = {}): IssueItem => ({
  key: String(n), href: `https://github.com/o/r/issues/${n}`, title: `Issue ${n}`, repo: "o/r", created: day(20), updated: day(1), assignees: [], ...o,
})
const keys = (groups: ReturnType<typeof groupIssues>) => groups.map((group) => [group.id, group.items.map((item) => item.key)])

test("the groups come in the order of what is for you, and empty ones are left out", () => {
  const groups = groupIssues({
    assigned: [issue(1, { assignees: ["me"] })],
    involved: [issue(2)],
    recent: [issue(3, { created: day(2) }), issue(4)],
  }, NOW)
  assert.deepEqual(keys(groups), [["assigned", ["1"]], ["involved", ["2"]], ["new", ["3"]], ["recent", ["4"]]])
  assert.deepEqual(groups.map((group) => group.title), ["Tildelt deg", "Du er involvert i", "Nye uten eier", "Nylig aktive"])
  assert.deepEqual(groupIssues({ assigned: [], involved: [], recent: [] }, NOW), [])
  assert.deepEqual(keys(groupIssues({ assigned: [], involved: [], recent: [issue(4)] }, NOW)), [["recent", ["4"]]])
})

test("an issue is only in the first group it belongs to", () => {
  const mine = issue(1, { assignees: ["me"], created: day(1) })
  const groups = groupIssues({ assigned: [mine], involved: [mine, issue(2, { created: day(1) })], recent: [mine, issue(2, { created: day(1) }), issue(3, { created: day(1) })] }, NOW)
  assert.deepEqual(keys(groups), [["assigned", ["1"]], ["involved", ["2"]], ["new", ["3"]]])
})

test("new means made in the last week and with nobody on it", () => {
  const groups = groupIssues({
    assigned: [], involved: [],
    recent: [issue(1, { created: day(6) }), issue(2, { created: day(8) }), issue(3, { created: day(1), assignees: ["kari"] })],
  }, NOW)
  assert.deepEqual(keys(groups), [["new", ["1"]], ["recent", ["2", "3"]]])
})

test("most recently moved first, the new ones newest first, at most ten", () => {
  const many = Array.from({ length: 14 }, (_, i) => issue(i + 1, { updated: day(i + 1) }))
  const [recent] = groupIssues({ assigned: [], involved: [], recent: many }, NOW)
  assert.equal(recent?.items.length, LIMIT)
  assert.deepEqual(recent?.items.map((item) => item.key), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"])
  const fresh = groupIssues({ assigned: [], involved: [], recent: [issue(1, { created: day(5) }), issue(2, { created: day(1) }), issue(3, { created: day(3) })] }, NOW)
  assert.deepEqual(keys(fresh), [["new", ["2", "3", "1"]]])
})

test("the week is counted in Oslo dates", () => {
  // 18 Nov 10:00Z minus 7 days is the 11th: made on the 11th counts, the 10th does not.
  const groups = groupIssues({ assigned: [], involved: [], recent: [issue(1, { created: "2026-11-11T00:30:00+01:00" }), issue(2, { created: "2026-11-10T23:30:00+01:00" })] }, NOW)
  assert.deepEqual(keys(groups), [["new", ["1"]], ["recent", ["2"]]])
})
