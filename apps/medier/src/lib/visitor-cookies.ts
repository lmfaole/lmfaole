import type { AstroCookies } from 'astro'
import { addSeen, isSeen, parseSeen, SEEN_COOKIE } from '@lmfaole/designsystem/lib/onboarding'
import { PREFS_COOKIE, serializePrefs, type Prefs } from '@lmfaole/designsystem/lib/preferences'

import { SEEN_PATH } from './onboarding'
import { cookieSecret, lastfmUserFound, listenbrainzUserFound, retroUserFound, steamUserFound, traktUserFound } from './runtime'
import { sign } from './signed-cookie'
import { FIRST_RUN, STEP_PARAM, withoutSeen, type UsernamePlan } from './settings-form'
import { COOKIE, COOKIE_MAX_AGE, type Service } from './users'
import { SALES_COOKIE, seenSalesValue } from './steam-wishlist'

/** Whether a username is on its service (in mock mode, any is). */
const FOUND: Record<Service, (user: string) => Promise<boolean>> = { lastfm: lastfmUserFound, trakt: traktUserFound, listenbrainz: listenbrainzUserFound, steam: steamUserFound, retroachievements: retroUserFound }
export const userFound = (service: Service, user: string): Promise<boolean> => FOUND[service](user)

/** Every cookie under the site's base (`Path=/medier/`), as the `seen` cookie the design system's islands write. */
const YEAR = { path: SEEN_PATH, maxAge: COOKIE_MAX_AGE, sameSite: 'lax', secure: true } as const

/**
 * The usernames that were found are kept (`HttpOnly`: only the server reads them), signed by the site (`signed-cookie.ts`) so that only a name it checked is ever asked about; the emptied ones forgotten,
 * the ones not found left as they were.
 */
export async function keepUsernames(cookies: AstroCookies, plan: UsernamePlan): Promise<void> {
  const secret = cookieSecret()
  for (const service of plan.clear) cookies.delete(COOKIE[service], { path: SEEN_PATH })
  for (const [service, user] of Object.entries(plan.set) as [Service, string][]) {
    cookies.set(COOKIE[service], secret === null ? user : await sign(COOKIE[service], user, secret), { ...YEAR, httpOnly: true })
  }
}

/** The look and the front page's sections, read by the server on every page (`lib/preferences`); not `HttpOnly`, as the design system's own cookies. */
export const keepPrefs = (cookies: AstroCookies, prefs: Prefs): void => cookies.set(PREFS_COOKIE, serializePrefs(prefs), YEAR)

/** The wizard done (or skipped): `first-run@1` in `seen`, so it does not open again. */
export const markFirstRunSeen = (cookies: AstroCookies): void => cookies.set(SEEN_COOKIE, addSeen(cookies.get(SEEN_COOKIE)?.value, FIRST_RUN.id, FIRST_RUN.version), YEAR)

/** «Vis introen igjen»: the wizard out of `seen`, so it opens on the next page. */
export const forgetFirstRun = (cookies: AstroCookies): void => cookies.set(SEEN_COOKIE, withoutSeen(cookies.get(SEEN_COOKIE)?.value, FIRST_RUN.id), YEAR)

/**
 * Whether the first-run wizard is open on this page: on a first visit (no `first-run@1` in `seen`), and again at `?forste-gang=<step>` where the server sent the visitor back to a step. The page's own
 * username forms and intros keep out of its way while it is open (the wizard asks the same).
 */
export function firstRunOpen(cookies: AstroCookies, url: URL): boolean {
  return !isSeen(parseSeen(cookies.get(SEEN_COOKIE)?.value), FIRST_RUN.id, FIRST_RUN.version) || url.searchParams.has(STEP_PARAM)
}

/** The wishlist looked at: the games on sale now (`Wishlist.onSale`) are kept as seen, so the bar's «På salg» counts only those that go on sale after this. In the browser only. */
export const markSalesSeen = (cookies: AstroCookies, appIds: Iterable<number>): void => cookies.set(SALES_COOKIE, seenSalesValue(appIds), YEAR)
