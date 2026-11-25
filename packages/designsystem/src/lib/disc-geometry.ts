/**
 * The mesh of a record: an annulus for its face, a wall round its edge and a wall round its hole, with a thickness, so that it has an edge that catches light and a hole that is deep. Vertices are
 * `x y z  nx ny nz  u v  kind` (nine floats): the face is at +z and the back at -z (a record turned round has its other side), `u v` are the position on the unit disc (what the cover is printed by), and `kind` is 0 for the face, 1 for the edge, 2 for the hole's wall.
 * Pure, so a test pins it.
 */

export interface DiscMesh {
  vertices: Float32Array
  indices: Uint16Array
}

export const FACE = 0
export const EDGE = 1
export const HOLE = 2

/** The record's radius is 1; `inner` is the hole's radius and `thickness` the whole depth (a real record is a hundredth of its width: this one is drawn thicker, so the edge can be seen at the size of a row). */
export function discMesh(segments = 96, inner = 0.22, thickness = 0.1): DiscMesh {
  const half = thickness / 2
  const vertices: number[] = []
  const indices: number[] = []
  const ring = (radius: number, z: number, normal: (cos: number, sin: number) => [number, number, number], kind: number, mirror = 1) => {
    const first = vertices.length / 9
    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2
      const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
      vertices.push(cos * radius, sin * radius, z, ...normal(cos, sin), mirror * cos * radius, sin * radius, kind)
    }
    return first
  }
  const strip = (a: number, b: number) => {
    for (let i = 0; i < segments; i += 1) indices.push(a + i, b + i, a + i + 1, a + i + 1, b + i, b + i + 1)
  }
  const up = (): [number, number, number] => [0, 0, 1]
  const faceInner = ring(inner, half, up, FACE)
  const faceOuter = ring(1, half, up, FACE)
  strip(faceInner, faceOuter)
  // The back, printed so that it reads the right way round from behind.
  const down = (): [number, number, number] => [0, 0, -1]
  const backInner = ring(inner, -half, down, FACE, -1)
  const backOuter = ring(1, -half, down, FACE, -1)
  strip(backInner, backOuter)
  // The edge is rounded: its normals lean toward each face, so the light rolls over it instead of stopping at a corner.
  const rounded = (lean: number) => (cos: number, sin: number): [number, number, number] => {
    const length = Math.hypot(1, lean)
    return [cos / length, sin / length, lean / length]
  }
  const edgeTop = ring(1, half, rounded(0.6), EDGE)
  const edgeBottom = ring(1, -half, rounded(-0.6), EDGE)
  strip(edgeTop, edgeBottom)
  const holeBottom = ring(inner, -half, (cos, sin) => [-cos, -sin, 0], HOLE)
  const holeTop = ring(inner, half, (cos, sin) => [-cos, -sin, 0], HOLE)
  strip(holeBottom, holeTop)
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) }
}
