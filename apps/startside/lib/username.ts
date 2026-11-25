/**
 * The visitor's GitHub username: what every GitHub list is fetched for. It is kept in a cookie in the visitor's browser (set by
 * `app/api/brukernavn/route.ts` after GitHub has said the user exists) and read by the server, so no page shows anyone's data
 * before the visitor has said whose. Pure, so a test pins what is accepted.
 */
import { BASE } from "./links.ts"

export const GITHUB_USER_COOKIE = "github_user"
/** Where the form posts to. */
export const USERNAME_ENDPOINT = `${BASE}/api/brukernavn`
/** The settings' account page. */
export const USERNAME_PAGE = `${BASE}/innstillinger/konto`

/** The query parameters a failed submission comes back with: which service said no, and what was written. */
export const ERROR_PARAM = "brukernavn-feil"
export const VALUE_PARAM = "brukernavn-verdi"

const YEAR = 60 * 60 * 24 * 365

/**
 * A GitHub login as written in the form or kept in the cookie: letters, digits and dashes, not starting with a dash, at most 39
 * (an `@` in front is allowed and dropped); nothing else, since it goes into search queries. `null` for anything that is not one.
 */
export function parseLogin(value: unknown): string | null {
  if (typeof value !== "string") return null
  const login = value.trim().replace(/^@/, "")
  return /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(login) ? login : null
}

/** Whether two logins are the same account: GitHub logins are not case-sensitive. */
export const sameLogin = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase()

/**
 * Where the form returns to: a path in the app (the base path itself, or under it), with no `//`, no backslash and no control
 * character anywhere, so it can never lead to another site. Anything else is the front page.
 */
export function safeBack(value: unknown): string {
  if (typeof value !== "string") return BASE
  const rest = value.slice(BASE.length)
  const inApp = value.startsWith(BASE) && (rest === "" || rest.startsWith("/") || rest.startsWith("?") || rest.startsWith("#"))
  return inApp && !value.includes("//") && !value.includes("\\") && !/[\u0000-\u001f\u007f]/.test(value) ? value : BASE
}

function split(back: string): { path: string; params: URLSearchParams; hash: string } {
  const hashAt = back.indexOf("#")
  const beforeHash = hashAt === -1 ? back : back.slice(0, hashAt)
  const queryAt = beforeHash.indexOf("?")
  return {
    path: queryAt === -1 ? beforeHash : beforeHash.slice(0, queryAt),
    params: new URLSearchParams(queryAt === -1 ? "" : beforeHash.slice(queryAt + 1)),
    hash: hashAt === -1 ? "" : back.slice(hashAt),
  }
}

/** The page to return to after a failed submission: `back` with which service failed and what was written. */
export function withError(back: string, service: string, value: string): string {
  const { path, params, hash } = split(back)
  params.set(ERROR_PARAM, service)
  params.set(VALUE_PARAM, value.slice(0, 100))
  return `${path}?${params.toString()}${hash}`
}

/** `back` without the error of an earlier failed submission, for the hidden field: a new try starts clean. */
export function withoutError(back: string): string {
  const { path, params, hash } = split(back)
  params.delete(ERROR_PARAM)
  params.delete(VALUE_PARAM)
  const query = params.toString()
  return `${path}${query === "" ? "" : `?${query}`}${hash}`
}

export type SearchParams = Record<string, string | string[] | undefined>

/** What the form shows for a service from the page's query: the value that was written and why it was not taken, or nothing. */
export function formState(params: SearchParams, service: string): { value?: string; error?: string } {
  const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
  if (one(params[ERROR_PARAM]) !== service) return {}
  const value = (one(params[VALUE_PARAM]) ?? "").slice(0, 100)
  return { value, error: `Fant ingen GitHub-bruker som heter «${value.trim()}». Sjekk stavemåten.` }
}

/** The `Set-Cookie` that keeps the username for a year in this browser, or that removes it (`null`). */
export function userCookie(login: string | null): string {
  return `${GITHUB_USER_COOKIE}=${login ?? ""}; Path=${BASE}; Max-Age=${login === null ? 0 : YEAR}; SameSite=Lax; Secure; HttpOnly`
}
