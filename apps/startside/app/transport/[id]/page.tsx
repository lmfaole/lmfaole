import { DepartureList } from "@lmfaole/designsystem/components/departure-list"
import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { Freshness } from "@lmfaole/designsystem/components/freshness"
import { DetailLayout } from "@lmfaole/designsystem/components/detail-layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { Shell } from "../../../components/shell"
import { StopLines } from "../../../components/stop"
import { now } from "../../../lib/day"
import { getStop } from "../../../lib/entur"
import { withBase } from "../../../lib/links"
import { parsePosition, POSITION_COOKIE } from "../../../lib/position"
import { settle } from "../../../lib/settle"
import { linePath, stopIdOf, toBoard } from "../../../lib/transit"

export const dynamic = "force-dynamic"

/** The page renews itself every minute (components/shell.tsx): after three missed renewals the departures may have changed. */
const STALE_AFTER = 180

const TRAIL = [{ path: "/transport", label: "Transport" }]

/** One stop: every departure of the next three hours in the order they leave, by the hour, each line a chip (and a link) to its own page from here, with a map of where the stop is in the rail. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = stopIdOf((await params).id)
  if (id === null) notFound()
  const instant = now()
  const result = await settle(getStop(id))
  if (!result.ok) {
    return (
      <Shell current="transport" width="wide" trail={TRAIL} title="Avganger">
        <ErrorMessage what="avganger fra Entur" error={result.error} retry />
      </Shell>
    )
  }
  const stop = result.value
  if (stop === null) notFound()
  const from = parsePosition((await cookies()).get(POSITION_COOKIE)?.value)

  return (
    <Shell current="transport" width="wide" trail={TRAIL} title={stop.name} lead={<>Alle avganger de neste tre timene · <Freshness at={instant.toISOString()} now={instant.toISOString()} staleAfterSeconds={STALE_AFTER} /></>}>
      <DetailLayout map={stop.at === null ? undefined : { at: stop.at, ...(from === null ? {} : { from }), label: `Kart over ${stop.name}` }}>
        <PageSection id="departures" title="Avganger" icon="bus">
          <StopLines stop={stop} current={null} />
          <DepartureList departures={stop.departures.map((departure) => toBoard(departure))} now={instant.toISOString()} lineHref={(line) => withBase(linePath(stop.id, line.line))} emptyMessage="Ingenting går herfra de neste tre timene." />
        </PageSection>
      </DetailLayout>
    </Shell>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = stopIdOf((await params).id)
  const stop = id === null ? null : await settle(getStop(id))
  return { title: `${stop?.ok === true && stop.value !== null ? stop.value.name : "Avganger"} · Startside` }
}
