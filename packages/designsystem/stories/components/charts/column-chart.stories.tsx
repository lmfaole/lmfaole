import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChartCard } from "../../../src/components/chart-card"
import { ColumnChart } from "../../../src/components/column-chart"
import { MONTHS } from "../../sample"

const meta = {
  title: "Components/Charts/ColumnChart",
  component: ColumnChart,
  tags: ["autodocs"],
  decorators: [(Story) => <ChartCard title="Avspillinger per måned">{Story()}</ChartCard>],
  args: { data: MONTHS, ariaLabel: "Avspillinger per måned", valueLabel: "Avspillinger" },
  parameters: { docs: { description: { component: `### Use it when

a few categories are compared, left to right in a fixed order (hours, weekdays, months).

### Do not use it when

the categories are ranked by size (a \`List\` that is \`ranked\`), or the values are a trend over time (\`AreaChart\`).

The height, the colour (\`--chart-accent\`, the theme's primary by default) and which axis labels show (every one up to eight, then every nth) are the chart's; the page gives only the data and the words.

With \`highlight\` one column is the point (this album among the artist's): it keeps the series' colour, its value is written over it and its label is bold, and the others are a grey step. The title says which it is.

### Accessibility

**Handled by the component**

- The chart is one image (\`role="img"\`) named by \`ariaLabel\` ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- The exact values are a \`ChartTable\` with row and column headers, always there for anyone to open («Vis tallene») ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- Not a tab stop; the tooltip only repeats the table, so nothing needs a pointer ([2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard))
- Every column is in the table, also those a crowded axis leaves unlabelled ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- Columns take their colour from the theme tokens, in light and dark ([1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast))

**You check**

- \`ariaLabel\` says what is counted and over what period, not «Diagram» ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- A \`summary\` that states the message (the finding, not only the numbers) ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- \`valueLabel\` names what is counted; it heads the table's column ([2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels))

### Content

Labels are short. The title says what is counted and in what unit.

### Related

\`AreaChart\`, \`ChartCard\`, \`List\`` } }, },
} satisfies Meta<typeof ColumnChart>
export default meta
type Story = StoryObj<typeof meta>

/** Twelve months, every column labelled. */
export const Default: Story = {}
/** 24 hours: a crowded axis labels every third column by itself; every hour is in the table. */
export const Hours: Story = { args: { data: Array.from({ length: 24 }, (_, hour) => ({ label: String(hour).padStart(2, "0"), value: Math.round(40 + 30 * Math.sin((hour - 6) / 3.8)) })), ariaLabel: "Avspillinger per time", highlight: "14" } }
/** The visible summary under the chart, the text that states the message. */
export const WithSummary: Story = { args: { summary: "Søylediagram. Avspillinger, 12 verdier. Høyest mar (402), lavest des (210). Økte fra 210 til 380." } }
/** `highlight`: one column against the rest, an album among the artist's in the order they came out. The others are a grey step; the picked-out one has its value over it and its label in bold, kept when the axis thins its labels. */
export const Highlight: Story = {
  args: {
    data: [
      { label: "Melody A.M.", value: 1204 },
      { label: "The Understanding", value: 688 },
      { label: "Junior", value: 913 },
      { label: "Senior", value: 342 },
      { label: "The Inevitable End", value: 410 },
      { label: "Profound Mysteries", value: 265 },
    ],
    ariaLabel: "Dine avspillinger av hvert studioalbum av Röyksopp",
    valueLabel: "Avspillinger",
    highlight: "Junior",
  },
}
/** No data: a sentence in the chart's place, at its height. */
export const Empty: Story = { args: { data: [] } }
