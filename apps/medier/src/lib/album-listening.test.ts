import { strict as assert } from "node:assert"
import { test } from "node:test"

import { aboutText, albumChartUrl, albumDayCounts, albumDaysText, albumFigures, albumPlaysIn, albumSeconds, allTimeAlbumsUrl, discographyChartText, discographyPlays, durationText, listenedSeconds, parseAlbumChart, parseTopAlbumsOfUser, trackPlays } from "./album-listening.ts"
import { parseMonth, type Month } from "./months.ts"

test("the weekly album chart is read, and an album's plays count every edition of it by the artist whatever its case", () => {
  assert.equal(albumChartUrl("B", 10, 20), "B&method=user.getweeklyalbumchart&from=10&to=20")
  const chart = parseAlbumChart({
    weeklyalbumchart: {
      album: [
        { name: "Junior", artist: { "#text": "Röyksopp" }, playcount: "12" },
        { name: "Junior (Deluxe Edition)", artist: { "#text": "RÖYKSOPP" }, playcount: "3" },
        { name: "Junior", artist: { "#text": "Someone Else" }, playcount: "40" },
        { name: "", artist: { "#text": "Röyksopp" }, playcount: "9" },
      ],
    },
  })
  assert.equal(chart.length, 3)
  assert.equal(albumPlaysIn(chart, "Röyksopp", "Junior"), 15)
  assert.equal(albumPlaysIn(chart, "Röyksopp", "Melody A.M."), 0)
  assert.deepEqual(parseAlbumChart({ error: 6 }), [])
})

test("a track's plays come from the top songs by the artist, matched by title whatever its edition; one not among them is left out", () => {
  const top = [
    { title: "Eple", artist: "Röyksopp", plays: 30, url: "" },
    { title: "Eple - Remastered", artist: "Röyksopp", plays: 2, url: "" },
    { title: "So Easy", artist: "Röyksopp", plays: 12, url: "" },
    { title: "Eple", artist: "Other", plays: 99, url: "" },
  ]
  const plays = trackPlays(top, "röyksopp", ["So Easy", "Eple", "Sparks"])
  assert.deepEqual([...plays], [["So Easy", 12], ["Eple", 32]])
})

test("the length is only told where every track's is known", () => {
  assert.equal(albumSeconds([{ seconds: 200 }, { seconds: 100 }]), 300)
  assert.equal(albumSeconds([{ seconds: 200 }, { seconds: null }]), null)
  assert.equal(albumSeconds([]), null)
})

test("the time listened is the plays times a play's length, weighted by the tracks played most, and not guessed from too little", () => {
  const tracks = [{ title: "A", seconds: 100 }, { title: "B", seconds: 300 }, { title: "C", seconds: null }]
  assert.equal(listenedSeconds(tracks, 10, new Map()), 10 * 200)
  assert.equal(listenedSeconds(tracks, 10, new Map([["A", 3], ["B", 1]])), 10 * 150)
  assert.equal(listenedSeconds(tracks, 2, new Map()), null)
  assert.equal(listenedSeconds(tracks, null, new Map()), null)
  assert.equal(listenedSeconds([{ title: "A", seconds: 100 }, { title: "B", seconds: null }, { title: "C", seconds: null }], 10, new Map()), null)
})

test("lengths and about-times are said as a person would", () => {
  assert.equal(durationText(47 * 60 + 10), "47 min")
  assert.equal(durationText(72 * 60), "1 t 12 min")
  assert.equal(durationText(120 * 60), "2 t")
  assert.equal(aboutText(41 * 60), "omtrent 40 min")
  assert.equal(aboutText(60), "omtrent 5 min")
  assert.equal(aboutText(6.2 * 3600), "omtrent 6 t")
  assert.equal(aboutText(6.3 * 3600), "omtrent 6,5 t")
  assert.equal(aboutText(123.4 * 3600), "omtrent 123 t")
})

test("the user's albums of all time are read from one shared answer, and each studio album gets their plays of every edition of it, 0 where it is not among them", () => {
  assert.equal(allTimeAlbumsUrl("B"), "B&method=user.gettopalbums&period=overall&limit=1000")
  const top = parseTopAlbumsOfUser({
    topalbums: {
      album: [
        { name: "Melody A.M.", artist: { name: "Röyksopp" }, playcount: "120" },
        { name: "Junior (Deluxe)", artist: { name: "röyksopp" }, playcount: "30" },
        { name: "Junior", artist: { name: "Röyksopp" }, playcount: "60" },
        { name: "", artist: { name: "Röyksopp" }, playcount: "5" },
      ],
    },
  })
  assert.equal(top.length, 3)
  assert.deepEqual(parseTopAlbumsOfUser({ error: 6 }), [])
  const studio = [
    { title: "Melody A.M.", released: "2001-09-03" },
    { title: "The Understanding", released: "2005-07-11" },
    { title: "Junior", released: "2009-03-20" },
  ]
  assert.deepEqual(
    discographyPlays(studio, top, "Röyksopp").map((album) => album.plays),
    [120, 0, 90],
  )
})

test("the chart of the discography says where this album is among them, what is counted and over what time; with too few albums or none played there is no chart", () => {
  const albums = [
    { title: "Melody A.M.", released: "2001-09-03", plays: 120 },
    { title: "The Understanding", released: "2005-07-11", plays: 0 },
    { title: "Junior", released: "2009-03-20", plays: 90 },
  ]
  const most = discographyChartText(albums, "Melody A.M.", "Röyksopp")
  assert.equal(most?.title, "Melody A.M. er det mest spilte albumet av Röyksopp")
  assert.equal(most?.highlight, "Melody A.M.")
  assert.match(most?.description ?? "", /3 studioalbumene, 2001–2009, eldste først/)
  assert.equal(discographyChartText(albums, "Junior (Deluxe)", "Röyksopp")?.title, "Junior er det nest mest spilte albumet av Röyksopp")
  assert.equal(discographyChartText(albums, "The Understanding", "Röyksopp")?.title, "The Understanding er ikke spilt, men Melody A.M. er spilt mest")
  assert.match(discographyChartText(albums, "Junior", "Röyksopp")?.summary ?? "", /Junior: 90 avspillinger, nummer 2 av 3/)
  assert.equal(discographyChartText(albums.slice(0, 2), "Melody A.M.", "Röyksopp"), null)
  assert.equal(discographyChartText(albums, "Senior", "Röyksopp"), null)
  assert.equal(discographyChartText(albums.map((album) => ({ ...album, plays: 0 })), "Junior", "Röyksopp"), null)
})

test("the head's figures are the plays, about how long, and the share of the artist; a figure that is not known is left out", () => {
  assert.deepEqual(albumFigures(1204, 6 * 3600, 3168), [
    { value: "1\u00a0204", label: "avspillinger" },
    { value: "6 t", label: "lyttetid, omtrent" },
    { value: "38 %", label: "av avspillingene av artisten" },
  ])
  assert.deepEqual(albumFigures(1, null, null), [{ value: "1", label: "avspilling" }])
  assert.equal(albumFigures(10, null, 5).length, 1)
})

test("the days an album was played are counted on their date in Oslo, every day of the months read gets a row, and none after today", () => {
  const months = ["2026-01", "2026-02"].map((id) => parseMonth(id) as Month)
  const play = (playedAt: string, album = "Junior", artist = "Röyksopp") => ({ track: "Happy Up Here", artist, album, image: null, url: "", playedAt })
  const days = albumDayCounts(
    months,
    [play("2026-01-31T23:30:00Z"), play("2026-02-01T10:00:00Z", "Junior (Deluxe)"), play("2026-02-02T10:00:00Z", "Senior"), play("2026-02-02T11:00:00Z", "Junior", "Other"), play("2026-01-05T08:00:00Z")],
    "röyksopp",
    "Junior",
    "2026-02-10",
  )
  assert.equal(days.length, 31 + 10)
  assert.equal(days[0]?.date, "2026-01-01")
  assert.equal(days.at(-1)?.date, "2026-02-10")
  assert.equal(days.find((day) => day.date === "2026-02-01")?.value, 2)
  assert.equal(days.find((day) => day.date === "2026-01-05")?.value, 1)
  assert.equal(days.reduce((sum, day) => sum + day.value, 0), 3)
  assert.deepEqual(albumDayCounts([], [], "Röyksopp", "Junior", "2026-02-10"), [])

  const text = albumDaysText(days, "Junior")
  assert.equal(text?.title, "Junior er spilt 2 dager i det siste")
  assert.match(text?.description ?? "", /fra 1\. januar 2026 til 10\. februar 2026: 3 avspillinger i alt/)
  assert.equal(albumDaysText(days.map((day) => ({ ...day, value: 0 })), "Junior")?.title, "Junior er ikke spilt i det siste")
  assert.equal(albumDaysText([], "Junior"), null)
})
