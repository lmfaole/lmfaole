import { osloDateDaysAgo, osloTime } from "./day.ts"

export interface IssueItem {
  key: string
  href: string
  title: string
  repo: string
  created: string
  updated: string
  /** The logins it is assigned to. */
  assignees: string[]
}

export type IssueGroupId = "assigned" | "involved" | "new" | "recent"

export interface IssueGroup {
  id: IssueGroupId
  title: string
  items: IssueItem[]
}

const TITLES: Record<IssueGroupId, string> = {
  assigned: "Tildelt deg",
  involved: "Du er involvert i",
  new: "Nye uten eier",
  recent: "Nylig aktive",
}

/** How many a group shows. */
export const LIMIT = 10

/** How many days an issue counts as new. */
export const NEW_DAYS = 7

const time = (iso: string) => new Date(iso).getTime()

/**
 * The issues in groups, the ones that are for you first: assigned to you, then ones you are involved in, then new ones
 * nobody owns (made in the last week), then what has moved lately. An issue is in the first group it belongs to, empty
 * groups are left out, and each shows the most recently moved first (the new ones the newest first), at most ten.
 */
export function groupIssues({ assigned, involved, recent }: { assigned: readonly IssueItem[]; involved: readonly IssueItem[]; recent: readonly IssueItem[] }, instant: Date): IssueGroup[] {
  const placed = new Set<string>()
  const take = (items: readonly IssueItem[], keep: (item: IssueItem) => boolean, order: (a: IssueItem, b: IssueItem) => number): IssueItem[] => {
    const chosen = items.filter((item) => !placed.has(item.href) && keep(item))
    for (const item of chosen) placed.add(item.href)
    return [...chosen].sort(order).slice(0, LIMIT)
  }
  const since = osloDateDaysAgo(instant, NEW_DAYS)
  const byUpdated = (a: IssueItem, b: IssueItem) => time(b.updated) - time(a.updated)
  const groups: [IssueGroupId, IssueItem[]][] = [
    ["assigned", take(assigned, () => true, byUpdated)],
    ["involved", take(involved, () => true, byUpdated)],
    ["new", take(recent, (item) => item.assignees.length === 0 && osloTime(new Date(item.created)).date >= since, (a, b) => time(b.created) - time(a.created))],
    ["recent", take(recent, () => true, byUpdated)],
  ]
  return groups.filter(([, items]) => items.length > 0).map(([id, items]) => ({ id, title: TITLES[id], items }))
}
