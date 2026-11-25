import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChartCard } from "../../../src/components/chart-card"
import { ColumnChart } from "../../../src/components/column-chart"
import { MONTHS } from "../../sample"

const meta = {
  title: "Components/Charts/ChartCard",
  component: ChartCard,
  tags: ["autodocs"],
  args: { title: "Per måned", description: "Antall avspillinger", children: null },
  render: (args) => (
    <ChartCard {...args}>
      <ColumnChart data={MONTHS} ariaLabel="Per måned" valueLabel="Avspillinger" />
    </ChartCard>
  ),
  parameters: { docs: { description: { component: `### Use it when

a chart is shown: every \`ColumnChart\`, \`AreaChart\`, \`DumbbellChart\`, \`CalendarHeatmap\` and \`AuroraChart\` stands in one (a test checks it). The card gives it a title, a line about how to read it and an empty state; the chart's height (\`--chart-height\`), colour (\`--chart-accent\`) and «Vis tallene» table are the same everywhere.

### Do not use it when

the thing is not a chart: a single number (\`KeyFigures\`), a number's shape in a row (\`Sparkline\`), the weather hour by hour (\`Meteogram\`) or how long each state lasted (\`DurationBars\`).

### Accessibility

**Handled by the component**

- The description is visible text under the title, in the muted token ([1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum))
- The title is a heading, \`<h3>\`, so the card is in the page's outline under a section's \`<h2>\` ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- With \`empty\` («avspillinger»), «Ingen avspillinger å vise.» takes the chart's place at its height, so nothing is an empty frame ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))

**You check**

- The card is under a section's \`<h2>\` (\`PageSection\`) ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The title states what the chart shows ([2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels))
- The chart inside still has its own \`ariaLabel\` ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- \`empty\` is a plural noun for what there is none of, set only when there is nothing to chart

### Content

Title says what the chart shows; the line under it says what is counted and over what period.

### Related

\`AreaChart\`, \`ColumnChart\`, \`PageSection\`` } }, },
} satisfies Meta<typeof ChartCard>
export default meta
type Story = StoryObj<typeof meta>

/** A chart with its title and the line that says what is counted. */
export const Default: Story = {}
/** The card's empty state: the sentence in place of the chart. */
export const Empty: Story = { args: { empty: "avspillinger" } }
