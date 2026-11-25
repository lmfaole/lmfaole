import { EmptyFrame } from "./internal/empty-frame"

/**
 * What a chart shows when it has nothing to draw: the empty frame of a section (`EmptyState`'s, with its drawing, centred) saying
 * «Ingen {what} å vise.», in the place the chart would have and at the chart height (`--chart-height`), so the page does not jump when data
 * arrives. No axes are drawn. `what` is a plural noun («avspillinger»); a chart given no data says «Ingen data å vise.», and a `ChartCard`
 * says it with its own word (`empty`).
 */
export function ChartEmpty({ what }: { what: string }) {
  return <EmptyFrame picture="nothing-yet" title={`Ingen ${what} å vise.`} chart />
}
