/**
 * Oslo Bysykkel (GBFS, from Urban Sharing; NLOD): the stations near a position with the bikes and the free docks there now. Outside Oslo there is
 * none within reach and nothing is shown. Pure: the two feeds in, the stations out.
 */
import type { Position } from "./position.ts"

/** How far is near, in metres: about five minutes on foot. */
export const BIKE_RADIUS = 500
export const BIKE_FEEDS = { information: "https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json", status: "https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json" } as const
export const BIKE_CREDIT = { text: "Sanntidsdata fra Oslo Bysykkel (NLOD)", href: "https://oslobysykkel.no/apne-data/sanntid" } as const

export interface BikeStation {
  id: string
  name: string
  /** Metres from the position, as the crow flies. */
  distance: number
  /** Where the station is, for its map. */
  lat: number
  lon: number
  bikes: number
  docks: number
  /** Whether bikes can be taken and left there now. */
  renting: boolean
  returning: boolean
}

interface Info {
  data?: { stations?: { station_id?: string; name?: string; lat?: number; lon?: number }[] }
}
interface Status {
  data?: { stations?: { station_id?: string; num_bikes_available?: number; num_docks_available?: number; is_renting?: boolean | number; is_returning?: boolean | number; is_installed?: boolean | number }[] }
}

/** The distance between two positions in metres (haversine). */
export function metresBetween(a: Position, b: Position): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h))
}

/** The installed stations within `radius` of the position, nearest first, at most `limit`. */
export function nearbyBikes(information: unknown, status: unknown, position: Position, radius = BIKE_RADIUS, limit = 3): BikeStation[] {
  const states = new Map(((status as Status | null)?.data?.stations ?? []).map((one) => [one.station_id, one]))
  return ((information as Info | null)?.data?.stations ?? [])
    .flatMap((station): BikeStation[] => {
      if (typeof station.station_id !== "string" || typeof station.lat !== "number" || typeof station.lon !== "number") return []
      const distance = metresBetween(position, { lat: station.lat, lon: station.lon })
      const state = states.get(station.station_id)
      if (distance > radius || state === undefined || state.is_installed === false || state.is_installed === 0) return []
      return [
        {
          id: station.station_id,
          name: station.name ?? station.station_id,
          distance: Math.round(distance),
          lat: station.lat,
          lon: station.lon,
          bikes: state.num_bikes_available ?? 0,
          docks: state.num_docks_available ?? 0,
          renting: Boolean(state.is_renting ?? true),
          returning: Boolean(state.is_returning ?? true),
        },
      ]
    })
    .toSorted((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

/** «3 sykler · 12 ledige plasser», with «ingen» rather than 0, and what is closed said so. */
export function bikeLine(station: Pick<BikeStation, "bikes" | "docks" | "renting" | "returning">): string {
  const bikes = !station.renting ? "utlån stengt" : station.bikes === 0 ? "ingen sykler" : station.bikes === 1 ? "1 sykkel" : `${station.bikes} sykler`
  const docks = !station.returning ? "innlevering stengt" : station.docks === 0 ? "ingen ledige plasser" : station.docks === 1 ? "1 ledig plass" : `${station.docks} ledige plasser`
  return `${bikes} · ${docks}`
}
