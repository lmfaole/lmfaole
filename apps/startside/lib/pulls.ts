import type { PullStatus } from "./pr-status.ts"

export interface PullItem {
  key: string
  href: string
  title: string
  repo: string
  created: string
  updated: string
  /** None where GitHub would not let the token read the pull request (an organisation can block it). */
  status?: PullStatus
}

export type GroupId = "blocked" | "ready" | "review" | "waiting" | "notReady" | "drafts" | "open"

export interface Entry {
  item: PullItem
  whose: "mine" | "theirs"
}

export interface Group {
  id: GroupId
  title: string
  entries: Entry[]
}

/** From what needs you most to what needs you least. */
const ORDER: readonly GroupId[] = ["blocked", "ready", "review", "waiting", "notReady", "drafts", "open"]

const TITLES: Record<GroupId, string> = {
  blocked: "Blokkert, krever deg",
  ready: "Klar til merge",
  review: "Venter på din review",
  waiting: "Venter på andre",
  notReady: "Ikke klar for review",
  drafts: "Dine utkast",
  open: "Dine åpne pull requests",
}

const failing = (status: PullStatus) => status.checks === "FAILURE" || status.checks === "ERROR"

/**
 * Where a pull request belongs. One of mine is blocked when something is for me to fix (red checks, conflicts, changes
 * asked for, open conversations), ready when it is approved and green (or green where no review is required), and
 * otherwise waits for others. One waiting for my review is not ready for it while it is a draft or red. Without a
 * status, a review is still a review and one of mine is just open.
 */
export function classify(item: PullItem, whose: "mine" | "theirs"): GroupId {
  const status = item.status
  if (whose === "theirs") return status !== undefined && (status.draft || failing(status)) ? "notReady" : "review"
  if (status === undefined) return "open"
  if (status.draft) return "drafts"
  if (failing(status) || status.mergeable === "CONFLICTING" || status.review === "CHANGES_REQUESTED" || status.openThreads > 0) return "blocked"
  if (status.review === "APPROVED" ? status.checks === "SUCCESS" || status.checks === null : status.review === null && status.checks === "SUCCESS") return "ready"
  return "waiting"
}

const time = (iso: string) => new Date(iso).getTime()

/** The pull requests in groups, the ones that need you most first; empty groups are left out. Reviews go oldest first, the blocked longest-stuck first, the rest newest first. */
export function groupPulls({ reviews, mine }: { reviews: readonly PullItem[]; mine: readonly PullItem[] }): Group[] {
  const entries: Entry[] = [...reviews.map((item) => ({ item, whose: "theirs" as const })), ...mine.map((item) => ({ item, whose: "mine" as const }))]
  return ORDER.flatMap((id) => {
    const inGroup = entries.filter((entry) => classify(entry.item, entry.whose) === id)
    const sorted = [...inGroup].sort((a, b) => (id === "review" ? time(a.item.created) - time(b.item.created) : id === "blocked" ? time(a.item.updated) - time(b.item.updated) : time(b.item.updated) - time(a.item.updated)))
    return sorted.length === 0 ? [] : [{ id, title: TITLES[id], entries: sorted }]
  })
}
