/** The rows of the table every chart keeps for a screen reader: the exact values the chart only draws. */
import type { ChartDatum } from "../components/chart-frame"

export type ChartRow = readonly (string | number)[]

/** One row per category, in the chart's own order, with the label as the axis shows it. */
export function datumRows(data: readonly ChartDatum[], formatLabel: (label: string) => string = (label) => label): ChartRow[] {
  return data.map((datum) => [formatLabel(datum.label), datum.value])
}
