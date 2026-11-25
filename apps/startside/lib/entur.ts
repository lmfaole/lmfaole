import { upstream } from "./upstream"
import type { Position } from "./position"
import { isJourneyId, modeOf, noticeOf, type Departure, type Stop, type TripStop } from "./transit"

const JOURNEY_PLANNER = "https://api.entur.io/journey-planner/v3/graphql"
const HEADERS = { "ET-Client-Name": "lmfaole-startside" }

async function ask<T>(query: string, revalidate: number): Promise<T> {
  const response = await upstream(JOURNEY_PLANNER, { headers: HEADERS, revalidate, json: { query } })
  if (!response.ok) throw new Error(`Entur svarte ${response.status}`)
  const body = (await response.json()) as { data?: T; errors?: { message: string }[] }
  if (body.data === undefined) throw new Error(body.errors?.[0]?.message ?? "Entur svarte uten data")
  return body.data
}

interface Call {
  expectedDepartureTime: string
  aimedDepartureTime: string
  cancellation: boolean
  realtime: boolean
  quay: { publicCode: string | null } | null
  situations: { summary: { value: string; language: string | null }[] }[]
  destinationDisplay: { frontText: string } | null
  serviceJourney: { id?: string | null; line: { publicCode: string | null; transportMode: string | null } }
}

interface NearestResult {
  nearest: { edges: { node: { distance: number; place: { id?: string; name?: string; latitude?: number | null; longitude?: number | null; estimatedCalls?: Call[] } } }[] }
}

function departureOf(call: Call, stop: string, distance: number): Departure {
  const quay = call.quay?.publicCode?.trim() ?? ""
  return {
    time: call.expectedDepartureTime,
    aimed: call.aimedDepartureTime,
    cancelled: call.cancellation,
    quay: quay === "" ? null : quay,
    notice: noticeOf(call.situations),
    line: call.serviceJourney.line.publicCode ?? "",
    destination: call.destinationDisplay?.frontText ?? "",
    mode: modeOf(call.serviceJourney.line.transportMode),
    realtime: call.realtime,
    stop,
    distance,
    journey: call.serviceJourney.id ?? null,
  }
}

const CALL_FIELDS = "expectedDepartureTime aimedDepartureTime cancellation realtime quay{publicCode} situations{ summary{value language} } destinationDisplay{frontText} serviceJourney{ id line{publicCode transportMode} }"

/** How far ahead a stop's own page looks, in seconds, and how many departures it asks for at most. */
const STOP_RANGE = 3 * 3600
const STOP_DEPARTURES = 200

interface StopPlaceResult {
  stopPlace: { id: string; name: string; latitude?: number | null; longitude?: number | null; estimatedCalls: Call[] } | null
}

/** One stop with every departure of the next three hours (Entur's Journey Planner), for its own page; null when Entur has no such stop. `id` is checked by `stopIdOf`. */
export async function getStop(id: string): Promise<Stop | null> {
  const data = await ask<StopPlaceResult>(`{ stopPlace(id:"${id}"){ id name latitude longitude estimatedCalls(numberOfDepartures:${STOP_DEPARTURES},timeRange:${STOP_RANGE}){ ${CALL_FIELDS} } } }`, 30)
  const place = data.stopPlace
  if (place === null) return null
  const { latitude, longitude } = place
  return { id: place.id, name: place.name, distance: 0, at: typeof latitude === "number" && typeof longitude === "number" ? { lat: latitude, lon: longitude } : null, departures: place.estimatedCalls.map((call) => departureOf(call, place.name, 0)) }
}

/** The stops around a position with their next departures (Entur's Journey Planner), the nearest first. Stops with nothing leaving are left out. */
export async function getStops(position: Position, radius: number): Promise<Stop[]> {
  const data = await ask<NearestResult>(
    `{ nearest(latitude:${position.lat},longitude:${position.lon},maximumDistance:${radius},maximumResults:8,filterByPlaceTypes:[stopPlace]){ edges{ node{ distance place{ ... on StopPlace{ id name latitude longitude estimatedCalls(numberOfDepartures:20,timeRange:3600){ ${CALL_FIELDS} } } } } } } }`,
    30,
  )
  return data.nearest.edges.flatMap(({ node }): Stop[] => {
    const { id, name, latitude, longitude, estimatedCalls } = node.place
    if (id === undefined || name === undefined || estimatedCalls === undefined || estimatedCalls.length === 0) return []
    const departures = estimatedCalls.map((call) => departureOf(call, name, node.distance))
    const at = typeof latitude === "number" && typeof longitude === "number" ? { lat: latitude, lon: longitude } : null
    return [{ id, name, distance: node.distance, at, departures }]
  })
}

interface TripCall {
  expectedDepartureTime: string
  aimedDepartureTime: string
  expectedArrivalTime: string
  aimedArrivalTime: string
  cancellation: boolean
  quay: { stopPlace: { id: string; name: string } | null } | null
}

/** Every stop of one trip in the order it calls, with real-time times (Entur's Journey Planner); null when Entur has no such trip or `id` is not one. */
export async function getTrip(id: string): Promise<TripStop[] | null> {
  if (!isJourneyId(id)) return null
  const data = await ask<{ serviceJourney: { estimatedCalls: TripCall[] | null } | null }>(
    `{ serviceJourney(id:"${id}"){ estimatedCalls{ expectedDepartureTime aimedDepartureTime expectedArrivalTime aimedArrivalTime cancellation quay{ stopPlace{ id name } } } } }`,
    30,
  )
  const calls = data.serviceJourney?.estimatedCalls
  if (calls === null || calls === undefined || calls.length === 0) return null
  return calls.flatMap((call, index) => {
    const place = call.quay?.stopPlace
    if (place === null || place === undefined) return []
    const last = index === calls.length - 1
    return [{ id: place.id, name: place.name, expected: last ? call.expectedArrivalTime : call.expectedDepartureTime, aimed: last ? call.aimedArrivalTime : call.aimedDepartureTime, cancelled: call.cancellation }]
  })
}
