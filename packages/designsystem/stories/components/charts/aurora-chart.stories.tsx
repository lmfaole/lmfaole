import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChartCard } from "../../../src/components/chart-card"
import { AuroraChart } from "../../../src/components/aurora-chart"
import type { AuroraChartSlot } from "../../../src/lib/aurora-chart"

/** NOAA's Kp from Friday 20 November 2026 00 UTC, every three hours for four days: the first day and a half measured, a small storm on Saturday evening. */
const KP = [1.33, 1, 1.67, 2, 2.33, 2.67, 3, 2.33, 2, 1.67, 2.33, 2.67, 3.33, 3.67, 4.67, 5.33, 4.33, 3.67, 3, 2.67, 2.33, 2.67, 3.33, 4, 3.67, 3, 2.33, 2, 2, 2.33, 2.67, 2.33]
const SLOTS: AuroraChartSlot[] = KP.map((kp, index) => {
  const time = new Date(Date.UTC(2026, 10, 20, index * 3)).toISOString()
  return { time, kp, observed: time < "2026-11-21T18:00:00Z", clouds: [10, 20, 80, 90, 30, 5, 0, 15][index % 8] ?? null }
})

/** Sunset to sunrise in Oslo, 19 to 24 November. */
const OSLO_DARK = [19, 20, 21, 22, 23].map((day) => ({ from: `2026-11-${day}T14:40:00Z`, to: `2026-11-${day + 1}T07:30:00Z` }))

const meta = {
  title: "Components/Charts/AuroraChart",
  component: AuroraChart,
  tags: ["autodocs"],
  decorators: [(Story) => <ChartCard title="Nordlys de neste dagene">{Story()}</ChartCard>],
  args: { data: SLOTS, needed: 4.5, dark: OSLO_DARK, now: "2026-11-21T19:20:00Z", ariaLabel: "Nordlys i Oslo de neste dagene" },
  parameters: { docs: { description: { component: `### Use it when

the chance of the northern lights over the next days is shown: how active the magnetic field is (the Kp index every three hours), against what the place needs, in the dark hours.

### Do not use it when

only tonight's answer matters (a sentence: «God sjanse kl. 21–24»), or the weather is the point (\`Meteogram\`).

### Accessibility

**Handled by the component**

- The drawing is one image named by \`ariaLabel\`, hidden inside, and a summary says the highest Kp and the dark hours that reach the line ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- A column that reaches is not told by colour alone: the dashed line is labelled with the Kp the place needs, and the dark is shaded ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- Every slot (time, Kp, measured or forecast, dark, clouds) is a \`ChartTable\`, always there for anyone to open («Vis tallene») ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- It takes the width of its room; in a narrow room every other hour label is left out ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow))

**You check**

- \`needed\` is worked out for the place, and \`dark\` is the place's own; the source (NOAA SWPC) is credited where the app lists its sources

### Content

Times are Oslo's, a slot «lør. 21–24»; the index «Kp 4,7» with a decimal comma.

### Related

\`Meteogram\`, \`ColumnChart\`, \`ChartCard\`` } } },
} satisfies Meta<typeof AuroraChart>
export default meta
type Story = StoryObj<typeof meta>

/** Oslo, which needs about Kp 4,5: only Saturday evening's storm reaches the line in the dark. */
export const Default: Story = {}
/** Tromsø in the polar night: every hour is dark and the line is at 0, so every column reaches. */
export const PolarNight: Story = { args: { needed: 0, dark: [{ from: "2026-11-18T00:00:00Z", to: "2027-01-15T11:00:00Z" }], ariaLabel: "Nordlys i Tromsø de neste dagene" } }
/** No slots: a sentence in the chart's place. */
export const Empty: Story = { args: { data: [] } }
