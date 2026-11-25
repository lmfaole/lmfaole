import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect, within } from "storybook/test"

import { Breadcrumbs } from "../../src/components/breadcrumbs"
import { ChapterList } from "../../src/components/chapter-list"
import { DetailHeader } from "../../src/components/detail-header"
import { List } from "../../src/components/list"
import { PageHeader } from "../../src/components/page-header"
import { player, PodcastPlayer } from "../../src/components/podcast-player"
import { RATE_KEY } from "../../src/lib/podcast-player"
import { episode, square } from "../sample"

/** The titles a podcast feed really has: long, with a part in brackets, and names with no place to break. */
const LONG = "#412 – Hvorfor vi sover dårligere enn før, og hva forskningen faktisk sier om melatonin, skjermbruk og søvnhygiene (med professor Ingrid Haugen fra Universitetet i Bergen)"
const UNBROKEN = "Episode_2026_11_22_FINAL_v2_masterert_uten_musikk"
const URL = "https://www.eksempel.no/podkast/episoder/2026/11/22/hvorfor-vi-sover-darligere-enn-for"
const SHOW = "Søvnpodden med Kari Nordmann og gjester fra Universitetet i Bergen og Oslo universitetssykehus"

const meta = {
  title: "Patterns/Long titles",
  parameters: {
    docs: {
      description: {
        component: `A title is the app's data, and a feed's titles can be anything: two hundred characters, a file name with no spaces, a URL. The design system handles them, one way per context, so no app sets a clamp or a size (\`lib/long-titles\`):

- **A row, a tile, the compact player, a chapter:** the title is cut at two lines, the line under it at one, with an ellipsis. The whole title is still in the page, and the row's link is named by it.
- **A head** (\`PageHeader\`, \`DetailHeader\`, «Spilles nå»): the title is never cut. It wraps in balanced lines, hyphenates, breaks a word with no place to break, and is set a step smaller past 60 characters, two steps past 120.
- **Everywhere:** nothing widens the page; a badge, a value or an action beside a title keeps its size.

Each story is drawn at 20rem and 24rem, the narrowest phones.`,
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * One width, a container of its own. It is a section named by its width, as a page's head stands in its `main`: a `<header>` there is the
 * head of that part, not the page's banner, so a head drawn at both widths is not two banners.
 */
function Width({ width, children }: { width: "w-80" | "w-96"; children: ReactNode }) {
  return (
    <section aria-label={width === "w-80" ? "20rem" : "24rem"} className={`${width} shrink-0 @container outline-1 outline-border outline-dashed`}>
      {children}
    </section>
  )
}

/** The two widths side by side. */
function Widths({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-8">
      {(["w-80", "w-96"] as const).map((width) => (
        <Width key={width} width={width}>
          {children}
        </Width>
      ))}
    </div>
  )
}

/** Rows: the title cut at two lines, the line under it at one; the badge and the value keep their room. */
export const Rows: Story = {
  render: () => (
    <Widths>
      <List
        kind="podcast"
        label="Episoder"
        rows={[
          { key: "long", title: LONG, href: "#long", meta: [SHOW, "22. nov. 2026", "1 t 12 min"], value: "72 min", badge: { label: "Ny" }, picture: { src: square(200, "S") } },
          { key: "unbroken", title: UNBROKEN, href: "#unbroken", meta: [URL], value: "4 min", picture: { src: square(30, "E") } },
          { key: "url", title: URL, href: "#url", external: true, meta: ["Lenke"], picture: { src: square(120, "U") } },
          { key: "short", title: "Kort tittel", href: "#short", meta: ["Søvnpodden"], value: "31 min", picture: { src: square(300, "K") } },
        ]}
      />
    </Widths>
  ),
  play: async ({ canvasElement }) => {
    const [first] = within(canvasElement).getAllByRole("link", { name: LONG })
    await expect(first).toBeVisible()
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth)
  },
}

/** A detail page's head: the whole title, wrapped, two steps smaller; the file name breaks. */
export const DetailHead: Story = {
  render: () => (
    <Widths>
      <div className="grid gap-6">
        <DetailHeader kind="podcast" label="Episode · 22. nov. 2026" title={LONG} picture={square(200, "S")} />
        <DetailHeader kind="podcast" label="Episode" title={UNBROKEN} picture={square(30, "E")} />
      </div>
    </Widths>
  ),
}

/** A page's own head, with the trail above it, at one width: a page has one trail («Brødsmuler»), and two would be two landmarks of one name. */
const pageHead = (width: "w-80" | "w-96") => () => (
  <Width width={width}>
    <Breadcrumbs
      items={[
        { href: "#", label: "Podkaster" },
        { href: "#show", label: SHOW },
        { href: "#episode", label: LONG },
      ]}
    />
    <PageHeader title={LONG} description={URL} />
  </Width>
)

/** A page's own head at 20rem, with the trail above it: the middle crumbs are cut, the page's own name and the title are whole. */
export const PageHead: Story = {
  render: pageHead("w-80"),
  globals: { viewport: { value: "large", isRotated: false } },
}

/** The page's head at 24rem. */
export const PageHeadWider: Story = { ...PageHead, render: pageHead("w-96") }

/** The chapters of an episode: each chapter's title cut at two lines; the time and «spilles nå» keep their room. */
export const Chapters: Story = {
  render: () => (
    <Widths>
      <ChapterList
        episode={episode({ id: "ep-chapters" })}
        chapters={[
          { start: 0, title: "Intro" },
          { start: 180, title: LONG },
          { start: 600, title: UNBROKEN, href: "https://example.com/kapittel" },
          { start: 2400, title: URL },
        ]}
      />
    </Widths>
  ),
}

const loadLong = () => {
  player.close()
  localStorage.removeItem(RATE_KEY)
  player.setRate(1)
  player.load(episode({ id: "ep-412", title: LONG, show: SHOW, href: "#ep-412", chapters: [{ start: 0, title: "Intro" }, { start: 60, title: UNBROKEN }] }), 90)
  return {}
}

/** The player's bar in a box of 20rem: the title cut at two lines, the chapter at one, play and pause where they always are. No marquee. */
export const PlayerBar: Story = {
  loaders: [loadLong],
  // A transform makes the box the bar's ground: it docks at the foot of the box, not of the window.
  render: () => (
    <div className="relative h-40 w-80 overflow-hidden outline-1 outline-border outline-dashed [transform:translateZ(0)]">
      <PodcastPlayer />
    </div>
  ),
  parameters: { layout: "fullscreen" },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("button", { name: new RegExp(`^Åpne avspilleren: ${LONG.slice(0, 20)}`) })).toBeVisible()
  },
}

/** The bar in a box of 24rem. */
export const PlayerBarWider: Story = {
  ...PlayerBar,
  render: () => (
    <div className="relative h-40 w-96 overflow-hidden outline-1 outline-border outline-dashed [transform:translateZ(0)]">
      <PodcastPlayer />
    </div>
  ),
}

/** «Spilles nå» on the narrowest phone (20rem): the whole title, balanced and two steps smaller; the show at one line. */
export const NowPlaying: Story = {
  loaders: [loadLong],
  render: () => <PodcastPlayer defaultOpen />,
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "narrow", isRotated: false } },
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog", { name: /#412/ })
    await expect(within(dialog).getByRole("link", { name: LONG })).toBeVisible()
  },
}
