import type { Meta, StoryObj } from "@storybook/react-vite"

import { PictureFrame } from "../../../src/components/internal/picture-frame"
import { Picture } from "../../../src/components/picture"
import { poster, square, wide } from "../../sample"

const meta = {
  title: "Components/Media/Picture",
  component: Picture,
  tags: ["autodocs"],
  args: { src: poster(10, "A"), kind: "film" },
  parameters: { docs: { description: { component: `### Use it when

one thing's picture in a frame of its own, in front of a row (\`context="row"\`, the default), at the head of its page (\`hero\`) or as a tile of a gallery (\`tile\`). Most pictures are drawn by the component that holds them (\`List\`, \`Tiles\`, \`DetailHeader\`), which take the same \`kind\`.

**The app says what the thing is (\`kind\`); the shape follows** (\`lib/picture-kinds\`), the same in every app: a circle for an \`artist\` or a \`person\`, a sharp square for an \`album\`, soft corners for a \`track\`, a tall frame for a \`film\` or a \`show\`, Steam's wide header for a \`game\` in a list (its box on its own page), and a square with the ordinary corners for a \`podcast\`, an \`episode\` or a \`place\`. There is no ratio or corners to choose.

### Do not use it when

decoration, or a picture that carries information (give that its own text).

### Accessibility

**Handled by the component**

- Decorative: the frame is hidden and the \`img\` has \`alt=""\` ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))

**You check**

- The thing's name is written next to it ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- A picture that carries information is not a \`Picture\`: give it its own text alternative ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))

### Related

\`Tiles\`, \`DetailHeader\`, \`Person\`, \`ImageLightbox\`` } }, },
} satisfies Meta<typeof Picture>
export default meta
type Story = StoryObj<typeof meta>

/** A film: the 2:3 frame at row size. */
export const Film: Story = {}
/** An album: a sharp square, a record's cover. */
export const Album: Story = { args: { kind: "album", src: square(100) } }
/** A track: a square with soft corners. */
export const Track: Story = { args: { kind: "track", src: square(100) } }
/** An artist or a person: a circle, with the top of the picture kept (a portrait's face is there). */
export const Artist: Story = { args: { kind: "artist", src: poster(40, "P") } }
/** A game in a list: Steam's wide header. */
export const Game: Story = { args: { kind: "game", src: wide(140, "G") } }
/** A podcast: a square with the ordinary corners. */
export const Podcast: Story = { args: { kind: "podcast", src: square(160) } }
/** The head of the thing's own page: the page's main picture, and the one thing a page lights. Its frame throws a shadow away from the light and has a rim of light towards it, both outside the picture (move the pointer over the page); nothing is painted over the picture. */
export const Hero: Story = { args: { context: "hero" } }
/** As wide as its cell, for a gallery tile. */
export const Tile: Story = { args: { context: "tile" }, decorators: [(Story) => <div className="w-40"><Story /></div>] }
/** Every kind side by side, in a row: one shape each. */
export const Kinds: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["album", "track", "artist", "person", "film", "show", "game", "podcast", "episode", "place"] as const).map((kind, index) => (
        <Picture key={kind} kind={kind} src={kind === "game" ? wide(index * 30, "G") : kind === "film" || kind === "show" ? poster(index * 30, kind[0]) : square(index * 30)} />
      ))}
    </div>
  ),
}
/** No picture: the frame stays, so rows stay level. */
export const NoPicture: Story = { args: { src: null } }

/** The same picture in three widths: the browser takes the smallest that is sharp at the size it is drawn (`srcset`, `sizes`), not the largest. */
export const WithSources: Story = {
  args: { src: null, sources: [{ src: poster(10, "S"), width: 92 }, { src: poster(40, "M"), width: 185 }, { src: poster(70, "L"), width: 342 }] },
}

/** The picture that leads a detail page: fetched at once and first (`priority`), the only one on the page. */
export const Priority: Story = { args: { context: "hero", priority: true } }

const cover = (stops: [string, string, string], dark: string): string =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${stops[0]}"/><stop offset=".55" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[2]}"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><circle cx="130" cy="70" r="38" fill="${dark}"/></svg>`)}`

/** A record playing now (drawn by \`NowPlayingCard\` and the list's live row, not by an app): round with a hole in the middle. The same light on four covers: the cover shapes the reflections (its hue where the spectrum starts and how much of its colour is in it, how vivid it is how tight the bands are, how light it is how much it shines), so no two discs shine alike. */
export const DiscCovers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <PictureFrame ratio="square" size="hero" disc src={cover(["#1a0b2e", "#5b1a8f", "#e0245e"], "#f5c542")} />
      <PictureFrame ratio="square" size="hero" disc src={cover(["#f6efe6", "#f3e1d0", "#ecd5c2"], "#ffffff")} />
      <PictureFrame ratio="square" size="hero" disc src={cover(["#0b1d2a", "#10425c", "#1bb5a8"], "#d9f2ee")} />
      <PictureFrame ratio="square" size="hero" disc src={cover(["#3a3a3a", "#8a8a8a", "#cfcfcf"], "#222222")} />
    </div>
  ),
}
