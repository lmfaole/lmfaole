import { isSeen, parseSeen, SEEN_COOKIE, type Seen } from "@lmfaole/designsystem/lib/onboarding"
import { parsePrefs, PREFS_COOKIE, type Prefs } from "@lmfaole/designsystem/lib/preferences"
import { cookies } from "next/headers"

import { DAY_COOKIE, parseDaySettings, type DaySettings } from "./day-settings"
import { env } from "./env"
import { parseRepos } from "./github-query"
import { BASE } from "./links"
import { decodeProblems, FIRST_RUN, parseReposCookie, PROBLEMS_COOKIE, REPOS_COOKIE, type Problems } from "./settings"
import { formState, GITHUB_USER_COOKIE, parseLogin, type SearchParams } from "./username"

/** The visitor's GitHub username from their cookie, or `null` before they have given one: then no GitHub data is fetched. */
export async function githubUser(): Promise<string | null> {
  return parseLogin((await cookies()).get(GITHUB_USER_COOKIE)?.value)
}

/**
 * Whose GitHub data a page shows: `user`, or `null` where the page shows the form instead (no username yet, or a name just
 * written that GitHub does not have, which the form then says). `known` is the name in the cookie, to prefill the form with.
 */
export async function githubPage(searchParams: Promise<SearchParams>): Promise<{ user: string | null; known: string | null; params: SearchParams }> {
  const [params, known] = await Promise.all([searchParams, githubUser()])
  return { user: formState(params, "github").error === undefined ? known : null, known, params }
}

/** Where the `seen` cookie (the intros dismissed, the news looked at, the install offer answered) is kept: the whole app. */
export const SEEN_PATH = BASE

/** The transport page is marked new in the navigation until this day (six weeks after it came). */
export const TRANSPORT_NEW_UNTIL = "2027-01-01T00:00:00+01:00"

/** What this visitor has seen and dismissed, from the `seen` cookie. */
export async function seenNotes(): Promise<Seen> {
  return parseSeen((await cookies()).get(SEEN_COOKIE)?.value)
}

/** The repositories the visitor follows (the `github_repos` cookie, checked as public when they were chosen), as `owner/name,owner/name`. None before they have chosen. */
export async function watchedRepoList(): Promise<string> {
  return parseReposCookie((await cookies()).get(REPOS_COOKIE)?.value).join(",")
}

/** What the wizard and the settings offer to follow before anything is chosen: the site's own suggestion (`GITHUB_WATCH_REPOS`). */
export function suggestedRepos(): string[] {
  return parseRepos(env("GITHUB_WATCH_REPOS"))
}

/** How the visitor wants the app (the `prefs` cookie): theme, effects, tilt and the front page's sections. */
export async function visitorPrefs(): Promise<Prefs> {
  return parsePrefs((await cookies()).get(PREFS_COOKIE)?.value)
}

/** How the front page follows the time of day (the `startside_day` cookie); the defaults before anything is set. */
export async function visitorDaySettings(): Promise<DaySettings> {
  return parseDaySettings((await cookies()).get(DAY_COOKIE)?.value)
}

/** What a failed submission of the settings said, for the form to show again; nothing otherwise. */
export async function settingsProblems(): Promise<Problems | null> {
  return decodeProblems((await cookies()).get(PROBLEMS_COOKIE)?.value)
}

/** Whether the first-run wizard is open on this page: not yet done or skipped, or a step of it just failed. */
export async function firstRunOpen(): Promise<boolean> {
  const [seen, problems] = await Promise.all([seenNotes(), settingsProblems()])
  return !isSeen(seen, FIRST_RUN) || problems?.step !== undefined
}

/** Whether a page's intro is left out: dismissed before, or the wizard is open (one introduction at a time). */
export async function introSeen(id: string): Promise<boolean> {
  const [seen, open] = await Promise.all([seenNotes(), firstRunOpen()])
  return isSeen(seen, id) || open
}

/** What the wizard and the settings page start from: what the visitor has chosen, or the suggestion; and what a failed submission said. */
export async function settingsState(): Promise<{ user: string | null; repos: string[]; prefs: Prefs; problems: Problems | null }> {
  const jar = await cookies()
  const kept = jar.get(REPOS_COOKIE)?.value
  const [user, prefs, problems] = await Promise.all([githubUser(), visitorPrefs(), settingsProblems()])
  return { user, repos: kept === undefined ? suggestedRepos() : parseReposCookie(kept), prefs, problems }
}
