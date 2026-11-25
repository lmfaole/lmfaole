import { cookies } from "next/headers"

import { accessAllowed } from "../../../lib/access-gate"
import { now, osloTime } from "../../../lib/day"
import { cinemaNames, createEntry, deleteEntry, getEntry, updateEntry, type Written } from "../../../lib/log-db"
import { logDatabase, logEnv } from "../../../lib/log-store"
import { checkEntry, entryPath, FORM_ID, formValues, fromLogPage, isLogKind, kindPath, newPath, parseKey, problemsCookie, PROBLEMS_COOKIE, type Errors, type FormValues } from "../../../lib/log"

const go = (location: string, cookie: string | null): Response => {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" })
  if (cookie !== null) headers.append("Set-Cookie", cookie)
  return new Response(null, { status: 303, headers })
}

const refuse = (status: 400 | 403, text: string): Response => new Response(text, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } })

/**
 * Logg's one endpoint (a plain form, no JavaScript needed): `kind` (film, tv, spill, boker, brettspill, kinoer), `op` (`create`,
 * `update` or `delete`), `key` for the row changed or deleted, and the kind's fields (lib/log.ts). Only for the owner, from the log's
 * own pages: Access's token is checked here too (the Worker has, but a write is not taken on its word alone), and the request must come
 * from a page under /start/logg on this origin. Saved or deleted: to the kind's list with «Lagret» or «Slettet». Not valid: back to the
 * form with the errors and what was written (`logg-feil`, on /start/logg only, a couple of minutes).
 */
export async function POST(request: Request): Promise<Response> {
  const env = logEnv()
  const headers = request.headers
  const sameOrigin = fromLogPage({ url: request.url, origin: headers.get("origin"), fetchSite: headers.get("sec-fetch-site"), referer: headers.get("referer") })
  if (!(await accessAllowed(headers, env)) || !sameOrigin) return refuse(403, "Forbidden")

  const form = await request.formData().catch(() => new FormData())
  const kind = form.get("kind")
  const op = form.get("op")
  if (!isLogKind(kind) || (op !== "create" && op !== "update" && op !== "delete")) return refuse(400, "Ukjent skjema")
  const rawKey = form.get("key")
  const key = op === "create" || typeof rawKey !== "string" ? null : parseKey(kind, rawKey)
  if (op !== "create" && key === null) return refuse(400, "Ukjent rad")
  const formPath = key === null || typeof rawKey !== "string" ? newPath(kind) : entryPath(kind, rawKey)
  const stale = (await cookies()).get(PROBLEMS_COOKIE) === undefined ? null : problemsCookie(null)
  const back = (errors: Errors, values: FormValues = {}): Response => go(formPath, problemsCookie({ form: formPath, errors, values }))

  const db = logDatabase(kind, env)
  if (db === null) return back({ [FORM_ID]: "Databasen er ikke koblet til appen. Se Logg i README-en." })

  const values = formValues(kind, (name) => form.get(name))
  let written: Written
  try {
    if (op === "delete" && key !== null) {
      written = await deleteEntry(db, kind, key)
    } else {
      // A film keeps the cinema it has, even one that is not (or no longer) among the cinemas.
      const kept = kind === "film" && key !== null ? (await getEntry(db, kind, key))?.cinema : null
      const cinemas = kind === "film" ? [...(await cinemaNames(db)), ...(typeof kept === "string" ? [kept] : [])] : []
      const checked = checkEntry(kind, values, { today: osloTime(now()).date, cinemas })
      if (!checked.ok) return back(checked.errors, checked.values)
      written = key === null ? await createEntry(db, kind, checked.row) : await updateEntry(db, kind, key, checked.row)
    }
  } catch (error) {
    console.error("Logg: kunne ikke skrive", kind, op, error)
    return back({ [FORM_ID]: op === "delete" ? "Kunne ikke slette nå. Prøv igjen om litt." : "Kunne ikke lagre nå. Prøv igjen om litt; det du skrev står her fortsatt." }, op === "delete" ? {} : values)
  }

  if (written.ok) return go(`${kindPath(kind)}?${op === "delete" ? "slettet" : "lagret"}=1`, stale)
  if (written.reason === "missing") return go(`${kindPath(kind)}?borte=1`, stale)
  if (written.reason === "taken") return back({ name: "Det finnes alt en kino med det navnet. Velg et annet navn, eller endre den som finnes." }, values)
  const films = written.count === 1 ? "1 film" : `${written.count ?? 0} filmer`
  return back({ [FORM_ID]: `Kinoen er brukt av ${films} og kan ikke slettes. Endre kinoen på filmene først.` })
}
