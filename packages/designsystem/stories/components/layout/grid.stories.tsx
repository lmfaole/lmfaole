import type { Meta, StoryObj } from "@storybook/react-vite"

import { Grid, Stack } from "../../../src/components/layout"
import { PageSection } from "../../../src/components/page-section"
import { List } from "../../../src/components/list"
const Box = ({ n }: { n: number }) => <div className="rounded-md border bg-muted px-3 py-2 text-sm">Box {n}</div>
const boxes = (count: number) => Array.from({ length: count }, (_, i) => <Box key={i} n={i + 1} />)

const meta = {
  title: "Components/Layout/Grid",
  component: Grid,
  tags: ["autodocs"],
  args: { columns: "tiles", children: null },
  parameters: { docs: { description: { component: `### Use it when

things are looked at, not read: pictures, charts, cards of equal weight.

### Do not use it when

the content is text to be read (a grid is read across and then down: \`Stack\`).

### Accessibility

**Handled by the component**

- The children are placed in DOM order, row by row, the order they are read in ([1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)).
- The columns fit as many as there is room for, so nothing scrolls sideways at 320 px ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).
- No semantics of its own: a \`div\` ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).

**You check**

- The children are in the order they matter: a grid is read across, then down ([1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)).
- Text, lists and sections stand in a \`Stack\`, not in columns.

### Related

\`Stack\`, \`Tiles\`` } }, },
} satisfies Meta<typeof Grid>
export default meta
type Story = StoryObj<typeof meta>

/**
 * As many 9rem columns as fit: for pictures. Columns are for what is LOOKED AT: pictures and charts. Text, lists and the sections of a
 * page stand under each other in the reading column (README, rule 7).
 */
export const Tiles: Story = { args: { columns: "tiles" }, render: (args) => <Grid {...args}>{boxes(10)}</Grid> }
/** Two or three charts across on a desktop, one on a phone. */
export const Charts: Story = { args: { columns: "charts" }, render: (args) => <Grid {...args}>{boxes(3)}</Grid> }

const rows = (names: string[]) => <List rows={names.map((name, index) => ({ key: name, title: name, value: `${index + 2}. nov.` }))} />

/**
 * **Ikke:** sections of text side by side. The reader has to choose a path (across, then down?), the second section looks less
 * important than the first though it is not, and each list is too narrow. Read content stands under each other: see the next story.
 */
export const DontSectionsInColumns: Story = {
  tags: ["!manifest"],
  args: { columns: "charts" },
  render: (args) => (
    <Grid {...args}>
      <PageSection id="dont-pulls" title="Pull requests" icon="pull-request">{rows(["Fiks tidssone i værmeldingen", "Utkast: tidslinje"])}</PageSection>
      <PageSection id="dont-issues" title="Issues" icon="issue">{rows(["Feil: TextArea får scroll", "Bedre tomtilstand"])}</PageSection>
    </Grid>
  ),
}

/** **Gjør:** the same sections under each other, in the order they matter: one path, each list the width of the column. */
export const DoSectionsUnderEachOther: Story = {
  render: () => (
    <Stack>
      <PageSection id="do-pulls" title="Pull requests" icon="pull-request">{rows(["Fiks tidssone i værmeldingen", "Utkast: tidslinje"])}</PageSection>
      <PageSection id="do-issues" title="Issues" icon="issue">{rows(["Feil: TextArea får scroll", "Bedre tomtilstand"])}</PageSection>
    </Stack>
  ),
}
