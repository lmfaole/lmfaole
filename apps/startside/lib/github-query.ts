import { parseLogin } from "./username.ts"

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
 * The searches for a user, each limited to public repositories (`scope`): the token is the owner's, so without `is:public` a search
 * would find what only the owner may see. By the user's login, never `@me`, which is the token's owner.
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
