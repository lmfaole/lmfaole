import type { Meta, StoryObj } from "@storybook/react-vite"

import { expect, userEvent, within } from "storybook/test"

import { ChapterList } from "../../../src/components/chapter-list"
import { player } from "../../../src/components/podcast-player"
import { episode } from "../../sample"

const sample = episode()

const meta = {
  title: "Components/Media/ChapterList",
  component: ChapterList,
  tags: ["autodocs"],
  args: { chapters: sample.chapters, episode: sample },
  loaders: [
    () => {
      player.close()
      return {}
    },
  ],
  parameters: { docs: { description: { component: `### Use it when

an episode has chapters (Podcasting 2.0 JSON chapters, Podlove Simple Chapters) and the reader may go to one: on the episode's page, and in \`PodcastPlayer\`, which opens it over the page. Each chapter has the time it starts; a tap goes there and plays, and starts the episode first when it is not the one in the player. The chapter playing is marked «spilles nå». A chapter's own link (\`href\`) stands beside it and opens in a new tab, so the episode plays on.

### Do not use it when

the list is of episodes (use \`List\` with a \`PlayButton\` as each row\'s \`action\`), or the times are not in an episode (use \`Timeline\`).

### Accessibility

**Handled by the component**

- A numbered list (\`<ol>\`) of native buttons; each says its time in words («10 min») before its title, and the clock time is hidden from a screen reader so it is not read twice.
- The chapter playing has \`aria-current\` and the words «spilles nå», not its ground alone ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
- A chapter's link says it opens in a new tab; every target is 2.75rem tall ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

**You check**

- The chapters are in the order they play, and their titles are the feed's own.

### Content

The chapter's start («10:00») and its title.

### Related

\`PodcastPlayer\`, \`PlayButton\`, \`Timeline\`` } } },
} satisfies Meta<typeof ChapterList>
export default meta
type Story = StoryObj<typeof meta>

/** An episode's chapters on its page, before it is played. */
export const Default: Story = {}

/** The episode is in the player, in its third chapter: that chapter is marked «spilles nå». */
export const Playing: Story = {
  loaders: [
    () => {
      player.load(sample, 725)
      return {}
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { current: true })).toHaveTextContent("Intervjuet")
  },
}

/** A tap on a chapter puts the episode in the player at its start. */
export const Tapped: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /Ukas nyheter/ }))
    await expect(player.getState().position).toBe(180)
    await expect(canvas.getByRole("button", { current: true })).toHaveTextContent("Ukas nyheter")
  },
}
