import type { Meta, StoryObj } from "@storybook/react-vite"

import { DepartureList } from "../../../src/components/departure-list"
import type { BoardDeparture } from "../../../src/lib/departures"

/** Friday 20 November 2026, 14:00 in Oslo: a fixed now, so the pictures stay the same. */
const NOW = "2026-11-20T13:00:00.000Z"
const at = (minutes: number) => new Date(Date.parse(NOW) + minutes * 60_000).toISOString()
const go = (key: string, line: string, mode: BoardDeparture["mode"], destination: string, minutes: number, extra: Partial<BoardDeparture> = {}): BoardDeparture => ({ key, line, mode, destination, expected: at(minutes), realtime: true, ...extra })

const CARL_BERNER: BoardDeparture[] = [
  go("17-1", "17", "tram", "Rikshospitalet", 0.5, { quay: "C" }),
  go("31-1", "31", "bus", "Tonsenhagen", 2, { quay: "B" }),
  go("5-1", "5", "metro", "Vestli", 4),
  go("31-5", "31", "bus", "Fornebu", 5, { quay: "A", aimed: at(2) }),
  go("31-2", "31", "bus", "Tonsenhagen", 9, { quay: "B" }),
  go("17-2", "17", "tram", "Rikshospitalet", 10, { quay: "C", cancelled: true, notice: "Innstilt på grunn av en feil på vognen." }),
  go("5-2", "5", "metro", "Vestli", 11),
  go("31-6", "31", "bus", "Fornebu", 13, { quay: "A" }),
  go("31-3", "31", "bus", "Tonsenhagen", 17, { quay: "B" }),
  go("5-3", "5", "metro", "Vestli", 19, { realtime: false }),
  go("17-3", "17", "tram", "Rikshospitalet", 20, { quay: "C" }),
  go("31-7", "31", "bus", "Fornebu", 21, { quay: "A" }),
  go("20-1", "20", "bus", "Skøyen", 27, { realtime: false }),
  go("5-4", "5", "metro", "Vestli", 34, { realtime: false }),
  go("20-2", "20", "bus", "Skøyen", 62, { realtime: false }),
  go("31-8", "31", "bus", "Tonsenhagen", 66, { realtime: false, quay: "B" }),
  go("17-4", "17", "tram", "Rikshospitalet", 70, { realtime: false, quay: "C" }),
]

const meta = {
  title: "Components/Lists/DepartureList",
  component: DepartureList,
  tags: ["autodocs"],
  args: { departures: CARL_BERNER, now: NOW },
  parameters: { docs: { description: { component: `### Use it when

a stop has its own page, and the reader wants every departure from it the next hours, not only the next of each line: when the last bus goes, what leaves at a quarter past. The rows come in the order they leave, under a heading for each hour.

### Do not use it when

the reader wants what to catch now from the stops around them: that is \`DepartureBoard\`, a card per stop with the next few of each line, which links here with \`href\`. A journey from A to B is the travel planner's, not a list.

### Accessibility

**Handled by the component**

- An ordered list per hour under a heading, so a screen reader can jump from hour to hour ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- Each row is heard as «Trikk 17 mot Rikshospitalet», with the time as a \`<time>\`; a delay as «Rutetid 14:02, forsinket +3 min»; a cancellation in words, not only struck ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- With \`lineHref\` the destination is the row's one link, named with the line; it covers the whole row, so a tap anywhere on it follows the link, and the focus ring goes round the row ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum))
- No script: the page renders it on the server with \`now\`

**You check**

- The page renews itself (the departures move), and says how fresh they are with \`Freshness\`
- A filter by line is links (\`FilterChips\`), each a page of its own

### Content

Entur's departures as for \`DepartureBoard\`; ask for enough (two hours, a hundred) that the list is the stop's timetable.

### Related

\`DepartureBoard\`, \`LineBadge\`, \`FilterChips\`, \`Freshness\`.
` } } },
} satisfies Meta<typeof DepartureList>

export default meta
type Story = StoryObj<typeof meta>

/** A stop's next hour and a bit, by hour, with a delay, a cancellation and timetable times. */
export const Default: Story = {}

/** Nothing leaves: a sentence. */
export const Empty: Story = { args: { departures: [] } }

/** On a phone. */
export const Narrow: Story = { decorators: [(Story) => <div className="max-w-[22rem]">{Story()}</div>] }

/** With `lineHref`: each destination links to its line's page from the stop, named with the line for a screen reader, and the whole row is the link's target. */
export const Linked: Story = { args: { lineHref: (line) => `#linje-${line.line}` } }
