import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../../../src/components/button"
import { DetailHeader } from "../../../src/components/detail-header"
import { DetailLayout } from "../../../src/components/detail-layout"
import { List } from "../../../src/components/list"
import { PageSection } from "../../../src/components/page-section"
import { PendingButton } from "../../../src/components/pending-button"
import { Text, TextLink } from "../../../src/components/text"
import { FactList } from "../../../src/components/fact-list"
import { gameFacts } from "../../../src/components/game-facts"
import { MediaGallery } from "../../../src/components/media-gallery"
import { podcastFacts } from "../../../src/lib/podcast-facts"
import { statFacts } from "../../../src/lib/games"
import { banner, mapTile, poster, screenshot, square, wide } from "../../sample"

/** Friday 20 November 2026, 14:00 in Oslo: a fixed now, so the pictures stay the same. */
const NOW = "2026-11-20T13:00:00Z"

const Sections = () => (
  <>
    <PageSection id="om" title="Om" icon="info">
      <Text>Legger til et felt for kildene i innstillingene, så de sies én gang og ikke på hver side. Feltet er likt i alle appene.</Text>
    </PageSection>
    <PageSection id="historikk" title="Historikk" icon="history">
      <Text>Åpnet for tre dager siden, review i går.</Text>
    </PageSection>
  </>
)

const meta = {
  title: "Components/Layout/DetailLayout",
  component: DetailLayout,
  tags: ["autodocs"],
  args: { children: <Sections /> },
  decorators: [(Story) => <div className="max-w-[70rem]">{Story()}</div>],
  parameters: { docs: { description: { component: `### Use it when

the body of the page of ONE thing, under its head (\`DetailHeader\` for a thing with a picture, the page's \`PageHeader\` for one without): a pull request, an issue, a stop, a podcast, an episode, an album, a film, an artist. The sections are \`children\`; what is looked up about the thing is data in the slots of the rail, and the rail is drawn the same on every detail page:

1. \`map\`: the place, a map across the top (a stop, a line), OpenStreetMap's credit in its corner.
2. \`status\` and \`steps\`: where it stands («Merget», «Tester feilet») and the steps it goes through (\`StateSteps\`).
3. \`actions\`: the page's one row of actions on the thing (subscribe; download and play).
4. \`facts\`: what it is, term by term (\`FactList\`), never under a title of its own.
5. \`links\`: where else it is, links out to other sites (\`LinkButton external\`): always here, never last in the sections.
6. \`updated\`: «Sist endret …», last.

On a wide page (56rem of room, in \`PageLayout width="pane"\`) the rail is at the right and stays in view while the sections scroll; on a phone it comes first, under the head and above the sections. There is no \`position\`: every detail page has the same skeleton, so «open elsewhere» is always in the same place.

### Do not use it when

the page is a list, a front page or an overview (\`PageLayout\` and \`PageSection\`s), or a form. Two columns for anything but a detail page are not in the design system: what is read is read in one column.

### Accessibility

**Handled by the component**

- The rail is a landmark (\`aside\`, «Fakta») that comes before the sections in the document, as on a phone, so the order read is the order seen on a phone ([1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)).
- The links out are marked as such, by the symbol and «(eksternt nettsted)» ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context)).
- The facts are a description list, and the time of the last change is a \`time\` with its exact moment ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).
- The map is one link named by its \`label\`, its tiles hidden ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)).
- The rail and the sections are one column under 56rem of room, so nothing scrolls sideways at 320 px ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).

**You check**

- The page has one \`h1\`, in its head; the sections have their headings.
- What the map shows is said in words too (the stop's name, the walk).
- A link's label says where it goes: «Åpne på GitHub», «Åpne i Apple Podcasts».

### Content

A fact is a noun and its value («Gren», «Etiketter», «Lengde»); several things of one kind are several values of one term. A number that says most about the thing is a \`DetailHeader\` figure, not a fact as well.

### Related

\`DetailHeader\`, \`PageHeader\`, \`PageSection\`, \`FactList\`, \`StatusLine\`, \`StateSteps\`, \`LinkButton\`, \`List\`` } } },
} satisfies Meta<typeof DetailLayout>
export default meta
type Story = StoryObj<typeof meta>

/** A pull request: its status and steps, its facts, the link out and when it last changed, beside the sections. */
export const PullRequest: Story = {
  args: {
    status: [{ text: "Venter på review", icon: "review" }, { text: "Tester feilet", icon: "close", tone: "destructive" }],
    steps: {
      label: "Status for pull request #42",
      now: NOW,
      steps: [
        { label: "Åpnet", at: "2026-11-17T09:00:00Z", state: "done" },
        { label: "Review", at: "2026-11-19T10:00:00Z", state: "current" },
        { label: "Merget", state: "upcoming" },
      ],
    },
    facts: [
      ["Gren", "kilder → main"],
      ["Størrelse", "+120 −14 · 6 filer"],
      ["Etiketter", ["innstillinger", "10.0.0"]],
      ["Venter på review fra", [<TextLink key="a" href="#">ole</TextLink>, <TextLink key="b" href="#">kari</TextLink>]],
    ],
    links: [{ href: "https://github.com/", label: "Åpne på GitHub" }],
    updated: { at: "2026-11-20T11:30:00Z", now: NOW },
  },
}

/** Fridays at six, from 2019: the dates of a podcast's episodes, for how often it comes out. */
const FRIDAYS = Array.from({ length: 30 }, (_, index) => new Date(Date.parse("2026-04-24T04:00:00Z") + index * 7 * 86_400_000).toISOString())

/**
 * A podcast: its one row of actions (subscribe) above its facts, and the link out under them. The facts are `podcastFacts` (`lib/podcast-facts`):
 * the publisher, Apple's categories in Norwegian, the language by name, how often it comes out (from the dates of its episodes), how many and since when.
 */
export const Podcast: Story = {
  args: {
    actions: <PendingButton pendingLabel="Abonnerer …">Abonner</PendingButton>,
    facts: podcastFacts({ publisher: "NRK", categories: ["Society & Culture", "Documentary", "News"], language: "no", episodeDates: ["2019-03-01T04:00:00Z", ...FRIDAYS], episodes: 312, now: NOW }),
    links: [{ href: "https://podcasts.apple.com/", label: "Åpne i Apple Podcasts" }],
  },
}

/** An episode: where it stands, and two actions on it in one row. */
export const Episode: Story = {
  args: {
    status: [{ text: "Hørt halvveis", icon: "duration" }],
    actions: (
      <>
        <PendingButton pendingLabel="Laster ned …">Last ned</PendingButton>
        <Button>Spill av</Button>
      </>
    ),
    links: [{ href: "https://example.com/", label: "Åpne på podkastens nettside" }],
  },
}

/** A stop: a map of the place across the top of the rail, its credit in the corner; the departures are the sections. */
export const Stop: Story = {
  args: {
    map: { at: { lat: 59.9255, lon: 10.7774 }, from: { lat: 59.9251, lon: 10.7752 }, label: "Kart over Carl Berners plass", tiles: mapTile },
    facts: [["Linjer", ["17", "31", "N31"]]],
  },
}

/** An album: under its `DetailHeader`, the facts and the links out in the rail, and what is like it as a section. */
export const UnderDetailHeader: Story = {
  args: {
    facts: [
      ["Utgitt", "2001"],
      ["Spor", "11"],
      ["Plateselskap", "Wall of Sound"],
    ],
    links: [
      { href: "https://www.last.fm/", label: "Åpne på Last.fm" },
      { href: "https://open.spotify.com/", label: "Åpne i Spotify" },
    ],
    children: (
      <PageSection id="likt" title="Likt" icon="music">
        <List kind="album" rows={[{ key: "a", href: "#", title: "The Understanding", picture: { src: square(200, "U") }, meta: ["Röyksopp", "2005"] }, { key: "b", href: "#", title: "Junior", picture: { src: square(260, "J") }, meta: ["Röyksopp", "2009"] }]} />
      </PageSection>
    ),
  },
  render: (args) => (
    <div className="grid gap-8">
      <DetailHeader kind="album" label="Album" title="Melody A.M." picture={poster(210, "M")} />
      <DetailLayout {...args} />
    </div>
  ),
}

/** On a phone the rail comes first, under the head and above the sections. */
export const OnPhone: Story = { args: { ...PullRequest.args }, decorators: [(Story) => <div className="max-w-[22rem]">{Story()}</div>] }

/** Nothing for the rail: the sections stand alone, in the reading column. */
export const WithoutRail: Story = {}

/**
 * A game's page (Steam): the head with its hero art, and the rail's facts from `gameFacts()` (`components/game-facts`) in a fixed order: the
 * reviews in Steam's words with an icon by how they lean, the players right now, the Steam Deck verdict, how it is played, the controller,
 * who made it, when it came out and its price on a sale. The sections: the pictures and videos (`MediaGallery`), the game's own stats
 * (`statFacts()` in a `FactList`) and its DLC (`List` with `price`).
 */
export const Game: Story = {
  args: {
    facts: gameFacts({
      reviews: { positive: 11_604, total: 12_345 },
      playersNow: 8_214,
      deck: "playable",
      categories: [2, 1, 9, 38, 28],
      developers: ["Owlcat Games"],
      publishers: ["Owlcat Games"],
      released: "2023-12-07",
      price: { final: 29_940, initial: 49_900 },
    }),
    links: [{ href: "https://store.steampowered.com/app/2186680", label: "Åpne i Steam-butikken" }],
    children: (
      <>
        <PageSection id="bilder" title="Bilder og videoer" icon="image">
          <MediaGallery items={[{ kind: "video", key: "t", src: "trailer.mp4", poster: screenshot(30, "T"), label: "Lanseringstrailer" }, ...[1, 2, 3, 4, 5, 6, 7].map((index) => ({ kind: "picture" as const, key: `s${index}`, src: screenshot(index * 40, String(index)), label: `Skjermbilde ${index}` }))]} />
        </PageSection>
        <PageSection id="statistikk" title="Statistikk" icon="chart">
          <FactList facts={statFacts([{ label: "Fiender beseiret", value: 12_345 }, { label: "Planeter utforsket", value: 31 }, { label: "Dødsfall", value: 0 }, { label: "Lengste kampserie på ett og samme skip uten å hvile", value: 17 }])} />
        </PageSection>
        <PageSection id="dlc" title="Tilleggsinnhold" icon="package">
          <List kind="game" columns={{ value: "Pris" }} rows={[{ key: "1", href: "https://store.steampowered.com/app/2", external: true, title: "Void Shadows", picture: { src: wide(30, "V") }, price: { final: 14_900, initial: 19_900 } }, { key: "2", href: "https://store.steampowered.com/app/3", external: true, title: "Lex Imperialis", picture: { src: wide(60, "L") }, price: { final: 9_900 } }]} />
        </PageSection>
      </>
    ),
  },
  render: (args) => (
    <div className="grid gap-8">
      <DetailHeader kind="game" label="Spill · 2023" title="Warhammer 40,000: Rogue Trader" picture={poster(20, "W")} backdrop={{ src: banner(20, "Rogue Trader") }} figures={[{ value: "86 t", label: "spilt" }, { value: "31 av 58", label: "prestasjoner" }]}>
        <Text>Owlcat Games · Rollespill, strategi</Text>
      </DetailHeader>
      <DetailLayout {...args} />
    </div>
  ),
}

/** The game's page on a phone: the rail first, under the head. */
export const GameOnPhone: Story = { ...Game, decorators: [(Story) => <div className="max-w-[22rem]">{Story()}</div>] }
