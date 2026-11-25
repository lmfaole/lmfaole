import { areaY, defineChart, dot, lineY } from "@tanstack/charts"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scalePoint } from "@tanstack/charts/scales/point"

import { datumRows } from "../lib/chart-rows"
import { type ChartDatum, ChartFrame, datumTooltip } from "./chart-frame"
import { ChartEmpty } from "./chart-empty"
import { ChartSummary } from "./chart-summary"
import { ChartTable } from "./chart-table"

interface AreaChartProps {
  /** In order along the axis, e.g. months oldest first. */
  data: ChartDatum[]
  /** Names the chart for a screen reader, e.g. "Plays per month". */
  ariaLabel: string
  /** What a value counts, for the tooltip, e.g. "Plays". */
  valueLabel: string
  /** A text that says what the chart shows (type, range, trend, extremes), visible under it. `summariseSeries` writes one. */
  summary?: string
}

/**
 * One filled area for a trend: the shape over time, not an exact comparison of two points. Several series are several `AreaChart`s, each in
 * its `ChartCard`. At the chart height, in `--chart-accent`, with the exact values in «Vis tallene».
 */
export function AreaChart({ data, ariaLabel, valueLabel, summary }: AreaChartProps) {
  if (data.length === 0) return <ChartEmpty what="data" />
  const labels = data.map((datum) => datum.label)
  const definition = defineChart({
    marks: [
      areaY(data, { x: "label", y: "value", fillOpacity: 0.15 }),
      lineY(data, { x: "label", y: "value", strokeWidth: 2 }),
      // A point per category, so a single month still shows; an area needs two.
      dot(data, { x: "label", y: "value", r: 2.5 }),
    ],
    scales: {
      x: {
        scale: () => scalePoint<string>().domain(labels),
        axis: { ticks: { size: 0 }, tickLabels: { thin: { minGap: 24 } } },
      },
      y: { scale: scaleLinear, nice: true, grid: true, axis: false },
    },
    tooltip: datumTooltip(valueLabel),
  })
  return (
    <>
      <ChartFrame definition={definition} ariaLabel={ariaLabel} />
      {summary === undefined ? null : <ChartSummary text={summary} />}
      <ChartTable caption={ariaLabel} columns={["Tidspunkt", valueLabel]} rows={datumRows(data)} />
    </>
  )
}
