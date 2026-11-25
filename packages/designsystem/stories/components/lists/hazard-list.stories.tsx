import type { Meta, StoryObj } from "@storybook/react-vite"

import { HazardList } from "../../../src/components/hazard-list"

const meta = {
  title: "Components/Lists/HazardList",
  component: HazardList,
  tags: ["autodocs"],
  args: {
    hazards: [
      { key: "snow", level: "yellow", title: "Mye snø", area: "Oslo og Akershus", when: "i dag 12:00 – i morgen 06:00", description: "Lokalt 15–25 cm snø på 12 timer. Vanskelige kjøreforhold.", source: "MET", href: "https://www.yr.no/nb/farevarsler", icon: "snow" },
      { key: "slide", level: "orange", title: "Jord- og flomskredfare", area: "Oslo", when: "i dag 07:00 – i morgen 07:00", description: "Mye regn på mettet bakke. Hold deg unna bratte skråninger og bekker med stor vannføring.", source: "Varsom", href: "https://www.varsom.no/", icon: "rain" },
    ],
    footer: "Farevarsler fra MET og Varsom (NVE).",
  },
  parameters: { docs: { description: { component: `### Use it when

the authorities warn about the weather or nature where the reader is: MET's farevarsler (wind, snow, rain, ice), NVE's flood, landslide and avalanche warnings on Varsom.

### Do not use it when

the message is about the page or a source (\`Banner\`), or it is a forecast and not a warning (\`List\`, \`FactList\`). Green («no warning») is not shown: an empty list draws nothing.

### Accessibility

**Handled by the component**

- The level is written out («Gult nivå»), not told by its colour alone ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- The level's words have 4.5:1 on its official colour in light and dark, tested in \`theme-contrast.test.ts\` ([1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum))
- The link out names where it goes and is marked as leaving the site ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context))
- The whole card is the link's target: a tap anywhere on the warning opens it in full, and the focus ring is drawn around the card. The link stays the one link in the card, with its own name («Hele varselet hos MET») ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum))
- The most serious comes first, in the reading order too ([1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence))

**You check**

- The title is the authority's name for the danger, the time in words the reader knows («i dag 12:00»)
- The source is credited as it asks (\`footer\`), and its full warning is linked

### Content

The authority's own words for what is coming; the area and the time on one muted line; at most two sentences of what it means. \`compact\` for a digest.

### Related

\`Banner\`, \`List\`, \`StatusLine\`` } } },
} satisfies Meta<typeof HazardList>
export default meta
type Story = StoryObj<typeof meta>

/** A yellow and an orange warning, the most serious first, with what they mean and the credit. */
export const Default: Story = {}
/** For a digest: the level, what, where and when, and the link; no description. */
export const Compact: Story = { args: { compact: true } }
/** Each level once. */
export const Levels: Story = {
  args: {
    footer: undefined,
    hazards: [
      { key: "y", level: "yellow", title: "Kraftige vindkast", area: "Vestland", source: "MET", href: "https://www.yr.no/nb/farevarsler", icon: "wind" },
      { key: "o", level: "orange", title: "Flomfare", area: "Innlandet", source: "Varsom", href: "https://www.varsom.no/", icon: "rain" },
      { key: "r", level: "red", title: "Ekstremvær «Ingunn»", area: "Trøndelag", source: "MET", href: "https://www.yr.no/nb/farevarsler", icon: "wind" },
    ],
  },
}
