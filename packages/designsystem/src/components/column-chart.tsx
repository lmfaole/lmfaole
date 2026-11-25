import { barY, defineChart, text } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"

import { datumRows } from "../lib/chart-rows"
import { type ChartDatum, ChartFrame, datumTooltip } from "./chart-frame"
import { ChartEmpty } from "./chart-empty"
import { ChartSummary } from "./chart-summary"
import { greyStep } from "../lib/chart-colors"
import { formatChartValue, labelStep } from "../lib/chart-format"
import { ChartTable } from "./chart-table"

interface ColumnChartProps {
  /** In the order to draw them, left to right. */
  data: ChartDatum[]
  /** Names the chart for a screen reader, e.g. "Plays per decade". */
  ariaLabel: string
  /** What a value counts, for the tooltip, e.g. "Plays". */
  valueLabel: string
  /** A text that says what the chart shows (type, range, trend, extremes), visible under it. `summariseSeries` writes one. */
  summary?: string
  /**
   * The label of the one column the chart is about (this album among the artist's): drawn in the series' colour while the others are a grey step, with its value written over it and its
   * label in bold under it, kept when the axis has no room for every label. The title says which it is; colour is never the only sign.
   */
  highlight?: string
}

/** The others beside a picked-out column: the lightest grey step that keeps 3:1 against the page. */
const REST = greyStep(44)

/**
 * Columns in the data's own order, for a shape across categories: decades, hours of the day; with `highlight`, one of them against the rest
 * (an album among the artist's). In a `ChartCard`, at the chart height, in `--chart-accent`, with the exact values in «Vis tallene». A crowded
 * axis labels every nth column, from the number of columns (24 hours: every third).
 */
export function ColumnChart({ data, ariaLabel, valueLabel, summary, highlight }: ColumnChartProps) {
  if (data.length === 0) return <ChartEmpty what="data" />
  const labels = data.map((datum) => datum.label)
  const labelEvery = labelStep(labels.length)
  // A column is at most a tenth of the width, so one year or three days do not become slabs.
  const padding = Math.max(0.12, 1 - 0.1 * labels.length)
  const picked = highlight === undefined ? undefined : data.find((datum) => datum.label === highlight)
  const definition = defineChart({
    marks: [
      barY(data, { x: "label", y: "value", inset: 1, radius: 3, ...(picked === undefined ? {} : { fill: (datum: ChartDatum) => (datum === picked ? "var(--ts-chart-1)" : REST) }) }),
      ...(picked === undefined ? [] : [text([picked], { x: "label", y: "value", text: (datum: ChartDatum) => formatChartValue(datum.value), anchor: "middle", dy: -8, fontSize: 12, fontWeight: 600, fill: "var(--foreground)" })]),
    ],
    scales: {
      x: {
        scale: () => scaleBand<string>().domain(labels).padding(padding),
        axis: {
          ticks: {
            size: 0,
            values: labels.filter((_, index) => index % labelEvery === 0),
          },
          ...(picked === undefined ? {} : { tickLabels: { fontWeight: ({ value }: { value: string }) => (value === picked.label ? 700 : 400), thin: { keep: [picked.label] } } }),
        },
      },
      // Room over the tallest column for the picked-out one's value.
      y: { scale: picked === undefined ? scaleLinear : () => scaleLinear().domain([0, Math.max(...data.map((datum) => datum.value), 1) * 1.15]), nice: true, grid: true, axis: false },
    },
    tooltip: datumTooltip(valueLabel),
  })
  return (
    <>
      <ChartFrame definition={definition} ariaLabel={ariaLabel} />
      {summary === undefined ? null : <ChartSummary text={summary} />}
      <ChartTable caption={ariaLabel} columns={["Kategori", valueLabel]} rows={datumRows(data)} />
    </>
  )
}
