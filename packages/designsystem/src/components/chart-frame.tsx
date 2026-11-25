"use client"

import type { ChartTooltipOptions } from "@tanstack/charts"
import { Chart, type ChartDefinition } from "@tanstack/charts/react"
import { tooltip } from "@tanstack/charts/tooltip"
import { useEffect, useRef, useState } from "react"
import "../lib/css-variables"
import { formatChartValue } from "../lib/chart-format"
import { cn } from "cn"

/** One value per category, the shape every chart here draws. */
export interface ChartDatum {
  label: string
  value: number
}

/**
 * The tooltip every chart here shares: the category as its title and one row
 * naming the value, e.g. "1990s" over "Plays 12". Without it the rows are the
 * channel names, `x` and `y`.
 */
export function datumTooltip(valueLabel: string, formatLabel: (label: string) => string = (label) => label) {
  const content: ChartTooltipOptions<ChartDatum>["content"] = (points) => {
    const datum = points[0]?.datum
    if (datum === undefined) return { rows: [] }
    return { title: formatLabel(datum.label), rows: [{ label: valueLabel, value: formatChartValue(datum.value) }] }
  }
  return { use: tooltip, content }
}

interface ChartFrameProps<TDatum> {
  definition: ChartDefinition<TDatum>
  ariaLabel: string
}

/** The height the chart is drawn at before its box is measured (the server, the first paint): the token's least, 12.5rem, in CSS pixels. */
const FIRST_HEIGHT = 200

/**
 * Where TanStack Charts meets the design system's theme: the series colour and the tooltip come from the `theme.css` tokens, so a chart
 * follows light and dark mode with the rest of the page and no colour is written down here. The colour is `--chart-accent` where a page
 * part sets one (`WeatherStage`: the weather's), the theme's primary otherwise. The height is the token `--chart-height`, the same for every
 * chart: the box has it from the first paint, in CSS, so the page does not jump; the chart is drawn at the height the box measures. A chart
 * is not a control, so it does not take keyboard focus (`keyboard: false`); the pointer's tooltip stays.
 */
export function ChartFrame<TDatum>({ definition, ariaLabel }: ChartFrameProps<TDatum>) {
  const box = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(FIRST_HEIGHT)
  useEffect(() => {
    const element = box.current
    if (element === null) return
    const observer = new ResizeObserver(([entry]) => {
      // Whole CSS pixels of a measured box (not a length on the page), so a sub-pixel change cannot set off a resize loop.
      if (entry && entry.contentRect.height > 0) setHeight(Math.round(entry.contentRect.height))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div className="@container w-full min-w-0">
      <div ref={box} className="h-(--chart-height) w-full min-w-0">
        <Chart
          definition={{ ...definition, keyboard: false }}
          ariaLabel={ariaLabel}
          height={height}
          className={cn(
            "text-muted-foreground w-full text-xs",
            "[--ts-chart-1:var(--chart-accent,var(--primary))] [--ts-chart-tooltip-background:var(--popover)] [--ts-chart-tooltip-color:var(--popover-foreground)]",
            "[--ts-chart-tooltip-border:0.0625rem_solid_var(--border)] [--ts-chart-tooltip-border-radius:var(--radius)]",
          )}
        />
      </div>
    </div>
  )
}
