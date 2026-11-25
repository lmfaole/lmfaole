import { FilterChips } from "@lmfaole/designsystem/components/filter-chips"

import { withBase } from "../lib/links"
import { linePath, linesOf, stopPath, type Stop } from "../lib/transit"

/** The lines from a stop as chips: «Alle» is the stop's page, each line its own page from the stop; `current` is the line shown, null on the stop's page. */
export function StopLines({ stop, current }: { stop: Stop; current: string | null }) {
  const lines = linesOf(stop.departures)
  if (lines.length < 2 && current === null) return null
  return (
    <FilterChips
      label="Linje"
      chips={[
        { key: "all", label: "Alle", href: withBase(stopPath(stop.id)), current: current === null },
        ...lines.map((one) => ({ key: one.line, label: one.line, href: withBase(linePath(stop.id, one.line)), current: one.line === current })),
      ]}
    />
  )
}
