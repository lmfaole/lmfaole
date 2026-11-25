/** A GitHub login, or `null` where it is not one: letters, digits and dashes (an `@` in front is allowed), so it cannot add search terms. */
export function parseLogin(value: unknown): string | null {
  if (typeof value !== "string") return null
  const login = value.trim().replace(/^@/, "")
  return /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(login) ? login : null
}

/** The user the page is about (`GITHUB_USER`); the page is the same for everyone and has no other. */
export function githubUser(value: string | undefined): string {
  const login = parseLogin(value)
  if (login === null) throw new Error("GITHUB_USER er ikke et GitHub-brukernavn")
  return login
}

/**
 * Whether a repository, as GitHub answers about it, is public: GraphQL's `isPrivate`/`visibility` (`PUBLIC`), REST's
 * `private`/`visibility` (`public`). Every field there is must say public, and at least one must be there: a token that can read
 * private repositories must never get one onto the page.
 */
export function isPublicRepository(repo: { isPrivate?: unknown; private?: unknown; visibility?: unknown } | null | undefined): boolean {
  if (typeof repo !== "object" || repo === null) return false
  const fields = [repo.isPrivate, repo.private, repo.visibility].filter((value) => value !== undefined)
  if (fields.length === 0) return false
  if (repo.isPrivate !== undefined && repo.isPrivate !== false) return false
  if (repo.private !== undefined && repo.private !== false) return false
  return repo.visibility === undefined || (typeof repo.visibility === "string" && repo.visibility.toLowerCase() === "public")
}

/** The search, if it is limited to public repositories; else it throws, so no search can go out without `is:public`. */
export function publicSearch(query: string): string {
  if (!/(^|\s)is:public(\s|$)/.test(query)) throw new Error("Søket må være begrenset til offentlige repoer")
  return query
}

/**
 * What every search is limited to: public repositories only, and not the organisations listed (`GITHUB_EXCLUDE_ORGS`,
 * comma-separated; `fremtind` is SpareBank 1's, which blocks the token and which the page never shows).
 */
export function scope(excludeOrgs: string | undefined): string {
  const orgs = (excludeOrgs ?? "")
    .split(",")
    .map((org) => org.trim())
    .filter((org) => /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(org))
  return ["is:public", ...orgs.map((org) => `-org:${org}`)].join(" ")
}

/** The watched repositories (`GITHUB_WATCH_REPOS`, comma-separated `owner/name`); anything that is not `owner/name` is dropped. */
export function parseRepos(repos: string | undefined): string[] {
  return (repos ?? "")
    .split(",")
    .map((repo) => repo.trim())
    .filter((repo) => /^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9._-]+$/.test(repo))
}

/** The watched repositories as search qualifiers: GitHub reads several `repo:` as "any of them". */
export function repoQualifiers(repos: string | undefined): string {
  return parseRepos(repos).map((repo) => `repo:${repo}`).join(" ")
}

/** Whether a repository (`owner/name`, any case) is one of the watched; with none watched, every one is. */
export function isWatched(repo: string, repos: string | undefined): boolean {
  const watched = parseRepos(repos).map((name) => name.toLowerCase())
  return watched.length === 0 || watched.includes(repo.toLowerCase())
}

/** The login, checked again where it goes into a query: nothing but a GitHub login may add search terms. */
function checked(user: string): string {
  const login = parseLogin(user)
  if (login === null) throw new Error("Ugyldig GitHub-brukernavn")
  return login
}

/**
 * The searches for a user, each limited to public repositories (`scope`): should the token be able to read private repositories,
 * without `is:public` a search would find what only its owner may see. By the user's login, never `@me`, which is the token's owner.
 */
export function userQueries(user: string, excludeOrgs: string | undefined) {
  const login = checked(user)
  const limit = scope(excludeOrgs)
  return {
    reviews: `is:open review-requested:${login} archived:false ${limit}`,
    mine: `is:open author:${login} archived:false ${limit}`,
    assigned: `is:open is:issue assignee:${login} archived:false ${limit}`,
    involved: `is:open is:issue involves:${login} archived:false ${limit}`,
    discussions: `involves:${login} ${limit}`,
    dependabot: `is:open author:app/dependabot user:${login} archived:false ${limit}`,
  }
}

/** What the user is involved in that moved since a date (`YYYY-MM-DD`), newest first: where replies from others are found. */
export function repliesQuery(user: string, since: string, excludeOrgs: string | undefined): string {
  if (!/^\d{4}-\d\d-\d\d$/.test(since)) throw new Error("Ugyldig dato")
  return `involves:${checked(user)} ${scope(excludeOrgs)} archived:false updated:>=${since} sort:updated-desc`
}
