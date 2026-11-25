import { placesFrom, type FoundPlace } from "./place-search"
import { upstream } from "./upstream"

interface Reverse {
  address?: { city?: string; town?: string; village?: string; suburb?: string; municipality?: string; county?: string }
}

/** The name of the place at a position (OpenStreetMap's Nominatim, through the relay), or nothing when it cannot be found. */
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

/** Places that match a search (OpenStreetMap's Nominatim, through the relay, Norwegian names first); nothing when the search fails. Only on a submitted search, never as one types, as Nominatim's terms ask. */
export async function searchPlaces(query: string): Promise<FoundPlace[] | null> {
  const q = query.trim().slice(0, 100)
  if (q === "") return []
  try {
    const response = await upstream(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&accept-language=nb&q=${encodeURIComponent(q)}`, {
      headers: { "User-Agent": "startside github.com/lmfaole/lmfaole" },
      revalidate: 86_400,
    })
    if (!response.ok) return null
    return placesFrom((await response.json()) as Parameters<typeof placesFrom>[0])
  } catch {
    return null
  }
}
