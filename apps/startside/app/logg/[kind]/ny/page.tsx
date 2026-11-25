import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { FormErrorSummary } from "@lmfaole/designsystem/components/form-error-summary"
import { notFound } from "next/navigation"

import { LogForm } from "../../../../components/log-form"
import { kindCrumb, LOG, logProblems, logTitle } from "../../../../components/log-pages"
import { Shell } from "../../../../components/shell"
import { now, osloTime } from "../../../../lib/day"
import { isLogKind, KINDS, newPath, showDate, type FormValues, type LogKind } from "../../../../lib/log"
import { cinemaNames } from "../../../../lib/log-db"
import { logDatabase, missingDatabase } from "../../../../lib/log-store"
import { settle } from "../../../../lib/settle"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!isLogKind(kind)) return { title: "Logg · Startside" }
  return { title: logTitle(KINDS[kind].add, await logProblems(newPath(kind))) }
}

/** What a new row starts with: film, TV and games are logged the day they happen, so their date is today's. */
function fresh(kind: LogKind): FormValues {
  const today = showDate(osloTime(now()).date)
  return kind === "film" || kind === "tv" ? { watched_on: today } : kind === "spill" ? { on_date: today } : {}
}

async function cinemas(kind: LogKind): Promise<string[]> {
  if (kind !== "film") return []
  const db = logDatabase(kind)
  if (db === null) throw missingDatabase(kind)
  return cinemaNames(db)
}

/** A new row of a kind (Logg › Film › Ny film). */
export default async function Page({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!isLogKind(kind)) notFound()
  const spec = KINDS[kind]
  const [problems, choices] = await Promise.all([logProblems(newPath(kind)), settle(cinemas(kind))])
  const errors = problems?.errors ?? {}
  return (
    <Shell current="log" firstRun={false} refresh={false} trail={[LOG, kindCrumb(kind)]} title={spec.add}>
      {Object.keys(errors).length === 0 ? null : <FormErrorSummary errors={Object.entries(errors).map(([field, message]) => ({ field, message }))} />}
      {choices.ok ? <LogForm kind={kind} values={problems?.values ?? fresh(kind)} errors={errors} cinemas={choices.value} /> : <ErrorMessage what="kinoene" error={choices.error} retry />}
    </Shell>
  )
}
