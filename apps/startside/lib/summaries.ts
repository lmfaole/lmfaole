// The AI summaries of the pull requests, issues and discussions the pages show (lib/ai.ts reads them): made by the scheduled job only
// (`scheduled` in worker.mjs, every 15 minutes), never because a page was opened, so an open page cannot spend the Workers AI
// allowance. At most `MAX_NEW` are made a run, only for what is new or has changed (a fingerprint of what the model is given), for the
// `MAX_ITEMS` that moved last, all of them public. They are kept in one KV key in `SNAPSHOT`, written only when something changed.
// Pure: the store, GitHub, the model and the clock are given, so a test pins what is asked and kept.

import { githubUser, isPublicRepository, publicSearch, scope } from "./github-query.ts"
import { buildMessages, cleanSummary, fingerprint, PROMPT_VERSION, type SummaryInput, type SummaryKind } from "./summarize.ts"

/** The KV key of the summaries. */
export const SUMMARIES_KEY = "summaries"
/** Cloudflare Workers AI: a small model, a few hundred tokens a summary. */
export const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8"
/** The most summaries made in one run: 96 runs a day, so at most 192 a day, and far fewer, as only what changed is made again. */
export const MAX_NEW = 2
/** The most items that have a summary: the ones that moved last. */
export const MAX_ITEMS = 40

export interface StoredSummary {
  /** The fingerprint of what the model was given. */
  fp: string
  text: string
  /** When it was made (ISO). */
  at: string
}

export interface Summaries {
  version: 1
  /** By `summaryRef`. */
  items: Record<string, StoredSummary>
}

/** The key of an item among the summaries: `owner/repo#number`, in lower case (GitHub's names are not case-sensitive). */
export const summaryRef = (repo: string, number: number): string => `${repo.toLowerCase()}#${number}`

/** The question for GitHub's GraphQL: what the user is involved in, what waits for their review, and their discussions, all open and public. */
export const SUMMARY_QUERY = `query Summaries($involved: String!, $reviews: String!, $discussions: String!) {
  involved: search(query: $involved, type: ISSUE, first: 30) { nodes { ...I } }
  reviews: search(query: $reviews, type: ISSUE, first: 15) { nodes { ...I } }
  discussions: search(query: $discussions, type: DISCUSSION, first: 15) { nodes { ... on Discussion { __typename number title body updatedAt repository { nameWithOwner isPrivate visibility } comments(last: 3) { nodes { author { login } body } } } } }
}
fragment I on SearchResultItem {
  ... on Issue { __typename number title body updatedAt repository { nameWithOwner isPrivate visibility } comments(last: 3) { nodes { author { login } body } } }
  ... on PullRequest { __typename number title body updatedAt repository { nameWithOwner isPrivate visibility } comments(last: 3) { nodes { author { login } body } } }
}`

/** The variables of `SUMMARY_QUERY` for a user: each search limited to public repositories. */
export function summaryVariables(user: string, excludeOrgs: string | undefined): Record<string, string> {
  const login = githubUser(user)
  const limit = scope(excludeOrgs)
  return {
    involved: publicSearch(`is:open involves:${login} archived:false ${limit} sort:updated-desc`),
    reviews: publicSearch(`is:open is:pr review-requested:${login} archived:false ${limit} sort:updated-desc`),
    discussions: publicSearch(`involves:${login} ${limit} sort:updated-desc`),
  }
}

interface Node {
  __typename?: string
  number?: number
  title?: string
  body?: string | null
  updatedAt?: string
  repository?: { nameWithOwner?: string; isPrivate?: unknown; visibility?: unknown }
  comments?: { nodes?: ({ author?: { login?: string } | null; body?: string } | null)[] }
}

export interface Candidate {
  ref: string
  kind: SummaryKind
  input: SummaryInput
  updated: string
}

const KINDS: Record<string, SummaryKind> = { Issue: "issue", PullRequest: "pull request", Discussion: "discussion" }

/** What may have a summary, from GitHub's answer: public only, each once, the `MAX_ITEMS` that moved last. */
export function summaryCandidates(data: unknown, max = MAX_ITEMS): Candidate[] {
  const lists = (typeof data === "object" && data !== null ? Object.values(data as Record<string, { nodes?: (Node | null)[] } | null>) : []).flatMap((list) => list?.nodes ?? [])
  const found = new Map<string, Candidate>()
  for (const node of lists) {
    const kind = KINDS[node?.__typename ?? ""]
    const repo = node?.repository?.nameWithOwner
    if (node === null || kind === undefined || repo === undefined || typeof node.number !== "number" || typeof node.title !== "string") continue
    if (!isPublicRepository(node.repository)) continue
    const ref = summaryRef(repo, node.number)
    if (found.has(ref)) continue
    const comments = (node.comments?.nodes ?? []).flatMap((comment) => (comment === null || typeof comment.body !== "string" || comment.body.trim() === "" ? [] : [`${comment.author?.login ?? "ukjent"}: ${comment.body}`]))
    found.set(ref, { ref, kind, input: { title: node.title, body: node.body ?? "", comments }, updated: node.updatedAt ?? "" })
  }
  return [...found.values()].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, max)
}

export function readSummaries(text: string | null): Summaries {
  try {
    const parsed = text === null ? null : (JSON.parse(text) as Summaries)
    if (parsed?.version === 1 && typeof parsed.items === "object" && parsed.items !== null) return parsed
  } catch {
    // A broken value is the same as none.
  }
  return { version: 1, items: {} }
}

export interface SummaryStore {
  get(key: string, options: { type: "text"; cacheTtl?: number }): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

/** The model, given the messages and what they are for; its answer as Workers AI gives it. */
export type RunModel = (messages: ReturnType<typeof buildMessages>, kind: SummaryKind) => Promise<{ response?: unknown }>

export interface SummaryReport {
  candidates: number
  made: number
  failed: number
  kept: number
  written: boolean
}

/**
 * One run: GitHub is asked once (`ask`, the answer's `data`), the summaries that are missing or whose text changed are made, newest
 * first, at most `MAX_NEW`, and the rest wait for the next run (a changed one keeps its old summary until then). What is no longer
 * among the candidates is dropped. Written only when anything changed.
 */
export async function refreshSummaries(store: SummaryStore, ask: () => Promise<unknown>, run: RunModel, now: number): Promise<SummaryReport> {
  const candidates = summaryCandidates(await ask())
  const before = await store.get(SUMMARIES_KEY, { type: "text" })
  const old = readSummaries(before)
  const items: Record<string, StoredSummary> = {}
  let made = 0
  let failed = 0
  for (const candidate of candidates) {
    const messages = buildMessages(candidate.kind, candidate.input)
    const fp = await fingerprint([MODEL, String(PROMPT_VERSION), ...messages.map((message) => message.content)])
    const kept = old.items[candidate.ref]
    if (kept?.fp === fp || made + failed >= MAX_NEW) {
      if (kept !== undefined) items[candidate.ref] = kept
      continue
    }
    try {
      const text = cleanSummary((await run(messages, candidate.kind)).response)
      made += 1
      if (text !== null) items[candidate.ref] = { fp, text, at: new Date(now).toISOString() }
      else if (kept !== undefined) items[candidate.ref] = kept
    } catch (error) {
      failed += 1
      console.warn(`Oppsummering av ${candidate.ref} feilet`, error)
      if (kept !== undefined) items[candidate.ref] = kept
    }
  }
  const next = JSON.stringify({ version: 1, items } satisfies Summaries)
  const written = next !== (before === null ? JSON.stringify({ version: 1, items: {} }) : JSON.stringify(old))
  if (written) await store.put(SUMMARIES_KEY, next)
  return { candidates: candidates.length, made, failed, kept: Object.keys(items).length, written }
}
