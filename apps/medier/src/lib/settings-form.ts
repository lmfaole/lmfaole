/**
 * The settings of a visitor, as the first-run wizard and «Innstillinger» send them (`src/pages/api/innstillinger.ts`): the two usernames, which sections the front page has, the theme, the effects and the
 * tilt. Pure, with a test: what a form says is read here, the usernames are checked by what the endpoint passes in, and the cookies and the redirect are made from the answer.
 */
import type { OnOff, Prefs, Theme } from "@lmfaole/designsystem/lib/preferences"

import { backWithError, backWithoutError, fieldAction, NOT_FOUND, type Service, SERVICES, type Users } from "./users.ts"

/** The wizard is in the `seen` cookie as `first-run@1` once it has been done or skipped; raise the version to show a changed one to everyone again. */
export const FIRST_RUN = { id: "first-run", version: 1 } as const

/** Where the wizard reopens after the server found an error in a step (without JavaScript): `?forste-gang=<step>`. */
export const STEP_PARAM = "forste-gang"

/** A hidden field of the wizard's, so the endpoint knows an error is to be shown in it (and not on «Innstillinger»). */
export const SOURCE_FIELD = "kilde"
export const FROM_FIRST_RUN = "forste-gang"

/** The steps of the wizard, in order. */
export const STEPS = ["velkommen", "lastfm", "trakt", "forsiden", "tema", "effekter", "lys", "installer"] as const
export type Step = (typeof STEPS)[number]

export const isStep = (value: string | null): value is Step => value !== null && (STEPS as readonly string[]).includes(value)

/** The step a username's field is in: the wizard asks only for Last.fm and Trakt, the others are only on «Innstillinger». */
export const STEP_OF: Partial<Record<Service, Step>> = { lastfm: "lastfm", trakt: "trakt" }

/** The front page's sections a visitor can leave out, in the order they stand. */
export const FRONT_SECTIONS = [
  { value: "na", label: "Spilles nå", description: "Låten du hører på akkurat nå, fra Last.fm.", icon: "listen" },
  { value: "musikk", label: "Musikk", description: "De siste avspillingene.", icon: "music" },
  { value: "film", label: "Film", description: "Filmene du har sett sist.", icon: "film" },
  { value: "tv", label: "TV", description: "Episodene du har sett sist.", icon: "tv" },
  { value: "artister", label: "Mest spilt siste måned", description: "Artistene du har spilt mest.", icon: "trend-up" },
  { value: "spill", label: "Spill", description: "Spillene du har spilt de siste to ukene, fra Steam.", icon: "game" },
] as const
export type FrontSection = (typeof FRONT_SECTIONS)[number]["value"]

/** The sections' ids in the app's own order, which the visitor's `order` rearranges (`orderSections` in the design system's `lib/preferences`). */
export const FRONT_SECTION_IDS: readonly FrontSection[] = FRONT_SECTIONS.map((section) => section.value)
const SECTION_IDS: readonly string[] = FRONT_SECTION_IDS
const isSection = (value: string): value is FrontSection => SECTION_IDS.includes(value)

/** Sections of before that are more than one now: «film-og-tv» was film and TV together, so a choice of it is both. */
const RENAMED: Readonly<Record<string, readonly FrontSection[]>> = { "film-og-tv": ["film", "tv"] }

/** The sections the front page shows, in its order: those chosen (old ones as what they are now, unknown ones ignored), or all where nothing has been chosen. */
export function shownSections(prefs: Pick<Prefs, "sections">): ReadonlySet<FrontSection> {
  if (prefs.sections === undefined) return new Set(FRONT_SECTIONS.map((section) => section.value))
  const chosen = new Set(prefs.sections.flatMap((value) => RENAMED[value] ?? (isSection(value) ? [value] : [])))
  return new Set(FRONT_SECTIONS.map((section) => section.value).filter((section) => chosen.has(section)))
}

const THEMES: readonly Theme[] = ["system", "light", "dark"]
const isTheme = (value: unknown): value is Theme => typeof value === "string" && (THEMES as readonly string[]).includes(value)
const isOnOff = (value: unknown): value is OnOff => value === "on" || value === "off"

/**
 * The design system's ordering (`orderSections` from `lib/preferences`, `applyMove` from `lib/reorder`), passed in by the endpoint: this module is run by `node --test`, which cannot load the
 * design system's TypeScript.
 */
export interface Ordering {
  orderSections: (ids: readonly string[], order?: readonly string[]) => string[]
  applyMove: (order: readonly string[], move: string | null | undefined) => string[]
}

/**
 * The prefs after a form: each choice the form has (a valid one), the others as they were. `sections` is a set of checkboxes, so the form also sends an empty `sections` to say the field was there:
 * with none ticked, the front page has none of them; without the field at all, they are left as they were. `order` is the `ReorderList`'s hidden field (comma ids), every section in it whatever is
 * missing or unknown, with a no-JS «Flytt opp» / «Flytt ned» (`move=<id>:up|down`) applied to it.
 */
export function formPrefs(current: Prefs, form: FormData, ordering?: Ordering): Prefs {
  const theme = form.get("theme")
  const effects = form.get("effects")
  const tilt = form.get("tilt")
  const next: Prefs = { theme: isTheme(theme) ? theme : current.theme, effects: isOnOff(effects) ? effects : current.effects, tilt: isOnOff(tilt) ? tilt : current.tilt }
  if (form.has("sections")) {
    const chosen = new Set(form.getAll("sections").filter((value): value is string => typeof value === "string" && isSection(value)))
    next.sections = FRONT_SECTIONS.map((section) => section.value).filter((section) => chosen.has(section))
  } else if (current.sections !== undefined) next.sections = current.sections
  const order = form.get("order")
  if (typeof order === "string" && ordering !== undefined) {
    const move = form.get("move")
    next.order = ordering.applyMove(ordering.orderSections(SECTION_IDS, order.split(",").map((id) => id.trim())), typeof move === "string" ? move : null)
  } else if (current.order !== undefined) next.order = current.order
  return next
}

/** The front page's sections as the visitor has them: in their order (`orderSections`), the chosen ones only. */
export const frontSections = (prefs: Pick<Prefs, "sections" | "order">, orderSections: <T extends string>(ids: readonly T[], order?: readonly string[]) => T[]): FrontSection[] => {
  const shown = shownSections(prefs)
  return orderSections(FRONT_SECTION_IDS, prefs.order).filter((id) => shown.has(id))
}

const LABEL: Record<FrontSection, string> = Object.fromEntries(FRONT_SECTIONS.map((section) => [section.value, section.label])) as Record<FrontSection, string>

/** What «Innstillinger» says is chosen under each of the app's own subpages («Utseende» is the design system's `appearancePage`). */
export function settingsSummary(shown: readonly FrontSection[], users: Users): { kontoer: string; forside: string } {
  const names = SERVICES.flatMap((service) => users[service] ?? []).filter((name, at, all) => all.findIndex((one) => one.toLowerCase() === name.toLowerCase()) === at)
  return {
    kontoer: names.length === 0 ? "Ingen brukernavn ennå" : names.length === 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} og ${names.at(-1) ?? ""}`,
    forside: shown.length === 0 ? "Ingen seksjoner" : shown.map((id) => LABEL[id]).join(", "),
  }
}

/** What to do with the usernames of a form: the ones to keep (found), the ones to forget (empty), and the ones not found, with what was typed. A field that is not in the form is left be. */
export interface UsernamePlan {
  set: Partial<Record<Service, string>>
  clear: Service[]
  invalid: Partial<Record<Service, string>>
}

export async function planUsernames(form: FormData, found: (service: Service, user: string) => Promise<boolean>): Promise<UsernamePlan> {
  const plan: UsernamePlan = { set: {}, clear: [], invalid: {} }
  await Promise.all(
    SERVICES.map(async (service) => {
      const action = fieldAction(form.get(service))
      if (action.kind === "clear") plan.clear.push(service)
      else if (action.kind === "invalid") plan.invalid[service] = action.value
      else if (action.kind === "set") {
        if (await found(service, action.user)) plan.set[service] = action.user
        else plan.invalid[service] = action.user
      }
    }),
  )
  return plan
}

/** The wizard's answer to a step checked with JavaScript: `{ errors: { field: "melding" } }`, empty when all is well. */
export function stepErrors(plan: UsernamePlan): Record<string, string> {
  return Object.fromEntries(SERVICES.flatMap((service) => (plan.invalid[service] === undefined ? [] : [[service, NOT_FOUND[service](plan.invalid[service])]])))
}

/**
 * Where to go once the form is read: `back` without an earlier error when all was well; else back with the first username that was not found (the page's form says so by its field), and from the wizard
 * also `forste-gang=<its step>` and the step's anchor, so it opens there again.
 */
export function settingsRedirect(back: string, plan: UsernamePlan, fromFirstRun: boolean): string {
  const clean = withoutStep(backWithoutError(back))
  const failed = SERVICES.find((service) => plan.invalid[service] !== undefined)
  if (failed === undefined) return clean
  const withError = backWithError(clean, failed, plan.invalid[failed] ?? "")
  const step = STEP_OF[failed]
  if (!fromFirstRun || step === undefined) return withError
  const url = new URL(withError, "https://medier.invalid")
  url.searchParams.set(STEP_PARAM, step)
  return `${url.pathname}${url.search}#first-run-${step}`
}

const withoutStep = (back: string): string => {
  const url = new URL(back, "https://medier.invalid")
  url.searchParams.delete(STEP_PARAM)
  url.hash = ""
  return `${url.pathname}${url.search}`
}

/** The `seen` cookie's value without `id` (any version): «Vis introen igjen». */
export function withoutSeen(value: string | undefined, id: string): string {
  let text = value ?? ""
  try {
    text = decodeURIComponent(text)
  } catch {
    // Kept as it is.
  }
  return text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "" && part.split("@")[0] !== id)
    .join(",")
}

/** The subpages of «Innstillinger» (`/innstillinger/<slug>/`), in the overview's order. */
export const SETTINGS_PAGES = {
  kontoer: { label: "Kontoer", icon: "person", lead: "Hvem siden henter data for: brukernavnet ditt på Last.fm (eller ListenBrainz), Trakt, Steam og RetroAchievements. Vi viser bare det som er offentlig på profilen." },
  forside: { label: "Forside", icon: "home", lead: "Hvilke seksjoner forsiden viser, og i hvilken rekkefølge." },
  utseende: { label: "Utseende", icon: "sun", lead: "Lyst eller mørkt, effekter i 3D, lys som følger telefonen og vibrasjon." },
  app: { label: "App", icon: "device", lead: "Ha Medier på hjem-skjermen." },
} as const
export type SettingsPage = keyof typeof SETTINGS_PAGES

/** Where a subpage's form comes back to: the subpage with `lagret=1` (the «Lagret» it shows), and the page the visitor came from (`tilbake`) when there is one. */
export function settingsPageBack(base: string, page: SettingsPage, tilbake: string | null): string {
  const params = new URLSearchParams(tilbake === null ? {} : { tilbake })
  params.set("lagret", "1")
  return `${base}innstillinger/${page}/?${params.toString()}`
}

/** Where the sections of the one long «Innstillinger» of before are now: its anchors (`/innstillinger/#tema`) lead to the subpage. */
export const OLD_ANCHORS: Readonly<Record<string, SettingsPage>> = { brukernavn: "kontoer", forsiden: "forside", rekkefolge: "forside", tema: "utseende", effekter: "utseende", lys: "utseende" }
