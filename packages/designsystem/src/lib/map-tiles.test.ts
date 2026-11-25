import { strict as assert } from "node:assert"
import { test } from "node:test"

import { coveringTiles, offsetInView, osmLink, TILE_SIZE, tileUrl, worldPixel } from "./map-tiles.ts"

const CARL_BERNER = { lat: 59.9255, lon: 10.7774 }

test("a place is in Web Mercator's pixels: the null island in the middle of the world, the west edge at zero", () => {
  assert.deepEqual(worldPixel({ lat: 0, lon: 0 }, 0), { x: 128, y: 128 })
  assert.equal(worldPixel({ lat: 10, lon: -180 }, 3).x, 0)
  const oslo = worldPixel(CARL_BERNER, 16)
  // The tile of OpenStreetMap that holds Carl Berners plass at zoom 16.
  assert.deepEqual([Math.floor(oslo.x / TILE_SIZE), Math.floor(oslo.y / TILE_SIZE)], [34729, 19058])
})

test("only the tiles the view touches are asked for: one for a small square inside a tile, four at a corner, a row for a banner", () => {
  // A point well inside one tile at zoom 2 (x 1, y 0).
  assert.equal(coveringTiles({ lat: 60, lon: -60 }, 2, 56, 56).length, 1)
  assert.equal(coveringTiles({ lat: 0, lon: 0 }, 2, 56, 56).length, 4)
  const banner = coveringTiles(CARL_BERNER, 16, 768, 112)
  assert.ok(banner.length >= 4 && banner.length <= 8, `${banner.length}`)
})

test("each tile says where it goes from the centre, and the one under the centre covers it", () => {
  const [tile] = coveringTiles({ lat: 60, lon: -60 }, 2, 56, 56)
  assert.ok(tile !== undefined)
  assert.ok(tile.left <= 0 && tile.left + TILE_SIZE >= 0 && tile.top <= 0 && tile.top + TILE_SIZE >= 0)
  assert.equal(tile.src, "https://tile.openstreetmap.org/2/1/1.png")
})

test("the column wraps across the antimeridian, and there is no tile above the world", () => {
  const tiles = coveringTiles({ lat: 85, lon: 179.99 }, 1, 64, 64)
  assert.deepEqual(tiles.map((tile) => tile.src).toSorted(), ["https://tile.openstreetmap.org/1/0/0.png", "https://tile.openstreetmap.org/1/1/0.png"])
})

test("a template or a function makes the address", () => {
  assert.equal(tileUrl("/t/{z}/{x}/{y}.png", 3, 4, 5), "/t/3/4/5.png")
  assert.equal(tileUrl((z, x, y) => `${z}-${x}-${y}`, 3, 4, 5), "3-4-5")
})

test("a point is placed from the centre while it is in the view, and left out beyond it", () => {
  const near = offsetInView(CARL_BERNER, { lat: 59.9258, lon: 10.7774 }, 16, 300, 112)
  assert.ok(near !== null && near.y < 0 && Math.abs(near.x) < 1e-6)
  assert.equal(offsetInView(CARL_BERNER, { lat: 59.94, lon: 10.7774 }, 16, 300, 112), null)
})

test("the link opens the place on openstreetmap.org with a marker", () => {
  assert.equal(osmLink(CARL_BERNER), "https://www.openstreetmap.org/?mlat=59.92550&mlon=10.77740#map=17/59.92550/10.77740")
})
