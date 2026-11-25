import { strict as assert } from "node:assert"
import { test } from "node:test"

import { albumInfoUrl, artistChartUrl, artistInfoUrl, parseArtistChart, parseRecentPage, parseTopAlbums, artistTopAlbumsUrl, playsInRangeUrl, firstSentences, parseAlbumInfo, parseArtistInfo, parseRecentTracks, parseTopArtists, parseTrackInfo, trackInfoUrl, parseUserInfo, parseTopTracks, parseSimilarArtists, similarArtistsUrl, allTimeTracksUrl } from "./lastfm.ts"

test("recent tracks: a played one has its time, the one playing now has none, an empty cover is null and a broken row is left out", () => {
  const plays = parseRecentTracks({
    recenttracks: {
      track: [
        { name: "Now", artist: { "#text": "A" }, album: { "#text": "X" }, image: [{ size: "small", "#text": "" }], url: "u0", "@attr": { nowplaying: "true" } },
        { name: "Then", artist: { "#text": "B" }, album: { "#text": "Y" }, image: [{ "#text": "s.jpg" }, { "#text": "l.jpg" }], url: "u1", date: { uts: "1763560800" } },
        { name: "", artist: { "#text": "C" } },
      ],
    },
  })
  assert.deepEqual(plays, [
    { track: "Now", artist: "A", album: "X", image: null, url: "u0", playedAt: null },
    { track: "Then", artist: "B", album: "Y", image: "l.jpg", url: "u1", playedAt: "2025-11-19T14:00:00.000Z" },
  ])
})

test("a single track comes as an object, not a list, and is read all the same; nothing at all is no plays", () => {
  assert.equal(parseRecentTracks({ recenttracks: { track: { name: "One", artist: { "#text": "A" }, date: { uts: "1" } } } }).length, 1)
  assert.deepEqual(parseRecentTracks({}), [])
})

test("top artists have their plays as numbers", () => {
  assert.deepEqual(parseTopArtists({ topartists: { artist: [{ name: "A", playcount: "42", url: "a" }, { name: "" }] } }), [{ name: "A", plays: 42, url: "a" }])
})

const BIO = "Troye Sivan is an Australian singer and actor. He rose to fame through YouTube. His debut album Blue Neighbourhood came out in 2015 &amp; was a hit. <a href=\"https://www.last.fm/music/Troye+Sivan\">Read more on Last.fm</a>. User-contributed text is available under the CC BY-SA License."

test("an artist's info is its tags, its listeners and the text before Last.fm's own link and licence line, as plain text", () => {
  const info = parseArtistInfo({ artist: { tags: { tag: [{ name: "pop" }, { name: "" }, { name: "lgbt" }] }, stats: { listeners: "1234567", userplaycount: "88" }, bio: { summary: BIO } } })
  assert.deepEqual(info.tags, ["pop", "lgbt"])
  assert.equal(info.listeners, 1234567)
  assert.equal(info.userPlays, 88)
  assert.equal(info.bio, "Troye Sivan is an Australian singer and actor. He rose to fame through YouTube. His debut album Blue Neighbourhood came out in 2015 & was a hit.")
  assert.ok(!info.bio?.includes("Read more") && !info.bio?.includes("CC BY-SA"))
})

test("an artist's MusicBrainz id is Last.fm's, when it is one", () => {
  assert.equal(parseArtistInfo({ artist: { mbid: "A74B1B7F-71A5-4011-9441-D0B5E4122711" } }).mbid, "a74b1b7f-71a5-4011-9441-d0b5e4122711")
  assert.equal(parseArtistInfo({ artist: { mbid: "" } }).mbid, null)
  assert.equal(parseArtistInfo({ artist: { mbid: "not-an-id" } }).mbid, null)
})

test("an artist Last.fm knows nothing of has no info, and a bio that is only the link is none", () => {
  assert.deepEqual(parseArtistInfo({ error: 6 }), { tags: [], listeners: null, userPlays: null, bio: null, mbid: null })
  assert.equal(parseArtistInfo({ artist: { bio: { summary: '<a href="https://x">Read more on Last.fm</a>' } } }).bio, null)
})

test("a long text is cut at the end of a sentence, never in a word", () => {
  const text = "Første setning er her. Andre setning er også her. Tredje setning kommer til slutt og er lang."
  assert.equal(firstSentences(text, 60), "Første setning er her. Andre setning er også her.")
  assert.equal(firstSentences("ett helt langt ord uten punktum her og der", 20), "ett helt langt ord…")
  assert.equal(firstSentences("kort", 20), "kort")
})

test("the artist is asked for by name, encoded, with autocorrect", () => {
  assert.equal(artistInfoUrl("https://x/?k=1", "Beyoncé & Co", "me"), "https://x/?k=1&method=artist.getinfo&autocorrect=1&artist=Beyonc%C3%A9%20%26%20Co&username=me")
})

test("a track's info is its tags, listeners, the owner's own count, its length in seconds, Last.fm's text where there is one and its album's cover", () => {
  const info = parseTrackInfo({ track: { duration: "215000", listeners: "5000", userplaycount: "12", toptags: { tag: [{ name: "pop" }] }, wiki: { summary: `${BIO.slice(0, 120)} <a href="x">Read more</a>` }, album: { title: "X", image: [{ "#text": "s.jpg" }, { "#text": "l.jpg" }] } } })
  assert.equal(info.cover, "l.jpg")
  assert.equal(info.seconds, 215)
  assert.equal(info.listeners, 5000)
  assert.equal(info.userPlays, 12)
  assert.deepEqual(info.tags, ["pop"])
  assert.ok(info.bio?.startsWith("Troye Sivan is"))
  assert.deepEqual(parseTrackInfo({ error: 6 }), { tags: [], listeners: null, userPlays: null, seconds: null, bio: null, cover: null })
  assert.equal(parseTrackInfo({ track: { duration: "0", userplaycount: "0" } }).seconds, null)
  assert.equal(parseTrackInfo({ track: { album: { image: [{ "#text": "https://x/2a96cbd8b46e442fc41c2b86b821562f.png" }] } } }).cover, null)
})

test("an album's info has its tracks in order, one track is a list of one, and a track without a name is left out", () => {
  const many = parseAlbumInfo({ album: { listeners: "9", userplaycount: "3", tracks: { track: [{ name: "One", duration: "180" }, { name: "" }, { name: "Two", duration: "0" }] } } })
  assert.deepEqual(many.tracks, [{ title: "One", seconds: 180 }, { title: "Two", seconds: null }])
  assert.equal(many.userPlays, 3)
  assert.deepEqual(parseAlbumInfo({ album: { tracks: { track: { name: "Only", duration: "60" } } } }).tracks, [{ title: "Only", seconds: 60 }])
  assert.deepEqual(parseAlbumInfo(null), { tags: [], listeners: null, userPlays: null, bio: null, tracks: [] })
})

test("a track and an album are asked for by artist and name, encoded, with the owner's name for the count", () => {
  assert.equal(trackInfoUrl("https://x/?k=1", "A & B", "Why?", "me"), "https://x/?k=1&method=track.getinfo&autocorrect=1&artist=A%20%26%20B&track=Why%3F&username=me")
  assert.equal(albumInfoUrl("https://x/?k=1", "A", "LP", "me"), "https://x/?k=1&method=album.getinfo&autocorrect=1&artist=A&album=LP&username=me")
})

test("a page of a range's plays has where it is among the pages and how many there are in all, and what plays this moment is not one of them", () => {
  const page = parseRecentPage({ recenttracks: { "@attr": { page: "2", totalPages: "5", total: "913" }, track: [
    { name: "Now", artist: { "#text": "A" }, "@attr": { nowplaying: "true" } },
    { name: "Then", artist: { "#text": "B" }, album: { "#text": "X" }, url: "u", date: { uts: "1763560800" } },
  ] } })
  assert.deepEqual([page.page, page.totalPages, page.total], [2, 5, 913])
  assert.deepEqual(page.plays.map((play) => play.track), ["Then"])
  assert.deepEqual(parseRecentPage({}), { plays: [], page: 1, totalPages: 1, total: 0 })
})

test("a week's chart has each artist's plays and place; one with no name or no count is left out", () => {
  const chart = parseArtistChart({ weeklyartistchart: { artist: [{ name: "A", playcount: "41", "@attr": { rank: "1" } }, { name: "", playcount: "3" }, { name: "B", playcount: "x" }, { name: "C", playcount: "7", "@attr": { rank: "2" } }] } })
  assert.deepEqual(chart, [{ name: "A", plays: 41, rank: 1 }, { name: "C", plays: 7, rank: 2 }])
  assert.deepEqual(parseArtistChart(null), [])
})

test("a range is asked for by unix seconds with the end left out, and a chart by both ends", () => {
  assert.equal(playsInRangeUrl("https://x/?k=1", 100, 200, 3), "https://x/?k=1&method=user.getrecenttracks&from=100&to=199&limit=200&page=3")
  assert.equal(artistChartUrl("https://x/?k=1", 100, 200), "https://x/?k=1&method=user.getweeklyartistchart&from=100&to=200")
})

test("an artist's albums: most played first, with no nameless ones, no repeats, and none without plays", () => {
  const albums = parseTopAlbums({
    topalbums: {
      album: [
        { name: "(null)", playcount: "900", url: "u0", image: [] },
        { name: "Small", playcount: "10", url: "u1", image: [{ "#text": "s.jpg" }, { "#text": "l.jpg" }] },
        { name: "Big", playcount: "5000", url: "u2", image: [{ "#text": "b.jpg" }] },
        { name: "big", playcount: "4000", url: "u3", image: [] },
        { name: "None", playcount: "0", url: "u4", image: [] },
        { name: "Broken", playcount: "x", url: "u5", image: [] },
      ],
    },
  })
  assert.deepEqual(albums.map((album) => album.title), ["Big", "Small"])
  assert.equal(albums[0]?.plays, 5000)
  assert.equal(albums[1]?.image, "l.jpg")
  assert.deepEqual(parseTopAlbums({}), [])
  assert.equal(parseTopAlbums({ topalbums: { album: Array.from({ length: 30 }, (_, index) => ({ name: `A${index}`, playcount: String(index + 1), url: "u", image: [] })) } }, 5).length, 5)
})

test("the address of an artist's albums names the artist, escaped", () => {
  assert.equal(artistTopAlbumsUrl("https://x/?k=1", "Years & Years"), "https://x/?k=1&method=artist.gettopalbums&autocorrect=1&artist=Years%20%26%20Years&limit=50")
})

test("the user: when they started and how many plays they have; what is not said is null", () => {
  assert.deepEqual(parseUserInfo({ user: { name: "ola", playcount: "123456", registered: { unixtime: "1300000000", "#text": 1300000000 } } }), { registered: 1300000000, plays: 123456 })
  assert.deepEqual(parseUserInfo({ user: { registered: { "#text": 1300000000 } } }), { registered: 1300000000, plays: null })
  assert.deepEqual(parseUserInfo({ error: 6 }), { registered: null, plays: null })
})

test("the user's top songs of all time, with the artist as a name or as text, and a broken row left out; the address asks for a thousand", () => {
  const tracks = parseTopTracks({ toptracks: { track: [{ name: "Take On Me", playcount: "40", url: "u", artist: { name: "a-ha", url: "a" } }, { name: "Strangers", playcount: "3", artist: { "#text": "Sigrid" } }, { name: "", playcount: "9", artist: { name: "X" } }, { name: "Zero", playcount: "0", artist: { name: "X" } }] } })
  assert.deepEqual(tracks, [{ title: "Take On Me", artist: "a-ha", plays: 40, url: "u" }, { title: "Strangers", artist: "Sigrid", plays: 3, url: "" }])
  assert.ok(allTimeTracksUrl("B").includes("period=overall") && allTimeTracksUrl("B").includes("limit=1000"))
})

test("artists like one, with how alike, a single one as Last.fm writes it alone, and the name encoded in the address", () => {
  assert.deepEqual(parseSimilarArtists({ similarartists: { artist: [{ name: "Aurora", match: "0.81", url: "u" }, { name: "" }] } }), [{ name: "Aurora", match: 0.81, url: "u" }])
  assert.deepEqual(parseSimilarArtists({ similarartists: { artist: { name: "Sigrid", match: "x" } } }), [{ name: "Sigrid", match: 0, url: "" }])
  assert.ok(similarArtistsUrl("B", "Kings of Convenience").includes("method=artist.getsimilar&autocorrect=1&artist=Kings%20of%20Convenience&limit=50"))
})
