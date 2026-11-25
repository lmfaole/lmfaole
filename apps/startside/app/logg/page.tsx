import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { List } from "@lmfaole/designsystem/components/list"
import { LinkButton } from "@lmfaole/designsystem/components/link-button"
import { PageSection } from "@lmfaole/designsystem/components/page-section"

import { entryRows } from "../../components/log-pages"
import { Shell } from "../../components/shell"
import { allOf, countOf, kindPath, KINDS, LOG_KINDS, newPath, type LogKind } from "../../lib/log"
import { count, latest } from "../../lib/log-db"
import { logDatabase, missingDatabase } from "../../lib/log-store"
import { settle } from "../../lib/settle"

export const dynamic = "force-dynamic"
export const metadata = { title: "Logg · Startside" }

/** How many of the latest a kind shows here. */
const LATEST = 3

async function overview(kind: LogKind) {
  const db = logDatabase(kind)
  if (db === null) throw missingDatabase(kind)
  const [rows, total] = await Promise.all([latest(db, kind, { limit: LATEST }), count(db, kind)])
  return { rows, total }
}

/**
 * Logg: what the owner has seen, played and read, kept by hand in D1 (it was CSV files once). One card per kind with the latest few,
 * «Ny …» to add one, and the way to all of them. Only the owner reaches it (Cloudflare Access, and the endpoint checks again).
 */
export default async function Page() {
  const kinds = await Promise.all(LOG_KINDS.map(async (kind) => ({ kind, result: await settle(overview(kind)) })))
  return (
    <Shell current="log" firstRun={false} title="Logg" lead="Det du har sett, spilt og lest, ført for hånd. Nytt legges til her, og det du endrer eller sletter, gjelder overalt.">
      {kinds.map(({ kind, result }) => {
        const spec = KINDS[kind]
        const add = (
          <div>
            <LinkButton href={newPath(kind)} icon="add">
              {spec.add}
            </LinkButton>
          </div>
        )
        if (!result.ok) {
          return (
            <PageSection key={kind} id={`logg-${kind}`} title={spec.title} icon={spec.icon} what={spec.what} error={result.error}>
              {null}
            </PageSection>
          )
        }
        return (
          <PageSection key={kind} id={`logg-${kind}`} title={spec.title} icon={spec.icon} continues={{ href: kindPath(kind), label: allOf(kind), count: countOf(kind, result.value.total) }}>
            {result.value.rows.length === 0 ? <EmptyState reason="nothing-yet" what={spec.plural} description="Det du legger til, kommer her." /> : <List rows={entryRows(kind, result.value.rows)} label={`Siste ${spec.plural}`} />}
            {add}
          </PageSection>
        )
      })}
    </Shell>
  )
}
