import type { Meta, StoryObj } from "@storybook/react-vite"

import { KeyFigures } from "../../../src/components/key-figures"
import { Sparkline } from "../../../src/components/sparkline"

const meta = {
  title: "Components/Charts/KeyFigures",
  component: KeyFigures,
  tags: ["autodocs"],
  args: {
    figures: [
      { value: "08:32", label: "soloppgang" },
      { value: "15:36", label: "solnedgang" },
      { value: "7 t 5 min", label: "dagslys, 4 min kortere" },
    ],
  },
  parameters: { docs: { description: { component: `### Use it when

a section has two to four numbers that say most about it, and the reader should have them at a glance: the sun's times, the price of power now and the cheapest hours, the air's index. They go first in the section, above the chart that shows the shape behind them.

### Do not use it when

the numbers are facts to look up, many or of different kinds (\`FactList\`), counts that each lead to a list (\`SummaryBar\`), or the head of a page of a thing (\`DetailHeader\`'s \`figures\`, the same figures). One number in a sentence is \`Text role="figure"\`.

### Accessibility

**Handled by the component**

- A description list: what is counted is the term, the number its value, so a screen reader hears both together ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The figures wrap at any width and 400 % zoom, never scroll sideways ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow))

**You check**

- The label says what the number is without the section around it («soloppgang», not «i dag»)
- A trend (\`Sparkline\`) has its own label

### Content

The number formatted as it is read («47 øre», «7 t 5 min»), the label lower case, a few words. Say a number once: the chart's summary says the rest.

### Related

\`DetailHeader\` (the same figures in a page's head), \`FactList\`, \`SummaryBar\`, \`ColumnChart\`.
` } } },
} satisfies Meta<typeof KeyFigures>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithTrend: Story = {
  args: {
    figures: [
      { value: "47 øre", label: "strøm nå", trend: <Sparkline data={[52, 50, 49, 47, 55, 80, 92, 78, 64]} ariaLabel="Prisen i dag" /> },
      { value: "03–06", label: "billigst, 41 øre" },
    ],
  },
}
