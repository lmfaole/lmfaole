import type { Meta, StoryObj } from "@storybook/react-vite"

import { MediaGallery, type MediaItem } from "../../../src/components/media-gallery"
import { screenshot } from "../../sample"

const shots = (count: number): MediaItem[] =>
  Array.from({ length: count }, (_, index) => ({ kind: "picture", key: `s${index}`, src: screenshot(20 + index * 37, String(index + 1)), label: `Skjermbilde ${index + 1} av Warhammer 40,000: Rogue Trader` }))

const trailer: MediaItem = { kind: "video", key: "t1", src: "trailer.mp4", poster: screenshot(250, "T"), label: "Lanseringstrailer – Void Shadows-utvidelsen" }

const meta = {
  title: "Components/Media/MediaGallery",
  component: MediaGallery,
  tags: ["autodocs"],
  args: { items: [trailer, ...shots(11)] },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
  parameters: { docs: { description: { component: `### Use it when

a set of pictures and videos of one thing, to be looked through: a game's screenshots and trailers (Steam's \`screenshots\` and \`movies\`), in a \`PageSection\` «Bilder og videoer» on the game's page.

The thumbnails are 16:9, two across in a narrow column and three from 40rem of room, the first six and a «Se alle 24» button for the rest. A tap opens one large in a dialog with «Forrige» and «Neste», the arrow keys and «3 av 24»; Esc, «Lukk» or a tap outside closes it. A video shows its still until it is played with the browser's own controls.

### Do not use it when

one picture to see larger (\`ImageLightbox\`); pictures that are the content of the page, each its own thing with a name and a link (\`Tiles\`); a picture of the thing itself (\`Picture\`, \`DetailHeader\`).

### Accessibility

**Handled by the component**

- Each thumbnail is a real \`button\` named by what it shows: «Vis bilde: …», «Spill av video: …» ([4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)).
- It opens a modal \`dialog\`: focus moves in, the page behind is inert, and Esc closes it ([2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap)).
- «Forrige» and «Neste» are buttons, and the arrow keys do the same, except in a video's own controls, where they seek ([2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard)).
- «3 av 24» and the item's words are a polite live region, so a screen reader hears where it is after a step ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)).
- A large picture's \`alt\` is its \`label\`; a video is named by it ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)).
- A video never plays by itself, loads nothing before it is played (\`preload="none"\`), and stops when the dialog closes or moves on ([1.4.2 Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control), [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)).
- Nothing slides or fades, so there is nothing to turn off under \`prefers-reduced-motion\`.

**You check**

- \`label\` says what each item shows («Kamp mot Drukhari-skipet i Void Shadows»); Steam gives screenshots no words, so the game's name and a number is the least.
- A video's \`src\` is a format the browser plays (Steam's \`mp4.max\` or \`webm.max\`), and its \`poster\` is its still (\`thumbnail\`).

### Content

Trailers first, then the screenshots, in the store's order. No caption under the thumbnails: the section's title says what they are.

### Related

\`ImageLightbox\`, \`Tiles\`, \`Overlay\`, \`PageSection\`, «Patterns / Pages and navigation»` } } },
} satisfies Meta<typeof MediaGallery>
export default meta
type Story = StoryObj<typeof meta>

/** A trailer and eleven screenshots: the first six, and «Se alle 12». */
export const Default: Story = {}

/** As few as there are: no «Se alle». */
export const Few: Story = { args: { items: shots(3) } }

/** On a phone: two across. */
export const OnPhone: Story = { decorators: [(Story) => <div className="max-w-[22rem]">{Story()}</div>] }
