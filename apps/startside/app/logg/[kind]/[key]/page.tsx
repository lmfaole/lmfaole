import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { FormErrorSummary } from "@lmfaole/designsystem/components/form-error-summary"
import { Inline } from "@lmfaole/designsystem/components/layout"
import { LinkButton } from "@lmfaole/designsystem/components/link-button"
import { PendingButton } from "@lmfaole/designsystem/components/pending-button"
import { Text } from "@lmfaole/designsystem/components/text"
import { notFound } from "next/navigation"

import { LogForm } from "../../../../components/log-form"
import { kindCrumb, LOG, logProblems, logTitle } from "../../../../components/log-pages"
import { Shell } from "../../../../components/shell"
import { entryLine, entryPath, FORM_ID, isLogKind, KINDS, LOG_ENDPOINT, parseKey, rowValues, type LogKind, type Row } from "../../../../lib/log"
import { cinemaNames, getEntry } from "../../../../lib/log-db"
import { logDatabase, missingDatabase } from "../../../../lib/log-store"
import { settle } from "../../../../lib/settle"
import type { SearchParams } from "../../../../lib/username"

export const dynamic = "force-dynamic"

/** The key as the address has it, decoded once (a cinema's name has spaces). */
function keyFrom(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

async function load(kind: LogKind, key: string): Promise<{ row: Row; cinemas: string[] } | null> {
  const parsed = parseKey(kind, key)
  if (parsed === null) return null
  const db = logDatabase(kind)
  if (db === null) throw missingDatabase(kind)
  const [row, cinemas] = await Promise.all([getEntry(db, kind, parsed), kind === "film" ? cinemaNames(db) : Promise.resolve([])])
  return row === null ? null : { row, cinemas }
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ kind: string; key: string }>; searchParams: Promise<SearchParams> }) {
  const [{ kind, key }, query] = await Promise.all([params, searchParams])
  if (!isLogKind(kind)) return { title: "Logg · Startside" }
  const doing = query["slett"] === "1" ? "Slett" : "Endre"
  return { title: logTitle(`${doing} ${KINDS[kind].one}`, await logProblems(entryPath(kind, keyFrom(key)))) }
}

/** Where a row came from, when the import brought it (it is kept as it is when the row is saved). */
function provenance(kind: LogKind, row: Row): string | null {
  const from = kind === "film" ? row.same_as : kind === "spill" || kind === "boker" ? row.source : null
  return typeof from === "string" && from !== "" ? from : null
}

/** One row to change (Logg › Film › Flow), or, with `?slett=1`, to delete: a log kept by hand cannot be got back, so that is asked first. */
export default async function Page({ params, searchParams }: { params: Promise<{ kind: string; key: string }>; searchParams: Promise<SearchParams> }) {
  const [{ kind, key: segment }, query] = await Promise.all([params, searchParams])
  if (!isLogKind(kind)) notFound()
  const spec = KINDS[kind]
  const key = keyFrom(segment)
  const path = entryPath(kind, key)
  const [result, problems] = await Promise.all([settle(load(kind, key)), logProblems(path)])
  const trail = [LOG, kindCrumb(kind)]
  if (!result.ok) {
    return (
      <Shell current="log" firstRun={false} refresh={false} trail={trail} title={`Endre ${spec.one}`}>
        <ErrorMessage what={spec.what} error={result.error} retry />
      </Shell>
    )
  }
  if (result.value === null) notFound()
  const { row, cinemas } = result.value
  const title = entryLine(kind, row).title
  const errors = problems?.errors ?? {}

  if (query["slett"] === "1") {
    return (
      <Shell current="log" firstRun={false} refresh={false} trail={trail} crumb={title} title={`Slette «${title}»?`} lead={`${spec.the[0]!.toUpperCase()}${spec.the.slice(1)} fjernes fra ${spec.what} og kan ikke hentes tilbake.`}>
        <form id={FORM_ID} method="post" action={LOG_ENDPOINT}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="op" value="delete" />
          <input type="hidden" name="key" value={key} />
          <Inline>
            <PendingButton pendingLabel="Sletter …">{`Slett ${spec.the}`}</PendingButton>
            <LinkButton href={path}>Behold</LinkButton>
          </Inline>
        </form>
      </Shell>
    )
  }

  const from = provenance(kind, row)
  return (
    <Shell
      current="log"
      firstRun={false}
      refresh={false}
      trail={trail}
      crumb={title}
      title={title}
      lead={`Endre ${spec.the}.`}
      actions={
        <LinkButton href={`${path}?slett=1`} icon="delete">
          {`Slett ${spec.the}`}
        </LinkButton>
      }
    >
      {Object.keys(errors).length === 0 ? null : <FormErrorSummary errors={Object.entries(errors).map(([field, message]) => ({ field, message }))} />}
      <LogForm kind={kind} entryKey={key} values={problems !== null && Object.keys(problems.values).length > 0 ? problems.values : rowValues(kind, row)} errors={errors} cinemas={cinemas}>
        {from === null ? null : <Text role="quiet">Importert fra {from}. Det følger med når du lagrer.</Text>}
      </LogForm>
    </Shell>
  )
}
