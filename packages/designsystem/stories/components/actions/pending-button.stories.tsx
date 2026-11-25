import type { Meta, StoryObj } from "@storybook/react-vite"

import { PendingButton } from "../../../src/components/pending-button"

const meta = {
  title: "Components/Actions/PendingButton",
  component: PendingButton,
  tags: ["autodocs"],
  args: { children: "Lagre", pendingLabel: "Lagrer …" },
  parameters: { docs: { description: { component: `### Use it when

a native form is sent to a server that may take a moment (a name checked with a service, settings saved): the button that sends it shows that it works until the next page comes. Put \`listenForPendingForms()\` (\`lib/pending-forms\`) once in the layout, or \`<PendingForms />\` in React; without it the form is sent as before.

### Do not use it when

the action answers at once, or it runs in the page without leaving it: show the result there (a \`Banner\`). A long job gets a \`Progress\`.

### Accessibility

**Handled by the component**

- A native \`<button>\`; while it waits it is \`aria-busy\` and \`aria-disabled\` (not \`disabled\`, which would lose focus and the button's own value), and a second press sends nothing ([4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value))
- The waiting is said in words, on the button and in a polite live region beside it (\`role="status"\`); the spinner is decorative and stands still where motion is reduced ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions))
- The two labels share one width, so nothing beside the button moves
- Coming back with the browser's back button, it waits no more

**You check**

- \`pendingLabel\` is the same verb, going on («Lagre» → «Lagrer …») ([3.2.4 Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification))
- The page that comes after says how it went (an error beside the field, «Lagret») ([3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification))

### Content

The verb in the present with « …»: «Lagrer …», «Sjekker brukernavnet …», «Sender …».

### Related

\`Button\`, \`UsernameForm\`, \`FirstRun\` (its «Neste» while a step is checked), pattern **Forms**` } } },
} satisfies Meta<typeof PendingButton>
export default meta
type Story = StoryObj<typeof meta>

/** Before it is pressed: a plain button. */
export const Default: Story = {}
/** While the server answers: the label gives way to `pendingLabel` and a spinner, in the same width. */
export const Pending: Story = {
  play: ({ canvasElement }) => {
    canvasElement.querySelector("button[data-pending-label]")?.setAttribute("aria-busy", "true")
  },
}
/** With \`reach\`, its target 0.25rem taller above and below, as in \`UsernameForm\`. */
export const Reach: Story = { args: { reach: true } }
/** In a form: press it to see the waiting state (the form goes nowhere here). */
export const InForm: Story = {
  render: (args) => (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const button = event.currentTarget.querySelector("button[data-pending-label]")
        button?.setAttribute("aria-busy", "true")
        button?.setAttribute("aria-disabled", "true")
      }}
    >
      <PendingButton {...args} />
    </form>
  ),
}
