import type { Meta, StoryObj } from "@storybook/react-vite"

import { TextLink } from "../../../src/components/text"

const meta = {
  title: "Components/Links/TextLink",
  component: TextLink,
  tags: ["autodocs"],
  args: { href: "#", children: "A link" },
  parameters: { docs: { description: { component: `### Use it when

a link in running text: one that stays in the app, or, with \`external\`, one out to another site (a credit, «Værdata fra Yr»).

### Do not use it when

an action that goes somewhere as a button (\`LinkButton\`), or a row that is one link (the list draws it).

### Accessibility

**Handled by the component**

- A native \`<a href>\`: a link to every assistive technology and to the keyboard ([4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value))
- Underlined (dotted, solid on hover), so it is not told by colour alone ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- At least 1.5rem tall (\`min-h-6\`) ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum))
- \`external\` sets \`rel="noopener noreferrer"\` and ends the link with the external symbol and «(eksternt nettsted)» for a screen reader (\`ExternalMark\`) ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context))
- Keeps the browser's focus outline; nothing removes it, and forced colours draw a real outline ([2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible))

**You check**

- The text says where it goes, never «Klikk her» or «Les mer» ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context))
- A link out names the place it goes («Åpne på GitHub»), so the reader knows where they land ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context))

### Content

Never «Klikk her» or «Les mer».

### Related

\`List\`, \`LinkButton\`` } }, },
} satisfies Meta<typeof TextLink>
export default meta
type Story = StoryObj<typeof meta>

/** A link that stays in the app, in running text. */
export const Internal: Story = {}
/** With `external`: a link out, with the external symbol, «(eksternt nettsted)» for a screen reader and `rel="noopener noreferrer"`. */
export const External: Story = { args: { external: true, href: "https://example.com" } }
