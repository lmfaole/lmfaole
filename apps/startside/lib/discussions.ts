export interface DiscussionItem {
  key: string
  href: string
  title: string
  repo: string
  category: string
  comments: number
  /** `true` or `false` in a category with answers (questions), `null` in the others (ideas, changes). */
  answered: boolean | null
  created: string
  updated: string
}

export type DiscussionGroupId = "involved" | "unanswered" | "recent"

export interface DiscussionGroup {
  id: DiscussionGroupId
  title: string
  items: DiscussionItem[]
}

const TITLES: Record<DiscussionGroupId, string> = { involved: "Du er med i", unanswered: "Ubesvarte spørsmål", recent: "Nylig aktive" }

/** How many a group shows. */
export const LIMIT = 10

const time = (iso: string) => new Date(iso).getTime()

/**
 * Discussions in three groups: the ones you are in, the questions nobody has answered, and what moved lately. A
 * discussion is in the first it belongs to; the most recently moved first, at most ten. Ideas and changes have no
 * answer to wait for, so only a question (`answered === false`) is unanswered.
 */
export function groupDiscussions({ involved, recent }: { involved: readonly DiscussionItem[]; recent: readonly DiscussionItem[] }): DiscussionGroup[] {
  const placed = new Set<string>()
  const take = (items: readonly DiscussionItem[], keep: (item: DiscussionItem) => boolean): DiscussionItem[] => {
    const chosen = items.filter((item) => !placed.has(item.href) && keep(item))
    for (const item of chosen) placed.add(item.href)
    return [...chosen].sort((a, b) => time(b.updated) - time(a.updated)).slice(0, LIMIT)
  }
  const groups: [DiscussionGroupId, DiscussionItem[]][] = [
    ["involved", take(involved, () => true)],
    ["unanswered", take(recent, (item) => item.answered === false)],
    ["recent", take(recent, () => true)],
  ]
  return groups.filter(([, items]) => items.length > 0).map(([id, items]) => ({ id, title: TITLES[id], items }))
}

/** What GraphQL's `Discussion` has, as asked for in lib/github.ts. */
export interface DiscussionNode {
  id: string
  url: string
  title: string
  createdAt: string
  updatedAt: string
  isAnswered: boolean | null
  category: { name: string } | null
  comments: { totalCount: number }
  repository: { nameWithOwner: string }
}

/** The discussions in a `search` answer: GraphQL puts `null` where it hides a result and `{}` where the result is not a discussion. */
export function discussionNodes(nodes: readonly (Partial<DiscussionNode> | null)[]): DiscussionItem[] {
  return nodes.flatMap((node) =>
    node === null || node.id === undefined || node.url === undefined || node.title === undefined || node.repository === undefined
      ? []
      : [{ key: node.id, href: node.url, title: node.title, repo: node.repository.nameWithOwner, category: node.category?.name ?? "", comments: node.comments?.totalCount ?? 0, answered: node.isAnswered ?? null, created: node.createdAt ?? "", updated: node.updatedAt ?? node.createdAt ?? "" }],
  )
}
