import { strict as assert } from "node:assert"
import { test } from "node:test"

import { parseStudioAlbums, releaseGroupsUrl } from "./musicbrainz.ts"

const MBID = "a74b1b7f-71a5-4011-9441-d0b5e4122711"
const credit = (name: string, id = MBID) => [{ name, artist: { id, name } }]
const group = (title: string, more: Record<string, unknown> = {}) => ({ id: `id-${title}`, title, "primary-type": "Album", "first-release-date": "2000", "artist-credit": credit("Radiohead"), ...more })

test("the search is for the artist's official albums, by its id where Last.fm gave one, else by its name in quotes", () => {
  const byId = new URL(releaseGroupsUrl("Radiohead", MBID))
  assert.equal(byId.origin + byId.pathname, "https://musicbrainz.org/ws/2/release-group")
  assert.equal(byId.searchParams.get("fmt"), "json")
  assert.equal(byId.searchParams.get("query"), `arid:${MBID} AND primarytype:album AND status:official`)
  assert.equal(new URL(releaseGroupsUrl('Say "Hi" \\ Bye', null)).searchParams.get("query"), 'artist:"Say \\"Hi\\" \\\\ Bye" AND primarytype:album AND status:official')
})

test("only albums with no secondary type are kept: no live album, compilation, remixes, soundtrack, demos, DJ mix, single or EP; oldest first, each title once", () => {
  const albums = parseStudioAlbums(
    {
      "release-groups": [
        group("In Rainbows", { "first-release-date": "2007-10-10" }),
        group("I Might Be Wrong", { "secondary-types": ["Live"] }),
        group("The Best Of", { "secondary-types": ["Compilation"] }),
        group("TKOL RMX", { "secondary-types": ["Compilation", "Remix"] }),
        group("Film", { "secondary-types": ["Soundtrack"] }),
        group("MINIDISCS", { "secondary-types": ["Demo"] }),
        group("Mixed", { "secondary-types": ["DJ-mix"] }),
        group("Creep", { "primary-type": "Single" }),
        group("My Iron Lung", { "primary-type": "EP" }),
        group("OK Computer", { "first-release-date": "1997-05-21", "secondary-types": [] }),
        group("ok computer", { id: "again" }),
        group("Someone Else's", { "artist-credit": credit("Radiohead", "other-artist") }),
        group("Undated", { "first-release-date": "" }),
      ],
    },
    "Radiohead",
    MBID,
  )
  assert.deepEqual(albums, [
    { id: "id-OK Computer", title: "OK Computer", released: "1997-05-21" },
    { id: "id-In Rainbows", title: "In Rainbows", released: "2007-10-10" },
    { id: "id-Undated", title: "Undated", released: null },
  ])
})

test("without an id, an album is the artist's when it is credited to the name; an answer with no albums, or none, says nothing", () => {
  const answer = { "release-groups": [group("Kid A"), group("Other", { "artist-credit": credit("Radiohead Tribute Band", "x") })] }
  assert.deepEqual(parseStudioAlbums(answer, "radiohead", null)?.map((album) => album.title), ["Kid A"])
  assert.equal(parseStudioAlbums({ "release-groups": [] }, "Radiohead", MBID), null)
  assert.equal(parseStudioAlbums({ error: "Rate limited" }, "Radiohead", MBID), null)
  assert.equal(parseStudioAlbums(null, "Radiohead", null), null)
})
