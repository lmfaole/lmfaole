import type { Meta, StoryObj } from "@storybook/react-vite"

import { IntroSettings } from "../../../src/components/app-settings"

const meta = {
  title: "Components/Onboarding/IntroSettings",
  component: IntroSettings,
  tags: ["autodocs"],
  args: { action: "/api/innstillinger", back: "/" },
  parameters: { docs: { description: { component: `### Use it when

the app has a first run (\`FirstRun\`): «Introen» with «Vis introen igjen», on the settings overview under \`SubPages\`. A form of its own to the app's settings endpoint (\`action\`) with \`rerun=1\` and \`back\` (the front page): the server takes the first run out of the \`seen\` cookie and sends the reader there, where the wizard opens.

### Do not use it when

the app has no first run, or inside another form (it is a form).

### Accessibility

**Handled by the component**

- A section labelled by its heading, with a real submit button: it works without JavaScript ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The button says what happens, and the sentence says where ([2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels))

**You check**

- The endpoint reads \`rerun=1\` and sends the reader to \`back\`.

### Content

All words are the component's.

### Related

\`FirstRun\`, \`SubPages\`, \`AppearanceSettings\`, \`SourcesSettings\`` } } },
} satisfies Meta<typeof IntroSettings>
export default meta
type Story = StoryObj<typeof meta>

/** «Vis introen igjen». */
export const Default: Story = {}
