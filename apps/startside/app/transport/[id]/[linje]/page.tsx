import { DepartureList } from "@lmfaole/designsystem/components/departure-list"
import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { Freshness } from "@lmfaole/designsystem/components/freshness"
import { DetailLayout } from "@lmfaole/designsystem/components/detail-layout"
import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Text } from "@lmfaole/designsystem/components/text"
import { StopSequence } from "@lmfaole/designsystem/components/stop-sequence"
import { clock, MODE_NAMES } from "@lmfaole/designsystem/lib/departures"
import { notFound } from "next/navigation"

import { Shell } from "../../../../components/shell"
import { StopLines } from "../../../../components/stop"
import { now } from "../../../../lib/day"
import { getStop, getTrip } from "../../../../lib/entur"
import { positionParam, type SearchParams } from "../../../../lib/position"
import { settle } from "../../../../lib/settle"
import { withBase } from "../../../../lib/links"
import { destinationsOf, isJourneyId, lineOf, shownTrip, stopIdOf, stopPath, toBoard, tripPosition, type Departure, type Stop, type TripStop } from "../../../../lib/transit"

export const dynamic = "force-dynamic"

/** The page renews itself every minute (components/shell.tsx): after three missed renewals the departures may have changed. */
const STALE_AFTER = 180

/** How many of the departures after the shown trip its section names. */
const LATER = 5

/**
 * One line from one stop: a section for each way it goes, with every stop of the next trip from there (the stops before it folded away) and when
 * it is at each, then the times of the departures after it; with the other lines a chip away and a map of the stop. Without the trip (Entur has
 * none), the section lists the departures instead.
 */
export default async function Page({ params, searchParams }: { params: Promise<{ id: string; linje: string }>; searchParams: Promise<SearchParams> }) {
  const segments = await params
  const id = stopIdOf(segments.id)
  const line = lineOf(segments.linje)
  if (id === null || line === null) notFound()
  const instant = now()
  const from = positionParam(await searchParams)
  const result = await settle(getStop(id))
  if (!result.ok) {
    return (
      <Shell current="transport" position={from} width="wide" trail={[{ path: "/transport", label: "Transport" }]} title={`Linje ${line}`}>
        <ErrorMessage what="avganger fra Entur" error={result.error} retry />
      </Shell>
    )
  }
  const stop = result.value
  if (stop === null) notFound()
  const departures = stop.departures.filter((departure) => departure.line === line)
  const mode = departures[0]?.mode
  const name = mode === undefined || mode === "walk" ? `Linje ${line}` : `${MODE_NAMES[mode]} ${line}`

  return (
    <Shell
      current="transport"
      position={from}
      width="wide"
      trail={[{ path: "/transport", label: "Transport" }, { path: stopPath(stop.id), label: stop.name }]}
      title={name}
      lead={<>Fra {stop.name} de neste tre timene · <Freshness at={instant.toISOString()} now={instant.toISOString()} staleAfterSeconds={STALE_AFTER} /></>}
    >
      <DetailLayout map={stop.at === null ? undefined : { at: stop.at, ...(from === null ? {} : { from }), label: `Kart over ${stop.name}` }}>
          <StopLines stop={stop} current={line} />
          {departures.length === 0 ? (
            <EmptyState reason="all-done" what="avganger" />
          ) : (
            await Promise.all(destinationsOf(departures).map(async (destination, index) => <Way key={destination} index={index} destination={destination} stop={stop} departures={departures.filter((departure) => departure.destination === destination)} mode={mode} now={instant.toISOString()} />))
          )}
      </DetailLayout>
    </Shell>
  )
}

async function Way({ index, destination, stop, departures, mode, now }: { index: number; destination: string; stop: Stop; departures: Departure[]; mode: Departure["mode"] | undefined; now: string }) {
  const shown = shownTrip(departures)
  const trip = shown !== undefined && isJourneyId(shown.journey) ? await settle(getTrip(shown.journey)) : null
  const stops: TripStop[] | null = trip?.ok === true ? trip.value : null
  const later = departures.filter((departure) => departure !== shown && !departure.cancelled).slice(0, LATER)
  return (
    <PageSection id={`mot-${index}`} title={`Mot ${destination}`} icon="route">
      {stops === null || shown === undefined ? (
        <DepartureList departures={departures.map((departure) => toBoard(departure))} now={now} />
      ) : (
        <Stack gap="tight">
          <Text role="quiet">
            {`Tidene er for avgangen kl. ${clock(shown.time)} herfra.`}
            {later.length === 0 ? null : ` Deretter ${later.map((departure) => clock(departure.time)).join(" · ")}.`}
          </Text>
          <StopSequence stops={stops.map((call, position) => ({ key: `${position}-${call.id}`, name: call.name, expected: call.expected, aimed: call.aimed, cancelled: call.cancelled, href: withBase(stopPath(call.id)) }))} current={tripPosition(stops, stop)} mode={mode === undefined || mode === "walk" ? "other" : mode} />
        </Stack>
      )}
    </PageSection>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; linje: string }> }) {
  const segments = await params
  const id = stopIdOf(segments.id)
  const line = lineOf(segments.linje)
  const stop = id === null ? null : await settle(getStop(id))
  return { title: `Linje ${line ?? ""} fra ${stop?.ok === true && stop.value !== null ? stop.value.name : "holdeplassen"} · Startside` }
}
