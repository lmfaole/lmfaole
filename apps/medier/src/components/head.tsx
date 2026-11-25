import { Badge } from "@lmfaole/designsystem/components/badge"
import { type DetailBackdrop, type DetailFigure, DetailHeader, type Presence } from "@lmfaole/designsystem/components/detail-header"
import { Inline } from "@lmfaole/designsystem/components/layout"
import { TextLink, Text } from "@lmfaole/designsystem/components/text"
import { TiltButton } from "@lmfaole/designsystem/components/tilt-button"
import type { PictureKind } from "@lmfaole/designsystem/components/picture"
import type { PictureSource } from "@lmfaole/designsystem/lib/picture-sources"
import type { ReactNode } from "react"

import type { RetroCase } from "../lib/retroachievements.ts"

/**
 * The head of the page of a thing: its picture and its name together, on a backdrop of the picture's colours drawn in WebGL that moves with the light (the design system's `DetailHeader`, `Light and shadow`). It is the page's `<h1>`.
 * An island, mounted by the page (`<Head client:idle … />`), since the detail components are not hydrated and the backdrop and the light need to be. Its picture is lit on its frame and nothing is painted over it (Spotify's artist
 * pictures may not be altered); the backdrop takes four colours from it and never the picture. The one button that asks to let the light follow an iPhone is under it, once.
 * The head is large for an artist (`shape="artist"`: its portrait is the page's face, and its `figures` are said there and nowhere else) and wherever there is a `sleeve` (an album's sleeve, a film's DVD case, a game's box): the design system derives it from the kind.
 */
export function Head({ kind, title, sources, shape, by, lines = [], tags = [], sleeve = false, disc = "record", figures = [], trend, backdrop, presence }: { kind: string; title: string; sources: PictureSource[]; /** What it is (`PictureKind`): its picture takes that shape. */ shape: PictureKind; /** The two or three numbers that say most, large under the name. */ figures?: DetailFigure[]; /** A small line of the first figure over time, beside it (an album's plays, a `Sparkline` streamed in by a server island). */ trend?: ReactNode; /** An album with Last.fm's cover: the cover as a sleeve in 3D with a record half out (never for Spotify's covers, which may not be altered). A film (`shape="film"`): TMDB's poster in a DVD case with the disc half out; a game (`shape="game"`) its box picture from Steam the same way. */ sleeve?: boolean; /** What an album's sleeve holds: a record, or a CD in its jewel case where the album came out on CD (`discOf`). A game's: a DVD, or with `cartridge` (played most on a Steam Deck) a game card in a handheld's case, or an old console's own case (`retroCase`). */ disc?: "record" | "cd" | Exclude<RetroCase, "dvd">; /** Lines of plain text under the name: a stretch of time, what is the most played. */ lines?: string[]; /** What it is tagged as (an artist's genres), each a badge under the lines. */ tags?: string[]; /** The artist, for an album and a song: «av …», linking to the artist's page. */ by?: { name: string; href: string }; /** A wide picture across the top of the head (a game's hero art), decoration only. */ backdrop?: DetailBackdrop; /** Where a person is now, under the name (a Steam profile). */ presence?: Presence }) {
  return (
    <>
      <DetailHeader kind={shape} label={kind} title={title} sources={sources} sleeve={sleeve} disc={disc} figures={trend === undefined ? figures : figures.map((figure, index) => (index === 0 ? { ...figure, trend } : figure))} {...(backdrop === undefined ? {} : { backdrop })} {...(presence === undefined ? {} : { presence })}>
        {by === undefined ? null : (
          <Text role="quiet">
            av <TextLink href={by.href}>{by.name}</TextLink>
          </Text>
        )}
        {lines.map((line) => (
          <Text key={line} role="quiet">
            {line}
          </Text>
        ))}
        {tags.length === 0 ? null : (
          <Inline label="Sjangere" items={tags.map((tag) => <Badge key={tag}>{tag}</Badge>)} />
        )}
      </DetailHeader>
      <TiltButton />
    </>
  )
}
