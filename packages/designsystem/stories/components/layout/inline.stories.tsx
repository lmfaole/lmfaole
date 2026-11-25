import type { Meta, StoryObj } from "@storybook/react-vite"

import { Inline } from "../../../src/components/layout"
const Box = ({ n }: { n: number }) => <div className="rounded-md border bg-muted px-3 py-2 text-sm">Box {n}</div>
const boxes = (count: number) => Array.from({ length: count }, (_, i) => <Box key={i} n={i + 1} />)

const meta = {
  title: "Components/Layout/Inline",
  component: Inline,
  tags: ["autodocs"],
  args: { children: null },
  parameters: { docs: { description: { component: `### Use it when

a few small things sit on one line: a count and a label, a button and a link.

### Do not use it when

the things are read in order down the page (\`Stack\`).

### Accessibility

**Handled by the component**

- The children are in DOM order, the order they are read in; \`between\` only moves them apart ([1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)).
- It wraps instead of scrolling sideways ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).
- No semantics of its own: a \`div\`, or a \`ul\` of \`li\` named by \`label\` when given \`items\` ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).

**You check**

- \`as="ul"\` when the children are a list of things ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).
- Small controls side by side keep the gap that makes each a 24 px target or spaced like one ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

### Related

\`Stack\`, \`StatusLine\`` } }, },
} satisfies Meta<typeof Inline>
export default meta
type Story = StoryObj<typeof meta>

/** Three things in a row, wrapping when the row is full. The gap is fixed. */
export const Default: Story = { render: (args) => <Inline justify={args.justify ?? "start"}>{boxes(3)}</Inline> }
/** \`justify="between"\`: one thing at each end, as a title and its action. */
export const SpaceBetween: Story = { args: { justify: "between" }, render: (args) => <Inline justify={args.justify ?? "start"}>{boxes(2)}</Inline> }
/** \`items\` and \`label\`: things of one kind in a row are a list, named for a screen reader. */
export const List: Story = { render: () => <Inline label="Sjangere" items={["Electronic", "Pop", "Jazz"].map((genre) => <span key={genre} className="rounded-md border bg-muted px-2 py-1 text-sm">{genre}</span>)} /> }
