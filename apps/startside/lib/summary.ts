import type { IconName } from "@lmfaole/designsystem/lib/icons"

import type { DiscussionGroup } from "./discussions.ts"
import type { IssueGroup } from "./issues.ts"
import type { Group } from "./pulls.ts"

/** How many things there are that want a look: red default branches, replies from others, Dependabot's open pull requests. */
export interface AlertCounts {
  ci: number
  replies: number
  dependabot: number
}

/** The part of GitHub a count is about: its counts stand in that part's section, not gathered at the top. */
export type SummaryArea = "alerts" | "pulls" | "issues" | "discussions"

export interface SummaryEntry {
  key: string
  area: SummaryArea
  label: string
  count: number
  href: string
  icon: IconName
  tone?: "default" | "destructive"
}

/**
 * The counts that tell whether the reader has something to do, each a link to the group it counts on the page that lists it
 * (the groups have ids on their pages). Only what is for the reader: what is blocked, what can be merged, what waits for their
 * review, issues assigned to them or new and owned by nobody, and questions nobody has answered. Zero counts are left out.
 * `base` is where the app is mounted.
 */
export function summaryItems(base: string, { pulls, issues, discussions, alerts = { ci: 0, replies: 0, dependabot: 0 } }: { pulls: readonly Group[]; issues: readonly IssueGroup[]; discussions: readonly DiscussionGroup[]; alerts?: AlertCounts }): SummaryEntry[] {
  const pull = (id: Group["id"]) => pulls.find((group) => group.id === id)?.entries.length ?? 0
  const issue = (id: IssueGroup["id"]) => issues.find((group) => group.id === id)?.items.length ?? 0
  const discussion = (id: DiscussionGroup["id"]) => discussions.find((group) => group.id === id)?.items.length ?? 0
  const entries: SummaryEntry[] = [
    { key: "ci", area: "alerts", label: "feilende CI", count: alerts.ci, href: `${base}/varsler#alerts-ci`, icon: "failure", tone: "destructive" },
    { key: "blocked", area: "pulls", label: "blokkert", count: pull("blocked"), href: `${base}/pull-requests#pulls-blocked`, icon: "warning", tone: "destructive" },
    { key: "ready", area: "pulls", label: "klar til merge", count: pull("ready"), href: `${base}/pull-requests#pulls-ready`, icon: "merge" },
    { key: "review", area: "pulls", label: "venter på din review", count: pull("review"), href: `${base}/pull-requests#pulls-review`, icon: "view" },
    { key: "replies", area: "alerts", label: "nytt fra andre", count: alerts.replies, href: `${base}/varsler#alerts-replies`, icon: "discussion" },
    { key: "dependabot", area: "alerts", label: "Dependabot", count: alerts.dependabot, href: `${base}/varsler#alerts-dependabot`, icon: "package" },
    { key: "assigned", area: "issues", label: "issues tildelt deg", count: issue("assigned"), href: `${base}/issues#issues-assigned`, icon: "tasks" },
    { key: "new", area: "issues", label: "nye issues uten eier", count: issue("new"), href: `${base}/issues#issues-new`, icon: "inbox" },
    { key: "unanswered", area: "discussions", label: "ubesvarte spørsmål", count: discussion("unanswered"), href: `${base}/discussions#discussions-unanswered`, icon: "question" },
  ]
  return entries.filter((entry) => entry.count > 0)
}

/** The counts of one part, in their order. */
export const countsOf = (entries: readonly SummaryEntry[], area: SummaryArea): SummaryEntry[] => entries.filter((entry) => entry.area === area)
