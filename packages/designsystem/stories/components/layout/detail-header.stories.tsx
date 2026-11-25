import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "../../../src/components/badge"
import { DetailHeader } from "../../../src/components/detail-header"
import { Inline } from "../../../src/components/layout"
import { Sparkline } from "../../../src/components/sparkline"
import { Text } from "../../../src/components/text"
import { albumCover, banner, boxArt, poster } from "../../sample"

const meta = {
  title: "Components/Layout/DetailHeader",
  component: DetailHeader,
  tags: ["autodocs"],
  args: { kind: "artist", label: "Artist", title: "CHXRRY", picture: poster(20, "C") },
  decorators: [(Story, { parameters }) => <div className={`@container ${typeof parameters["width"] === "string" ? parameters["width"] : "max-w-xl"}`}>{Story()}</div>],
  parameters: { docs: { description: { component: `### Use it when

the head of a page of one thing (an artist, an album, a film, a person): its main picture and its name together. It is the page's \`<h1>\`, so the page leaves out its own \`PageHeader\`.

The picture stands beside the name on a phone, not above it, so neither is left alone with a gap of page around it. The stage behind them is the picture's own colours, four soft pools drawn in WebGL, that move with the page's light: the pointer, and on a phone how it is held (\`LightSource\`, in the picture). Only four colours are taken from the picture, never the picture itself, and nothing is painted over it, so it is safe for sources whose terms forbid altering their pictures (Spotify's). The backdrop is drawn when the light changes and at no other time: nothing loops.

### Do not use it when

the page is not of one thing with a picture: a list, a front page (\`PageHeader\`). Without a picture the head has its plain tinted ground and the name.

### Accessibility

**Handled by the component**

- The name is the page's one \`h1\`; the kind in words is above it ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)).
- The backdrop is decoration, hidden from assistive technology, and is laid over the page at half strength in light and 40 % in dark, with a fade, and the text of the head is the full text colour, so it keeps 4.5:1 on the worst colour a picture can give (a test measures it) ([1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)).
- Nothing in the head moves by itself: the backdrop moves only with the pointer or the phone, and not at all under \`prefers-reduced-motion\` ([2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide), [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)).
- The head has a hairline frame, and a light picture (a white cover) gets a darker stage in the light theme, so the head and the picture's edge are seen on a white page ([1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)).
- A long name breaks where it must and never runs out of its column ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).

**You check**

- \`title\` is the thing's name; the page has no other \`h1\`.
- What goes in \`children\` is the full text colour, never \`Text role="quiet"\`: the ground is tinted.
- \`kind\` is what the thing is (\`PictureKind\`): the picture takes its shape, as in every list and gallery; \`label\` says it in words.
- The picture may be read by WebGL only where its host allows it (CORS); where not, the plain ground shows.

### Content

\`label\` is the kind in one word above the name («Artist», «Album», «Låt», «Film», «Serie», «Person»); under it, in \`children\`, only what belongs to the head: by whom, an attribution, a few genres.

\`figures\` are the two or three numbers that say most about the thing to this reader («10 903 avspillinger», «22 % av alt du har hørt»): large, under the name, each said here and **not again** in the page's facts. A rank is said in words in \`label\` («Din nest mest spilte artist»), not as a figure; when something started is shown by a chart further down, not by a figure.

### Size

The size follows from the data, never from the app: the head is large where the picture is the page's face, an artist's portrait (\`kind="artist"\`; Spotify's artist pictures are large and sharp), and wherever there is a \`sleeve\`. A person's page (\`kind="person"\`) keeps the ordinary head. The picture is \`Picture size="feature"\`, as wide as its cell and lit on its frame like the hero, uncropped beyond its shape and with nothing over it. On a phone the name goes first, the whole width of the head (a long name does not wrap in a narrow column), and the picture is under it, about half the head wide, **beside the figures**, so it is never alone with a gap of page around it; from a wide head (\`@3xl\`) the picture is beside the name, at 16rem and from \`@5xl\` 20rem, and the name, the figures and \`children\` are a column centred on it. A poster or a cover without a sleeve has the ordinary head. An album's page with its sleeve is large too: the sleeve's column is half as wide again as a portrait's, so the cover is as large as a portrait would be and the record lies beside it; in a narrow head the sleeve is the whole width under the name and the figures go across under it. An album whose edition is a CD has \`disc="cd"\`: its cover in a jewel case with the CD half out (\`AlbumSleeve kind="cd"\`). A film's page (\`kind="film"\`) may have \`sleeve\` the same way: its poster in a DVD case with the disc half out (\`AlbumSleeve kind="dvd"\`), for a poster the app may alter (TMDB's); a game's with \`disc="cartridge"\` is a handheld game's case with its game card half out (\`AlbumSleeve kind="cartridge"\`), and an old console's has its own: \`nes\`, \`snes\`, \`n64\`, \`gameboy\`, \`gba\` (a cardboard box with that console's cartridge), \`genesis\` (a black clamshell) and \`psx\` (a jewel case with a black disc).

A game's page (\`kind="game"\`, Steam) has its hero art as \`backdrop\`: a wide picture across the top of the head, edge to edge, faded into the stage under it. It is decoration (\`alt=""\`, lazy), never cropped to a face and never written on; the poster and the name stand under it as on any page. A person's page may have \`presence\` (a Steam profile): where they are now, on a line under the name: a live dot and «Spiller Hades II» (the game a link to its page), «På nett», or a hollow dot and «Borte», «Frakoblet · sist på nett for 2 timer siden». The words say it; the dot repeats it.

A figure may have a \`trend\`: a \`Sparkline\` of how the number moved, beside it. Its box is kept from the first paint, so a sparkline that comes later (from a server island) moves nothing.

### Related

\`PageHeader\`, \`Picture\` (\`size="hero"\`), \`LightSource\`, «Foundations / Light and shadow»` } }, },
} satisfies Meta<typeof DetailHeader>
export default meta
type Story = StoryObj<typeof meta>

/** An artist (`kind="artist"`): a round portrait, large, on the portrait's own colours (move the pointer over the page and the pools of colour move). */
export const Artist: Story = { args: { children: <Text role="quiet">Fra Spotify</Text> } }
/** A film: a poster beside the name, the kind with its year. */
export const Poster: Story = { args: { kind: "film", label: "Film · 1995", title: "Heat", picture: poster(150, "H") } }
/** A long name and a line under it: the name wraps beside the picture and never leaves its column. */
export const LongName: Story = { args: { kind: "album", label: "Album", title: "Hyperdimensional Rhapsody of the Unfathomably Extended Edition", picture: poster(300, "R"), children: <Text role="quiet">Shygirl</Text> } }
/** An album: with `sleeve` its cover is a sleeve in 3D with a record half out, tilting with the light, on a stage of the cover's colours. For Last.fm's covers, never Spotify's. */
export const Album: Story = { args: { kind: "album", label: "Album", title: "Rated R", sleeve: true, picture: albumCover("#1a0b2e", "#5b1a8f", "#e0245e", "#f5c542"), children: <Text role="quiet">av Rihanna</Text> } }
/** Figures: the two or three numbers that say most, large under the name. */
export const WithFigures: Story = { args: { label: "Din nest mest spilte artist", figures: [{ value: "10 903", label: "avspillinger" }, { value: "22 %", label: "av alt du har hørt" }] } }
/** An artist's page is large: the portrait is the page's face. On a phone the name first and the picture beside the figures; on a wide head the picture beside the name, the rest centred on it. */
export const Large: Story = {
  args: {
    label: "Din nest mest spilte artist",
    title: "Röyksopp",
    figures: [{ value: "10 903", label: "avspillinger" }, { value: "22 %", label: "av alt du har hørt" }],
    children: (
      <Inline label="Sjangere" items={[<Badge key="electronic">Electronic</Badge>, <Badge key="norwegian">norwegian</Badge>]} />
    ),
  },
  parameters: { width: "max-w-4xl" },
}
/** An artist's head on a phone: the name the width of the head, the portrait under it beside the figures. */
export const LargeOnPhone: Story = { args: { ...Large.args }, parameters: { width: "max-w-[22rem]" } }
/** An artist without figures: the portrait under the name, larger than half the head, on a phone. */
export const LargeWithoutFigures: Story = { args: { label: "Artist", title: "Kings of Convenience", picture: poster(60, "K") }, parameters: { width: "max-w-[22rem]" } }
/** With `sleeve` (large): an album's page, its cover as large as a portrait and the record beside it; a figure with its `trend`, a sparkline beside the number. */
export const LargeAlbum: Story = {
  args: {
    kind: "album",
    label: "Album",
    title: "Melody A.M.",
    sleeve: true,
    picture: albumCover("#0b1e2e", "#1a5b8f", "#24c0e0", "#f5c542"),
    figures: [
      { value: "1 204", label: "avspillinger", trend: <Sparkline data={[12, 40, 88, 61, 30, 22, 45, 70]} ariaLabel="Avspillinger per kvartal: økte, så falt" /> },
      { value: "71 t", label: "lyttetid, omtrent" },
      { value: "38 %", label: "av det du har spilt av Röyksopp" },
    ],
    children: <Text role="quiet">av Röyksopp</Text>,
  },
  parameters: { width: "max-w-4xl" },
}
/** With `sleeve` and `disc="cd"`: an album whose edition is a CD, its cover in a jewel case with the CD half out. */
export const LargeAlbumCd: Story = { args: { ...LargeAlbum.args, disc: "cd" }, parameters: { width: "max-w-4xl" } }
/** A film's page (`kind="film"`) with `sleeve`: the poster in a DVD case with the disc half out, as an album's sleeve. */
export const LargeFilm: Story = {
  args: { kind: "film", label: "Film · 1995", title: "Heat", sleeve: true, picture: poster(150, "H"), children: <Text role="quiet">Michael Mann</Text> },
  parameters: { width: "max-w-4xl" },
}
/** A game played most on a handheld, `kind="game"` and `disc="cartridge"`: the box picture in a slim case with its game card half out, in place of the DVD. */
export const LargeGameCartridge: Story = { args: { ...LargeFilm.args, kind: "game", label: "Spill · 2020", title: "Hades", disc: "cartridge", children: <Text role="quiet">Supergiant Games</Text> }, parameters: { width: "max-w-4xl" } }
/** A film's DVD case on a phone. */
/** A Game Boy Advance game (`disc="gba"`): its square box with the cartridge half out. */
export const LargeGameGba: Story = { args: { ...LargeFilm.args, kind: "game", label: "Game Boy Advance · 2002", title: "Metroid Fusion", disc: "gba", picture: boxArt(200, 200, 270, "A"), children: <Text role="quiet">Nintendo</Text> }, parameters: { width: "max-w-4xl" } }
/** An old console's game, `kind="game"` and `disc="snes"`: its box of cardboard with the Super Nintendo's cartridge half out (and so for `nes`, `n64`, `gameboy`, `gba`, `genesis` and `psx`). */
export const LargeGameSnes: Story = { args: { ...LargeFilm.args, kind: "game", label: "SNES · 1990", title: "Super Mario World", disc: "snes", picture: boxArt(276, 200, 220, "S"), children: <Text role="quiet">Nintendo</Text> }, parameters: { width: "max-w-4xl" } }

export const LargeFilmOnPhone: Story = { args: { ...LargeFilm.args }, parameters: { width: "max-w-[22rem]" } }
/** With `sleeve` on a phone: the name, the sleeve the width of the head, and the figures across under it. */
export const LargeAlbumOnPhone: Story = { args: { ...LargeAlbum.args }, parameters: { width: "max-w-[22rem]" } }
/** No picture: the plain tinted ground and the name. */
export const WithoutPicture: Story = { args: { picture: null, title: "Ukjent artist" } }
/** A person (`kind="person"`): a round portrait in the ordinary head, the department above the name. */
export const Person: Story = { args: { kind: "person", label: "Regi", title: "Kelly Reichardt", picture: poster(200, "K") } }
/** A white cover: the head's hairline frame and, in the light theme, a darker stage (the `--muted` ground and a stronger backdrop), so the cover's edge and the head's both show. */
export const WhiteCover: Story = { args: { kind: "album", label: "Album", title: "The Beatles", picture: albumCover("#ffffff", "#fafafa", "#f4f4f4", "#ffffff"), children: <Text role="quiet">av The Beatles</Text> } }

/** An episode's page: «S2 E14» after the label (whole words to a screen reader), and «Bonus» beside it for an episode that is not an ordinary one. */
export const Episode: Story = { args: { kind: "episode", label: "Episode", episode: { season: 2, number: 14, type: "bonus" }, title: "Ekstra: Hele intervjuet med statsministeren om strømprisen, nettleien og hva som egentlig skjer med Norgespris neste vinter", picture: poster(260, "E"), children: <Text role="quiet">Ekko · 12. november</Text> } }

/** A game's page (Steam): the hero art across the top as `backdrop`, faded into the stage; the poster, a long name and the figures under it. */
export const Game: Story = {
  args: {
    kind: "game",
    label: "Spill · 2023",
    title: "Warhammer 40,000: Rogue Trader – Void Shadows-utvidelsen (Deluxe Edition)",
    picture: poster(20, "W"),
    backdrop: { src: banner(20, "Rogue Trader") },
    figures: [{ value: "86 t", label: "spilt" }, { value: "31 av 58", label: "prestasjoner" }],
    children: <Text role="quiet">Owlcat Games · Rollespill, strategi</Text>,
  },
  parameters: { width: "max-w-4xl" },
}

/** The same on a phone: the backdrop is lower, the poster beside the name. */
export const GameOnPhone: Story = { args: { ...Game.args }, parameters: { width: "max-w-[22rem]" } }

/** A Steam profile in a game: a live dot and «Spiller …», the game a link to its page. */
export const Profile: Story = {
  args: {
    kind: "person",
    label: "Steam-profil",
    title: "lmfaole",
    picture: poster(290, "L"),
    presence: { state: "in-game", game: "Hades II", href: "#hades-ii" },
    figures: [{ value: "42", label: "nivå" }, { value: "318", label: "spill" }, { value: "57", label: "merker" }],
  },
}

/** Offline: a hollow dot, and when they were last online. */
export const ProfileOffline: Story = { args: { ...Profile.args, presence: { state: "offline", lastOnline: { at: "2026-11-20T09:30:00Z", now: "2026-11-20T12:00:00Z" } } } }
