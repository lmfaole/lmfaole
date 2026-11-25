import { roundPosition, type Position } from "./position.ts"

export interface FoundPlace {
  name: string
  /** Where it is: the rest of the address, e.g. «Vestland, Norge». */
  detail: string
  position: Position
}

interface Hit {
  lat?: string
  lon?: string
  name?: string
  display_name?: string
}

/** The places in Nominatim's answer to a search: name, where it is, and the position; the same name in the same place only once. */
export function placesFrom(hits: readonly Hit[]): FoundPlace[] {
  const seen = new Set<string>()
  const places: FoundPlace[] = []
  for (const hit of hits) {
    const lat = Number(hit.lat)
    const lon = Number(hit.lon)
    if (hit.lat === undefined || hit.lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const parts = (hit.display_name ?? "").split(",").map((part) => part.trim()).filter((part) => part !== "")
    const name = hit.name?.trim() || parts[0]
    if (name === undefined || name === "") continue
    const detail = (parts[0] === name ? parts.slice(1) : parts).filter((part) => !/^\d{4,5}$/.test(part)).slice(-3).join(", ")
    const key = `${name}|${detail}`
    if (seen.has(key)) continue
    seen.add(key)
    places.push({ name, detail, position: roundPosition({ lat, lon }) })
  }
  return places
}
