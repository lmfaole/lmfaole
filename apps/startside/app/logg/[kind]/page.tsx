import { Banner } from "@lmfaole/designsystem/components/banner"
import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { List } from "@lmfaole/designsystem/components/list"
import { LinkButton } from "@lmfaole/designsystem/components/link-button"
import { SearchField } from "@lmfaole/designsystem/components/search-field"
import { Text } from "@lmfaole/designsystem/components/text"
import { notFound } from "next/navigation"

import { entryRows, LOG } from "../../../components/log-pages"
import { Shell } from "../../../components/shell"
import { countOf, isLogKind, kindPath, KINDS, newPath, type LogKind } from "../../../lib/log"
import { count, latest } from "../../../lib/log-db"
import { logDatabase, missingDatabase } from "../../../lib/log-store"
import { settle } from "../../../lib/settle"
import type { SearchParams } from "../../../lib/username"

export const dynamic = "force-dynamic"

/** How many rows the list shows; older ones are found by searching. */
const LIMIT = 100

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  return { title: `${isLogKind(kind) ? KINDS[kind].title : "Logg"} · Logg · Startside` }
}

async function entries(kind: LogKind, search: string) {
  const db = logDatabase(kind)
  if (db === null) throw missingDatabase(kind)
  const [rows, total] = await Promise.all([latest(db, kind, { limit: LIMIT, search }), count(db, kind)])
  return { rows, total }
}

/** One kind's list (Logg › Film): the latest first, a search on the title, and «Ny …». A row goes to its form, to change or delete it. */
export default async function Page({ params, searchParams }: { params: Promise<{ kind: string }>; searchParams: Promise<SearchParams> }) {
  const [{ kind }, query] = await Promise.all([params, searchParams])
  if (!isLogKind(kind)) notFound()
  const spec = KINDS[kind]
  const search = typeof query["q"] === "string" ? query["q"].trim().slice(0, 200) : ""
  const result = await settle(entries(kind, search))
  return (
    <Shell
      current="log"
      firstRun={false}
      trail={[LOG]}
      title={spec.title}
      lead={result.ok ? countOf(kind, result.value.total) : undefined}
      actions={
        <LinkButton href={newPath(kind)} icon="add">
          {spec.add}
        </LinkButton>
      }
    >
      {query["lagret"] === "1" ? <Banner tone="success" title="Lagret" /> : null}
      {query["slettet"] === "1" ? <Banner tone="success" title="Slettet" /> : null}
      {query["borte"] === "1" ? (
        <Banner tone="info" title="Fant den ikke">
          Den er nok slettet allerede. Ingenting ble endret.
        </Banner>
      ) : null}
      {!result.ok ? (
        <ErrorMessage what={spec.what} error={result.error} retry />
      ) : (
        <>
          <SearchField label={`Søk i ${spec.plural}`} action={kindPath(kind)} value={search} />
          {result.value.rows.length === 0 ? (
            search === "" ? (
              <EmptyState reason="nothing-yet" what={spec.plural} description="Det du legger til, kommer her." action={{ href: newPath(kind), label: spec.add, icon: "add" }} />
            ) : (
              <EmptyState reason="no-results" what={spec.plural} query={search} />
            )
          ) : (
            <>
              <List rows={entryRows(kind, result.value.rows)} label={search === "" ? `Siste ${spec.plural}` : `${spec.title} som passer «${search}»`} />
              {result.value.rows.length === LIMIT ? <Text role="quiet">Viser de {LIMIT} første. Søk for å finne flere.</Text> : null}
            </>
          )}
        </>
      )}
    </Shell>
  )
}
