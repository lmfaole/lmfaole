import { strict as assert } from "node:assert"
import { test } from "node:test"

import { artistFigures, artistKind, coversFromPlays, listeningChartText, listeningPeriods, placeAmong, playsIn, shareText, similarHeard, tracksBy } from "./artist-listening.ts"
import { osloMidnight } from "./weeks.ts"

test("the stretches since the user started are the finest of month, quarter, half-year and year that make at most 24, on the calendar's boundaries in Oslo, end to start", () => {
  const months = listeningPeriods(osloMidnight(2025, 3, 10), Date.UTC(2026, 10, 21, 12))
  assert.equal(months.unit, "month")
  assert.equal(months.periods.length, 21)
  assert.deepEqual([months.periods[0]?.label, months.periods[0]?.long, months.periods[0]?.start], ["mars 2025", "mars 2025", osloMidnight(2025, 3, 1)])
  assert.equal(months.periods.at(-1)?.label, "nov. 2026")
  assert.equal(months.periods.at(-1)?.end, osloMidnight(2026, 12, 1))
  assert.ok(months.periods.every((one, index) => index === 0 || one.start === months.periods[index - 1]?.end))
  const quarters = listeningPeriods(osloMidnight(2022, 2, 1), Date.UTC(2026, 10, 21, 12))
  assert.equal(quarters.unit, "quarter")
  assert.deepEqual([quarters.periods[0]?.label, quarters.periods[0]?.long, quarters.periods[0]?.start], ["1. kv. 2022", "1. kvartal 2022", osloMidnight(2022, 1, 1)])
  assert.equal(quarters.periods.length, 20)
  assert.equal(quarters.periods.at(-1)?.end, osloMidnight(2027, 1, 1))
  const halves = listeningPeriods(osloMidnight(2018, 8, 1), Date.UTC(2026, 10, 21, 12))
  assert.equal(halves.unit, "half")
  assert.deepEqual(halves.periods.map((one) => one.label).slice(0, 2), ["2. halvår 2018", "1. halvår 2019"])
  const years = listeningPeriods(osloMidnight(2000, 1, 1), Date.UTC(2026, 10, 21, 12))
  assert.equal(years.unit, "year")
  assert.equal(years.periods.length, 24)
  assert.deepEqual([years.periods[0]?.label, years.periods.at(-1)?.label], ["2003", "2026"])
})

test("an artist's plays in a chart are found whatever the case, and are 0 where it is not in it", () => {
  const chart = [{ name: "AURORA", plays: 12, rank: 1 }]
  assert.equal(playsIn(chart, "Aurora"), 12)
  assert.equal(playsIn(chart, "Sigrid"), 0)
})

test("the place among all the user has heard, and its share, written in Norwegian", () => {
  const top = [{ name: "a-ha", plays: 900, url: "" }, { name: "Sigrid", plays: 310, url: "" }]
  assert.deepEqual(placeAmong(top, "sigrid", 10000), { rank: 2, plays: 310, share: 0.031 })
  assert.equal(placeAmong(top, "Sigrid", null)?.share, null)
  assert.equal(placeAmong(top, "Aurora", 10000), null)
  assert.equal(shareText(0.031), "3,1 %")
  assert.equal(shareText(0.256), "26 %")
  assert.equal(shareText(0.0004), "under 0,1 %")
})

test("the user's songs by the artist, and the artists like it that they play too, the most alike first", () => {
  const tracks = [{ title: "Take On Me", artist: "a-ha", plays: 40, url: "" }, { title: "Strangers", artist: "Sigrid", plays: 30, url: "" }, { title: "The Sun Always Shines on T.V.", artist: "A-ha", plays: 20, url: "" }]
  assert.deepEqual(tracksBy(tracks, "a-ha").map((one) => one.title), ["Take On Me", "The Sun Always Shines on T.V."])
  const similar = [{ name: "Unheard", match: 1, url: "" }, { name: "sigrid", match: 0.8, url: "u" }, { name: "a-ha", match: 0.7, url: "" }, { name: "Aurora", match: 0.5, url: "" }]
  const top = [{ name: "a-ha", plays: 1, url: "" }, { name: "Aurora", plays: 5, url: "" }, { name: "Sigrid", plays: 9, url: "s" }]
  assert.deepEqual(similarHeard(similar, top, "a-ha"), [{ name: "Sigrid", plays: 9, url: "s" }, { name: "Aurora", plays: 5, url: "" }])
  assert.equal(similarHeard(similar, top, "a-ha", 1).length, 1)
})

test("the head says the artist's place in words, and its plays, share of all and plays last month as figures", () => {
  assert.equal(artistKind(null), "Artist")
  assert.equal(artistKind(1), "Din mest spilte artist")
  assert.equal(artistKind(4), "Din fjerde mest spilte artist")
  assert.equal(artistKind(1042), `Nr. ${(1042).toLocaleString("nb-NO")} av artistene dine`)
  assert.deepEqual(artistFigures(1234, 0.031, 56), [{ value: (1234).toLocaleString("nb-NO"), label: "avspillinger" }, { value: "3,1 %", label: "av alt du har hørt" }, { value: "56", label: "siste måned" }])
  assert.deepEqual(artistFigures(1, null, null), [{ value: "1", label: "avspilling" }])
  assert.deepEqual(artistFigures(null, null, 1), [{ value: "1", label: "siste måned" }])
})

test("the chart over time says when it was first played, when most and how much now; and that it started before the history where it did", () => {
  const series = [{ long: "1. kvartal 2022", plays: 0 }, { long: "2. kvartal 2022", plays: 0 }, { long: "3. kvartal 2022", plays: 12 }, { long: "4. kvartal 2022", plays: 40 }, { long: "1. kvartal 2023", plays: 7 }]
  assert.deepEqual(listeningChartText("quarter", series), {
    title: "Mest spilt i 4. kvartal 2022",
    description: "Avspillinger per kvartal, 1. kvartal 2022 til 1. kvartal 2023.",
    summary: "Arealdiagram. Først spilt i 3. kvartal 2022, mest i 4. kvartal 2022 (40 avspillinger), 7 avspillinger hittil i 1. kvartal 2023.",
  })
  assert.equal(listeningChartText("year", [{ long: "2025", plays: 3 }, { long: "2026", plays: 9 }])?.summary, "Arealdiagram. Spilt alt i 2025, da historikken din på Last.fm begynner, mest hittil i 2026 (9 avspillinger).")
  assert.equal(listeningChartText("month", [{ long: "mai 2026", plays: 0 }, { long: "juni 2026", plays: 0 }])?.title, "Ikke spilt i perioden")
  assert.equal(listeningChartText("month", [{ long: "mai 2026", plays: 4 }]), null)
})

test("a song's cover is the one its recent plays carry, whatever the case of its title; a song not played lately, or played with no cover, has none", () => {
  const play = (track: string, artist: string, image: string | null) => ({ track, artist, album: "A", image, url: "", playedAt: null })
  const plays = [play("Eple", "Röyksopp", "new.jpg"), play("eple", "Röyksopp", "old.jpg"), play("Eple", "Other", "x.jpg"), play("Sparks", "röyksopp", null)]
  assert.deepEqual([...coversFromPlays(plays, "Röyksopp", ["Eple", "Sparks", "Poor Leno"])], [["Eple", "new.jpg"]])
})
