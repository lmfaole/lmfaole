import type { Decorator, Meta, StoryObj } from "@storybook/react-vite"

import { AppMark, Wordmark } from "../../../src/components/wordmark"
import { BRAND_HUES, type BrandHue } from "../../../src/lib/brand"

/** The app's `<html data-brand>`, on a wrapper in a story. */
const brand = (hue: BrandHue): Decorator => (Story) => (
  <div data-brand={hue}>
    <Story />
  </div>
)

const meta = {
  title: "Components/Media/Wordmark",
  component: Wordmark,
  tags: ["autodocs"],
  args: { name: "Medier", glyph: "play", family: "lmfaole", size: "md" },
  parameters: { docs: { description: { component: `### Use it when

the app says its own name: at the top of the \`NavBar\` rail (\`glyph\` and \`family\` on \`NavBar\` draw it), in the first-run introduction (\`FirstRun\` \`glyph\`), on a page about the app. It is the app's glyph on a rounded tile in the app's brand colour (\`AppMark\`), then its name in the reading font, then, quieter, the family that vouches for it: «Medier · lmfaole». The tile is the same drawing as the app's icon on a home screen and in a tab (\`npx designsystem-app-icons\`), so the app is known by one mark everywhere.

The colour comes from \`data-brand\` on the page's \`<html>\` (guide «Brand»); without one the tile is the ink, and the mark still works. In a signature moment, \`AppMark reveal\` plays the mark's gesture once on the brand's motion tokens: Medier's play mark beats twice, Start's sun rises. \`AppMark loading\` beats after a second's wait, then rests (guide «Motion», «Brand motion»).

### Do not use it when

it is another maker's mark (\`Logo\`, \`BrandIcon\`), a heading of a page (\`PageHeader\`), a link home on its own (the \`NavBar\`'s first place is that), or as decoration repeated in the content: the mark is said once, in the chrome.

### Accessibility

**Handled by the component**

- The tile is decoration, hidden from assistive technology; the name is text, read as it is written ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)).
- The dot between the name and the family is hidden, and a space stands in for it: «Medier lmfaole».
- The tile in each hue has 4.5:1 on the page and the card, and its glyph 4.5:1 on it, in light and dark (\`theme-contrast.test.ts\`; [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)).
- The name is the ink, never the brand colour: it is read, and the colour is not needed to read it.
- \`reveal\` and \`loading\` play once, within a second, and not at all under \`prefers-reduced-motion\` ([2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)).

**You check**

- The name is the app's name as it is said, the same as its \`<title>\` and its manifest's \`name\`.

### Content

The app's name, one or two words, and the family's name in lower case as it is written (\`lmfaole\`). No slogan.

### Related

\`AppMark\`, \`NavBar\` (\`glyph\`, \`family\`), \`FirstRun\` (\`glyph\`), \`Logo\`, guide «Brand»` } } },
} satisfies Meta<typeof Wordmark>
export default meta
type Story = StoryObj<typeof meta>

/** Medier, in violet, with the family after it: the app leads, the family vouches. */
export const Default: Story = { decorators: [brand("violet")] }

/** Start's mark: the sunrise, in teal. */
export const Start: Story = { args: { name: "Startside", glyph: "sunrise" }, decorators: [brand("teal")] }

/** The three sizes: `sm` in the `NavBar` and `FirstRun`, `md` in a page, `lg` on a page about the app. */
export const Sizes: Story = {
  decorators: [brand("violet")],
  render: (args) => (
    <div className="grid justify-items-start gap-4">
      <Wordmark {...args} size="sm" />
      <Wordmark {...args} size="md" />
      <Wordmark {...args} size="lg" />
    </div>
  ),
}


/** No brand on the page: the tile is the ink, so a mark works before an app has chosen its hue. */
export const Unbranded: Story = {}

/** The mark alone (`AppMark`) in each hue the family offers, on the card: one tile, one glyph, one hue per app. */
export const EveryHue: Story = {
  render: () => (
    <div className="bg-card flex flex-wrap gap-4 rounded-lg border p-4">
      {BRAND_HUES.map((hue) => (
        <div key={hue} data-brand={hue} className="grid justify-items-center gap-1.5 text-xs">
          <AppMark glyph="play" size="lg" />
          <code className="font-mono">{hue}</code>
        </div>
      ))}
    </div>
  ),
}

/**
 * `reveal`: the mark's gesture, once, as it appears, on the brand's motion tokens (guide «Motion», «Brand motion»). Medier (`amber`): the play mark
 * beats twice on the light spring, the second beat smaller. Start (`teal`): the sun rises over its horizon and settles, no overshoot. A mark of
 * another glyph rises into place. Only in a signature moment: the first run, the end of it, an app's first empty page.
 */
export const Reveal: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <div data-brand="amber" className="grid justify-items-center gap-1.5 text-xs">
        <AppMark glyph="play" size="lg" reveal />
        <code className="font-mono">amber · play</code>
      </div>
      <div data-brand="teal" className="grid justify-items-center gap-1.5 text-xs">
        <AppMark glyph="sunrise" size="lg" reveal />
        <code className="font-mono">teal · sunrise</code>
      </div>
    </div>
  ),
}

/**
 * `loading`: a wait of more than a second for the app itself (the first sync, a sign-in): after a second the glyph beats as the brand beats, then
 * rests. Never a loop: the words beside it say what is waited for, and a list or a section waits with a `Skeleton`.
 */
export const Loading: Story = {
  render: () => (
    <p data-brand="amber" className="flex items-center gap-3 text-sm" role="status">
      <AppMark glyph="play" size="md" loading />
      Henter det du har spilt …
    </p>
  ),
}
