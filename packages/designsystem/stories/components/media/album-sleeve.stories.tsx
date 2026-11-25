import type { Meta, StoryObj } from "@storybook/react-vite"

import { AlbumSleeve } from "../../../src/components/album-sleeve"
import { albumCover, boxArt, poster } from "../../sample"

const meta = {
  title: "Components/Media/AlbumSleeve",
  component: AlbumSleeve,
  tags: ["autodocs"],
  args: { src: albumCover("#1a0b2e", "#5b1a8f", "#e0245e", "#f5c542") },
  parameters: { docs: { description: { component: `### Use it when

the main picture of the page of an album: its cover whole on a slab of plastic, with a record pulled half out of it, that tilts toward the page's light (move the pointer over the page; on a phone, tilt it) and catches it. \`DetailHeader\` takes it with \`sleeve\`.

With \`kind="dvd"\` it is the main picture of the page of a film instead: the poster under the clear sleeve of a black DVD case, and a silver disc half out of it whose tracks split the light into a spectrum. \`DetailHeader\` draws it for \`sleeve\` with \`ratio="poster"\`.

With \`kind="cd"\` it is an album whose edition is a CD: the cover under the clear, glossy lid of a jewel case (142 × 125 mm, the booklet 120 mm square right of the hinge's ridges), and a CD half out of it. A CD's tracks are twice as far apart as a DVD's, so its rainbows are more and narrower. \`DetailHeader\` draws it for \`sleeve\` with \`disc="cd"\`.

With \`kind="cartridge"\` it is a handheld game (one played most on a Steam Deck, say): the box picture (2:3) under the clear sleeve of a slim black case, and a game card half out of it, dark plastic with a ridged grip and the picture again on its glossy label. \`DetailHeader\` draws it for \`sleeve\` with \`ratio="poster"\` and \`disc="cartridge"\`.

The old consoles' games have their own cases. \`nes\`, \`snes\`, \`n64\`, \`gameboy\` and \`gba\` are the box picture printed on a cardboard box, its edges and corners rubbed pale, with that console's cartridge half out of it: the NES's tall grey one with ridges at the bottom, the Super Nintendo's pale one with round shoulders and grooves, the Nintendo 64's dark, wide one with its shoulders cut, the Game Boy's grey one with its corner cut, and the Game Boy Advance's dark, wide one. \`genesis\` is a black clamshell with the Mega Drive's black cartridge, and \`psx\` a jewel case with the first PlayStation's black disc (its picture square, as the booklet's). Each cartridge has the box picture on its label, cropped to the label's shape. A picture of another shape than the case's face is cropped about its middle, as a cover is. \`DetailHeader\` draws them for \`sleeve\` with \`ratio="poster"\` and \`disc\` set to the kind.

Every case has depth: rounded or folded edges that catch the light, a print raised off the card, a printed back (lines of text and a barcode) and a record, disc or cartridge with a rim of its own. Dragged sideways with a mouse, a pen or a finger it spins round, 360 degrees, coasts and settles face on again; dragged up and down it tips a little (a finger dragged up and down still scrolls the page).

It is the cover with something added (a record, a gleam of plastic), so it is for covers the app may alter (Last.fm's, its own), **never for Spotify's**, whose terms forbid overlays and crops. Where WebGL is not there, before it is ready and under \`prefers-reduced-motion\` it is the cover alone as a sharp square (\`Picture\`), in the same place; an old console's box picture is in its box's own shape there too. It is drawn when the light changes and at no other time: nothing loops.

### Do not use it when

the page is not of an album or a film (an artist, a person), or the cover is Spotify's, or a row's thumbnail.

### Accessibility

**Handled by the component**

- Decoration: hidden from assistive technology; the album's name and artist are in the page's head beside it ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)).
- Nothing moves by itself: it tilts only with the pointer or the phone and spins only when dragged, and not at all under \`prefers-reduced-motion\` ([2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide), [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)).
- The gleam is a soft highlight that moves at the pace of a hand: nothing flashes ([2.3.1 Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold)).
- The spin is a decoration a pointer may play with, not a function: nothing is reached only by dragging, so it needs no single-pointer alternative ([2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)). A drag on a spinning record does not count as a click that stops it.
- A page has a few WebGL surfaces at most; with none to spare it is the CSS cover ([«Light and shadow»](?path=/docs/foundations-light-and-shadow--docs)).

**You check**

- The cover is Last.fm's or the app's own, never Spotify's.
- The cover may be read by WebGL only where its host allows it (CORS).

### Content

None: it draws a picture.

### Related

\`DetailHeader\` (\`sleeve\`), \`Picture\`, \`AmbientBackdrop\`, «Foundations / Light and shadow»` } }, },
} satisfies Meta<typeof AlbumSleeve>
export default meta
type Story = StoryObj<typeof meta>

/** A sleeve in 3D with a record half out: move the pointer over the page and it tilts toward the light, and the plastic's gleam moves across the cover. */
export const Default: Story = {}
/** A light cover: the gleam is plastic, not the cover, so it shows on pale art too. */
export const LightCover: Story = { args: { src: albumCover("#f6efe6", "#e9d3bd", "#d6b9a0", "#ffffff") } }
/** A film's poster in a DVD case (`kind="dvd"`), the disc half out: tilt it and the spectrum runs across the disc. */
export const Dvd: Story = { args: { kind: "dvd", src: poster(150, "H"), size: "feature" }, decorators: [(Story) => <div className="max-w-md">{Story()}</div>] }
/** An album's CD in its jewel case (`kind="cd"`), the disc half out: the lid's hard gloss moves over the cover, and the CD's rainbows come in more orders than the DVD's. */
export const Cd: Story = { args: { kind: "cd", size: "feature" }, decorators: [(Story) => <div className="max-w-xl">{Story()}</div>] }
/** A handheld game's case (`kind="cartridge"`), the game card half out with the box picture on its label: tilt it and the label's gloss moves. */
export const Cartridge: Story = { args: { kind: "cartridge", src: poster(150, "H"), size: "feature" }, decorators: [(Story) => <div className="max-w-sm">{Story()}</div>] }
/** A NES game (`kind="nes"`): the box picture printed on a worn cardboard box, and the tall grey cartridge half out with the picture on its label. */
export const Nes: Story = { args: { kind: "nes", src: boxArt(200, 280, 10, "N"), size: "feature" }, decorators: [(Story) => <div className="max-w-md">{Story()}</div>] }
/** A Super Nintendo game (`kind="snes"`): the pale grey cartridge with round shoulders and grooves down its sides. */
export const Snes: Story = { args: { kind: "snes", src: boxArt(276, 200, 220, "S"), size: "feature" }, decorators: [(Story) => <div className="max-w-md">{Story()}</div>] }
/** A Nintendo 64 game (`kind="n64"`): the dark, wide cartridge with its shoulders cut. */
export const N64: Story = { args: { kind: "n64", src: boxArt(276, 200, 120, "6"), size: "feature" }, decorators: [(Story) => <div className="max-w-md">{Story()}</div>] }
/** A Game Boy game (`kind="gameboy"`): the small grey cartridge with its corner cut and ridges along its top. */
export const GameBoy: Story = { args: { kind: "gameboy", src: boxArt(184, 200, 90, "G"), size: "feature" }, decorators: [(Story) => <div className="max-w-md">{Story()}</div>] }
/** A Game Boy Advance game (`kind="gba"`): the dark, wide cartridge with a round top. */
export const Gba: Story = { args: { kind: "gba", src: boxArt(200, 200, 270, "A"), size: "feature" }, decorators: [(Story) => <div className="max-w-md">{Story()}</div>] }
/** A Mega Drive game (`kind="genesis"`): a black clamshell, and the black cartridge with its shoulders cut and a ridged grip. */
export const Genesis: Story = { args: { kind: "genesis", src: poster(200, "M"), size: "feature" }, decorators: [(Story) => <div className="max-w-md">{Story()}</div>] }
/** A PlayStation game (`kind="psx"`): a jewel case, and the black disc half out with faint rainbows in it. */
export const Psx: Story = { args: { kind: "psx", src: poster(0, "P"), size: "feature" }, decorators: [(Story) => <div className="max-w-xl">{Story()}</div>] }
