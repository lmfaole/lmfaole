import { DepartureBoard } from "@lmfaole/designsystem/components/departure-board"
import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { Grid } from "@lmfaole/designsystem/components/layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"

import { withBase } from "../lib/links"
import { positionQuery, type Position } from "../lib/position"
import type { Settled } from "../lib/settle"
import { linePath, stopPath, toBoard, walkMinutesOver, type Stop } from "../lib/transit"

/** Rows (a line to one destination) on each stop's board. */
const LIMIT = 5

/** The stations nearest to the device, each with a departure board of what leaves from it (and a map of where it is, with the reader on it), the nearest first. */
export function NearbyStops({ stops, instant, from }: { stops: Settled<Stop[]>; instant: Date; from: Position }) {
  return (
    <PageSection id="stations" title="Nærmeste stasjoner" icon="bus" what="avganger fra Entur" error={stops.ok ? undefined : stops.error}>
      {stops.ok ? <Boards stops={stops.value} instant={instant} from={from} /> : null}
    </PageSection>
  )
}

function Boards({ stops, instant, from }: { stops: Stop[]; instant: Date; from: Position }) {
  const shown = stops.filter((stop) => stop.departures.length > 0).toSorted((a, b) => a.distance - b.distance)
  if (shown.length === 0) {
    return <EmptyState reason="all-done" what="avganger" description="Ingenting går fra stasjonene innen en kilometer fra deg den nærmeste tiden. Om natten kan det være stille en stund." />
  }
  return (
    <Grid columns="charts">
      {shown.map((stop) => (
        <DepartureBoard key={stop.id} stop={stop.name} now={instant.toISOString()} departures={stop.departures.map((departure) => toBoard(departure))} walkMinutes={walkMinutesOver(stop.distance)} distance={stop.distance} limit={LIMIT} continues={{ href: withBase(stopPath(stop.id)) + positionQuery(from), label: `Se alle avganger fra ${stop.name}` }} lineHref={(line) => withBase(linePath(stop.id, line.line)) + positionQuery(from)} {...(stop.at === null ? {} : { at: stop.at, from })} />
      ))}
    </Grid>
  )
}
