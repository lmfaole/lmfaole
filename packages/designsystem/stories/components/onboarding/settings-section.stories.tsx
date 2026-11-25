import type { Meta, StoryObj } from "@storybook/react-vite"

import { IntroSettings } from "../../../src/components/app-settings"
import { AppearanceSettings } from "../../../src/components/appearance-settings"
import { Banner } from "../../../src/components/banner"
import { Breadcrumbs } from "../../../src/components/breadcrumbs"
import { PageColumn } from "../../../src/components/layout"
import { PendingButton } from "../../../src/components/pending-button"
import { PageHeader } from "../../../src/components/page-header"
import { ReorderList } from "../../../src/components/reorder-list"
import { SettingsSection } from "../../../src/components/settings-section"
import { Heading } from "../../../src/components/text"
import { fields } from "./first-run-steps"

const meta = {
  title: "Components/Onboarding/SettingsSection",
  component: SettingsSection,
  tags: ["autodocs"],
  args: { title: "Forsiden", description: "Hvilke deler som står på forsiden.", id: "forside", children: fields.sections() },
  argTypes: { children: { control: false } },
  parameters: { docs: { description: { component: `### Use it when

an app has a setting of its own (the account, the front page, a place): one section for each, in a subpage of «Innstillinger» with breadcrumbs, its own small form with \`back\` set to the subpage, «Lagre», and a \`Banner tone="success"\` after the save, with the same fields as the first-run wizard (\`FirstRun\`). The page itself is an overview (see SubPages, «Settings overview»). The parts every app has are whole components built of this: \`AppearanceSettings\` («Utseende»), \`InstallSettings\` («App»), \`IntroSettings\` and \`SourcesSettings\`.

### Do not use it when

a page has one setting of its own (put the field on the page), for parts of a page that are not settings (use \`PageSection\`), or for the theme, the effects, the light, installing, the introduction or the sources (use the components above).

### Accessibility

**Handled by the component**

- A section labelled by its \`h2\`, so the settings are in the outline and a screen reader can jump between them ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- After a save the server sends the reader back with \`?lagret=1\`, and the page shows \`Banner tone="success"\` («Lagret», \`role="status"\`) under the title, so it is seen and said ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)).
- \`id\` is a place to link to: «Bytt» on a \`UserChip\` can go to \`/innstillinger#github\`

**You check**

- The page is one form, or one per section, with a real submit button; it works without JavaScript.

### Content

The title is the thing («Tema», «Effekter»), the description what it changes in one sentence.

### Related

\`FirstRun\`, \`AppearanceSettings\`, \`ChoiceCards\`, \`CheckboxList\`, \`ListField\`, \`TextField\`, \`PageSection\`` } } },
} satisfies Meta<typeof SettingsSection>
export default meta
type Story = StoryObj<typeof meta>

/** One section: the front page's parts. */
export const Default: Story = {}

/** A small app's settings on one page: its own settings in one form, then the shared parts, each its own form. */
export const SettingsPage: Story = {
  render: () => (
    <PageColumn>
      <Heading level={1}>Innstillinger</Heading>
      <form method="post" action="/start/api/innstillinger" className="grid gap-8">
        <input type="hidden" name="back" value="/start/innstillinger" />
        <SettingsSection id="github" title="GitHub" description="Hvem vi henter data for, og hva du følger.">
          {fields.github()}
          {fields.repos()}
        </SettingsSection>
        <SettingsSection id="forside" title="Forsiden" description="Hvilke deler som står på forsiden.">
          {fields.sections()}
        </SettingsSection>
        <div>
          <PendingButton pendingLabel="Lagrer …">Lagre</PendingButton>
        </div>
      </form>
      <AppearanceSettings prefs={{ theme: "system", effects: "on", tilt: "off" }} action="/start/api/innstillinger" back="/start/innstillinger" />
      <IntroSettings action="/start/api/innstillinger" back="/start" />
    </PageColumn>
  ),
}

/**
 * A settings subpage: the breadcrumbs back to «Innstillinger», a `Banner tone="success"` after the save (`?lagret=1`, `role="status"`), and one section in its own form that posts
 * to the settings endpoint with `back` set to this subpage. The order is a `ReorderList`, the sections shown a `CheckboxList`.
 */
export const SettingsSubpage: Story = {
  render: () => (
    <PageColumn>
      <Breadcrumbs
        items={[
          { label: "Innstillinger", href: "#innstillinger" },
          { label: "Forsiden", href: "#forside" },
        ]}
      />
      <PageHeader title="Forsiden" />
      <Banner tone="success" title="Lagret" />
      <form method="post" action="/start/api/innstillinger" className="grid gap-8">
        <input type="hidden" name="back" value="/start/innstillinger/forside" />
        <SettingsSection id="forside" title="Hva og i hvilken rekkefølge" description="Hvilke deler som står på forsiden, og hvilken som kommer først.">
          {fields.sections()}
          <ReorderList
            name="order"
            legend="Rekkefølgen"
            hint="Dra i håndtaket, eller bruk pilene."
            items={[
              { id: "weather", label: "Været", icon: "weather" },
              { id: "transport", label: "Avganger", icon: "bus" },
              { id: "github", label: "GitHub", icon: "pull-request" },
            ]}
          />
        </SettingsSection>
        <div>
          <PendingButton pendingLabel="Lagrer …">Lagre</PendingButton>
        </div>
      </form>
    </PageColumn>
  ),
}
