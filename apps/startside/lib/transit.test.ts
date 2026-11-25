import { strict as assert } from "node:assert"
import { test } from "node:test"

import { destinationsOf, isJourneyId, lineOf, linePath, linesOf, modeOf, noticeOf, shownTrip, stopIdOf, stopPath, toBoard, tripPosition, walkMinutesOver, type Departure, type TripStop } from "./transit.ts"

const departure = (time: string, more: Partial<Departure> = {}): Departure => ({ time, aimed: time, cancelled: false, quay: null, notice: null, line: "1", destination: "X", mode: "bus", realtime: true, stop: "A", distance: 0, ...more })

test("Entur's modes: trains, boats and coaches have their own, anything unknown is other", () => {
  assert.deepEqual(["foot", "coach", "rail", "water", "metro", "air", null].map(modeOf), ["walk", "bus", "rail", "ferry", "metro", "other", "other"])
})

test("the notice of a departure is the Norwegian summary of its first situation, else the first one there is", () => {
  assert.equal(noticeOf([{ summary: [{ value: "Cancelled", language: "en" }, { value: "Innstilt ", language: "no" }] }]), "Innstilt")
  assert.equal(noticeOf([{ summary: [{ value: " ", language: "nob" }, { value: "Delayed", language: "en" }] }]), "Delayed")
  assert.equal(noticeOf([]), null)
})

test("a departure for the board has its times, its state and only the details it has", () => {
  const late = departure("2026-11-18T20:59:00+01:00", { aimed: "2026-11-18T20:55:00+01:00", quay: "B", mode: "walk" })
  assert.deepEqual(toBoard(late, "k"), { key: "k", line: "1", mode: "other", destination: "X", expected: "2026-11-18T20:59:00+01:00", aimed: "2026-11-18T20:55:00+01:00", realtime: true, quay: "B" })
  const gone = toBoard(departure("2026-11-18T20:55:00+01:00", { cancelled: true, notice: "Innstilt" }))
  assert.deepEqual([gone.cancelled, gone.notice, "quay" in gone], [true, "Innstilt", false])
  assert.notEqual(gone.key, toBoard(departure("2026-11-18T21:05:00+01:00")).key)
})

test("the walk to a stop is about a metre a second, and never under a minute", () => {
  assert.equal(walkMinutesOver(590), 10)
  assert.equal(walkMinutesOver(10), 1)
})

test("a stop's address carries the register's number alone, any other id encoded, and reads back to the id", () => {
  assert.equal(stopPath("NSR:StopPlace:58366"), "/transport/58366")
  assert.equal(stopPath("MOCK:StopPlace:grunerlokka-stasjon"), "/transport/MOCK%3AStopPlace%3Agrunerlokka-stasjon")
  assert.equal(stopIdOf("58366"), "NSR:StopPlace:58366")
  assert.equal(stopIdOf("MOCK%3AStopPlace%3Agrunerlokka-stasjon"), "MOCK:StopPlace:grunerlokka-stasjon")
  assert.equal(stopIdOf("MOCK:StopPlace:grunerlokka-stasjon"), "MOCK:StopPlace:grunerlokka-stasjon")
})

test("an address that is no stop id is refused, so nothing else reaches the query", () => {
  assert.deepEqual(['NSR:StopPlace:1"){x}', "%E0%A4%A", "abc", ""].map(stopIdOf), [null, null, null, null])
})

test("the lines of a stop are listed once each, in the order of their numbers", () => {
  const lines = linesOf([departure("t", { line: "31" }), departure("t", { line: "2", mode: "tram" }), departure("t", { line: "31" }), departure("t", { line: "RE11", mode: "rail" }), departure("t", { line: "10" })])
  assert.deepEqual(lines, [{ line: "2", mode: "tram" }, { line: "10", mode: "bus" }, { line: "31", mode: "bus" }, { line: "RE11", mode: "rail" }])
})

test("a line's page is under its stop, and its address reads back to the line", () => {
  assert.equal(linePath("NSR:StopPlace:58366", "RE11"), "/transport/58366/RE11")
  assert.deepEqual(["31", "RE11", "N%C3%B830", "FB2"].map(lineOf), ["31", "RE11", "Nø30", "FB2"])
  assert.deepEqual(['31"}', "", "%E0%A4%A", "a".repeat(13)].map(lineOf), [null, null, null, null])
})

test("the destinations of a line from a stop, each once, the soonest first", () => {
  assert.deepEqual(destinationsOf([departure("1", { destination: "Fornebu" }), departure("2", { destination: "Tonsenhagen" }), departure("3", { destination: "Fornebu" })]), ["Fornebu", "Tonsenhagen"])
})

test("a trip's id is asked for only as Entur writes one", () => {
  assert.deepEqual(["RUT:ServiceJourney:d205d3a9", "VYG:ServiceJourney:1-2.3", 'RUT:ServiceJourney:x"){', "NSR:StopPlace:1", null, undefined].map(isJourneyId), [true, true, false, false, false, false])
})

test("the trip shown for a way is the next not cancelled with a trip, else the next", () => {
  const cancelled = departure("t1", { cancelled: true, journey: "RUT:ServiceJourney:a" })
  const without = departure("t2", { journey: null })
  const next = departure("t3", { journey: "RUT:ServiceJourney:c" })
  assert.equal(shownTrip([cancelled, without, next]), next)
  assert.equal(shownTrip([cancelled, without]), cancelled)
  assert.equal(shownTrip([]), undefined)
})

test("the stop is found on the trip by its id, else by its name, else the trip is shown from its start", () => {
  const trip: TripStop[] = ["A", "B", "C"].map((name) => ({ id: `NSR:StopPlace:${name}`, name, expected: "", aimed: "", cancelled: false }))
  assert.equal(tripPosition(trip, { id: "NSR:StopPlace:B", name: "x" }), 1)
  assert.equal(tripPosition(trip, { id: "NSR:StopPlace:9", name: "C" }), 2)
  assert.equal(tripPosition(trip, { id: "NSR:StopPlace:9", name: "Z" }), 0)
})
