export interface Position {
  lat: number
  lon: number
}

/** The cookie that holds the device's position: `lat,lon`, three decimals (about a hundred metres), for the nearest stations and the forecast. */
export const POSITION_COOKIE = "startside-pos"

/** A position from a cookie value; nothing for anything that is not a position on Earth. */
export function parsePosition(value: string | undefined): Position | null {
  if (value === undefined) return null
  const match = /^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/.exec(decodeURIComponent(value).trim())
  if (match === null) return null
  const lat = Number(match[1])
  const lon = Number(match[2])
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 ? roundPosition({ lat, lon }) : null
}

/** Three decimals: close enough to tell which stations are nearest, and the position leaves the device no more exactly than that. */
export function roundPosition({ lat, lon }: Position): Position {
  return { lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000 }
}

export function formatPosition({ lat, lon }: Position): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`
}

/** Two decimals (about a kilometre), for the forecast: it does not change within a kilometre, and the cache keeps one for each. */
export function coarsePosition({ lat, lon }: Position): Position {
  return { lat: Math.round(lat * 100) / 100, lon: Math.round(lon * 100) / 100 }
}

/** Whether the device has moved far enough (about two hundred metres) for other stations to be the nearest ones. */
export function movedFar(from: Position, to: Position): boolean {
  // In thousandths of a degree, since 59.931 - 59.929 is not exactly 0.002; a degree of longitude is about half as long as one of latitude this far north.
  return Math.round(Math.abs(from.lat - to.lat) * 1000) >= 2 || Math.round(Math.abs(from.lon - to.lon) * 1000) >= 4
}

/** The cookie that holds the name of a place searched for and chosen in the settings; while it is there, the position is that place and not the device's, so the page does not follow the device. */
export const PLACE_COOKIE = "startside-sted"

/** The chosen place's name from its cookie; nothing when the position is the device's. */
export function parsePlaceName(value: string | undefined): string | null {
  if (value === undefined || value === "") return null
  try {
    const name = decodeURIComponent(value).trim().slice(0, 80)
    return name === "" ? null : name
  } catch {
    return null
  }
}

/** A place in a search's answer, as the form sends it: `lat,lon|name`. */
export function formatChosenPlace(position: Position, name: string): string {
  return `${formatPosition(roundPosition(position))}|${name}`
}

/** The place the form sent (`formatChosenPlace`), or nothing for anything else. */
export function parseChosenPlace(value: string | undefined): { position: Position; name: string } | null {
  if (value === undefined) return null
  const at = value.indexOf("|")
  if (at === -1) return null
  const position = parsePosition(value.slice(0, at))
  const name = value.slice(at + 1).trim().slice(0, 80)
  return position === null || name === "" ? null : { position, name }
}

const YEAR = 60 * 60 * 24 * 365

/** The `Set-Cookie`s that keep a chosen place for a year: its position and its name. */
export function chosenPlaceCookies({ position, name }: { position: Position; name: string }, path: string): string[] {
  return [
    `${POSITION_COOKIE}=${formatPosition(position)}; Path=${path}; Max-Age=${YEAR}; SameSite=Lax; Secure`,
    `${PLACE_COOKIE}=${encodeURIComponent(name)}; Path=${path}; Max-Age=${YEAR}; SameSite=Lax; Secure`,
  ]
}
