import type { PictureCorners, Ratio, Size } from "./picture-frames"

/**
 * The shape language of the pictures: what KIND of thing a picture is of is told by its shape, so a reader tells a person from a record
 * from a film before reading a word. One shape for each kind, the same in a row, in a gallery and on the thing's own page, in every app;
 * an app says the kind, never a ratio or corners. A circle is a person or a band; a sharp square a record's cover; a square with soft
 * corners a single song; a tall frame a film or a show; a game is Steam's wide header in a list and its tall box on its own page; a
 * podcast, an episode, a place and an achievement have a square with the ordinary corners.
 */
export type PictureKind = "album" | "track" | "artist" | "person" | "film" | "show" | "game" | "podcast" | "episode" | "place" | "achievement"

/** Where the picture stands: in front of a row of a list, at the head of the thing's own page, or as a tile of a gallery. */
export type PictureContext = "row" | "hero" | "tile"

export interface PictureShape {
  ratio: Ratio
  corners: PictureCorners
}

export const PICTURE_KINDS: Readonly<Record<PictureKind, PictureShape>> = {
  album: { ratio: "square", corners: "sharp" },
  track: { ratio: "square", corners: "soft" },
  artist: { ratio: "square", corners: "round" },
  person: { ratio: "square", corners: "round" },
  film: { ratio: "poster", corners: "normal" },
  show: { ratio: "poster", corners: "normal" },
  /** A game's own page: Steam's tall library picture, its box. In a row or a tile it is the wide header (`shapeOf`). */
  game: { ratio: "poster", corners: "sharp" },
  podcast: { ratio: "square", corners: "normal" },
  episode: { ratio: "square", corners: "normal" },
  place: { ratio: "square", corners: "normal" },
  /** A game's achievement: its own small square icon. */
  achievement: { ratio: "square", corners: "normal" },
}

/** The frame's size for each context. */
export const CONTEXT_SIZES: Readonly<Record<PictureContext, Size>> = { row: "row", hero: "hero", tile: "fill" }

/** The shape of a kind where it stands: a game in a list or a gallery is Steam's wide header, on its own page its box. */
export function shapeOf(kind: PictureKind, context: PictureContext): PictureShape {
  if (kind === "game" && context !== "hero") return { ratio: "wide", corners: "normal" }
  return PICTURE_KINDS[kind]
}
