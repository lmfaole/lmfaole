/**
 * The moon (MET's Sunrise 3.0, `/moon`): its phase, how much of it is lit, and when it rises and sets. A bright moon washes out a weak aurora, so
 * the weather page says it beside the northern lights. Pure: the answer in, the words out.
 */

export interface Moon {
  /** 0 is new, 90 the first quarter, 180 full, 270 the last quarter (MET's `moonphase`, in degrees). */
  phase: number
  rise: string | null
  set: string | null
}

interface Answer {
  properties?: { moonphase?: number; moonrise?: { time?: string | null } | null; moonset?: { time?: string | null } | null }
}

export function parseMoon(body: unknown): Moon | null {
  const p = (body as Answer | null)?.properties
  if (p === undefined || typeof p.moonphase !== "number") return null
  return { phase: p.moonphase, rise: p.moonrise?.time ?? null, set: p.moonset?.time ?? null }
}

/** How much of the disc is lit, 0 to 1. */
export const litFraction = (phase: number): number => (1 - Math.cos((phase * Math.PI) / 180)) / 2

/** The phase in words: «Nymåne», «Voksende», «Fullmåne», «Minkende», with the quarters on the way. */
export function phaseName(phase: number): string {
  const p = ((phase % 360) + 360) % 360
  if (p < 11.25 || p >= 348.75) return "Nymåne"
  if (p < 78.75) return "Voksende månesigd"
  if (p < 101.25) return "Første kvarter"
  if (p < 168.75) return "Voksende måne"
  if (p < 191.25) return "Fullmåne"
  if (p < 258.75) return "Minkende måne"
  if (p < 281.25) return "Siste kvarter"
  return "Minkende månesigd"
}

/** What the moon does to the northern lights tonight: a moon more than half lit drowns the weak ones. */
export function moonForAurora(phase: number): string | null {
  const lit = litFraction(phase)
  if (lit >= 0.75) return "Sterkt måneskinn gjør svakt nordlys vanskelig å se."
  if (lit >= 0.4) return "Månen lyser en del, så svakt nordlys kan bli blekt."
  return lit <= 0.15 ? "Lite måneskinn: gode forhold for å se svakt nordlys." : null
}

/** The address of the moon for a date at a position (`date` is `YYYY-MM-DD`, `offset` Oslo's, «+01:00»). */
export const moonUrl = (lat: number, lon: number, date: string, offset: string): string => `https://api.met.no/weatherapi/sunrise/3.0/moon?lat=${lat}&lon=${lon}&date=${date}&offset=${encodeURIComponent(offset)}`
