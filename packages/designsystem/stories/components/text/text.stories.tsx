import type { Meta, StoryObj } from "@storybook/react-vite"

import { Text } from "../../../src/components/text"

const meta = {
  title: "Components/Text/Text",
  component: Text,
  tags: ["autodocs"],
  args: { children: "Blåbærsyltetøy på skiva." },
  parameters: { docs: { description: { component: `### Use it when

running text, in one of four roles: \`body\`, \`quiet\` (a secondary line), \`note\` (a credit or a source under content) or \`figure\` (a number in a line). The role says what the words are; the size, weight and colour follow from it.

### Do not use it when

a heading (\`Heading\`) or a label next to a field (\`TextField\`).

### Accessibility

**Handled by the component**

- A paragraph is a \`p\`; only \`figure\` is a \`span\`, so it sits in a line ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The quiet colour is a theme token that meets 4.5:1 ([1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum))
- Sizes are in \`rem\`, so text grows with the reader's text size ([1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text))
- Long words break where they must instead of widening the page ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow))

**You check**

- \`quiet\` and \`note\` are for what matters less; never put the only copy of something important in them ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))

### Content

Plain words, active voice, «du» to the reader.

### Related

\`Heading\`, \`Lines\`, \`Markdown\`` } }, },
} satisfies Meta<typeof Text>
export default meta
type Story = StoryObj<typeof meta>

/** Running text: the \`body\` role. */
export const Default: Story = {}
/** A secondary line or a description: smaller and quieter, still 4.5:1. */
export const Quiet: Story = { args: { role: "quiet" } }
/** Small text under content: a credit, a source, «Sist endret». */
export const Note: Story = { args: { role: "note", children: "Tekst fra Wikipedia" } }
/** A number in a line, its figures lined up under each other. */
export const Figure: Story = { args: { role: "figure", children: "1 111 8 888" } }
