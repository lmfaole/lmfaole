import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../../../src/components/button"
import { Inline } from "../../../src/components/layout"

const meta = {
  title: "Components/Actions/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Nullstill" },
  parameters: { docs: { description: { component: `### Use it when

a secondary action that does something on this page: reset, re-run the intro, cancel a download, use my position. It has one look
(outline) and one size; an app says what it does (\`children\`, \`icon\`, \`type\`), never how it looks.

### Do not use it when

going to another page (\`LinkButton\`, \`TextLink\`), or sending a form to the server (\`PendingButton\`, the one filled button).

### Accessibility

**Handled by the component**

- A native \`<button>\`: focusable, and pressed with Enter and Space ([2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard))
- Its text is its accessible name, and \`disabled\` is the native attribute, exposed as such ([4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value))
- A focus ring in the \`ring\` token on keyboard focus ([2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible))
- It is 2.25rem tall and its target reaches 0.25rem above and below it (2.5rem) ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum))
- Text and border are theme tokens whose contrast the theme tests ([1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum))

**You check**

- The text says what happens («Lagre», «Last ned»), not «OK» ([2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels))
- An \`aria-label\` on a button with visible text starts with that text ([2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name))
- A disabled button cannot be focused: say near it why it is not available ([3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions))
- Going to another page is a link (\`LinkButton\`), not a button ([4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value))

### Content

A verb: «Lagre», «Opprett», with the thing when it is not clear.

### Related

\`LinkButton\`, \`PendingButton\`, \`ButtonGroup\`` } }, },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

/** The one look: outline, one size. */
export const Default: Story = {}
/** An icon before the words, where the buttons beside it have one. */
export const WithIcon: Story = { args: { icon: "download", children: "Last ned" } }
/** In a form: `type="submit"` with `name` and `value`, for a second way to send it («Kjør på nytt»). */
export const InAForm: Story = {
  render: () => (
    <form action="#">
      <Inline>
        <Button type="submit" name="handling" value="kjor" icon="refresh">Kjør på nytt</Button>
        <Button type="button">Avbryt</Button>
      </Inline>
    </form>
  ),
}
/** The native disabled state: faded and not focusable; say near it why. */
export const Disabled: Story = { args: { disabled: true } }
