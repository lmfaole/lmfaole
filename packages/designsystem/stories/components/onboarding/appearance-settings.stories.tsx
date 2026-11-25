import type { Meta, StoryObj } from "@storybook/react-vite"

import { AppearanceSettings, EffectsChoice, ThemeChoice, TiltChoice } from "../../../src/components/appearance-settings"
import { Breadcrumbs } from "../../../src/components/breadcrumbs"
import { PageColumn } from "../../../src/components/layout"
import { PageHeader } from "../../../src/components/page-header"

const meta = {
  title: "Components/Onboarding/AppearanceSettings",
  component: AppearanceSettings,
  tags: ["autodocs"],
  args: { prefs: { theme: "system", effects: "on", tilt: "off" }, action: "/api/innstillinger", back: "/innstillinger/utseende" },
  parameters: { docs: { description: { component: `### Use it when

an app has a settings page: «Innstillinger › Utseende» is this, whole and the same in every app. «Tema», «Effekter» (with «Vibrasjon») and «Lyset», each a \`SettingsSection\` with its choices as pictures (the example IS the choice), in one form to the app's settings endpoint, and «Lagre». The app passes what is chosen now (\`prefs\`, from the \`prefs\` cookie), its endpoint (\`action\`) and where to come back to (\`back\`). The fields are \`theme\`, \`effects\`, \`tilt\` and \`back\`; vibration is kept in the browser (\`ds-haptics\`) and sends nothing.

In the overview, its row is \`appearancePage(href, prefs)\` (first, with \`appearanceSummary\` as its value). In a first run, the same choices one step at a time: \`ThemeChoice\`, \`EffectsChoice\`, \`TiltChoice\`.

### Do not use it when

for any other setting (use \`SettingsSection\` with the app's own fields), or with the sections in another order or other words: they are the same in every app.

### Accessibility

**Handled by the component**

- Each choice is native radio buttons in a \`<fieldset>\` named by its section, the whole card the label ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The pictures are hidden from a screen reader: the label and its sentence say what the choice is ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- The chosen card is marked by its border, a ring, a check and the radio, never by colour alone ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- «Følg telefonen» asks the phone for its motion only when chosen, and says so first ([3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input))
- A real form with a submit button: it works without JavaScript

**You check**

- The page shows \`Banner tone="success"\` («Lagret») after the save (\`?lagret=1\`), under its breadcrumbs and title.

### Content

All words are the component's.

### Related

\`SettingsSection\`, \`SubPages\`, \`FirstRun\`, \`IntroSettings\`, \`InstallSettings\`, \`SourcesSettings\`, guide «Foundations / Haptics»` } } },
} satisfies Meta<typeof AppearanceSettings>
export default meta
type Story = StoryObj<typeof meta>

/** The three sections and «Lagre», as chosen now. */
export const Default: Story = {}

/** The whole subpage: breadcrumbs, the title and the form. */
export const Subpage: Story = {
  args: { prefs: { theme: "dark", effects: "off", tilt: "on" } },
  render: (args) => (
    <PageColumn>
      <Breadcrumbs items={[{ label: "Innstillinger", href: "#innstillinger" }, { label: "Utseende", href: "#utseende" }]} />
      <PageHeader title="Utseende" />
      <AppearanceSettings {...args} />
    </PageColumn>
  ),
}

/** One step each in a first run: the same choices, with their legend. */
export const Choices: Story = {
  render: () => (
    <div className="grid max-w-prose gap-8">
      <ThemeChoice value="system" />
      <EffectsChoice value="on" />
      <TiltChoice value="off" />
    </div>
  ),
}
