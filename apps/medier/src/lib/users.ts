/**
 * Whose data is shown: the visitor's own usernames on Last.fm, Trakt, ListenBrainz, Steam and RetroAchievements, which they give the site (`/api/brukernavn`) and which are kept in a cookie in their browser, read by the server on every page.
 * No username, no data of that service: the page asks for it instead. Pure, with a test.
 */

export type Service = "lastfm" | "trakt" | "listenbrainz" | "steam" | "retroachievements"

export const SERVICES: readonly Service[] = ["lastfm", "trakt", "listenbrainz", "steam", "retroachievements"]

/** The usernames a request has, `null` for one it has not. */
export interface Users {
  lastfm: string | null
  trakt: string | null
  /** The music's other source: used where there is no Last.fm username (`hasMusic`). */
  listenbrainz: string | null
  /** A Steam profile's custom name or its SteamID (17 digits). */
  steam: string | null
  /** A username on RetroAchievements: the old console games played in an emulator. */
  retroachievements: string | null
}

export const NO_USERS: Users = { lastfm: null, trakt: null, listenbrainz: null, steam: null, retroachievements: null }

export const COOKIE: Record<Service, string> = { lastfm: "lastfm_user", trakt: "trakt_user", listenbrainz: "listenbrainz_user", steam: "steam_user", retroachievements: "retroachievements_user" }
export const SERVICE_NAME: Record<Service, string> = { lastfm: "Last.fm", trakt: "Trakt", listenbrainz: "ListenBrainz", steam: "Steam", retroachievements: "RetroAchievements" }

/** Whether there is music to show: plays from Last.fm, or else from ListenBrainz. */
export const hasMusic = (users: Users): boolean => users.lastfm !== null || users.listenbrainz !== null

/** A year, in seconds. */
export const COOKIE_MAX_AGE = 365 * 24 * 3600

/** What the endpoint redirects back with when a username could not be found: which service, and what was typed. */
export const ERROR_PARAM = "brukernavn-feil"
export const VALUE_PARAM = "brukernavn-verdi"

/** A username as it may be kept: trimmed, not too long, and of the letters the services allow (letters, digits, `_`, `-`, `.`); `null` for anything else. */
export function cleanUsername(value: unknown): string | null {
  if (typeof value !== "string") return null
  const name = value.trim()
  return /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(name) ? name : null
}

/** The usernames in a request's cookies; one that is not a username (edited by hand, garbled) is none. */
export function readUsers(cookie: (name: string) => string | undefined): Users {
  return { lastfm: cleanUsername(cookie(COOKIE.lastfm)), trakt: cleanUsername(cookie(COOKIE.trakt)), listenbrainz: cleanUsername(cookie(COOKIE.listenbrainz)), steam: cleanUsername(cookie(COOKIE.steam)), retroachievements: cleanUsername(cookie(COOKIE.retroachievements)) }
}

/** The address to go back to after the form: a path on this site, never another site's (`//host`, `/\host`, a scheme). */
export function safeBack(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return fallback
  return value
}

const without = (back: string): URL => {
  const url = new URL(back, "https://medier.invalid")
  url.searchParams.delete(ERROR_PARAM)
  url.searchParams.delete(VALUE_PARAM)
  return url
}
const path = (url: URL): string => `${url.pathname}${url.search}${url.hash}`

/** `back` with the error of a username that was not found (and nothing of an earlier error), for the page to show in its form. */
export function backWithError(back: string, service: Service, value: string): string {
  const url = without(back)
  url.searchParams.set(ERROR_PARAM, service)
  url.searchParams.set(VALUE_PARAM, value)
  return path(url)
}

/** `back` without an earlier error: once the username is found it is no longer an error. */
export const backWithoutError = (back: string): string => path(without(back))

/** The error a page was sent back with, if any: the service and what was typed. */
export function formError(search: URLSearchParams): { service: Service; value: string } | null {
  const service = SERVICES.find((one) => one === search.get(ERROR_PARAM))
  if (service === undefined) return null
  return { service, value: (search.get(VALUE_PARAM) ?? "").slice(0, 64) }
}

/** What the endpoint does with one field: leave the cookie be (the field was not in the form), clear it (an empty field), check and keep the username, or refuse what is no username. */
export type FieldAction = { kind: "keep" } | { kind: "clear" } | { kind: "set"; user: string } | { kind: "invalid"; value: string }

export function fieldAction(value: unknown): FieldAction {
  if (typeof value !== "string") return { kind: "keep" }
  if (value.trim() === "") return { kind: "clear" }
  const user = cleanUsername(value)
  return user === null ? { kind: "invalid", value: value.trim().slice(0, 64) } : { kind: "set", user }
}

/** Who a page is for, for the service worker: it keeps the pages of one visitor at a time (`public/sw.js`). */
export const whoOf = (users: Users): string => SERVICES.map((service) => users[service] ?? "").join("|")

export const WHO_HEADER = "X-Medier-Who"

/** One field of the username form (the design system's `UsernameForm`). */
export interface UsernameField {
  name: string
  label: string
  value?: string
  hint?: string
  error?: string
}

const HINT: Record<Service, string> = {
  lastfm: "Brukernavnet ditt på last.fm, der avspillingene dine blir registrert.",
  trakt: "Brukernavnet ditt på trakt.tv. Profilen må være offentlig.",
  listenbrainz: "Brukernavnet ditt på listenbrainz.org. Brukes for musikken når du ikke har Last.fm.",
  steam: "Det egne navnet i adressen til Steam-profilen din (steamcommunity.com/id/…), eller SteamID-en (17 sifre). Spilldetaljene må være offentlige.",
  retroachievements: "Brukernavnet ditt på retroachievements.org, for spillene du spiller i en emulator.",
}

export const NOT_FOUND: Record<Service, (value: string) => string> = {
  lastfm: (value) => `Fant ingen bruker som heter «${value}» på Last.fm. Sjekk stavingen.`,
  trakt: (value) => `Fant ingen offentlig profil som heter «${value}» på Trakt. Sjekk stavingen, og at profilen ikke er privat.`,
  listenbrainz: (value) => `Fant ingen bruker som heter «${value}» på ListenBrainz. Sjekk stavingen.`,
  steam: (value) => `Fant ingen Steam-profil med navnet eller ID-en «${value}». Sjekk stavingen, og bruk navnet fra profilens adresse.`,
  retroachievements: (value) => `Fant ingen bruker som heter «${value}» på RetroAchievements. Sjekk stavingen.`,
}

/** The fields for the services a page needs, filled in with what the visitor has (or typed, when it was not found), with the error of one that was not found. */
export function usernameFields(services: readonly Service[], users: Users, error: { service: Service; value: string } | null): UsernameField[] {
  return services.map((service) => {
    const failed = error?.service === service
    const value = failed ? error.value : (users[service] ?? undefined)
    return { name: service, label: `Brukernavn på ${SERVICE_NAME[service]}`, hint: HINT[service], ...(value === undefined ? {} : { value }), ...(failed ? { error: NOT_FOUND[service](error.value) } : {}) }
  })
}

export const FORM_BODY = "Vi viser bare det som er offentlig på profilen. Brukernavnet lagres i en informasjonskapsel i denne nettleseren."
