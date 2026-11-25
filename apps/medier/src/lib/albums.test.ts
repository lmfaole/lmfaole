import { strict as assert } from "node:assert"
import { test } from "node:test"

import { albumKey, albumShelf, isSingleOrEp, looksLikeAlbum, realAlbums } from "./albums.ts"
import type { ArtistAlbum } from "./lastfm.ts"

const album = (title: string, plays: number, image: string | null = `${title}.jpg`): ArtistAlbum => ({ title, plays, image, url: `https://www.last.fm/${title}` })
const studio = (...titles: string[]) => titles.map((title) => ({ id: title, title, released: null }))

test("an album's editions have one key: deluxe, remastered, expanded and the like, and « - Single»", () => {
  for (const title of ["Blonde", "Blonde (Deluxe Edition)", "blonde [2016 Remaster]", "Blonde - Expanded Edition", "Blonde (Deluxe) [Remastered]", "Blonde - Single"]) assert.equal(albumKey(title), "blonde", title)
  assert.equal(albumKey("Kid A Mnesia"), "kidamnesia")
  assert.equal(albumKey("(What's the Story) Morning Glory?"), "whatsthestorymorningglory")
  assert.equal(albumKey("Songs (Remixed by Someone)"), "songsremixedbysomeone")
  assert.equal(albumKey("(Deluxe)"), "deluxe")
})

test("a title can say it is a single, an EP, live, a compilation, remixes, a soundtrack, demos or a DJ mix", () => {
  for (const title of ["Song - Single", "Thing (EP)", "Thing [EP]", "Thing - EP", "Bandname EP"]) assert.ok(isSingleOrEp(title) && !looksLikeAlbum(title), title)
  for (const title of ["Live at Wembley", "Album (Live)", "MTV Unplugged", "Greatest Hits", "The Best of Band", "Nymph (Remixes)", "Dune (Original Motion Picture Soundtrack)", "Demos", "DJ-Kicks", "Fabric 50 (DJ Mix)"]) {
    assert.ok(!looksLikeAlbum(title), title)
  }
  for (const title of ["Live Through This", "Demon Days", "All My Demons Greeting Me As A Friend", "Deep", "Singles", "Sleep", "It's Album Time"]) assert.ok(looksLikeAlbum(title), title)
})

const LASTFM = [
  album("Hit Song", 9000),
  album("Blonde", 5000, null),
  album("Blonde (Deluxe Edition)", 6000),
  album("Endless", 800),
  album("Thing EP", 700),
  album("Live at Coachella", 600),
  album("Greatest Hits", 500),
  album("Channel Orange", 4000),
]

test("with MusicBrainz's albums, only they are kept, each once: the plays of all its editions, and the most played one's name and cover", () => {
  const albums = realAlbums(LASTFM, studio("Channel Orange", "Blonde", "Endless"))
  assert.deepEqual(albums.map((one) => [one.title, one.plays]), [["Blonde (Deluxe Edition)", 11000], ["Channel Orange", 4000], ["Endless", 800]])
  assert.equal(albums[0]?.image, "Blonde (Deluxe Edition).jpg")
  assert.equal(albums[0]?.url, "https://www.last.fm/Blonde (Deluxe Edition)")
})

test("a cover is taken from another edition where the most played has none, and a single that MusicBrainz names like an album is still a single", () => {
  const albums = realAlbums([album("Blonde", 5000, null), album("Blonde (Remastered)", 10, "r.jpg"), album("Blonde - Single", 9000)], studio("Blonde"))
  assert.deepEqual(albums.map((one) => [one.title, one.plays, one.image]), [["Blonde", 5010, "r.jpg"]])
})

test("without MusicBrainz (it failed, or there is no id and no match), the titles decide, the editions are still one, and the list is cut at the limit", () => {
  const albums = realAlbums(LASTFM, null)
  assert.deepEqual(albums.map((one) => one.title), ["Blonde (Deluxe Edition)", "Hit Song", "Channel Orange", "Endless"])
  assert.equal(realAlbums(LASTFM, null, 2).length, 2)
  assert.deepEqual(realAlbums([], studio("Blonde")), [])
})

test("the shelf is every one of MusicBrainz's albums, oldest first and an unknown day last, with Last.fm's plays and cover where it has them, else the Cover Art Archive's", () => {
  const shelf = albumShelf(LASTFM, [
    { id: "b", title: "Blonde", released: "2016-08-20" },
    { id: "x", title: "Nostalgia, Ultra", released: null },
    { id: "c", title: "Channel Orange", released: "2012-07-10" },
    { id: "e", title: "Endless", released: "2016-08-19" },
  ])
  assert.deepEqual(shelf.map((one) => [one.title, one.released, one.plays]), [["Channel Orange", "2012-07-10", 4000], ["Endless", "2016-08-19", 800], ["Blonde", "2016-08-20", 11000], ["Nostalgia, Ultra", null, null]])
  assert.equal(shelf[2]?.image, "Blonde (Deluxe Edition).jpg")
  assert.equal(shelf[3]?.image, "https://coverartarchive.org/release-group/x/front-250")
})

test("without MusicBrainz the shelf is Last.fm's albums, most played first and with no day, at most the limit", () => {
  assert.deepEqual(albumShelf(LASTFM, null, 3).map((one) => [one.title, one.released]), [["Blonde (Deluxe Edition)", null], ["Hit Song", null], ["Channel Orange", null]])
})
