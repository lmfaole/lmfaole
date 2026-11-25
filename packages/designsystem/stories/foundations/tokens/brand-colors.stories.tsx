import type { Meta, StoryObj } from "@storybook/react-vite"

import { AppMark } from "../../../src/components/wordmark"
import { BRAND_HUES, type BrandHue } from "../../../src/lib/brand"

const meta = { title: "Foundations/Tokens/Brand colours", tags: ["autodocs", "!manifest"], parameters: { docs: { description: { component: `An app's hue, set once with \`data-brand\` on its \`<html>\`: \`--brand\` (the mark, the current place's icon, the focus ring, the one primary button), \`--brand-foreground\` (what stands on it) and \`--brand-subtle\` (the surface of the current place). Each is \`light-dark()\`: deep with white on it in light, lighter with the ink on it in dark. \`--brand\` keeps 4.5:1 on the page and the card, its foreground 4.5:1 on it, and the subtle surface carries the text (4.5:1) and the brand (3:1); \`theme-contrast.test.ts\` checks every hue in both themes.

Without \`data-brand\` the three are the ink, its page and the muted surface: an app that has not chosen looks as it did.

**Use them** for the app's identity in the chrome, sparingly. **Do not** use them for a state (they are not success, a warning or a link), in a chart, on an event or a transit line, or for text in the content.

### Related

\`Wordmark\`, \`AppMark\`, \`NavBar\`, guide «Brand»` } } } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function Hue({ hue }: { hue?: BrandHue }) {
  return (
    <div data-brand={hue} className="bg-card grid w-44 gap-2 rounded-lg border p-3 text-xs">
      <div className="flex items-center gap-2">
        <AppMark glyph="play" size="md" />
        <code className="font-mono font-medium">{hue ?? "ingen"}</code>
      </div>
      <div className="bg-brand text-brand-foreground rounded-md px-2 py-1.5 font-medium">--brand</div>
      <div className="bg-brand-subtle flex items-center gap-1.5 rounded-md px-2 py-1.5">
        <span className="bg-brand size-2.5 rounded-full" aria-hidden="true" />
        --brand-subtle
      </div>
    </div>
  )
}

/** Every hue, and none: the mark, the brand with its foreground, and the subtle surface with the text and a dot of the brand on it. */
export const Hues: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Hue />
      {BRAND_HUES.map((hue) => (
        <Hue key={hue} hue={hue} />
      ))}
    </div>
  ),
}
