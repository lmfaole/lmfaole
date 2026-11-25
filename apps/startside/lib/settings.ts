/**
 * The visitor's settings: what the first-run wizard (`components/first-run.tsx`) and «Innstillinger» (`app/innstillinger`) send to
 * `app/api/innstillinger/route.ts`, read and checked here. The GitHub username, the repositories to follow (the `github_repos`
 * cookie), the front page's sections, the theme, the effects and the tilt (the `prefs` cookie, the design system's `lib/preferences`).
 * Pure, so a test pins it: what is asked of GitHub comes in as `Checks`.
 */
import { BASE } from "./links.ts"
import type { SectionId } from "./plan.ts"
import { parseLogin } from "./username.ts"

export const SETTINGS_ENDPOINT = `${BASE}/api/innstillinger`
export const SETTINGS_PAGE = `${BASE}/innstillinger`
/** The settings' subpages (`app/innstillinger/<slug>`), each with its own small form; the overview links to them. */
export const SETTINGS_SUBPAGES = ["konto", "repoer", "forside", "tid", "posisjon", "utseende", "app"] as const
export type SettingsSubpage = (typeof SETTINGS_SUBPAGES)[number]
export const settingsPage = (slug: SettingsSubpage, sub?: string): string => `${SETTINGS_PAGE}/${slug}${sub === undefined ? "" : `/${sub}`}`

/** The repositories to follow, `owner/name` separated by commas (URL-encoded in the cookie). */
export const REPOS_COOKIE = "github_repos"
export const MAX_REPOS = 20

/** The wizard's entry in the `seen` cookie, and its anchor and DOM id. */
export const FIRST_RUN = "first-run"
/** The query parameter the wizard reopens at after a submission without JavaScript failed: the step. */
export const STEP_PARAM = "forste-gang"
/** A short-lived cookie with what a failed submission said and what was written, so the form shows it again (kept out of the address). */
export const PROBLEMS_COOKIE = "innstillinger-feil"

const YEAR = 60 * 60 * 24 * 365

export type Theme = "system" | "light" | "dark"
export type OnOff = "on" | "off"
/** The same shape as the design system's `Prefs`. */
export type Choices = { theme: Theme; effects: OnOff; tilt: OnOff; sections?: string[]; order?: string[] }

/** The front page's sections, as they are offered: every one is shown at the time of day it fits (lib/plan.ts). */
export const SECTION_OPTIONS: readonly { value: SectionId; label: string; description: string }[] = [
  { value: "alerts", label: "Følg opp", description: "Bygg som har feilet, svar og Dependabot. Bare for eieren av startsiden." },
  { value: "pulls", label: "Pull requests", description: "Det som venter på review, og dine egne." },
  { value: "issues", label: "Issues", description: "Tildelt deg, og nye i repoene du følger." },
  { value: "discussions", label: "Discussions", description: "Der du er med, i repoene du følger." },
  { value: "weather", label: "Været", description: "Resten av dagen, eller i morgen om kvelden." },
]

/** Each section's icon, in the order list and the overview. */
export const SECTION_ICONS = { alerts: "notification", pulls: "pull-request", issues: "issue", discussions: "discussion", weather: "weather" } as const satisfies Record<SectionId, string>

const SECTION_IDS = new Set<string>(SECTION_OPTIONS.map((option) => option.value))

/** What the form said, field by field; a field that was not in the form is absent, and is left as it is. */
export type SettingsForm = {
  github?: string
  repos?: string[]
  theme?: Theme
  effects?: OnOff
  tilt?: OnOff
  sections?: SectionId[]
  /** The front page's order (the reorder list's hidden field, comma ids), known sections only. */
  order?: SectionId[]
  skip: boolean
  rerun: boolean
  /** With JavaScript the wizard asks for one step at a time: the step's id. Then nothing is kept; the answer is the errors. */
  validate?: string
  /** Sent from the wizard (a hidden field in its first step), so a failure reopens it at the step. */
  fromWizard: boolean
}

const text = (value: FormDataEntryValue | null): string | undefined => (typeof value === "string" ? value : undefined)
const oneOf = <T extends string>(value: FormDataEntryValue | null, allowed: readonly T[]): T | undefined => (allowed as readonly string[]).includes(String(value)) ? (value as T) : undefined

/** Lines and commas split it; blanks and repeats (in any case) go; the first `max` are kept. As the design system's `parseListField`. */
export function listOf(value: string | undefined, max = Number.POSITIVE_INFINITY): string[] {
  const seen = new Set<string>()
  const list: string[] = []
  for (const part of (value ?? "").split(/[\n\r,]+/)) {
    const item = part.trim()
    if (item === "" || seen.has(item.toLowerCase())) continue
    seen.add(item.toLowerCase())
    list.push(item)
    if (list.length >= max) break
  }
  return list
}

export function readSettingsForm(form: FormData): SettingsForm {
  const github = text(form.get("github"))
  const repos = text(form.get("repos"))
  // A CheckboxList with nothing ticked sends nothing: the hidden `sections-shown` says the list was there, so none means none.
  const sections = form.has("sections-shown") || form.has("sections") ? form.getAll("sections").map(String).filter((id): id is SectionId => SECTION_IDS.has(id)) : undefined
  const order = text(form.get("order"))
  return {
    ...(github === undefined ? {} : { github }),
    ...(order === undefined ? {} : { order: [...new Set(order.split(",").map((id) => id.trim()).filter((id): id is SectionId => SECTION_IDS.has(id)))] }),
    ...(repos === undefined ? {} : { repos: listOf(repos) }),
    ...(oneOf(form.get("theme"), ["system", "light", "dark"] as const) === undefined ? {} : { theme: form.get("theme") as Theme }),
    ...(oneOf(form.get("effects"), ["on", "off"] as const) === undefined ? {} : { effects: form.get("effects") as OnOff }),
    ...(oneOf(form.get("tilt"), ["on", "off"] as const) === undefined ? {} : { tilt: form.get("tilt") as OnOff }),
    ...(sections === undefined ? {} : { sections: [...new Set(sections)] }),
    skip: form.get("skip") === "1",
    rerun: form.get("rerun") === "1",
    ...(text(form.get("validate")) ? { validate: String(form.get("validate")) } : {}),
    fromWizard: form.get("kilde") === FIRST_RUN,
  }
}

/** The choices with what the form changed; all sections ticked is the default again (so a section added later is shown too). */
export function mergeChoices(current: Choices, form: SettingsForm): Choices {
  const sections = form.sections ?? current.sections
  const all = sections !== undefined && SECTION_OPTIONS.every((option) => sections.includes(option.value))
  const next: Choices = { theme: form.theme ?? current.theme, effects: form.effects ?? current.effects, tilt: form.tilt ?? current.tilt }
  if (sections !== undefined && !all) next.sections = sections
  const order = form.order ?? current.order
  if (order !== undefined && order.length > 0) next.order = order
  return next
}

/** A repository as `owner/name`; `null` for anything else (it goes into GitHub's queries). */
export function parseRepo(value: string): string | null {
  const repo = value.trim().replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "")
  return /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]{1,100}$/.test(repo) ? repo : null
}

/** The repositories in the cookie; what is not `owner/name` is dropped, and no more than `MAX_REPOS`. */
export function parseReposCookie(value: string | undefined): string[] {
  let decoded = value ?? ""
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    return []
  }
  return listOf(decoded)
    .map(parseRepo)
    .filter((repo): repo is string => repo !== null)
    .slice(0, MAX_REPOS)
}

/** The `Set-Cookie` that keeps the repositories for a year (none is kept as `-`, so the suggestion is not offered again), or removes the cookie (`null`). */
export function reposCookie(repos: readonly string[] | null): string {
  const value = repos === null ? "" : repos.length === 0 ? "-" : encodeURIComponent(repos.join(","))
  return `${REPOS_COOKIE}=${value}; Path=${BASE}; Max-Age=${repos === null ? 0 : YEAR}; SameSite=Lax; Secure; HttpOnly`
}

/** What is asked of GitHub: the login as GitHub writes it (or `null`: no such user), and a public repository's `owner/name` as GitHub writes it (or `null`). */
export type Checks = { user: (login: string) => Promise<string | null>; publicRepo: (repo: string) => Promise<string | null> }

/** The fields that are checked, each on its own step of the wizard. */
export type Field = "github" | "repos" | "starts"
/** The wizard's step of each field, or the settings page's anchor (`starts`: the time-of-day settings, not in the wizard). */
export const STEP_OF: Record<Field, string> = { github: "github", repos: "repos", starts: "tider" }

export type Checked = { errors: Partial<Record<Field, string>>; github?: string | null; repos?: string[] }

/** Checks what needs GitHub: the user exists (an empty field forgets the name: `null`) and every repository is public (at most 20). */
export async function checkSettings(form: SettingsForm, checks: Checks): Promise<Checked> {
  const result: Checked = { errors: {} }
  if (form.github !== undefined) {
    const written = form.github.trim()
    if (written === "") result.github = null
    else {
      const login = parseLogin(written)
      const found = login === null ? null : await checks.user(login).catch(() => null)
      if (found === null) result.errors.github = `Fant ingen GitHub-bruker som heter «${written.slice(0, 100)}». Sjekk stavemåten.`
      else result.github = found
    }
  }
  if (form.repos !== undefined) {
    if (form.repos.length > MAX_REPOS) result.errors.repos = `Du kan følge opptil ${MAX_REPOS} repoer. Ta bort ${form.repos.length - MAX_REPOS}.`
    else {
      const malformed = form.repos.find((repo) => parseRepo(repo) === null)
      if (malformed !== undefined) result.errors.repos = `«${malformed.slice(0, 100)}» er ikke et repo. Skriv det som eier/navn, for eksempel vercel/next.js.`
      else {
        const found = await Promise.all(form.repos.map(async (repo) => [repo, await checks.publicRepo(parseRepo(repo) as string).catch(() => null)] as const))
        const missing = found.find(([, name]) => name === null)
        if (missing !== undefined) result.errors.repos = `Fant ikke noe offentlig repo som heter «${missing[0].slice(0, 100)}».`
        else result.repos = found.map(([, name]) => name as string)
      }
    }
  }
  return result
}

/** What a failed submission brings back to the form: where (the wizard's step), why, and what was written. */
export type Problems = { step?: string; errors: Partial<Record<Field, string>>; values: Partial<Record<Field, string>> }

const FIELDS: readonly Field[] = ["github", "repos", "starts"]

export function encodeProblems(problems: Problems): string {
  const params = new URLSearchParams()
  if (problems.step !== undefined) params.set("step", problems.step)
  for (const field of FIELDS) {
    const error = problems.errors[field]
    const value = problems.values[field]
    if (error !== undefined) params.set(`${field}-error`, error)
    if (value !== undefined) params.set(field, value.slice(0, 2000))
  }
  return params.toString()
}

export function decodeProblems(value: string | undefined): Problems | null {
  if (value === undefined || value === "") return null
  let params: URLSearchParams
  try {
    params = new URLSearchParams(decodeURIComponent(value))
  } catch {
    return null
  }
  const problems: Problems = { errors: {}, values: {} }
  const step = params.get("step")
  if (step !== null && /^[a-z-]{1,20}$/.test(step)) problems.step = step
  for (const field of FIELDS) {
    const error = params.get(`${field}-error`)
    const written = params.get(field)
    if (error !== null) problems.errors[field] = error.slice(0, 300)
    if (written !== null) problems.values[field] = written.slice(0, 2000)
  }
  return Object.keys(problems.errors).length === 0 ? null : problems
}

/** The `Set-Cookie` for the problems of a failed submission (a couple of minutes, enough to come back to the form), or that removes them. */
export function problemsCookie(problems: Problems | null): string {
  return `${PROBLEMS_COOKIE}=${problems === null ? "" : encodeURIComponent(encodeProblems(problems))}; Path=${BASE}; Max-Age=${problems === null ? 0 : 120}; SameSite=Lax; Secure; HttpOnly`
}

/** The first step with an error, in the wizard's order. */
export function firstStep(errors: Partial<Record<Field, string>>): string | undefined {
  const field = FIELDS.find((one) => errors[one] !== undefined)
  return field === undefined ? undefined : STEP_OF[field]
}

/** `back` without an earlier `forste-gang` (and an earlier «lagret»), and with what is given now; the anchor is the step, so it opens there without JavaScript. */
export function backWith(back: string, add: { step?: string; saved?: boolean } = {}): string {
  const hashAt = back.indexOf("#")
  const beforeHash = hashAt === -1 ? back : back.slice(0, hashAt)
  const queryAt = beforeHash.indexOf("?")
  const path = queryAt === -1 ? beforeHash : beforeHash.slice(0, queryAt)
  const params = new URLSearchParams(queryAt === -1 ? "" : beforeHash.slice(queryAt + 1))
  params.delete(STEP_PARAM)
  params.delete("lagret")
  if (add.step !== undefined) params.set(STEP_PARAM, add.step)
  if (add.saved) params.set("lagret", "1")
  const query = params.toString()
  const hash = add.step !== undefined ? `#${FIRST_RUN}-${add.step}` : hashAt === -1 || add.saved ? "" : back.slice(hashAt)
  return `${path}${query === "" ? "" : `?${query}`}${hash}`
}

/** The page a form was sent from, from the `Referer` (same origin only): where the wizard, drawn on any page, goes back to. */
export function refererPath(referer: string | null, origin: string): string | null {
  if (referer === null) return null
  try {
    const url = new URL(referer)
    return url.origin === origin ? `${url.pathname}${url.search}` : null
  } catch {
    return null
  }
}

/** The `seen` cookie's value without `id` (any version): «Vis introen igjen». Entries are `id@version`, separated by commas. */
export function withoutSeen(value: string | undefined, id: string): string {
  let decoded = value ?? ""
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    return ""
  }
  return decoded
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "" && part.split("@")[0] !== id)
    .join(",")
}

/** The overview's line for the front page: the sections it shows, in their order («Følg opp, Pull requests, …»), or that none are. */
export function sectionsSummary(order: readonly string[], chosen?: readonly string[]): string {
  const shown = order.filter((id) => chosen === undefined || chosen.includes(id)).map((id) => SECTION_OPTIONS.find((option) => option.value === id)?.label ?? id)
  return shown.length === 0 ? "Ingen deler" : shown.join(", ")
}

/** The overview's line for the followed repositories (the cookie; absent is none, whatever the suggestion is). */
export function reposSummary(repos: readonly string[]): string {
  if (repos.length === 0) return "Ingen"
  return repos.length <= 2 ? repos.join(" og ") : `${repos.slice(0, 2).join(", ")} og ${repos.length - 2} til`
}
