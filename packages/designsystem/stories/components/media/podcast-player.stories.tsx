import type { Meta, StoryObj } from "@storybook/react-vite"

import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Stack } from "../../../src/components/layout"
import { NavBar } from "../../../src/components/nav-bar"
import { PageLayout } from "../../../src/components/page-layout"
import { player, PodcastPlayer } from "../../../src/components/podcast-player"
import { PlayButton } from "../../../src/components/play-button"
import { Heading, Text } from "../../../src/components/text"
import { RATE_KEY } from "../../../src/lib/podcast-player"
import { episode } from "../../sample"

const NAV = [
  { key: "home", href: "#", label: "Hjem", icon: "home", current: false },
  { key: "podcasts", href: "#", label: "Podkaster", icon: "podcast", current: true },
  { key: "search", href: "#", label: "Søk", icon: "search", current: false },
] as const

const meta = {
  title: "Components/Media/PodcastPlayer",
  component: PodcastPlayer,
  tags: ["autodocs"],
  // Each story starts with an empty player at normal speed (the store is one for the page, and the speed is kept in the browser).
  loaders: [
    () => {
      player.close()
      localStorage.removeItem(RATE_KEY)
      player.setRate(1)
      return {}
    },
  ],
  render: (args) => (
    <div className="min-h-dvh p-6">
      <Stack gap="tight">
        <Heading level={1}>Byvandring</Heading>
        <Text>The page goes on under the player; the player stays at the foot while the reader moves between pages.</Text>
      </Stack>
      <PodcastPlayer {...args} />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
    // In the docs, each story in a frame of its own: the player docks at the foot of its window, and one page has one player.
    docs: {
      story: { inline: false, iframeHeight: 320 },
      description: { component: `### Use it when

an app plays podcasts: put \`PodcastPlayer\` once in the root layout, so it plays on while the reader moves between pages. It draws nothing until an episode is played, from a \`PlayButton\`, a \`ChapterList\` or the app's own code (\`player.play(episode, at)\` from \`lib/podcast-player\`). Then it docks at the foot of the screen: above the \`NavBar\`'s bar on a phone, beside its rail from tablet width, and the page leaves room under it (\`--player-room\`, which \`PageLayout\` reads).

The bar is a media app's bar, and no more: the artwork, the title (cut at two lines) and, under it, the show or the chapter playing (cut at one line), play and pause (and +30 s where there is room), and a thin line along its top of how far it has come. A tap on it anywhere else opens **«Spilles nå»** (\`NowPlaying\`, also exported), the player in full: over the whole screen on a phone, a large sheet in the middle of a wide one. It has a button that closes it (a chevron down) and the show; the artwork, large and lit, on a ground of its own colours (where the picture's host allows it to be read, CORS; otherwise a plain tint); the title (a link to the episode's page with \`href\`) and the chapter playing; a scrubber with the time gone and the time left; −15 s, play and pause, +30 s, and with chapters the previous and next chapter; the speed (0,8× to 2×, kept in this browser); and the chapters, under the player on a phone and beside it on a wide screen. Esc, the «Lukk» button, a drag down on a phone, a tap outside the sheet, Android's back button and a change of page close it. The lock screen, a watch and a headset's buttons work through Media Session: play, pause, back, forward, a seek, and «previous» and «next» as chapters.

\`onProgress(episode, position, duration)\` is how the app saves where the reader is («Fortsett å lytte»): every \`progressEvery\` seconds (15) while it plays, when it pauses or ends (at the end, with the position at the length), when another episode takes over, and when the page is hidden or left. Read the state anywhere with \`usePlayer()\`. \`defaultOpen\` opens «Spilles nå» at once.

### Do not use it when

the sound is a short clip in the page (a word's pronunciation, a sample of a song): use the browser's own \`<audio controls>\` there. Never put two \`PodcastPlayer\`s in an app: there is one store, one \`<audio>\`.

### Accessibility

**Handled by the component**

- The bar is a landmark («Avspiller»). Its one big target is a real button, «Åpne avspilleren: » and the title and the line under it (\`aria-haspopup="dialog"\`); play and pause and +30 s are buttons of their own beside it. Nothing plays until the reader asks ([1.4.2 Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control)).
- «Spilles nå» is a native modal \`<dialog>\` named «Spilles nå» and the title: the page behind is inert and does not scroll, focus goes to play and pause (or «Prøv igjen») and back to the bar when it closes, and Esc closes it ([2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)). A drag down is never the only way: «Lukk» is a button ([2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)).
- Every control is a native button, range or select with a name in Norwegian: «Lukk», «15 sekunder tilbake», «Spill av» / «Pause», «30 sekunder fram», «Forrige kapittel», «Neste kapittel», «Tid», «Hastighet», and the chapter playing («Intervjuet, kapittel 3 av 5. Vis kapitlene»), which moves focus to it in the list.
- The scrubber says where it is in words («12 min 5 s av 1 t 2 min»), and its arrows go 15 s back and 30 s forward, Page Up and Page Down five minutes, Home and End to the ends; a drag seeks when it is let go ([4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)).
- No keys of the whole page are taken: Space plays and pauses only on the focused button.
- The chapter playing is marked in words, not by colour alone.
- Every target is at least 2.75rem, the play button in «Spilles nå» 4.5rem ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).
- The page leaves room under the bar, so nothing focused hides under it ([2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)).
- When the audio fails, an alert says so in words, the bar says «Kunne ikke spille av» under the title, and the play button becomes «Prøv igjen», which goes on from where it was. While it waits for data the button is busy (\`aria-busy\`) and turns a ring, still under reduced motion, and «Spilles nå» says «Henter lyden …» (a status).
- Under reduced motion «Spilles nå» appears and goes at once, and the artwork does not grow and shrink with play and pause. Play and pause give a light buzz where the phone can (\`data-haptic="selection"\`, with \`Haptics\` in the layout).

**You check**

- The episode's \`title\` and \`show\` are the feed's own, so the lock screen names them as the app does.
- \`onProgress\` saves quietly: it is called often, and must never stop the sound or move focus.

### Content

The episode's title, the show, and the chapter's title as the feed gives them. Times in minutes and seconds («12:05», the time left «−50:00»), and in words for a screen reader. The labels: «Spilles nå», «Lukk», «Kapitler», «Henter lyden …».

### Related

\`PlayButton\`, \`ChapterList\`, \`NowPlayingCard\` (what plays now, in a page), \`Overlay\` (the same \`<dialog>\` and motion), \`AmbientBackdrop\`, \`PageLayout\` (\`player\`), \`NavBar\`, \`Progress\`` },
    },
  },
} satisfies Meta<typeof PodcastPlayer>
export default meta
type Story = StoryObj<typeof meta>

/** An episode where the reader left off (12:05, in its third chapter), paused: the bar at the foot of the page, and a tap on it opens «Spilles nå»; «Lukk» gives focus back to the bar. */
export const Default: Story = {
  loaders: [
    () => {
      player.load(episode(), 725)
      return {}
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const region = await canvas.findByRole("region", { name: "Avspiller" })
    const bar = within(region)
    await expect(bar.queryByRole("slider")).toBeNull()
    await expect(bar.getByRole("button", { name: "Spill av" })).toBeVisible()
    const opener = bar.getByRole("button", { name: /^Åpne avspilleren: Episode 42: Lyden av byen/ })
    await expect(opener).toHaveTextContent("Intervjuet")
    await userEvent.click(opener)
    const dialog = await within(document.body).findByRole("dialog", { name: "Spilles nå Episode 42: Lyden av byen" })
    const full = within(dialog)
    await waitFor(() => expect(full.getByRole("button", { name: "Spill av" })).toHaveFocus())
    await expect(full.getByRole("slider", { name: "Tid" })).toHaveAttribute("aria-valuetext", "12 min 5 s av 1 t 2 min")
    await userEvent.click(full.getByRole("button", { name: "15 sekunder tilbake" }))
    await expect(full.getByRole("slider", { name: "Tid" })).toHaveAttribute("aria-valuetext", "11 min 50 s av 1 t 2 min")
    await userEvent.click(full.getByRole("button", { name: "30 sekunder fram" }))
    await expect(full.getByRole("slider", { name: "Tid" })).toHaveAttribute("aria-valuetext", "12 min 20 s av 1 t 2 min")
    await userEvent.click(full.getByRole("button", { name: "15 sekunder tilbake" }))
    await userEvent.click(full.getByRole("button", { name: "Lukk" }))
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"))
    await expect(opener).toHaveFocus()
  },
}

/** An episode without chapters: the show under the title in the bar. */
export const WithoutChapters: Story = {
  loaders: [
    () => {
      player.load(episode({ id: "ep-7", title: "Episode 7: Uten kapitler", chapters: [] }), 90)
      return {}
    },
  ],
}

/** A title and a show too long for the bar: the title is cut at two lines and the show at one, and the whole of them is in the button's name. No marquee (Patterns/Long titles). */
export const LongTitles: Story = {
  loaders: [
    () => {
      player.load(episode({ id: "ep-long", title: "Episode 118: Hvorfor bygger vi byer slik vi gjør, og hva skjer med gatene når bilene forsvinner fra sentrum?", show: "Byvandring med Kari Nordmann og gjester fra Byantikvaren i Oslo" }), 1500)
      return {}
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("button", { name: /^Åpne avspilleren: Episode 118: Hvorfor bygger vi byer/ })).toBeVisible()
  },
  globals: { viewport: { value: "compact", isRotated: false } },
}

/** «Spilles nå» open on a phone: the whole screen, the artwork large on its own colours, the chapter playing under the title, the scrubber, −15 s, play, +30 s and the chapters either side, the speed; the chapters follow under it. A tap on the chapter goes to the list, to the chapter playing. */
export const NowPlayingOpen: Story = {
  args: { defaultOpen: true },
  loaders: [
    () => {
      player.load(episode({ href: "#episode-42" }), 725)
      return {}
    },
  ],
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog", { name: /Episode 42/ })
    const full = within(dialog)
    await expect(full.getByRole("link", { name: "Episode 42: Lyden av byen" })).toHaveAttribute("href", "#episode-42")
    await expect(full.getByRole("button", { name: "Forrige kapittel" })).toBeEnabled()
    await expect(full.getByRole("combobox", { name: "Hastighet" })).toHaveValue("1")
    await userEvent.click(full.getByRole("button", { name: /^Intervjuet\W+kapittel 3 av 5/ }))
    const list = full.getByRole("region", { name: "Kapitler" })
    await waitFor(() => expect(within(list).getByRole("button", { current: true })).toHaveFocus())
    await expect(within(list).getByRole("button", { current: true })).toHaveTextContent("Intervjuet")
    await new Promise((done) => setTimeout(done, 600))
    for (const scroller of dialog.querySelectorAll("div")) scroller.scrollTop = 0
    full.getByRole("button", { name: "Spill av" }).focus()
  },
  globals: { viewport: { value: "compact", isRotated: false } },
}

/** «Spilles nå» on a wide screen: a large sheet in the middle, the player on one side and the chapters on the other. */
export const NowPlayingWide: Story = { ...NowPlayingOpen, play: undefined, globals: { viewport: { value: "large", isRotated: false } } }

/** «Spilles nå» for an episode without chapters: no chapter line, no previous or next, no list; a narrower sheet on a wide screen. */
export const NowPlayingWithoutChapters: Story = {
  args: { defaultOpen: true },
  loaders: [
    () => {
      player.load(episode({ id: "ep-7", title: "Episode 7: Uten kapitler", chapters: [] }), 90)
      return {}
    },
  ],
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog", { name: /Episode 7/ })
    await expect(within(dialog).queryByRole("button", { name: "Neste kapittel" })).toBeNull()
    await expect(within(dialog).queryByRole("region", { name: "Kapitler" })).toBeNull()
  },
  globals: { viewport: { value: "compact", isRotated: false } },
}

/** Waiting for data: the play button turns a ring and is busy (`aria-busy`), and the time line says «Henter lyden …». */
export const NowPlayingBuffering: Story = {
  args: { defaultOpen: true },
  loaders: [
    () => {
      player.load(episode(), 725)
      return {}
    },
  ],
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog", { name: /Episode 42/ })
    document.querySelector("audio")?.dispatchEvent(new Event("waiting"))
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Spill av" })).toHaveAttribute("aria-busy", "true"))
    await expect(within(dialog).getByRole("status")).toHaveTextContent("Henter lyden …")
  },
  globals: { viewport: { value: "compact", isRotated: false } },
}

/** Long words in «Spilles nå»: the title is whole, in balanced lines and a step smaller, the show at one line, and nothing runs out of the screen. In the dark theme. */
export const NowPlayingLongDark: Story = {
  args: { defaultOpen: true },
  loaders: LongTitles.loaders,
  play: async () => {
    await within(document.body).findByRole("dialog", { name: /Episode 118/ })
  },
  globals: { viewport: { value: "compact", isRotated: false }, theme: "dark" },
}

/** The audio could not be loaded: the bar says so under the title, an alert says it to a screen reader, and «Prøv igjen» is in the play button's place. */
export const Failed: Story = {
  loaders: [
    () => {
      player.load(episode({ id: "ep-broken", src: "data:audio/wav;base64,AAAA" }), 0)
      return {}
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Kunne ikke spille av episoden")
    await expect(canvas.getByRole("button", { name: /^Åpne avspilleren: .*Kunne ikke spille av/ })).toBeVisible()
    await expect(canvas.getByRole("button", { name: "Prøv igjen" })).toBeVisible()
  },
}

/** The audio could not be loaded, in «Spilles nå»: the alert in the scrubber's place, and «Prøv igjen» where play was, with focus on it. */
export const NowPlayingFailed: Story = {
  args: { defaultOpen: true },
  loaders: Failed.loaders,
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog", { name: /Episode 42/ })
    const full = within(dialog)
    await expect(await full.findByRole("alert")).toHaveTextContent("Kunne ikke spille av episoden")
    await waitFor(() => expect(full.getByRole("button", { name: "Prøv igjen" })).toHaveFocus())
  },
  globals: { viewport: { value: "compact", isRotated: false } },
}

/** Nothing played yet: the player draws nothing, and a `PlayButton` starts it. */
export const Empty: Story = {
  render: (args) => (
    <div className="min-h-dvh p-6">
      <Stack gap="tight">
        <Heading level={1}>Episode 42: Lyden av byen</Heading>
        <PlayButton episode={episode()} />
      </Stack>
      <PodcastPlayer {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole("region", { name: "Avspiller" })).toBeNull()
  },
}

/** In an app's frame on a phone: above the `NavBar`'s bar on a phone, beside its rail from tablet width, with `PageLayout` leaving room under it (`player`). */
export const InAppFrame: Story = {
  loaders: [
    () => {
      player.load(episode(), 725)
      return {}
    },
  ],
  render: (args) => (
    <div className="min-h-dvh">
      <PageLayout nav={<NavBar title="Podkast" items={NAV} />} player={<PodcastPlayer {...args} />}>
        <Stack gap="tight">
          <Heading level={1}>Byvandring</Heading>
          <Text>The page's last line stays above the player, and the player above the bar.</Text>
        </Stack>
      </PageLayout>
    </div>
  ),
  globals: { viewport: { value: "compact", isRotated: false } },
}

/** The same frame from tablet width: the player at the foot of the content column, beside the rail. */
export const InAppFrameWide: Story = { ...InAppFrame, globals: { viewport: { value: "expanded", isRotated: false } } }

/** `onProgress`: when another episode takes over, the one before is reported with where it was and its length (here shown in the page; an app saves it). */
export const SavesProgress: Story = {
  loaders: [
    () => {
      player.load(episode(), 725)
      return {}
    },
  ],
  render: function Render(args) {
    const [saved, setSaved] = useState("Ikke lagret ennå")
    return (
      <div className="min-h-dvh p-6">
        <Stack gap="tight">
          <PlayButton episode={episode({ id: "ep-41", title: "Episode 41: Broene", duration: 2580, chapters: [] })} />
          <output className="text-sm">{saved}</output>
        </Stack>
        <PodcastPlayer {...args} onProgress={(one, position, duration) => setSaved(`Lagret: ${one.title}, ${Math.round(position)} av ${Math.round(duration)} s`)} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole("button", { name: /Spill av.*Episode 41/ }))
    await waitFor(() => expect(canvas.getByText("Lagret: Episode 42: Lyden av byen, 725 av 3725 s")).toBeVisible())
  },
}
