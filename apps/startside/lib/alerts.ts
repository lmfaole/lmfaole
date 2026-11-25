import { osloDateDaysAgo, osloTime } from "./day.ts"

/** What GitHub says about the last commit of a repository's default branch. */
export interface RepoNode {
  nameWithOwner: string
  isArchived: boolean
  defaultBranchRef: {
    name: string
    target: { oid?: string; url?: string; messageHeadline?: string; committedDate?: string; statusCheckRollup?: { state: string } | null } | null
  } | null
}

export interface CiFailure {
  repo: string
  branch: string
  /** The commit that is red: its first line and when it was made. */
  headline: string
  committed: string
  /** The checks of the commit, on GitHub. */
  href: string
}

/**
 * The repositories whose default branch is red: the last commit's checks failed or errored. Archived repositories and ones with no
 * checks are left out, and so is a repository named twice (one of yours that is also watched). Most recently pushed first.
 */
export function ciFailures(nodes: readonly (RepoNode | null)[]): CiFailure[] {
  const seen = new Set<string>()
  const failures: CiFailure[] = []
  for (const node of nodes) {
    if (node === null || node.isArchived || seen.has(node.nameWithOwner)) continue
    seen.add(node.nameWithOwner)
    const branch = node.defaultBranchRef
    const commit = branch?.target
    const state = commit?.statusCheckRollup?.state
    if (branch === null || branch === undefined || commit === null || commit === undefined || (state !== "FAILURE" && state !== "ERROR")) continue
    failures.push({
      repo: node.nameWithOwner,
      branch: branch.name,
      headline: commit.messageHeadline ?? "",
      committed: commit.committedDate ?? "",
      href: commit.url === undefined ? `https://github.com/${node.nameWithOwner}/actions` : `${commit.url}/checks`,
    })
  }
  return failures.sort((a, b) => Date.parse(b.committed) - Date.parse(a.committed))
}

/** One thing you are in where someone else wrote last. */
export interface Reply {
  key: string
  href: string
  title: string
  repo: string
  /** Who wrote last, and when. */
  who: string
  when: string
  /** A comment, or a review that approved, asked for changes or commented. */
  what: "comment" | "approved" | "changes" | "review"
}

interface Last {
  author: { login: string } | null
  createdAt?: string
  submittedAt?: string | null
  state?: string
}

/** What GraphQL gives for an issue or a pull request you are involved in: its last comment, and for a pull request its last review. */
export interface InvolvedNode {
  id?: string
  url?: string
  title?: string
  repository?: { nameWithOwner: string }
  comments?: { nodes: (Last | null)[] }
  reviews?: { nodes: (Last | null)[] }
}

/**
 * The things you are involved in where somebody else wrote last, newest first, from the last `days` days (Oslo dates). GitHub's
 * own notifications need a token this one cannot be, so «new from others» is read from the conversations: the last comment or review
 * of each thing, kept when it is not by `me`.
 */
export function fromOthers(nodes: readonly (InvolvedNode | null)[], me: string, instant: Date, days = 3): Reply[] {
  const since = osloDateDaysAgo(instant, days)
  const replies: Reply[] = []
  for (const node of nodes) {
    if (node === null || node.url === undefined || node.title === undefined || node.id === undefined) continue
    const comment = node.comments?.nodes.at(-1) ?? null
    const review = node.reviews?.nodes.at(-1) ?? null
    const commentAt = comment?.createdAt ?? ""
    const reviewAt = review?.submittedAt ?? ""
    const latest = reviewAt > commentAt ? { last: review, at: reviewAt, review: true } : { last: comment, at: commentAt, review: false }
    const login = latest.last?.author?.login
    if (latest.last === null || login === undefined || login.toLowerCase() === me.toLowerCase() || latest.at === "" || osloTime(new Date(latest.at)).date < since) continue
    const state = latest.last.state
    replies.push({
      key: node.id,
      href: node.url,
      title: node.title,
      repo: node.repository?.nameWithOwner ?? "",
      who: login,
      when: latest.at,
      what: !latest.review ? "comment" : state === "APPROVED" ? "approved" : state === "CHANGES_REQUESTED" ? "changes" : "review",
    })
  }
  return replies.sort((a, b) => Date.parse(b.when) - Date.parse(a.when))
}

/** The words for what someone did: «kommenterte», «godkjente», «ønsker endringer». */
export function replyText(what: Reply["what"]): string {
  return what === "approved" ? "godkjente" : what === "changes" ? "ønsker endringer" : what === "review" ? "reviewet" : "kommenterte"
}
