import type { Meta, StoryObj } from "@storybook/react-vite"

import { SourcesSettings } from "../../../src/components/app-settings"

const meta = {
  title: "Components/Onboarding/SourcesSettings",
  component: SourcesSettings,
  tags: ["autodocs"],
  args: {
    sources: [
      { name: "GitHub", brand: "github", href: "https://github.com", description: "Offentlige pull requests, saker og diskusjoner for brukeren du har valgt." },
      { name: "Entur", brand: "entur", href: "https://entur.no", description: "Stasjoner og avganger." },
      { name: "Yr", brand: "yr", href: "https://www.yr.no", description: "Værdata fra Meteorologisk institutt." },
      { name: "OpenStreetMap", brand: "openstreetmap", href: "https://www.openstreetmap.org/copyright", description: "Navnet på stedet du er.", credit: "© OpenStreetMap-bidragsytere." },
    ],
  },
  parameters: { docs: { description: { component: `### Use it when

the app shows data from others: «Kilder», last on the settings overview, says once where the data comes from rather than on every page that uses it. Each source with its mark (\`brand\`), its name linking to it, what the app gets from it (\`description\`), and the credit its terms ask for (\`credit\`).

### Do not use it when

for a credit a source's terms ask to be shown beside its data (a map's attribution): that stays where the data is.

### Accessibility

**Handled by the component**

- A section labelled by its heading, the sources a description list: the source is the term, what it gives the value ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The whole source is the link's target, while a screen reader hears only the name; the marks are hidden ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context))
- A link that leaves the app says so ([3.2.5 Change on Request](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request))

**You check**

- Every source the app asks is listed, with the credit its terms ask for.

### Content

\`description\` is what the app gets from the source, in a sentence; \`credit\` the words its terms ask for, as they are.

### Related

\`SubPages\`, \`IntroSettings\`, \`BrandIcon\`` } } },
} satisfies Meta<typeof SourcesSettings>
export default meta
type Story = StoryObj<typeof meta>

/** The start page's sources. */
export const Default: Story = {}
