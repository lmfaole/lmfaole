import type { IconName } from "@lmfaole/designsystem/lib/icons"

/** What GitHub knows about a pull request, as its GraphQL API words it. */
export interface PullStatus {
  draft: boolean
  /** The state of the checks on the last commit; none where the repository has no checks. */
  checks: "SUCCESS" | "FAILURE" | "ERROR" | "PENDING" | "EXPECTED" | null
  review: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null
  mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN"
  /** Review conversations that are still open. */
  openThreads: number
  author: string | null
  /** How much there is to read: lines added and removed, and files. */
  size: { additions: number; deletions: number; files: number } | null
}

export interface Label {
  text: string
  /** What it means, in front of the words (a meaning of the design system's `ICONS`). */
  icon: IconName
  /** `bad` is for what stops the pull request: failing checks, conflicts, changes asked for. */
  tone: "default" | "muted" | "destructive"
}

/**
 * The status of a pull request as a few short labels, worst first. Your own pull requests show their review state
 * (is anyone to answer, can it be merged); the ones waiting for your review show who wrote them, since the review is yours.
 */
export function statusLabels(status: PullStatus, whose: "mine" | "theirs"): Label[] {
  const labels: Label[] = []
  if (whose === "theirs" && status.author !== null) labels.push({ text: `av ${status.author}`, tone: "muted", icon: "person" })
  if (whose === "theirs" && status.size !== null) labels.push({ text: `+${status.size.additions} −${status.size.deletions} · ${status.size.files} ${status.size.files === 1 ? "fil" : "filer"}`, tone: "muted", icon: "changes" })
  if (status.draft) labels.push({ text: "Utkast", tone: "muted", icon: "pull-request-draft" })
  if (status.checks === "FAILURE" || status.checks === "ERROR") labels.push({ text: "Tester feilet", tone: "destructive", icon: "failure" })
  else if (status.checks === "PENDING" || status.checks === "EXPECTED") labels.push({ text: "Tester kjører", tone: "muted", icon: "pending" })
  else if (status.checks === "SUCCESS") labels.push({ text: "Tester OK", tone: "default", icon: "success" })
  if (status.mergeable === "CONFLICTING") labels.push({ text: "Konflikter", tone: "destructive", icon: "warning" })
  if (whose === "mine") {
    if (status.review === "CHANGES_REQUESTED") labels.push({ text: "Endringer ønskes", tone: "destructive", icon: "changes" })
    else if (status.review === "APPROVED") labels.push({ text: "Godkjent", tone: "default", icon: "success" })
    else if (status.review === "REVIEW_REQUIRED" && !status.draft) labels.push({ text: "Venter på review", tone: "muted", icon: "waiting" })
    if (status.openThreads > 0) labels.push({ text: status.openThreads === 1 ? "1 åpen kommentar" : `${status.openThreads} åpne kommentarer`, tone: "destructive", icon: "discussion" })
  }
  return labels
}

/** The pull request fields of GraphQL's answer, as `search` returns them. */
export interface PullNode {
  databaseId: number
  url: string
  title: string
  updatedAt: string
  isDraft: boolean
  reviewDecision: PullStatus["review"]
  mergeable: PullStatus["mergeable"]
  repository: { nameWithOwner: string }
  author: { login: string } | null
  commits: { nodes: { commit: { statusCheckRollup: { state: NonNullable<PullStatus["checks"]> } | null } }[] }
  reviewThreads: { nodes: { isResolved: boolean }[] }
  additions: number
  deletions: number
  changedFiles: number
}

export function toStatus(node: PullNode): PullStatus {
  return {
    draft: node.isDraft,
    checks: node.commits.nodes[0]?.commit.statusCheckRollup?.state ?? null,
    review: node.reviewDecision,
    mergeable: node.mergeable,
    openThreads: node.reviewThreads.nodes.filter((thread) => !thread.isResolved).length,
    author: node.author?.login ?? null,
    size: { additions: node.additions, deletions: node.deletions, files: node.changedFiles },
  }
}

/** The pull requests in a `search` answer: GraphQL puts `null` where it hides a result and `{}` where the result is not a pull request. */
export function pullNodes(nodes: readonly (Partial<PullNode> | null)[]): PullNode[] {
  return nodes.filter((node): node is PullNode => node !== null && node.databaseId !== undefined)
}

/** What GraphQL could say about a list of pull requests, by address. It leaves out what the token may not read (an organisation can block it). */
export type Statuses = Map<string, PullStatus>

/** The statuses in a GraphQL `search` answer. */
export function readStatuses(answer: { data?: { search: { nodes: readonly (Partial<PullNode> | null)[] } } }): Statuses {
  return new Map(pullNodes(answer.data?.search.nodes ?? []).map((node) => [node.url, toStatus(node)]))
}

/** The items with the status GraphQL had for them, in the order they came; those it had none for are kept without one. */
export function withStatus<Item extends { href: string }>(items: readonly Item[], statuses: Statuses): (Item & { status?: PullStatus })[] {
  return items.map((item) => {
    const status = statuses.get(item.href)
    return status === undefined ? item : { ...item, status }
  })
}

const DAY = 86_400_000

const daysSince = (iso: string, now: Date): number => Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY))

/**
 * How long it has been: a pull request that waits for your review says for how long (red from three days), one of yours
 * says when nothing has happened to it for three days or more.
 */
export function ageLabels(item: { created: string; updated: string }, whose: "mine" | "theirs", now: Date): Label[] {
  if (whose === "theirs") {
    const days = daysSince(item.created, now)
    if (days === 0) return [{ text: "Ny i dag", tone: "muted", icon: "time" }]
    return [{ text: days === 1 ? "Venter 1 dag" : `Venter ${days} dager`, tone: days >= 3 ? "destructive" : "default", icon: "time" }]
  }
  const quiet = daysSince(item.updated, now)
  return quiet >= 3 ? [{ text: `Stille i ${quiet} dager`, tone: "muted", icon: "time" }] : []
}

/** What a reviewer last did, in words. */
export function reviewStateText(state: string): string {
  switch (state) {
    case "APPROVED":
      return "godkjent"
    case "CHANGES_REQUESTED":
      return "ønsker endringer"
    case "COMMENTED":
      return "kommenterte"
    case "DISMISSED":
      return "avvist"
    default:
      return "venter"
  }
}

/** A check (a test run, a status) as a symbol and words: done well, failed, still running, or neither (skipped, neutral). */
export function checkLook(state: string): { icon: IconName; text: string; tone: "muted" | "destructive" } {
  switch (state) {
    case "SUCCESS":
      return { icon: "success", text: "OK", tone: "muted" }
    case "FAILURE":
    case "ERROR":
    case "TIMED_OUT":
    case "CANCELLED":
    case "STARTUP_FAILURE":
    case "ACTION_REQUIRED":
      return { icon: "failure", text: "Feilet", tone: "destructive" }
    case "NEUTRAL":
    case "SKIPPED":
    case "STALE":
      return { icon: "info", text: "Hoppet over", tone: "muted" }
    default:
      return { icon: "pending", text: "Kjører", tone: "muted" }
  }
}

/** The most important statuses for a compact row: what stops something first, then the rest in their order, at most `count`. */
export function compactLabels(labels: readonly Label[], count: number): Label[] {
  return [...labels.filter((label) => label.tone === "destructive"), ...labels.filter((label) => label.tone !== "destructive")].slice(0, count)
}
