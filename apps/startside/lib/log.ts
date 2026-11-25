// The owner's hand-kept logs (Logg, /start/logg): film, TV, games, books, board games and cinemas, kept in D1 since the CSV files of the
// old monorepo went (scripts/import-dump.ts brought them in). One spec per kind says where its rows are, what the form asks and how a row
// is read back; the validation of a form is here and pure, the queries are in lib/log-db.ts. Tested in lib/log.test.ts.

import type { IconName } from "@lmfaole/designsystem/lib/icons"

import { BASE } from "./links.ts"

export type LogKind = "film" | "tv" | "spill" | "boker" | "brettspill" | "kinoer"

/** The D1 bindings (wrangler.jsonc): `watching` and `gameplay` are the activity worker's, `library` packages/db's. */
export type LogDatabase = "WATCHING" | "GAMEPLAY" | "LIBRARY"

export type Value = string | number | null
export type Row = Record<string, Value>

export interface Option {
  value: string
  label: string
}

interface FieldBase {
  /** The form field, and (but for `list:status`) the column it is kept in. */
  name: string
  label: string
  hint?: string
  optional?: boolean
  /** What is typed exactly (an id, a code): no capital letter and no spelling check. */
  verbatim?: boolean
}

export type Field =
  | (FieldBase & { type: "text"; max: number; missing: string })
  | (FieldBase & { type: "date"; missing?: string })
  | (FieldBase & { type: "year"; missing?: string })
  | (FieldBase & { type: "integer"; min: number; wrong: string; missing?: string })
  | (FieldBase & { type: "decimal"; min: number; max: number; step?: number; wrong: string })
  | (FieldBase & { type: "choice"; options: readonly Option[]; missing: string })
  | (FieldBase & { type: "cinema" })
  | (FieldBase & { type: "country" })
  | (FieldBase & { type: "url" })

export interface KindSpec {
  kind: LogKind
  db: LogDatabase
  table: string
  /** The page's title and the section's. */
  title: string
  /** «Ny film»: the action and the title of the empty form. */
  add: string
  /** In «Kunne ikke hente {what}»: «filmloggen». */
  what: string
  /** «1 film», «2 filmer», «Slett filmen». */
  one: string
  /** In «Ingen {plural} ennå». */
  plural: string
  the: string
  icon: IconName
  fields: readonly Field[]
}

const NOTE: Field = { name: "note", label: "Notat", type: "text", max: 1000, optional: true, missing: "" }
const DATE_HINT = "Dag, måned og år, som 25.11.2026."

/** Statuses, in the order they are offered. A book's and a board game's status also says which list it is in (`list:status`). */
export const GAME_STATUSES: readonly Option[] = [
  { value: "playing", label: "Spiller" },
  { value: "done", label: "Ferdig" },
  { value: "dropped", label: "Avbrutt" },
]
export const BOOK_STATUSES: readonly Option[] = [
  { value: "log:done", label: "Lest" },
  { value: "log:reading", label: "Leser" },
  { value: "log:dropped", label: "Avbrutt" },
  { value: "collection:owned", label: "Eier" },
  { value: "collection:want", label: "Vil ha" },
]
export const BOARDGAME_STATUSES: readonly Option[] = [
  { value: "log:played", label: "Spilt" },
  { value: "collection:owned", label: "Eier" },
]

export const KINDS: Record<LogKind, KindSpec> = {
  film: {
    kind: "film",
    db: "WATCHING",
    table: "film_log",
    title: "Film",
    add: "Ny film",
    what: "filmloggen",
    one: "film",
    plural: "filmer",
    the: "filmen",
    icon: "film",
    fields: [
      { name: "watched_on", label: "Dato", type: "date", hint: `${DATE_HINT} Tomt når dagen ikke er kjent.`, optional: true },
      { name: "title", label: "Tittel", type: "text", max: 300, missing: "Skriv tittelen på filmen." },
      { name: "year", label: "År", type: "year", hint: "Året filmen kom, som 2024.", optional: true },
      { name: "tmdb_id", label: "TMDB-id", type: "integer", min: 1, hint: "Tallet i adressen hos themoviedb.org, som 949423.", optional: true, verbatim: true, wrong: "Skriv TMDB-id-en som et helt tall, som 949423." },
      { name: "cinema", label: "Kino", type: "cinema", hint: "Tomt for en film sett hjemme.", optional: true },
      { name: "seat", label: "Sete", type: "text", max: 200, hint: "Som Sal 1, rad 6, sete 13.", optional: true, missing: "" },
      NOTE,
    ],
  },
  tv: {
    kind: "tv",
    db: "WATCHING",
    table: "tv_log",
    title: "TV",
    add: "Ny episode",
    what: "TV-loggen",
    one: "episode",
    plural: "episoder",
    the: "episoden",
    icon: "tv",
    fields: [
      { name: "watched_on", label: "Dato", type: "date", hint: `${DATE_HINT} Tomt når dagen ikke er kjent.`, optional: true },
      { name: "show", label: "Serie", type: "text", max: 300, missing: "Skriv navnet på serien." },
      { name: "season", label: "Sesong", type: "integer", min: 0, hint: "0 for spesialepisoder.", verbatim: true, missing: "Skriv sesongen som et tall, som 2.", wrong: "Skriv sesongen som et helt tall, som 2." },
      { name: "episode", label: "Episode", type: "integer", min: 0, verbatim: true, missing: "Skriv episoden som et tall, som 7.", wrong: "Skriv episoden som et helt tall, som 7." },
      { name: "episode_title", label: "Episodetittel", type: "text", max: 300, optional: true, missing: "" },
      { name: "tmdb_id", label: "TMDB-id", type: "integer", min: 1, hint: "Seriens tall i adressen hos themoviedb.org, som 117488.", optional: true, verbatim: true, wrong: "Skriv TMDB-id-en som et helt tall, som 117488." },
    ],
  },
  spill: {
    kind: "spill",
    db: "GAMEPLAY",
    table: "game_log",
    title: "Spill",
    add: "Nytt spill",
    what: "spilloggen",
    one: "spill",
    plural: "spill",
    the: "spillet",
    icon: "game",
    fields: [
      { name: "on_date", label: "Dato", type: "date", hint: `${DATE_HINT} Tomt når dagen ikke er kjent.`, optional: true },
      { name: "title", label: "Tittel", type: "text", max: 300, missing: "Skriv tittelen på spillet." },
      { name: "status", label: "Status", type: "choice", options: GAME_STATUSES, missing: "Velg om du spiller, er ferdig eller har avbrutt." },
      { name: "hours", label: "Timer", type: "decimal", min: 0, max: 10000, hint: "Tiden spilt, som 1,5.", optional: true, verbatim: true, wrong: "Skriv timene som et tall, som 1,5." },
      { name: "platform", label: "Plattform", type: "text", max: 100, hint: "Som playstation, xbox, gba eller steam.", optional: true, verbatim: true, missing: "" },
      NOTE,
    ],
  },
  boker: {
    kind: "boker",
    db: "LIBRARY",
    table: "books",
    title: "Bøker",
    add: "Ny bok",
    what: "bøkene",
    one: "bok",
    plural: "bøker",
    the: "boka",
    icon: "book",
    fields: [
      { name: "list:status", label: "Status", type: "choice", options: BOOK_STATUSES, hint: "Lest, leser og avbrutt er loggen; eier og vil ha er samlingen.", missing: "Velg en status for boka." },
      { name: "title", label: "Tittel", type: "text", max: 300, missing: "Skriv tittelen på boka." },
      { name: "year", label: "År", type: "year", hint: "Året boka kom, som 2021.", optional: true },
      { name: "on_date", label: "Dato", type: "date", hint: `${DATE_HINT} Da du leste den ut, begynte på den eller fikk den.`, optional: true },
      { name: "rating", label: "Vurdering", type: "decimal", min: 0.5, max: 5, step: 0.5, hint: "Fra 0,5 til 5, i halve.", optional: true, verbatim: true, wrong: "Skriv vurderingen som et tall fra 0,5 til 5, i halve, som 4,5." },
      { name: "format", label: "Format", type: "text", max: 100, hint: "Som lydbok, e-bok eller papir.", optional: true, missing: "" },
    ],
  },
  brettspill: {
    kind: "brettspill",
    db: "LIBRARY",
    table: "boardgames",
    title: "Brettspill",
    add: "Nytt brettspill",
    what: "brettspillene",
    one: "brettspill",
    plural: "brettspill",
    the: "brettspillet",
    icon: "boardgame",
    fields: [
      { name: "title", label: "Tittel", type: "text", max: 300, missing: "Skriv navnet på brettspillet." },
      { name: "list:status", label: "Status", type: "choice", options: BOARDGAME_STATUSES, hint: "Spilt er loggen; eier er samlingen.", missing: "Velg om du har spilt det eller eier det." },
      { name: "format", label: "Format", type: "text", max: 100, hint: "Som fysisk eller app.", optional: true, missing: "" },
    ],
  },
  kinoer: {
    kind: "kinoer",
    db: "WATCHING",
    table: "cinemas",
    title: "Kinoer",
    add: "Ny kino",
    what: "kinoene",
    one: "kino",
    plural: "kinoer",
    the: "kinoen",
    icon: "place",
    fields: [
      { name: "name", label: "Navn", type: "text", max: 200, hint: "Slik filmene skal vise den, som Vega kino.", missing: "Skriv navnet på kinoen." },
      { name: "city", label: "By", type: "text", max: 100, optional: true, missing: "" },
      { name: "country", label: "Land", type: "country", hint: "Landkoden med to bokstaver, som NO eller SE." },
      { name: "website", label: "Nettsted", type: "url", hint: "Som https://www.vegakino.no/.", optional: true, verbatim: true },
    ],
  },
}

export const LOG_KINDS = Object.keys(KINDS) as LogKind[]

/** «1 film», «1 234 filmer». */
export const countOf = (kind: LogKind, count: number): string => `${count.toLocaleString("nb-NO")} ${count === 1 ? KINDS[kind].one : KINDS[kind].plural}`

/** The link to all of a kind: «Se hele filmloggen», «Se alle bøkene». */
export const allOf = (kind: LogKind): string => `${KINDS[kind].what.endsWith("loggen") ? "Se hele" : "Se alle"} ${KINDS[kind].what}`

export const isLogKind = (value: unknown): value is LogKind => typeof value === "string" && Object.hasOwn(KINDS, value)

/** The endpoint every form of the log is sent to (app/api/logg/route.ts). */
export const LOG_ENDPOINT = `${BASE}/api/logg`
/** Where the log's pages are; a form is taken only from a page under it. */
export const LOG_PATH = `${BASE}/logg`

export const kindPath = (kind: LogKind): string => `${LOG_PATH}/${kind}`
export const newPath = (kind: LogKind): string => `${LOG_PATH}/${kind}/ny`
export const entryPath = (kind: LogKind, key: string): string => `${LOG_PATH}/${kind}/${encodeURIComponent(key)}`

// ---------------------------------------------------------------------------------------------------------------- keys

/** Which row an address names: the `id` (film, TV, games), the list and the id (books, board games: `log-12`), or the name (cinemas). */
export type EntryKey = { id: number } | { list: "log" | "collection"; id: number } | { name: string }

/** The key of a row in an address, or `null` where it cannot be one (it ends up in a query, bound). */
export function parseKey(kind: LogKind, raw: string): EntryKey | null {
  if (kind === "kinoer") {
    const name = raw.trim()
    return name === "" || name.length > 200 ? null : { name }
  }
  if (kind === "boker" || kind === "brettspill") {
    const match = /^(log|collection)-([1-9]\d{0,8})$/.exec(raw)
    return match === null ? null : { list: match[1] as "log" | "collection", id: Number(match[2]) }
  }
  return /^[1-9]\d{0,8}$/.test(raw) ? { id: Number(raw) } : null
}

/** A row's key as its address has it. */
export function keyOf(kind: LogKind, row: Row): string {
  if (kind === "kinoer") return String(row.name)
  if (kind === "boker" || kind === "brettspill") return `${row.list}-${row.id}`
  return String(row.id)
}

// ---------------------------------------------------------------------------------------------------------------- reading a form

export type FormValues = Record<string, string>
export type Errors = Record<string, string>

export type Checked = { ok: true; row: Row } | { ok: false; errors: Errors; values: FormValues }

/** What a form sent, as text, for the fields of a kind only (anything else is left out). */
export function formValues(kind: LogKind, read: (name: string) => unknown): FormValues {
  const values: FormValues = {}
  for (const field of KINDS[kind].fields) {
    const value = read(field.name)
    values[field.name] = typeof value === "string" ? value.trim().slice(0, 2000) : ""
  }
  return values
}

/** `2026-11-25` from `25.11.2026`, `25.11.26`, `2026-11-25` or `25/11/2026`; `null` for anything that is not a day of the calendar. */
export function parseDate(text: string): string | null {
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text)
  const nordic = /^(\d{1,2})[./](\d{1,2})[./](\d{2}|\d{4})$/.exec(text)
  const [year, month, day] = iso !== null ? [Number(iso[1]), Number(iso[2]), Number(iso[3])] : nordic !== null ? [Number(nordic[3]!.length === 2 ? `20${nordic[3]}` : nordic[3]), Number(nordic[2]), Number(nordic[1])] : [NaN, NaN, NaN]
  if (!Number.isInteger(year) || year < 1900 || month < 1 || month > 12 || day < 1) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCMonth() !== month - 1) return null
  return date.toISOString().slice(0, 10)
}

/** A date as the form shows it: `25.11.2026`. */
export function showDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return match === null ? iso : `${match[3]}.${match[2]}.${match[1]}`
}

/** A number written the Norwegian way or not (`1,5`, `1.5`, `2`), or `null`. */
export function parseDecimal(text: string): number | null {
  if (!/^\d{1,6}([.,]\d{1,3})?$/.test(text)) return null
  return Number(text.replace(",", "."))
}

/** A number as the form shows it: `1,5`. */
export const showDecimal = (value: number): string => String(value).replace(".", ",")

const countries = new Intl.DisplayNames(["nb"], { type: "region", fallback: "none" })

/** A country's name in bokmål from its ISO 3166-1 alpha-2 code, or `null` where the code is not one. */
export function countryName(code: string): string | null {
  if (!/^[A-Z]{2}$/.test(code)) return null
  try {
    return countries.of(code) ?? null
  } catch {
    return null
  }
}

/**
 * Checks a form of a kind and makes its row: every field's own rule, by its spec. `today` (`YYYY-MM-DD`, Oslo) is the latest date
 * allowed, with a day's slack; `cinemas` the names a film may be seen at. A text left empty is `null`, never `""`. On a failure, the
 * errors by field, in bokmål, saying how to put it right, and what was written, to show again.
 */
export function checkEntry(kind: LogKind, values: FormValues, { today, cinemas = [] }: { today: string; cinemas?: readonly string[] }): Checked {
  const errors: Errors = {}
  const row: Row = {}
  const latest = new Date(`${today}T12:00:00Z`)
  latest.setUTCDate(latest.getUTCDate() + 1)
  const thisYear = Number(today.slice(0, 4))
  for (const field of KINDS[kind].fields) {
    const text = values[field.name] ?? ""
    if (text === "") {
      if (field.optional) {
        if (field.name !== "list:status") row[field.name] = null
        continue
      }
      errors[field.name] = "missing" in field && field.missing ? field.missing : `Fyll inn ${field.label.toLowerCase()}.`
      continue
    }
    switch (field.type) {
      case "text":
        if (text.length > field.max) errors[field.name] = `Gjør teksten kortere: høyst ${field.max} tegn.`
        else row[field.name] = text
        break
      case "date": {
        const date = parseDate(text)
        if (date === null) errors[field.name] = "Skriv datoen som dag, måned og år, som 25.11.2026."
        else if (date > latest.toISOString().slice(0, 10)) errors[field.name] = "Datoen er fram i tid. Skriv dagen det skjedde."
        else row[field.name] = date
        break
      }
      case "year": {
        const year = /^\d{4}$/.test(text) ? Number(text) : NaN
        if (!(year >= 1870 && year <= thisYear + 5)) errors[field.name] = `Skriv året med fire sifre, mellom 1870 og ${thisYear + 5}.`
        else row[field.name] = year
        break
      }
      case "integer": {
        const number = /^\d{1,9}$/.test(text) ? Number(text) : NaN
        if (!(number >= field.min)) errors[field.name] = field.wrong
        else row[field.name] = number
        break
      }
      case "decimal": {
        const number = parseDecimal(text)
        if (number === null || number < field.min || number > field.max || (field.step !== undefined && !Number.isInteger(number / field.step))) errors[field.name] = field.wrong
        else row[field.name] = number
        break
      }
      case "choice":
        if (!field.options.some((option) => option.value === text)) errors[field.name] = field.missing
        else if (field.name === "list:status") {
          const [list, status] = text.split(":") as [string, string]
          row.list = list
          row.status = status
        } else row[field.name] = text
        break
      case "cinema":
        if (!cinemas.includes(text)) errors[field.name] = "Velg en kino fra lista, eller legg den til under Kinoer først."
        else row[field.name] = text
        break
      case "country": {
        const code = text.toUpperCase()
        if (countryName(code) === null) errors[field.name] = "Skriv landkoden med to bokstaver, som NO for Norge."
        else row[field.name] = code
        break
      }
      case "url": {
        let ok = false
        try {
          const url = new URL(text)
          ok = (url.protocol === "https:" || url.protocol === "http:") && text.length <= 500
        } catch {
          ok = false
        }
        if (!ok) errors[field.name] = "Skriv hele adressen, som https://www.vegakino.no/."
        else row[field.name] = text
        break
      }
    }
  }
  return Object.keys(errors).length === 0 ? { ok: true, row } : { ok: false, errors, values }
}

/** A row as the form shows it again (to change it): every field as text, dates as `25.11.2026`, numbers with a comma. */
export function rowValues(kind: LogKind, row: Row): FormValues {
  const values: FormValues = {}
  for (const field of KINDS[kind].fields) {
    const value = field.name === "list:status" ? `${row.list}:${row.status}` : row[field.name]
    values[field.name] = value === null || value === undefined ? "" : field.type === "date" ? showDate(String(value)) : field.type === "decimal" && typeof value === "number" ? showDecimal(value) : String(value)
  }
  return values
}

// ---------------------------------------------------------------------------------------------------------------- a row in a list

const listDate = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

/** A date in a list: «24. nov. 2026». */
export const listedDate = (iso: Value): string | null => (typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? listDate.format(new Date(`${iso}T00:00:00Z`)) : null)

const labelOf = (options: readonly Option[], value: string): string => options.find((option) => option.value === value)?.label ?? value

const present = (parts: readonly (string | null | undefined | false)[]): string[] => parts.filter((part): part is string => typeof part === "string" && part !== "")

/** What a row of a kind says in a list: its title, the details in the order they are looked for, and an episode's number. */
export function entryLine(kind: LogKind, row: Row): { title: string; meta: string[]; episode?: { season: number; number: number } } {
  const text = (name: string): string | null => (typeof row[name] === "string" && row[name] !== "" ? (row[name] as string) : null)
  const number = (name: string): number | null => (typeof row[name] === "number" ? (row[name] as number) : null)
  switch (kind) {
    case "film":
      return { title: text("title") ?? "Uten tittel", meta: present([listedDate(row.watched_on), number("year") === null ? null : String(number("year")), text("cinema")]) }
    case "tv": {
      const season = number("season")
      const episode = number("episode")
      return {
        title: text("show") ?? "Uten navn",
        meta: present([text("episode_title"), listedDate(row.watched_on)]),
        ...(season === null || episode === null ? {} : { episode: { season, number: episode } }),
      }
    }
    case "spill": {
      const hours = number("hours")
      return { title: text("title") ?? "Uten tittel", meta: present([labelOf(GAME_STATUSES, String(row.status)), listedDate(row.on_date), hours === null ? null : `${showDecimal(hours)}\u00a0t`, text("platform")]) }
    }
    case "boker": {
      const rating = number("rating")
      return { title: text("title") ?? "Uten tittel", meta: present([labelOf(BOOK_STATUSES, `${row.list}:${row.status}`), listedDate(row.on_date), rating === null ? null : `${showDecimal(rating)} av 5`, text("format")]) }
    }
    case "brettspill":
      return { title: text("title") ?? "Uten tittel", meta: present([labelOf(BOARDGAME_STATUSES, `${row.list}:${row.status}`), text("format")]) }
    case "kinoer":
      return { title: text("name") ?? "Uten navn", meta: present([text("city"), countryName(String(row.country)) ?? text("country")]) }
  }
}

// ---------------------------------------------------------------------------------------------------------------- the form's way back

/** What a failed form leaves for its page: the errors and what was written, for the form at `form` only, a couple of minutes. */
export interface Problems {
  form: string
  errors: Errors
  values: FormValues
}

export const PROBLEMS_COOKIE = "logg-feil"

/** The form's own id: a problem with the whole form (it could not be saved) is under it, so the summary's link goes to the form. */
export const FORM_ID = "skjema"

/** The `Set-Cookie` for a failed form, on the log's pages only (`Path=/start/logg`, never the whole origin); or one that removes it. */
export function problemsCookie(problems: Problems | null): string {
  let value = problems === null ? "" : encodeURIComponent(JSON.stringify(problems))
  // A cookie holds about 4 kB: the errors always go back, what was written only when it fits.
  if (problems !== null && value.length > 3500) value = encodeURIComponent(JSON.stringify({ ...problems, values: {} }))
  return `${PROBLEMS_COOKIE}=${value}; Path=${LOG_PATH}; Max-Age=${problems === null ? 0 : 120}; SameSite=Strict; Secure; HttpOnly`
}

/** The problems of the form at `form`, or `null`: none, another form's, or not readable. */
export function readProblems(cookie: string | undefined, form: string): Problems | null {
  if (!cookie) return null
  // Next hands the cookie over decoded, a plain parser does not.
  const parse = (text: string): Partial<Problems> | null => {
    try {
      const value: unknown = JSON.parse(text)
      return typeof value === "object" && value !== null ? (value as Partial<Problems>) : null
    } catch {
      return null
    }
  }
  try {
    const parsed = parse(cookie) ?? parse(decodeURIComponent(cookie))
    if (parsed === null || parsed.form !== form || typeof parsed.errors !== "object" || parsed.errors === null) return null
    const strings = (record: unknown): Record<string, string> =>
      Object.fromEntries(Object.entries((record ?? {}) as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
    const errors = strings(parsed.errors)
    return Object.keys(errors).length === 0 ? null : { form, errors, values: strings(parsed.values) }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------------------------------------------- the request

/**
 * Whether a POST to the log comes from one of its own pages: the same origin (`Origin`, or `Sec-Fetch-Site: same-origin` from a browser
 * that sent none) and, since lmfaole.party/medier, /cv and /design share the origin, a `Referer` on a page under `/start/logg` (the
 * page's `Referrer-Policy`, strict-origin-when-cross-origin, sends the whole address to its own origin). Anything missing is a no.
 */
export function fromLogPage({ url, origin, fetchSite, referer }: { url: string; origin: string | null; fetchSite: string | null; referer: string | null }): boolean {
  const own = new URL(url).origin
  if (origin !== null ? origin !== own : fetchSite !== "same-origin") return false
  if (fetchSite !== null && fetchSite !== "same-origin") return false
  if (referer === null) return false
  try {
    const from = new URL(referer)
    return from.origin === own && (from.pathname === LOG_PATH || from.pathname.startsWith(`${LOG_PATH}/`))
  } catch {
    return false
  }
}
