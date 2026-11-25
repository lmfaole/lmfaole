import { strict as assert } from "node:assert"
import { test } from "node:test"

import { ciFailures, fromOthers, replyText, type InvolvedNode, type RepoNode } from "./alerts.ts"

const repo = (name: string, state: string | null, committedDate: string, extra: Partial<RepoNode> = {}): RepoNode => ({
  nameWithOwner: name, isArchived: false,
  defaultBranchRef: { name: "main", target: { oid: "abc", url: `https://github.com/${name}/commit/abc`, messageHeadline: `fix in ${name}`, committedDate, statusCheckRollup: state === null ? null : { state } } },
  ...extra,
})

test("only a red default branch is a failure, newest first, with the checks as the address", () => {
  const failures = ciFailures([repo("o/a", "SUCCESS", "2026-11-18T10:00:00Z"), repo("o/b", "FAILURE", "2026-11-17T10:00:00Z"), repo("o/c", "ERROR", "2026-11-18T09:00:00Z"), repo("o/d", "PENDING", "2026-11-18T11:00:00Z"), repo("o/e", null, "2026-11-18T12:00:00Z")])
  assert.deepEqual(failures.map((failure) => failure.repo), ["o/c", "o/b"])
  assert.equal(failures[0]?.href, "https://github.com/o/c/commit/abc/checks")
  assert.equal(failures[0]?.headline, "fix in o/c")
})

test("archived repositories, repositories without a branch and the same repository twice are left out", () => {
  const failing = repo("o/a", "FAILURE", "2026-11-18T10:00:00Z")
  assert.deepEqual(ciFailures([failing, failing, null, repo("o/old", "FAILURE", "2026-11-18T10:00:00Z", { isArchived: true }), { nameWithOwner: "o/empty", isArchived: false, defaultBranchRef: null }]).map((failure) => failure.repo), ["o/a"])
  assert.deepEqual(ciFailures([]), [])
})

const NOW = new Date("2026-11-18T12:00:00Z")
const node = (id: string, comment?: { login: string; at: string }, review?: { login: string; at: string; state: string }): InvolvedNode => ({
  id, url: `https://github.com/o/r/pull/${id}`, title: `T${id}`, repository: { nameWithOwner: "o/r" },
  comments: { nodes: comment === undefined ? [] : [{ author: { login: comment.login }, createdAt: comment.at }] },
  reviews: { nodes: review === undefined ? [] : [{ author: { login: review.login }, submittedAt: review.at, state: review.state }] },
})

test("things where somebody else wrote last, newest first; where you did, nothing", () => {
  const replies = fromOthers([
    node("1", { login: "kari", at: "2026-11-18T08:00:00Z" }),
    node("2", { login: "lmfaole", at: "2026-11-18T09:00:00Z" }),
    node("3", { login: "ola", at: "2026-11-18T10:00:00Z" }),
  ], "lmfaole", NOW)
  assert.deepEqual(replies.map((reply) => [reply.key, reply.who, reply.what]), [["3", "ola", "comment"], ["1", "kari", "comment"]])
})

test("a review newer than the last comment is what counts, with what it said", () => {
  const replies = fromOthers([
    node("1", { login: "kari", at: "2026-11-18T08:00:00Z" }, { login: "ola", at: "2026-11-18T09:00:00Z", state: "APPROVED" }),
    node("2", undefined, { login: "ola", at: "2026-11-18T09:30:00Z", state: "CHANGES_REQUESTED" }),
    node("3", undefined, { login: "ola", at: "2026-11-18T09:40:00Z", state: "COMMENTED" }),
  ], "lmfaole", NOW)
  assert.deepEqual(replies.map((reply) => [reply.key, reply.what]), [["3", "review"], ["2", "changes"], ["1", "approved"]])
  assert.equal(replyText("approved"), "godkjente")
  assert.equal(replyText("changes"), "ønsker endringer")
  assert.equal(replyText("comment"), "kommenterte")
})

test("only the last few days, counted in Oslo dates, and nothing for a thing nobody has written on", () => {
  // The 18th minus three days is the 15th. 14 Nov 23:30Z is 00:30 on the 15th in Oslo, so it counts; 14 Nov 22:30Z is 23:30 on the 14th, so it does not.
  const replies = fromOthers([node("in", { login: "kari", at: "2026-11-14T23:30:00Z" }), node("out", { login: "kari", at: "2026-11-14T22:30:00Z" }), node("none")], "lmfaole", NOW, 3)
  assert.deepEqual(replies.map((reply) => reply.key), ["in"])
  assert.deepEqual(fromOthers([node("1", { login: "kari", at: "2026-11-10T08:00:00Z" })], "lmfaole", NOW), [])
  assert.deepEqual(fromOthers([null, {}], "lmfaole", NOW), [])
})
