import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { expect, userEvent, within } from "storybook/test"

import { Transcript, type TranscriptCue } from "../../../src/components/transcript"

/** A made-up interview, timed, with two speakers taking turns; one line has a word with no place to break. */
const CUES: TranscriptCue[] = [
  { start: 0, end: 6, speaker: "Anne Lindmo", text: "Hei, og velkommen til Ekko. I dag skal vi snakke om strømprisen, og hvorfor den aldri ser ut til å gå ned." },
  { start: 6, end: 11, speaker: "Anne Lindmo", text: "Med meg i studio har jeg en som har fulgt kraftmarkedet i tjue år." },
  { start: 11, end: 19, speaker: "Per Sandvik", text: "Takk for at jeg fikk komme. Det korte svaret er at vi er koblet til resten av Europa, og der er strømmen dyr." },
  { start: 19, end: 27, speaker: "Per Sandvik", text: "Det lange svaret handler om magasiner, nedbør og kabler, og om Norgespris, som kom i høst." },
  { start: 27, end: 31, speaker: "Anne Lindmo", text: "Så hva betyr det for en vanlig husholdning?" },
  { start: 31, end: 42, speaker: "Per Sandvik", text: "At regningen i vinter blir lavere for de fleste. Men for de som har fastprisavtale, er det ikke sikkert at det lønner seg å bytte." },
  { start: 42, end: 48, speaker: "Anne Lindmo", text: "Vi får spørsmål om dette hver uke. Her er ett fra en lytter i Tromsø." },
  { start: 48, end: 56, speaker: "Lytter", text: "Kraftoverføringsnettutbyggingsfinansieringsordningen – hva er det, og hvorfor står den på regningen min?" },
  { start: 56, end: 66, speaker: "Per Sandvik", text: "Det er nettleien. Den betaler for linjene som fører strømmen hjem til deg, og den har steget mer enn selve strømprisen." },
  { start: 66, end: 72, speaker: "Anne Lindmo", text: "Takk for at du hørte på Ekko. Vi er tilbake neste fredag." },
]

const PLAIN = `Hei, og velkommen til Ekko. I dag skal vi snakke om strømprisen, og hvorfor den aldri ser ut til å gå ned.

Med meg i studio har jeg en som har fulgt kraftmarkedet i tjue år. Det korte svaret er at vi er koblet til resten av Europa, og der er strømmen dyr.

Det lange svaret handler om magasiner, nedbør og kabler,
og om Norgespris, som kom i høst.`

/** The transcript with an episode of its own: a tap moves the time, and the line said then is marked and followed. */
function Playing({ cues, start }: { cues: readonly TranscriptCue[]; start: number }) {
  const [time, setTime] = useState(start)
  return <Transcript cues={cues} currentTime={time} onSeek={setTime} />
}

const meta = {
  title: "Components/Media/Transcript",
  component: Transcript,
  tags: ["autodocs"],
  args: { cues: CUES, currentTime: 20, onSeek: () => {} },
  parameters: { docs: { description: { component: `### Use it when

an episode has a transcript (Podcasting 2.0 \`podcast:transcript\`: WebVTT, SRT or JSON), on the episode's page or in «Spilles nå». Timed lines (\`cues\`: \`start\`, \`end\` in seconds, \`text\`, \`speaker\`) are read along: the line said now (\`currentTime\`) is marked and kept in view, and a tap goes there (\`onSeek\`). Lines are grouped in turns under the speaker's name. A transcript without times (\`text\`, plain text) is paragraphs. Both can be searched.

Without \`currentTime\` and \`onSeek\`, give \`episode\`: it follows the design system's player when that episode plays, and a tap starts it there.

With neither cues nor text it is an \`EmptyState\` («Ingen transkripsjon ennå»); with \`error\` it is an \`ErrorMessage\` («Kunne ikke hente transkripsjonen»).

### Do not use it when

- The times are chapters with titles: \`ChapterList\`.
- The text is show notes: \`Markdown\`.

### Accessibility

**Handled by the component**

- A list (\`<ol>\`) of lines, in turns under the speaker's name; each line is a native button that says its time in words («1 min 6 s») before its words, the clock hidden so it is not read twice ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).
- The line said now has \`aria-current\`, a bar at its start and a ground, not a colour alone ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
- One tab stop for the lines: the arrows, Home and End go between them, Enter or Space goes there ([2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard)).
- It scrolls its own box, never the page, and only gently; at once, without the glide, for a reader who asks for less motion. When the reader scrolls or moves with the keys it stops, and «Følg avspillingen» brings it back ([2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)).
- The search has a label; the matches are marked, the current one stronger, «Forrige» and «Neste» go between them (Enter and Shift+Enter in the field), and the count is said («Treff 2 av 5») ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)).
- Each target is 2.75rem tall ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

**You check**

- The cues are in the order they are said, and the speakers' names are as the transcript has them.

### Content

The transcript's own words. Speaker names as given; nothing is added.

### Related

\`ChapterList\`, \`PodcastPlayer\`, \`EmptyState\`, \`ErrorMessage\`` } } },
} satisfies Meta<typeof Transcript>
export default meta
type Story = StoryObj<typeof meta>

/** Timed, with speakers: the line said at 0:20 is marked, and the box keeps it in view. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { current: true })).toHaveTextContent("Det lange svaret")
  },
}

/** A tap on a line goes there: the time moves, and that line is the one marked. */
export const Seek: Story = {
  render: () => <Playing cues={CUES} start={0} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /Så hva betyr det/ }))
    await expect(canvas.getByRole("button", { current: true })).toHaveTextContent("Så hva betyr det")
  },
}

/** A search marks every match, and says how many; Enter goes to the next. */
export const Search: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText("Søk i transkripsjonen"), "strøm")
    await expect(canvas.getByText(/Treff 1 av \d+/)).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll("mark").length).toBeGreaterThan(2)
  },
}

/** Without speakers: one run of lines. */
export const WithoutSpeakers: Story = { args: { cues: CUES.map(({ speaker: _, ...cue }) => cue) } }

/** Without times (`text`): paragraphs to read, and search; nothing to tap. */
export const PlainText: Story = { args: { cues: undefined, currentTime: undefined, onSeek: undefined, text: PLAIN } }

/** On a phone: the time column stays narrow, and the long word breaks. */
export const OnPhone: Story = { args: { currentTime: 50 }, parameters: { width: "max-w-[22rem]" } }

/** No transcript: an `EmptyState`. */
export const Empty: Story = { args: { cues: [], currentTime: undefined } }

/** It could not be fetched: an `ErrorMessage`. */
export const Failed: Story = { args: { cues: undefined, error: new Error("HTTP 404 fra transcript.vtt"), retry: true } }
