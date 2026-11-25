import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tiles } from "../../../src/components/tiles"
import { poster, square } from "../../sample"

const meta = {
  title: "Components/Lists/Tiles",
  component: Tiles,
  tags: ["autodocs"],
  args: { kind: "film", tiles: Array.from({ length: 10 }, (_, i) => ({ key: String(i), href: i === 3 ? null : `#item-${i}`, title: `Tittel ${i + 1}`, picture: { src: poster(i * 36, String(i + 1)) }, meta: ["Regissør", "★ 4"] })) },
  parameters: { docs: { description: { component: `### Use it when

the picture IS the content: the cast of a film (\`kind="person"\`), the albums of an artist (\`kind="album"\`). \`kind\` gives every picture its shape; give \`picture.sources\` its widths, as for \`Picture\`.

### Do not use it when

a list of things to open, with a name and a line under it (\`List\`): most lists are that.

### Accessibility

**Handled by the component**

- A list of tiles ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).
- Each tile is one link around picture and words; the picture is hidden, so the link's name is its title and its \`meta\` lines ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context)).
- A tile without \`href\` is plain text, not a link that goes nowhere ([4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)).
- The tiles are read in DOM order, row by row ([1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)).
- Three across on a phone and as many as fit above, so nothing scrolls sideways at 320 px ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).
- The whole tile is the target, well over 24 px ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

**You check**

- \`title\` names the thing, and the \`meta\` lines stay short: a screen reader hears all of them as the link ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context)).
- The title is cut after two lines: keep the whole of it on the page the tile links to.
- The tile has no focus style of its own: check the browser's outline shows around it ([2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)).

### Content

The name and a line under it.

### Related

\`List\`, \`Grid\`, \`Picture\`` } }, },
} satisfies Meta<typeof Tiles>
export default meta
type Story = StoryObj<typeof meta>

/** Posters with a description and a line each; the fourth tile has no address, so it is not a link. */
export const Default: Story = {}
/** `kind="person"`: round portraits, the cast of a film with each role under the name. */
export const Cast: Story = { args: { kind: "person", tiles: Array.from({ length: 6 }, (_, i) => ({ key: String(i), href: `#person-${i}`, title: `Skuespiller ${i + 1}`, picture: { src: square(i * 50, String(i + 1)) }, meta: ["Rolle"] })) } }
/** An artist's albums by when they came out, oldest first: sharp covers (`kind="album"`), the year and the plays under the title; the last has no cover yet, and its frame stays. */
export const Albums: Story = {
  args: {
    kind: "album",
    tiles: [
      ["Melody A.M.", 2001, "12 340 avspillinger"],
      ["The Understanding", 2005, "8 112 avspillinger"],
      ["Junior", 2009, "5 020 avspillinger"],
      ["Senior", 2010, null],
      ["The Inevitable End", 2014, "1 204 avspillinger"],
      ["Profound Mysteries", 2022, null],
    ].map(([title, year, plays], i) => ({ key: String(i), href: i === 3 ? null : `#album-${i}`, title: String(title), picture: { src: i === 5 ? null : square(i * 50, String(i + 1)) }, meta: [String(year), plays === null ? null : String(plays)] })),
  },
}
