import { strict as assert } from "node:assert"
import { test } from "node:test"

import { concertDate, latestSetlist, parseSetlists, placeOf, setlistsUrl } from "./setlistfm.ts"

const artist = { mbid: "a74b1b7f-71a5-4011-9441-d0b5e4122711", name: "Radiohead", url: "https://www.setlist.fm/setlists/radiohead-bd6bd12.html" }
const venue = (name: string, city: string, country: string) => ({ name, city: { name: city, country: { code: "XX", name: country } } })
const ANSWER = {
  type: "setlists",
  setlist: [
    { id: "coming", eventDate: "01-06-2026", artist, venue: venue("Spektrum", "Oslo", "Norway"), url: "https://www.setlist.fm/setlist/coming.html", sets: { set: [] } },
    { id: "b", eventDate: "15-12-2025", artist, venue: venue("Royal Arena", "Copenhagen", "Denmark"), tour: { name: "2025 Tour" }, url: "https://www.setlist.fm/setlist/b.html", sets: { set: [] } },
    {
      id: "a",
      eventDate: "12-12-2025",
      artist,
      venue: venue("Uber Arena", "Berlin", "Germany"),
      url: "https://www.setlist.fm/setlist/a.html",
      sets: { set: [{ song: [{ name: "2 + 2 = 5" }, { name: "Airbag", info: "acoustic" }, { name: "" }] }, { encore: 1, song: [{ name: "Karma Police" }] }] },
    },
    { id: "bad", eventDate: "2025-12-01", artist, venue: venue("X", "Y", "Z"), url: "https://www.setlist.fm/setlist/bad.html" },
  ],
}

test("an artist's setlists are asked for by its MusicBrainz id", () => {
  assert.equal(setlistsUrl("a74b1b7f-71a5-4011-9441-d0b5e4122711"), "https://api.setlist.fm/rest/1.0/artist/a74b1b7f-71a5-4011-9441-d0b5e4122711/setlists?p=1")
  assert.equal(concertDate("16-12-2025"), "2025-12-16")
  assert.equal(concertDate("2025-12-16"), null)
})

test("the concerts that have been are kept, newest first, as setlist.fm names them, with the songs in order and the encores marked", () => {
  const setlists = parseSetlists(ANSWER, "2026-01-10")
  assert.equal(setlists?.url, artist.url)
  assert.deepEqual(setlists?.concerts.map((one) => one.id), ["b", "a"])
  assert.equal(setlists?.concerts[0]?.tour, "2025 Tour")
  assert.equal(placeOf(setlists?.concerts[0] ?? { venue: "", city: "", country: "" }), "Royal Arena, Copenhagen, Denmark")
  const latest = setlists === null ? null : latestSetlist(setlists)
  assert.equal(latest?.id, "a")
  assert.deepEqual(latest?.songs, [
    { name: "2 + 2 = 5", encore: false },
    { name: "Airbag", encore: false },
    { name: "Karma Police", encore: true },
  ])
})

test("no concert that has been, or an answer that is not one, is none", () => {
  assert.equal(parseSetlists(ANSWER, "2025-01-01"), null)
  assert.equal(parseSetlists({ code: 404, message: "not found" }, "2026-01-10"), null)
})
