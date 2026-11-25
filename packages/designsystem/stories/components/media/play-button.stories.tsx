import type { Meta, StoryObj } from "@storybook/react-vite"

import { expect, userEvent, within } from "storybook/test"

import { Stack } from "../../../src/components/layout"
import { PlayButton } from "../../../src/components/play-button"
import { player } from "../../../src/components/podcast-player"
import { episode } from "../../sample"

const meta = {
  title: "Components/Media/PlayButton",
  component: PlayButton,
  tags: ["autodocs"],
  args: { episode: episode() },
  loaders: [
    () => {
      player.close()
      return {}
    },
  ],
  parameters: { docs: { description: { component: `### Use it when

an episode can be played from where it is shown: on its page, in a row of a list. It says what a press does: «Spill av» from the start, «Fortsett» where the reader left off (\`position\`, saved by the app from \`PodcastPlayer\`'s \`onProgress\`, with what is left in words, «23 min igjen», and a thin bar of how far they came), and «Pause» while it is the one playing. It follows the player: every \`PlayButton\` of an episode changes when it starts or stops, wherever it was pressed.

It needs the app's one \`PodcastPlayer\` (in the root layout) to be heard; pressed before the player is there, the episode starts when it comes.

### Do not use it when

the player's own controls are meant (they are in \`PodcastPlayer\`), or for a chapter: use \`ChapterList\`.

### Accessibility

**Handled by the component**

- A native button, whose name has the episode's title after the visible word («Spill av: Episode 42»), so a list of them can be told apart, and the visible word first ([2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name)).
- While the episode waits for data, the button is busy (\`aria-busy\`).
- What is left is in words; the bar is decoration beside them ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
- A large button (2.25rem tall), above the 1.5rem the rule asks ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

**You check**

- \`position\` is the reader's own, saved from \`onProgress\`; leave it out for an episode not begun.

### Content

«Spill av», «Fortsett», «Pause»; what is left («23 min igjen») or the length («1 t 2 min»).

### Related

\`PodcastPlayer\`, \`ChapterList\`, \`Button\`` } } },
} satisfies Meta<typeof PlayButton>
export default meta
type Story = StoryObj<typeof meta>

/** An episode not begun: «Spill av», and its length. */
export const Default: Story = {}

/** Where the reader left off: «Fortsett», what is left in words, and how far they came. */
export const Resume: Story = { args: { position: 2325 } }

/** A list of episodes: each button names its own episode for a screen reader. */
export const InAList: Story = {
  render: () => (
    <Stack gap="tight">
      <PlayButton episode={episode()} position={2325} />
      <PlayButton episode={episode({ id: "ep-41", title: "Episode 41: Broene", duration: 2580 })} />
      <PlayButton episode={episode({ id: "ep-40", title: "Episode 40: Trikken", duration: 1990 })} position={1990} />
    </Stack>
  ),
}

/** A press puts the episode in the player (here without a `PodcastPlayer`, so it waits for one, and starts when it comes). */
export const Pressed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /Spill av.*Episode 42/ }))
    await expect(player.getState().episode?.id).toBe("ep-42")
  },
}
