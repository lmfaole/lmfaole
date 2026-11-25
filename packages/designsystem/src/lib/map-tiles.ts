/** A place on the earth, in degrees (WGS 84). */
export interface LatLon {
  lat: number
  lon: number
}

/** The address of a tile: `{z}`, `{x}` and `{y}` in a template, or a function of the three. */
export type TileSource = string | ((z: number, x: number, y: number) => string)

/** OpenStreetMap's own tiles (tile.openstreetmap.org): free to use with the credit and the page's Referer, within its tile policy. */
export const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

export const TILE_SIZE = 256

/** Web Mercator stops short of the poles. */
const MAX_LAT = 85.05112878

/** A place in Web Mercator's pixels at a zoom: the whole world is `256 × 2^z` on each side, from the top left (180° W, 85° N). */
export function worldPixel({ lat, lon }: LatLon, zoom: number): { x: number; y: number } {
  const size = TILE_SIZE * 2 ** zoom
  const phi = (Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)) * Math.PI) / 180
  return {
    x: ((lon + 180) / 360) * size,
    y: ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * size,
  }
}

export function tileUrl(source: TileSource, z: number, x: number, y: number): string {
  return typeof source === "function" ? source(z, x, y) : source.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y))
}

export interface PlacedTile {
  key: string
  src: string
  /** The tile's left and top edge, in pixels from the centre of the view. */
  left: number
  top: number
}

/**
 * The tiles that cover a view of `width × height` pixels centred on `at`, each with where it goes from the view's centre: only those the
 * view touches (one to four for a small square), not a block of nine. Across the antimeridian the column wraps; above and below the world
 * there is no tile.
 */
export function coveringTiles(at: LatLon, zoom: number, width: number, height: number, source: TileSource = OSM_TILES): PlacedTile[] {
  const z = Math.round(zoom)
  const count = 2 ** z
  const centre = worldPixel(at, z)
  const first = { x: Math.floor((centre.x - width / 2) / TILE_SIZE), y: Math.floor((centre.y - height / 2) / TILE_SIZE) }
  const last = { x: Math.floor((centre.x + width / 2 - 1e-9) / TILE_SIZE), y: Math.floor((centre.y + height / 2 - 1e-9) / TILE_SIZE) }
  const tiles: PlacedTile[] = []
  for (let ty = first.y; ty <= last.y; ty++) {
    if (ty < 0 || ty >= count) continue
    for (let tx = first.x; tx <= last.x; tx++) {
      const x = ((tx % count) + count) % count
      tiles.push({ key: `${z}/${tx}/${ty}`, src: tileUrl(source, z, x, ty), left: tx * TILE_SIZE - centre.x, top: ty * TILE_SIZE - centre.y })
    }
  }
  return tiles
}

/** Where `point` is from the centre `at`, in pixels, or null when it falls outside a view of `width × height` (less `margin` at each edge). */
export function offsetInView(at: LatLon, point: LatLon, zoom: number, width: number, height: number, margin = 0): { x: number; y: number } | null {
  const z = Math.round(zoom)
  const a = worldPixel(at, z)
  const b = worldPixel(point, z)
  const x = b.x - a.x
  const y = b.y - a.y
  return Math.abs(x) <= width / 2 - margin && Math.abs(y) <= height / 2 - margin ? { x, y } : null
}

/** The place on openstreetmap.org, with a marker on it. */
export function osmLink({ lat, lon }: LatLon, zoom = 17): string {
  const la = lat.toFixed(5)
  const lo = lon.toFixed(5)
  return `https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=${Math.round(zoom)}/${la}/${lo}`
}

export const OSM_COPYRIGHT = "https://www.openstreetmap.org/copyright"
