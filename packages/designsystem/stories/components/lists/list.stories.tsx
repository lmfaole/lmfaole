import type { Meta, StoryObj } from "@storybook/react-vite"

import { List } from "../../../src/components/list"
import { PlayButton } from "../../../src/components/play-button"
import { Time } from "../../../src/components/time"
import { deckStatus } from "../../../src/lib/games"
import { episode, poster, square, wide } from "../../sample"

const NOW = new Date("2025-11-12T12:00:00Z")

const meta = {
  title: "Components/Lists/List",
  component: List,
  tags: ["autodocs"],
  args: {
    kind: "podcast",
    rows: [
      { key: "1", href: "#ekko", title: "Ekko", picture: { src: square(10, "E") }, meta: ["NRK", "412 episoder"], value: <Time value="2025-11-11T08:00:00Z" now={NOW} /> },
      { key: "2", href: "#loerdagsrevyen", title: "Lørdagsrevyen", picture: { src: square(120, "L") }, meta: ["NRK", "88 episoder"], value: <Time value="2025-11-08T18:00:00Z" now={NOW} /> },
      { key: "3", href: "#uten-bilde", title: "En podkast uten bilde ennå", meta: ["Uavhengig"], value: <Time value="2025-10-30T07:00:00Z" now={NOW} /> },
    ],
  },
  parameters: { docs: { description: { component: `### Use it when

many things of one kind, each a row that leads to its own page: podcasts, episodes, albums, games, a top list, pull requests, the hours of a day. One component for every list of things to open, so a podcast row in one app is the same as in another.

The rows are data: \`title\` (words) and \`href\`, \`meta\` (the line under the title), \`value\` (at the end), \`action\` (a button of its own). The list decides the look. What leads the row follows from the data:

- \`kind\` (\`podcast\`, \`album\`, \`film\`, \`person\`, \`game\`, \`achievement\` …): a picture in that kind's shape in front of every row, an empty frame where a row has none.
- A row's \`map\`: a small map of the place.
- A row's \`icon\`: what kind of thing a row that is not media is (a pull request, rain).
- \`ranked\`: a top list, each row's place, how it moved (\`change\`) and a bar for its score (\`amount\`).

For podcasts:

- A row's \`episode\` (\`{ season, number, type }\`): «S2 E14» first in the meta, «Sesong 2, episode 14» to a screen reader, and «Trailer» or «Bonus» beside the title.
- A row's \`reason\` (\`{ by }\`, \`{ follows }\`, \`{ with }\`): why it is recommended, a line of its own in fixed words: «Anbefalt av Ekko», «Fordi du følger Ekko», «Med Anne Lindmo».
- A row's \`role\` with \`kind="person"\` (\`host\`, \`co-host\`, \`guest\` …; \`personRole()\` reads a feed's \`podcast:person role\`): the people are grouped by role, a table per role under its words («Verter», «Gjester»), in a fixed order.

For games (Steam):

- A row's \`price\` (\`{ final, initial, newSale }\`, in øre as the store gives it): the price in the value column, and on a sale «−40 %» with the price before struck through, «før 499 kr» to a screen reader; \`newSale\` (from \`newSales()\` in \`lib/games\`) is «Nytt tilbud» beside the title. A wishlist and a game's DLC.
- A row's \`news\` (\`patch-notes\` or \`event\`): «Oppdatering» or «Hendelse» as its badge, for a game's news.

### Do not use it when

- The picture IS the content and is looked at, not read (a cast, an artist's albums): \`Tiles\`.
- Terms and their values about one thing: \`FactList\`.
- Values compared across columns: \`Table\`.
- What happened to one thing over time: \`Timeline\`.

### Accessibility

**Handled by the component**

- A table with hidden column headers (Plass, Bilde, Navn, Detaljer, Antall, Handling, as there are); the title is the row header, so each cell is heard with it ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).
- The table roles are written out, so it stays a table while it is laid out as a grid ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).
- Pictures are decorative: hidden, with an empty \`alt\`; an icon is hidden unless the row gives \`iconLabel\` ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)).
- A row with \`href\` is that link's target whole: a tap anywhere follows it, the row is tinted under a pointer and ringed under keyboard focus, and the link's name is still only the title. Links in \`meta\` and the row's \`action\` stay their own targets ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)).
- A link to another site (\`external\`) says so to a screen reader, «(eksternt nettsted)», and opens without \`window.opener\` ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context)).
- A rank's change is words («Opp 3», «Ny»); the arrow and the bar only repeat it ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
- A sale is words: the percent off, the price, and «før» the price before, struck through for the eye only ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
- «Spilles nå» is words beside the dot ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
- Long words wrap; a row keeps to the width of its column at 320 px ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).

**You check**

- \`title\` names the thing, and \`href\` goes to the thing's page ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context)).
- \`meta\` and \`value\` say in words what they are (a date, a count with its unit).
- \`progress\` is a bar for the eye: say how much is left in \`meta\` too.
- Give \`label\` where the list's heading is not right above it.

### Content

The name first, a short line under it, one value at the end.

### Related

\`Tiles\`, \`FactList\`, \`StatusLine\`, \`DetailLayout\`, \`Picture\`` } } },
} satisfies Meta<typeof List>
export default meta
type Story = StoryObj<typeof meta>

/** Podcasts (`kind="podcast"`): square pictures, the maker and the count under the name, the latest episode at the end; the third has no picture yet, and its frame stays. */
export const Podcasts: Story = {}

/** No `kind`, no icon: just the rows. */
export const Plain: Story = {
  args: {
    kind: undefined,
    rows: [
      { key: "1", href: "#a", title: "Fiks tidssone i værmeldingen", meta: ["lmfaole/startside"], value: "2. nov." },
      { key: "2", href: "#b", title: "Utkast: tidslinje", meta: ["lmfaole/medier"], value: "4. nov." },
    ],
  },
}

/** Films (`kind="film"`): posters, the director and the year in `meta`. */
export const Films: Story = {
  args: {
    kind: "film",
    rows: [
      { key: "1", href: "#blade-runner", title: "Blade Runner", picture: { src: poster(10, "B") }, meta: ["Ridley Scott", 1982, "★ 5"], value: "i går" },
      { key: "2", href: "#alien", title: "Alien", picture: { src: poster(120, "A") }, meta: ["Ridley Scott", null, "★ 4"], value: "3. nov." },
    ],
  },
}

/** Games (`kind="game"`): wide pictures. */
export const Games: Story = {
  args: {
    kind: "game",
    rows: [
      { key: "1", href: "#hades", title: "Hades", picture: { src: wide(10, "H") }, meta: ["42 timer"], progress: 0.8 },
      { key: "2", href: "#celeste", title: "Celeste", picture: { src: wide(200, "C") }, meta: ["9 timer"], progress: 0.35 },
    ],
  },
}

/** A top list (`ranked`, `kind="artist"`): the places from the order, how each moved first in the line, and a bar for its plays. */
export const Ranked: Story = {
  args: {
    kind: "artist",
    ranked: true,
    label: "Toppartister denne uken",
    columns: { value: "Avspillinger" },
    rows: [
      { key: "1", href: "#robyn", title: "Robyn", picture: { src: square(300, "R") }, change: { kind: "up", by: 2 }, amount: 84, value: "84" },
      { key: "2", href: "#royksopp", title: "Röyksopp", picture: { src: square(30, "R") }, change: { kind: "same" }, amount: 61, value: "61" },
      { key: "3", href: "#sigrid", title: "Sigrid", picture: { src: square(180, "S") }, change: { kind: "new" }, amount: 22, value: "22" },
    ],
  },
}

/** Rows that are not media: an icon says the kind, statuses go on their own line, a badge says one word beside the title. */
export const Icons: Story = {
  args: {
    kind: undefined,
    rows: [
      { key: "1", href: "#pr-12", title: "Fiks tidssone i værmeldingen", icon: "pull-request", iconLabel: "Pull request", meta: ["lmfaole/startside"], status: [{ text: "Sjekker feilet", tone: "destructive", icon: "failure" }, { text: "2 dager" }] },
      { key: "2", href: "#pr-14", title: "Tidslinje for avspillinger", icon: "pull-request", iconLabel: "Pull request", badge: { label: "Utkast" }, meta: ["lmfaole/medier"], status: [{ text: "Sjekker ok", icon: "success" }] },
      { key: "3", href: "#issue-9", title: "TextArea får scroll", icon: "issue", iconLabel: "Issue", iconTone: "destructive", meta: ["lmfaole/designsystem"] },
    ],
  },
}

/** What plays now (`live`): the picture turns as a disc, and the end says «Spilles nå»; a new row is marked until its day (`isNew`). */
export const Live: Story = {
  args: {
    kind: "track",
    rows: [
      { key: "1", title: "Running Up That Hill", picture: { src: square(320, "K") }, meta: ["Kate Bush", "Hounds of Love"], live: true },
      { key: "2", href: "#dancing", title: "Dancing On My Own", picture: { src: square(200, "R") }, meta: ["Robyn"], value: "11:58", isNew: { until: "2025-12-01", now: "2025-11-12" } },
      { key: "3", href: "#delirious", title: "Delirious", picture: { src: square(40, "S") }, meta: ["Susanne Sundfør"], value: "11:53" },
    ],
  },
}

/** Places (`map`): a small map in front; a row without `href` makes the map its link, so the whole row opens the place. The list credits the map once, under itself. */
export const Places: Story = {
  args: {
    kind: undefined,
    rows: [
      { key: "a", title: "Carl Berners plass", map: { at: { lat: 59.9265, lon: 10.7779 }, label: "Kart over Carl Berners plass" }, meta: ["7 sykler", "12 låser"], value: "200 m" },
      { key: "b", title: "Birkelunden", map: { at: { lat: 59.9229, lon: 10.7612 }, label: "Kart over Birkelunden" }, meta: ["2 sykler", "18 låser"], value: "450 m" },
    ],
  },
}

/** A row's own `action` at the end, its own target beside the row's link; how much is heard goes in `meta` and the bar (`progress`). */
export const Action: Story = {
  args: {
    kind: "episode",
    rows: [
      { key: "1", href: "#ep-1", title: "Hva skjer med strømprisen?", picture: { src: square(60, "1") }, meta: ["Ekko", "32 min igjen"], progress: 0.4, action: <PlayButton episode={episode({ id: "ep-1", title: "Hva skjer med strømprisen?" })} /> },
      { key: "2", href: "#ep-2", title: "Lørdagsrevyen 8. november", picture: { src: square(160, "2") }, meta: ["Lørdagsrevyen", "44 min"], action: <PlayButton episode={episode({ id: "ep-2", title: "Lørdagsrevyen 8. november" })} /> },
    ],
    columns: { action: "Spill av" },
  },
}

/** Links of their own in the line under the title, and a row that goes to another site (`external`). */
export const Links: Story = {
  args: {
    kind: "album",
    rows: [
      { key: "1", href: "#melody", title: "Melody A.M.", picture: { src: square(100, "M") }, meta: [{ label: "Röyksopp", href: "#royksopp" }, 2001, { label: "Åpne i Spotify", href: "https://open.spotify.com", external: true }] },
      { key: "2", href: "https://www.discogs.com", external: true, title: "Junior (Discogs)", picture: { src: square(140, "J") }, meta: ["Röyksopp", 2009] },
    ],
  },
}

/** Episodes with their place in the podcast (`episode`): «S2 E14» first in the meta, and «Trailer» or «Bonus» beside the title. A long title is cut at two lines. */
export const Episodes: Story = {
  args: {
    kind: "episode",
    rows: [
      { key: "14", href: "#e14", title: "Hva skjer med strømprisen, nettleien og Norgespris når vinteren kommer, og hvem betaler egentlig regningen til slutt?", picture: { src: square(60, "14") }, episode: { season: 2, number: 14 }, meta: [<Time key="t" value="2025-11-11T08:00:00Z" now={NOW} />, "44 min"] },
      { key: "b", href: "#bonus", title: "Hele intervjuet", picture: { src: square(90, "B") }, episode: { season: 2, type: "bonus" }, meta: [<Time key="t" value="2025-11-08T08:00:00Z" now={NOW} />, "1 t 12 min"] },
      { key: "13", href: "#e13", title: "Lørdagsrevyen 8. november", picture: { src: square(160, "13") }, episode: { season: 2, number: 13 }, meta: [<Time key="t" value="2025-11-04T08:00:00Z" now={NOW} />, "38 min"] },
      { key: "t", href: "#trailer", title: "Snart: sesong 2", picture: { src: square(200, "T") }, episode: { type: "trailer" }, meta: ["2 min"] },
    ],
  },
}

/**
 * The people of an episode (`kind="person"`, each row's `role`): grouped by role in a fixed order, each group under its words («Verter»,
 * «Gjest», «Produsent»), a round picture in front, an empty frame where there is none.
 */
export const People: Story = {
  args: {
    kind: "person",
    label: "Folk i episoden",
    rows: [
      { key: "g1", href: "#hadia", title: "Hadia Tajik", role: "guest", picture: { src: square(20, "HT") }, meta: ["Stortingsrepresentant"] },
      { key: "h1", href: "#anne", title: "Anne Lindmo", role: "host", picture: { src: square(320, "AL") } },
      { key: "h2", href: "#per", title: "Per Kristian Indrehus-Fredriksen Sandvik", role: "host" },
      { key: "p1", href: "#kari", title: "Kari Nordmann", role: "producer", picture: { src: square(200, "KN") } },
    ],
  },
}

/**
 * Recommendations (`reason`): why each is here on a line of its own under the meta, in fixed words. The same list is «Anbefalt av
 * skaperne» on a podcast's page (`{ by }`, from its podroll), «Anbefalt for deg» on the front page (`{ follows }`, `{ with }`), and, with no
 * reason, «Mer fra samme utgiver».
 */
export const Recommendations: Story = {
  args: {
    kind: "podcast",
    rows: [
      { key: "1", href: "#hjernekraft", title: "Hjernekraft", picture: { src: square(30, "H") }, meta: ["NRK", "120 episoder"], reason: { by: "Ekko" } },
      { key: "2", href: "#loerdagsrevyen", title: "Lørdagsrevyen", picture: { src: square(120, "L") }, meta: ["NRK"], reason: { follows: "Ekko – et aktuelt samfunnsprogram" } },
      { key: "3", href: "#lang", title: "Den aller lengste podkasttittelen i verden, med undertittel, sesongnavn og en forklaring på hva den handler om", picture: { src: square(220, "D") }, meta: ["Uavhengig"], reason: { with: ["Anne Lindmo", "Per Sandvik", "Kari Nordmann"] } },
    ],
  },
}

/**
 * A wishlist (`kind="game"`, each row's `price`): the price at the end, and on a sale «−40 %» with the price before struck through; a game
 * that came on sale since the last visit (`price.newSale`, from `newSales()`) has «Nytt tilbud» beside its title. Its Steam Deck verdict is a status (`deckStatus()`).
 */
export const Wishlist: Story = {
  args: {
    kind: "game",
    label: "Ønskelisten",
    columns: { value: "Pris" },
    rows: [
      { key: "2183900", href: "#rogue-trader", title: "Warhammer 40,000: Rogue Trader – Void Shadows-utvidelsen (Deluxe Edition)", picture: { src: wide(20, "W") }, meta: ["Owlcat Games", "Lagt til 3. mars"], price: { final: 29_940, initial: 49_900, newSale: true }, status: [deckStatus("playable")] },
      { key: "1145350", href: "#hades-ii", title: "Hades II", picture: { src: wide(10, "H") }, meta: ["Supergiant Games"], price: { final: 21_225, initial: 28_300 }, status: [deckStatus("verified")] },
      { key: "1086940", href: "#baldurs-gate-3", title: "Baldur's Gate 3", picture: { src: wide(260, "B") }, meta: ["Larian Studios"], price: { final: 59_900 }, status: [deckStatus("verified")] },
      { key: "1172470", href: "#apex", title: "Apex Legends", picture: { src: wide(140, "A") }, meta: ["Respawn"], price: { final: 0, free: true }, status: [deckStatus("unsupported")] },
      { key: "2", href: "#kommer", title: "Et spill som ikke er ute ennå", picture: { src: wide(320, "K") }, meta: ["Kommer i 2027"], status: [deckStatus("unknown")] },
    ],
  },
}

/** A game's DLC: rows that go to the store (`external`), with their price. */
export const Dlc: Story = {
  args: {
    kind: "game",
    label: "Tilleggsinnhold",
    columns: { value: "Pris" },
    rows: [
      { key: "1", href: "https://store.steampowered.com/app/2", external: true, title: "Void Shadows", picture: { src: wide(30, "V") }, price: { final: 14_900, initial: 19_900 } },
      { key: "2", href: "https://store.steampowered.com/app/3", external: true, title: "Lex Imperialis – en svært lang tittel på en kosmetisk pakke med drakter og våpen", picture: { src: wide(60, "L") }, price: { final: 9_900 } },
      { key: "3", href: "https://store.steampowered.com/app/4", external: true, title: "Lydsporet", picture: { src: wide(90, "O") }, price: { final: 0, free: true } },
    ],
  },
}

/** A game's news (`news`): patch notes are «Oppdatering», an event «Hendelse»; each row goes to the item on Steam (`external`), its date in the meta. */
export const News: Story = {
  args: {
    kind: undefined,
    label: "Nyheter",
    rows: [
      { key: "1", href: "https://store.steampowered.com/news/1", external: true, title: "Oppdatering 1.3.2: retting av lagringsfeil i Void Shadows og bedre ytelse på Steam Deck", icon: "article", news: "patch-notes", meta: [<Time key="t" value="2025-11-11T08:00:00Z" now={NOW} />, "Owlcat Games"] },
      { key: "2", href: "https://store.steampowered.com/news/2", external: true, title: "Høstsalg: halv pris hele uken", icon: "article", news: "event", meta: [<Time key="t" value="2025-11-08T08:00:00Z" now={NOW} />, "Steam"] },
      { key: "3", href: "https://store.steampowered.com/news/3", external: true, title: "Utviklerdagbok #12: kampsystemet", icon: "article", meta: [<Time key="t" value="2025-10-30T08:00:00Z" now={NOW} />, "PC Gamer"] },
    ],
  },
}

/** Steam badges: Steam gives them no pictures, so each is a row with the `award` icon, its level and when it was earned. */
export const Badges: Story = {
  args: {
    kind: undefined,
    label: "Merker",
    columns: { value: "XP" },
    rows: [
      { key: "13", title: "Mange spill", icon: "award", meta: ["Nivå 7", <Time key="t" value="2025-11-02T08:00:00Z" now={NOW} />], value: "700 XP" },
      { key: "1", title: "Års tjeneste", icon: "award", meta: ["Nivå 12", <Time key="t" value="2025-09-14T08:00:00Z" now={NOW} />], value: "600 XP" },
      { key: "2", title: "Samlemerke: Warhammer 40,000: Rogue Trader – Void Shadows", icon: "award", meta: ["Nivå 1", <Time key="t" value="2025-06-01T08:00:00Z" now={NOW} />], value: "100 XP" },
    ],
  },
}
