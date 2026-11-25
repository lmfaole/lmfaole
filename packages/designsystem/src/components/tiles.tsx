import { shapeOf, type PictureKind } from "../lib/picture-kinds"
import { PictureFrame } from "./internal/picture-frame"
import type { ListPicture } from "./list"

/** One tile of a gallery: its picture, its name and the lines under it. The same words as a `ListRow`. */
export interface Tile {
  key: string
  title: string
  /** Where the tile goes; none for a tile that is not a link. */
  href?: string | null | undefined
  /** The picture, in the shape of the gallery's `kind`. */
  picture?: ListPicture | undefined
  /** Lines under the title, muted, each on a line of its own: a role, a year, a count. Empty lines are left out. */
  meta?: readonly (string | null | undefined)[] | undefined
}

const TILE = "group grid content-start gap-2 no-underline"

/**
 * Things as a gallery, only where the picture IS the content (the cast of a film, the albums of an artist): pictures in a grid, three across on
 * a phone, then as many as fit at least 9rem each, each tile one link (the picture is as much the link as the name). The shape comes from `kind`.
 * A list of things to open is a `List`.
 */
export function Tiles({ tiles, kind }: { tiles: readonly Tile[]; /** What kind of thing the gallery is of: the shape of every picture. */ kind: PictureKind }) {
  const { ratio, corners } = shapeOf(kind, "tile")
  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]">
      {tiles.map((tile) => {
        const sources = tile.picture?.sources
        const common = { src: tile.picture?.src ?? null, corners, ...(sources === undefined ? {} : { sources }) }
        const lines = (tile.meta ?? []).filter((line): line is string => line !== null && line !== undefined && line !== "")
        const content = (
          <>
            {ratio === "wide" ? <PictureFrame {...common} ratio="wide" size="fill" /> : <PictureFrame {...common} ratio={ratio} size="fill" />}
            <span className="grid min-w-0 gap-0.5 text-xs">
              <span className="line-clamp-2 text-sm font-medium [overflow-wrap:anywhere] group-hover:underline">{tile.title}</span>
              {lines.map((line, index) => (
                <span key={`${index}-${line}`} className="text-muted-foreground block min-w-0 truncate">
                  {line}
                </span>
              ))}
            </span>
          </>
        )
        return (
          <li key={tile.key}>
            {tile.href === null || tile.href === undefined ? (
              <span className={TILE}>{content}</span>
            ) : (
              <a href={tile.href} className={TILE}>
                {content}
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}
