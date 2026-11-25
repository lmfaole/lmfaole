import { strict as assert } from "node:assert"
import { test } from "node:test"

import { MAX_NEW, readSummaries, refreshSummaries, summaryCandidates, summaryRef, summaryVariables, SUMMARIES_KEY, type SummaryStore } from "./summaries.ts"

const node = (repo: string, number: number, updatedAt: string, more: Record<string, unknown> = {}) => ({
  __typename: "PullRequest",
  number,
  title: `Tittel ${number}`,
  body: "Beskrivelse",
  updatedAt,
  repository: { nameWithOwner: repo, isPrivate: false, visibility: "PUBLIC" },
  comments: { nodes: [{ author: { login: "a" }, body: "hei" }] },
  ...more,
})

function memory(initial: Record<string, string> = {}): SummaryStore & { data: Record<string, string>; writes: string[] } {
  const data = { ...initial }
  const writes: string[] = []
  return {
    data,
    writes,
    get: async (key) => data[key] ?? null,
    put: async (key, value) => {
      data[key] = value
      writes.push(key)
    },
  }
}

test("every search is the user's, open where it can be, and public", () => {
  const variables = summaryVariables("lmfaole", "fremtind")
  for (const query of Object.values(variables)) assert.match(query, /(^|\s)is:public(\s|$)/)
  assert.match(variables["reviews"] ?? "", /review-requested:lmfaole/)
  assert.throws(() => summaryVariables("me is:private", undefined))
})

test("only public items are candidates, each once, the newest first", () => {
  const data = {
    involved: { nodes: [node("Me/A", 1, "2026-11-20T10:00:00Z"), node("me/secret", 2, "2026-11-21T10:00:00Z", { repository: { nameWithOwner: "me/secret", isPrivate: true, visibility: "PRIVATE" } }), null] },
    reviews: { nodes: [node("me/a", 1, "2026-11-20T10:00:00Z"), node("me/b", 3, "2026-11-22T10:00:00Z", { __typename: "Issue" }), node("me/c", 4, "2026-11-23T10:00:00Z", { repository: { nameWithOwner: "me/c", visibility: "INTERNAL", isPrivate: false } })] },
    discussions: { nodes: [node("me/d", 5, "2026-11-19T10:00:00Z", { __typename: "Discussion", repository: { nameWithOwner: "me/d" } })] },
  }
  const found = summaryCandidates(data)
  assert.deepEqual(found.map((c) => [c.ref, c.kind]), [["me/b#3", "issue"], ["me/a#1", "pull request"]])
  assert.deepEqual(found[1]?.input, { title: "Tittel 1", body: "Beskrivelse", comments: ["a: hei"] })
  assert.equal(summaryRef("LmFaole/X", 7), "lmfaole/x#7")
})

test("a run makes at most MAX_NEW, newest first, keeps what has not changed, and writes only when anything did", async () => {
  const nodes = Array.from({ length: MAX_NEW + 2 }, (_, i) => node("me/a", i + 1, `2026-11-2${i}T10:00:00Z`))
  const ask = async () => ({ involved: { nodes } })
  const asked: string[] = []
  const run = async (messages: { content: string }[]) => {
    asked.push(messages[1]?.content ?? "")
    return { response: "En kort oppsummering av saken." }
  }
  const store = memory()
  const first = await refreshSummaries(store, ask, run, Date.UTC(2026, 10, 22))
  assert.deepEqual([first.candidates, first.made, first.kept, first.written], [MAX_NEW + 2, MAX_NEW, MAX_NEW, true])
  assert.deepEqual(Object.keys(readSummaries(store.data[SUMMARIES_KEY] ?? null).items).sort(), ["me/a#3", "me/a#4"])

  const second = await refreshSummaries(store, ask, run, Date.UTC(2026, 10, 22))
  assert.deepEqual([second.made, second.kept], [MAX_NEW, MAX_NEW + 2])
  const third = await refreshSummaries(store, ask, run, Date.UTC(2026, 10, 22))
  assert.deepEqual([third.made, third.written], [0, false])
  assert.equal(asked.length, MAX_NEW * 2)
  assert.equal(store.writes.length, 2)
})

test("a changed text is made again, one gone is dropped, and a failing model keeps the old one", async () => {
  const store = memory()
  const run = async () => ({ response: "En kort oppsummering av saken." })
  await refreshSummaries(store, async () => ({ involved: { nodes: [node("me/a", 1, "2026-11-20T10:00:00Z"), node("me/a", 2, "2026-11-20T09:00:00Z")] } }), run, 0)
  const failing = async () => {
    throw new Error("nei")
  }
  const changed = await refreshSummaries(store, async () => ({ involved: { nodes: [node("me/a", 1, "2026-11-21T10:00:00Z", { body: "Ny tekst" })] } }), failing, 0)
  assert.deepEqual([changed.made, changed.failed, changed.kept, changed.written], [0, 1, 1, true])
  assert.deepEqual(Object.keys(readSummaries(store.data[SUMMARIES_KEY] ?? null).items), ["me/a#1"])
  assert.deepEqual(readSummaries("not json"), { version: 1, items: {} })
})
