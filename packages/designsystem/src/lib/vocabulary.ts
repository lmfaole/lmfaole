import type { IconName } from "./icons"

export type { PictureContext, PictureKind } from "./picture-kinds"

/**
 * The words the components share, so the same thing is said the same way everywhere and an app learns it once:
 * a link to somewhere is always `{ href, label, icon? }`, a colour of meaning always a `Tone`, a line or two under a
 * title always `description`, a list's items always `rows` and a chart's always `data`. What is a picture takes it as `src`
 * (`Picture`, `AlbumSleeve`); what has a picture among other things takes it as `picture` (a row, `DetailHeader`, `NowPlayingCard`). A component narrows these (a `Tone` without `destructive`), it does not invent its own.
 */

/** The colour of meaning: `muted` for what is said quietly, `destructive` for what went wrong. */
export type Tone = "default" | "muted" | "destructive"

/** Where a link or a button that goes somewhere goes: its target and what it says, in full («Se alle pull requests»). */
export interface LinkTo {
  href: string
  label: string
  /** Its icon, where the links beside it have one. */
  icon?: IconName
}

/**
 * An action that does something here instead of going somewhere: its words, its icon where the actions beside it have one, and what it does.
 * Only a client component (an island) has one, since a handler cannot cross from the server; on the server an action is a `LinkTo`.
 */
export interface ActionTo {
  label: string
  icon?: IconName
  onSelect: () => void
}

/** Where words or data come from, named and linked where it has an address: `{ label: "Wikipedia", href }`. Drawn as «Tekst fra …». */
export interface Source {
  label: string
  href?: string
}
