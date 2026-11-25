import { STRETCHED_LINK } from "../../lib/link-style"
import { coveringTiles, offsetInView, osmLink, OSM_COPYRIGHT, OSM_TILES, TILE_SIZE, type LatLon, type TileSource } from "../../lib/map-tiles"

/*
 * INTERNAL since 10.0.0: a map is data an app gives (a `List` row's `map`, `DetailLayout map`, `DepartureBoard at`), and the component that has it draws it and its credit.
 */

export interface MapThumbProps {
  /** The place the map is centred on, with the pin on it. */
  at: LatLon
  /** Where the reader is: a small dot, drawn only when it falls inside the map. */
  from?: LatLon
  /** What the map is of, for a screen reader («Kart over Carl Berners plass»). */
  label: string
  /** `square` (3.5 rem) in front of a row (`List`), `banner` (the full width, 7 rem high) at the top of a card. */
  shape?: "square" | "banner"
  /** Where the map's link goes: the place on openstreetmap.org (`osmLink(at)`) by default. The whole map is the link. */
  href?: string
  /**
   * The map's link covers the whole row it stands in (a `List` row, whose `LINKED_ROW` it makes a target, or a container with
   * `STRETCHED_ROW`), so a tap on the row's name or count opens the map too. Give it only where the map is the row's one link (a city bike
   * station with no page of its own); the link is still named by `label` and still looks like the map. The credit stays its own target.
   */
  stretched?: boolean
  /** Where the tiles come from: a template with `{z}`, `{x}` and `{y}`, or a function of them. OpenStreetMap's own by default. */
  tiles?: TileSource
}

/** The zoom of the tiles: a few streets around the place. */
const ZOOM = 16

/** The pixels of tiles each shape asks for: a square of 3.5 rem, a banner as wide as a broad card. A little more than shown, for a larger root font. */
const COVER = { square: { width: 80, height: 80 }, banner: { width: 1024, height: 160 } } as const

const FRAME = { square: "size-14 shrink-0 rounded-md", banner: "h-28 w-full" } as const

/** The tiles in dark mode: turned to dark streets on a dark ground, and dimmed, so the map does not light up the page. */
const TILES = "pointer-events-none absolute top-1/2 left-1/2 select-none dark:brightness-90 dark:contrast-90 dark:hue-rotate-180 dark:invert dark:saturate-50"

/**
 * A small still map of a place: OpenStreetMap's tiles centred on `at`, with a pin on the place and, when it is near enough to be in the
 * picture, a dot where the reader is (`from`). Only the tiles the map covers are asked for, lazily; it is plain HTML with no script, the
 * same on the server and in the browser. `square` stands in front of a row, `banner` across the top of a card (`DepartureBoard` takes `at`).
 * The whole map is a link that opens the place on openstreetmap.org (`href` for another).
 * The tiles' terms ask for the credit where the map is seen: a banner carries it in its corner, a list of squares has `MapCredit` once.
 * With `stretched`, the map is the link of the whole row it stands in (`List`): a tap anywhere on the row opens it.
 */
export function MapThumb({ at, from, label, shape = "square", href = osmLink(at), stretched = false, tiles = OSM_TILES }: MapThumbProps) {
  const credit = shape === "banner"
  const cover = COVER[shape]
  const placed = coveringTiles(at, ZOOM, cover.width, cover.height, tiles)
  const you = from === undefined ? null : offsetInView(at, from, ZOOM, shape === "square" ? 56 : cover.width, shape === "square" ? 56 : 112, 6)
  const map = (
    <span aria-hidden="true" className="absolute inset-0 bg-muted">
      {placed.map((tile) => (
        <img key={tile.key} src={tile.src} alt="" width={TILE_SIZE} height={TILE_SIZE} loading="lazy" decoding="async" draggable={false} className={`${TILES} block`} style={{ width: `${TILE_SIZE / 16}rem`, height: `${TILE_SIZE / 16}rem`, maxWidth: "none", transform: `translate(${tile.left / 16}rem, ${tile.top / 16}rem)` }} />
      ))}
      {you === null ? null : <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full border-2 border-background bg-foreground shadow-sm" style={{ marginLeft: `${you.x / 16}rem`, marginTop: `${you.y / 16}rem` }} />}
      <Pin size={shape === "square" ? "size-5" : "size-7"} />
    </span>
  )
  const creditLink = credit ? (
    <span className="absolute right-0 bottom-0 rounded-tl-md bg-background/80 px-1.5 text-[0.6875rem] leading-6 text-foreground">
      <a href={OSM_COPYRIGHT} className="inline-block min-h-6 underline-offset-2 hover:underline">
        © OpenStreetMap
      </a>
    </span>
  ) : null
  if (stretched)
    // The link is not positioned, so its cover reaches the row (the nearest positioned ancestor), not only the map. The credit is beside
    // the link, not in it (no link in a link), laid over the map's corner in the same grid cell.
    return (
      <span className={`grid ${shape === "square" ? "w-fit" : "w-full"}`}>
        <a href={href} aria-label={label} data-stretched="" className={`block [grid-area:1/1] ${STRETCHED_LINK}`}>
          <span className={`relative block overflow-hidden ${FRAME[shape]}`}>{map}</span>
        </a>
        {credit ? <span className={`relative block overflow-hidden [grid-area:1/1] pointer-events-none [&_a]:pointer-events-auto ${FRAME[shape]}`}>{creditLink}</span> : null}
      </span>
    )
  return (
    <span className={`relative block overflow-hidden ${FRAME[shape]}`}>
      <a href={href} aria-label={label} className="absolute inset-0 block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
        {map}
      </a>
      {creditLink}
    </span>
  )
}

/** The pin, its point on the place: the primary colour with the page's colour round it, so it stands on light streets and dark ones. */
function Pin({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full ${size} drop-shadow-sm`}>
      <path d="M12 23s-8-7.6-8-13.5a8 8 0 0 1 16 0C20 15.4 12 23 12 23Z" className="fill-primary stroke-background" strokeWidth="1.5" />
      <circle cx="12" cy="9.5" r="3" className="fill-primary-foreground" />
    </svg>
  )
}

/** The credit OpenStreetMap's terms ask for, once under a list of `MapThumb` squares (`List` puts it there): «Kart: © OpenStreetMap». The link's target reaches 0.25rem round it (2rem high), within the room a list leaves above and below it. */
export function MapCredit() {
  return (
    <p className="text-xs text-muted-foreground">
      Kart:{" "}
      <a href={OSM_COPYRIGHT} className="relative inline-block min-h-6 underline decoration-dotted underline-offset-4 after:absolute after:-inset-1 after:content-[''] hover:decoration-solid">
        © OpenStreetMap
      </a>
    </p>
  )
}
