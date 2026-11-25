import type { ReactNode } from "react"

import { ChartEmpty } from "./chart-empty"
import { CardHeading } from "./text"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

interface ChartCardProps {
  title: string
  /** A line under the title: what the chart counts, how to read it. */
  description?: string
  /**
   * When there is nothing to chart: what there is none of, a plural noun («avspillinger»). The card then says «Ingen avspillinger å vise.»
   * in place of the chart, at the chart's height.
   */
  empty?: string | undefined
  children: ReactNode
}

/**
 * The card every chart stands in (`ColumnChart`, `AreaChart`, `DumbbellChart`, `CalendarHeatmap`, `AuroraChart`): a title (an `<h3>`, under
 * a page's section), a line under it and the chart, or a sentence when there is nothing to chart. The chart's height, colour and table are
 * the chart's; the page gives only the words.
 */
export function ChartCard({ title, description, empty, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CardHeading level={3}>{title}</CardHeading>
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{empty === undefined ? children : <ChartEmpty what={empty} />}</CardContent>
    </Card>
  )
}
