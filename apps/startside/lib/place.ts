import { upstream } from "./upstream"

interface Reverse {
  address?: { city?: string; town?: string; village?: string; suburb?: string; municipality?: string; county?: string }
}

/** The name of the place at a position (OpenStreetMap's Nominatim, through the relay, kept a day), or nothing when it cannot be found. Asked with two decimals (`coarsePosition`), so there are few to ask for. */
export async function placeName(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await upstream(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=nb&lat=${lat}&lon=${lon}`, {
      headers: { "User-Agent": "startside github.com/lmfaole/lmfaole" },
      revalidate: 86_400,
    })
    if (!response.ok) return null
    const { address } = (await response.json()) as Reverse
    return address?.city ?? address?.town ?? address?.village ?? address?.suburb ?? address?.municipality ?? address?.county ?? null
  } catch {
    return null
  }
}
