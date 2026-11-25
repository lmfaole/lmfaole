import type { Meta, StoryObj } from "@storybook/react-vite"

import { Stack } from "../../../src/components/layout"
const Box = ({ n }: { n: number }) => <div className="rounded-md border bg-muted px-3 py-2 text-sm">Box {n}</div>
const boxes = (count: number) => Array.from({ length: count }, (_, i) => <Box key={i} n={i + 1} />)

const meta = {
  title: "Components/Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  args: { children: null },
  parameters: { docs: { description: { component: `### Use it when

things stand under each other inside a section or a card. This is the layout of read content. The sections of a page are not put in a \`Stack\`: \`PageLayout\` spaces them, the same on every page.

### Do not use it when

the things are looked at side by side (\`Tiles\`, \`Grid\`).

### Accessibility

**Handled by the component**

- The children stand under each other in DOM order, the order they are read in ([1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)).
- One column that never grows wider than its parent ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).
- No semantics of its own: a \`div\` ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).

**You check**

- A group shown only by spacing also has a heading or an element that says so ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).

### Related

\`Inline\`, \`Grid\`, \`PageLayout\`` } }, },
} satisfies Meta<typeof Stack>
export default meta
type Story = StoryObj<typeof meta>

/** Blocks inside a section, under each other: the \`default\` gap. */
export const Default: Story = { render: (args) => <Stack {...args}>{boxes(3)}</Stack> }
/** \`gap="tight"\`: lines that belong together, as a title and its details. */
export const Tight: Story = { args: { gap: "tight" }, render: (args) => <Stack {...args}>{boxes(3)}</Stack> }
