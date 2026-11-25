/** Where the app is mounted (`basePath` in next.config.ts): plain links and addresses in the design system's components do not get it added. */
export const BASE = "/start"

export type Kind = "pull-requests" | "issues" | "discussions"

export interface Ref {
  owner: string
  repo: string
  number: number
}

/** An address in the app, with the base in front. */
export const withBase = (path: string): string => `${BASE}${path}`

const GITHUB = /^https:\/\/github\.com\/([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9._-]+)\/(pull|issues|discussions)\/(\d+)\/?$/

const KINDS: Record<string, Kind> = { pull: "pull-requests", issues: "issues", discussions: "discussions" }

/** What a GitHub address names: a pull request, an issue or a discussion in a repository; nothing for any other address. */
export function parseGithubUrl(href: string): ({ kind: Kind } & Ref) | null {
  const match = GITHUB.exec(href)
  if (match === null) return null
  const [, owner, repo, kind, number] = match
  return { kind: KINDS[kind as string] as Kind, owner: owner as string, repo: repo as string, number: Number(number) }
}

/** The path of the app's own page for something (`/pull-requests/owner/repo/12`). */
export const detailPath = (kind: Kind, { owner, repo, number }: Ref): string => `/${kind}/${owner}/${repo}/${number}`

/**
 * The app's own page for a pull request, an issue or a discussion given by its GitHub address, with the base in front.
 * A link in a list goes here and not out to GitHub: leaving is a choice made on the page itself («Åpne på GitHub»).
 */
export function internalHref(href: string): string | null {
  const parsed = parseGithubUrl(href)
  return parsed === null ? null : withBase(detailPath(parsed.kind, parsed))
}

/** A reference from the address of a detail page; nothing where a part is not what GitHub allows (it ends up in a query). */
export function parseRef(params: { owner: string; repo: string; number: string }): Ref | null {
  const number = Number(params.number)
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(params.owner) || !/^[A-Za-z0-9._-]+$/.test(params.repo) || !Number.isInteger(number) || number < 1) return null
  return { owner: params.owner, repo: params.repo, number }
}
