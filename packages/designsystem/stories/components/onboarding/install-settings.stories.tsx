import type { Meta, StoryObj } from "@storybook/react-vite"

import { InstallSettings } from "../../../src/components/app-settings"

const meta = {
  title: "Components/Onboarding/InstallSettings",
  component: InstallSettings,
  tags: ["autodocs"],
  args: { appName: "Startside", cookiePath: "/" },
  parameters: { docs: { description: { component: `### Use it when

the app can be installed: «Innstillinger › App» is this. The offer to install (\`InstallPrompt\`, answered once as \`install-settings\` in the \`seen\` cookie under \`cookiePath\`), and the way by hand where the browser has no button. In the overview, its row is \`appPage(href, appName)\`, second after «Utseende». It needs the browser (in Astro: \`client:idle\`).

### Do not use it when

on the front page: that is \`InstallPrompt\` itself, offered once.

### Accessibility

**Handled by the component**

- A section labelled by its heading ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The offer is shown only where the browser can install; the way by hand is always there in words ([3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions))

**You check**

- \`cookiePath\` is the path the app's \`seen\` cookie is kept under.

### Content

All words are the component's, with the app's name.

### Related

\`InstallPrompt\`, \`SubPages\`, \`AppearanceSettings\`` } } },
} satisfies Meta<typeof InstallSettings>
export default meta
type Story = StoryObj<typeof meta>

/** Where the browser has no install button (as in Storybook): the way by hand. */
export const Default: Story = {}
