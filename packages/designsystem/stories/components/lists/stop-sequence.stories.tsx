import type { Meta, StoryObj } from "@storybook/react-vite"

import { StopSequence, type RouteStop } from "../../../src/components/stop-sequence"

/** Friday 20 November 2026, 14:00 in Oslo: a fixed now, so the pictures stay the same. */
const NOW = "2026-11-20T13:00:00.000Z"
const at = (minutes: number) => new Date(Date.parse(NOW) + minutes * 60_000).toISOString()

const NAMES = ["Fornebu", "Fornebu vest", "Lysaker stasjon", "Skøyen", "Majorstuen", "Bislett", "Alexander Kiellands plass", "Carl Berners plass", "Hasle", "Økern", "Tonsenhagen"]

const TRIP: RouteStop[] = NAMES.map((name, index) => ({ key: String(index), name, expected: at(index * 3 - 21) }))
const LINKED = TRIP.map((stop) => ({ ...stop, href: `#${stop.key}` }))
const LATE = LINKED.map((stop, index) => (index >= 7 ? { ...stop, aimed: stop.expected, expected: at(index * 3 - 21 + 4) } : stop))

const meta = {
  title: "Components/Lists/StopSequence",
  component: StopSequence,
  tags: ["autodocs"],
  args: { stops: LINKED, current: 7, mode: "bus" },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
  parameters: { docs: { description: { component: `### Use it when

a line has its own page, and the reader wants to know where it goes: every stop on one trip, in the order it calls, and when it is there. The stop the page is seen from is marked, and the stops before it are folded away.

### Do not use it when

the reader wants the departures from a stop: that is \`DepartureList\` (all of them) or \`DepartureBoard\` (the next few). A journey with changes is the travel planner's.

### Accessibility

**Handled by the component**

- An ordered list, so a screen reader hears how many stops there are and where in the trip a stop is ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The stop seen from is \`aria-current="location"\` and is heard as «herfra»; not only by its full dot ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- A delay is heard as «Rutetid 14:02, forsinket +4 min»; a cancelled stop is «Innstilt» in words
- With \`href\` the stop's name is the row's one link; it covers the whole row, at least 44 px high ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum))
- The fold is a native \`<details>\`: no script

### Content

Entur's \`serviceJourney.estimatedCalls\` for one departure: the stop place's name and id (its page), the expected and aimed departure (arrival at the last stop).

### Related

\`DepartureList\`, \`DepartureBoard\`, \`LineBadge\`, \`Timeline\`.` } } },
} satisfies Meta<typeof StopSequence>

export default meta
type Story = StoryObj<typeof meta>

/** Buss 31 from Carl Berners plass towards Tonsenhagen: the seven stops before it folded, each stop a link to its page. */
export const Default: Story = {}

/** The fold open: the stops before are quieter. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector("details")?.setAttribute("open", "")
    await new Promise((resolve) => setTimeout(resolve, 800))
  },
}

/** Late from Carl Berners plass on: the timetable's time struck beside the real one. A cancelled stop in words. */
export const Late: Story = { args: { stops: LATE.map((stop, index) => (index === 9 ? { ...stop, cancelled: true } : stop)), mode: "tram" } }

/** From the first stop: nothing to fold, and without links. */
export const FromStart: Story = { args: { stops: TRIP, current: 0, mode: "metro" } }
