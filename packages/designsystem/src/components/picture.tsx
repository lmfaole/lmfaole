import type { PictureSource } from "../lib/picture-sources"
import { CONTEXT_SIZES, shapeOf, type PictureContext, type PictureKind } from "../lib/picture-kinds"
import { PictureFrame } from "./internal/picture-frame"

export type { PictureContext, PictureKind } from "../lib/picture-kinds"

/**
 * The picture of one thing in a frame of its own. The app says what the thing is (`kind`) and where the picture stands (`context`); the
 * shape and the size follow from those (`lib/picture-kinds`), so the same kind looks the same in every app. The frame is always there, so
 * the rows of a list stay level when there is no picture or it fails to load. Decorative: the name beside it says what it is. `src` is the
 * address as the browser asks for it; resolving it (a base path, a CDN) is the project's.
 *
 * Most pictures are drawn by the component that holds them (`List`, `Tiles`, `DetailHeader`), which take the same `kind`.
 */
export function Picture({ src, sources, kind, context = "row", priority = false }: {
  src: string | null | undefined
  /** What the picture is of: its shape. */
  kind: PictureKind
  /** In front of a row (the default), at the head of the thing's own page, or a tile of a gallery. */
  context?: PictureContext
  /** The same picture in the widths its source offers: the browser takes the smallest that is sharp here (`srcset`), not the largest. */
  sources?: readonly PictureSource[]
  /** The one picture that is the page's largest thing on load (the hero of a detail page): fetched at once and first, never lazily. */
  priority?: boolean
}) {
  const { ratio, corners } = shapeOf(kind, context)
  const size = CONTEXT_SIZES[context]
  const common = { src, priority, corners, ...(sources === undefined ? {} : { sources }) }
  return ratio === "wide" ? <PictureFrame {...common} ratio="wide" size={context === "tile" ? "fill" : "row"} /> : <PictureFrame {...common} ratio={ratio} size={size} />
}
