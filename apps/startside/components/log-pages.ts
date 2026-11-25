import type { ListRow } from "@lmfaole/designsystem/components/list"
import { cookies } from "next/headers"

import { entryLine, entryPath, KINDS, keyOf, PROBLEMS_COOKIE, readProblems, type LogKind, type Problems, type Row } from "../lib/log"

/** Every page under Logg has it as its first crumb. */
export const LOG = { path: "/logg", label: "Logg" } as const

/** A kind's list, the crumb under Logg. */
export const kindCrumb = (kind: LogKind) => ({ path: `/logg/${kind}`, label: KINDS[kind].title })

/** The rows of a kind as a list: each one a link to change it. */
export const entryRows = (kind: LogKind, rows: readonly Row[]): ListRow[] =>
  rows.map((row) => {
    const key = keyOf(kind, row)
    const line = entryLine(kind, row)
    return { key, title: line.title, href: entryPath(kind, key), meta: line.meta, ...(line.episode === undefined ? {} : { episode: line.episode }) }
  })

/** What a failed form at `form` left (lib/log.ts `problemsCookie`), or `null`. */
export async function logProblems(form: string): Promise<Problems | null> {
  return readProblems((await cookies()).get(PROBLEMS_COOKIE)?.value, form)
}

/** A page's title in the tab: «Ny film · Logg · Startside», «Feil: » first while the form shows errors. */
export const logTitle = (title: string, problems: Problems | null): string => `${problems === null ? "" : "Feil: "}${title} · Logg · Startside`
