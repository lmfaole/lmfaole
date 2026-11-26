import { AreaChart } from '@lmfaole/designsystem/components/area-chart'
import { ChartCard } from '@lmfaole/designsystem/components/chart-card'
import { ColumnChart } from '@lmfaole/designsystem/components/column-chart'
import { KeyFigures } from '@lmfaole/designsystem/components/key-figures'
import { formatChartValue } from '@lmfaole/designsystem/lib/chart-format'
import { summariseSeries } from '@lmfaole/designsystem/lib/chart-summary'

import type { ChartPlan, DrawnChart } from '../lib/chart'

/** What the summary calls the chart it describes. */
const KINDS = { column: 'Søylediagram', area: 'Områdediagram' }

/** One chart in its card, with the text that says what it shows and the numbers under it. */
function SlideChart({ plan }: { plan: DrawnChart }) {
  const data = [...plan.data]
  const summary = summariseSeries(data, { kind: KINDS[plan.look], valueLabel: plan.valueLabel, ordered: plan.ordered })
  const props = { data, ariaLabel: plan.title, valueLabel: plan.valueLabel, ...(summary === null ? {} : { summary }) }
  return <ChartCard title={plan.title}>{plan.look === 'area' ? <AreaChart {...props} /> : <ColumnChart {...props} />}</ChartCard>
}

/**
 * The numbers of a slide's charts, drawn by the design system instead of pasted in as a picture: the figures that are too few to draw read
 * as themselves, the rest are a chart in a card with its summary and its table. `src/lib/chart.ts` chose the form; this only draws it.
 *
 * The page puts it in as an island (`client:visible`), so a chart is drawn at the width its box measures; the same component renders
 * without one in the file you download, where it is the first paint's chart and every value is in «Vis tallene» under it.
 */
export function SlideCharts({ plans }: { plans: readonly ChartPlan[] }) {
  return (
    <>
      {plans.map((plan, index) =>
        plan.look === 'figures' ? (
          <KeyFigures key={index} figures={plan.figures.map((figure) => ({ value: formatChartValue(figure.value), label: figure.label }))} />
        ) : (
          <SlideChart key={index} plan={plan} />
        ),
      )}
    </>
  )
}
