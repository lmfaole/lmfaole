import { strict as assert } from "node:assert"
import { test } from "node:test"

import { balanced, countryName, discOf, discographyPlace, firstRelease, groupReleasesUrl, otherEditions, parseCredits, parseReleaseGroupMatch, parseReleases, placeText, releaseCreditsUrl, releaseGroupSearchUrl, studioIndex } from "./musicbrainz-release.ts"

const ALBUMS = [
  { id: "g1", title: "Melody A.M.", released: "2001" },
  { id: "g2", title: "The Understanding", released: "2005" },
  { id: "g3", title: "Junior", released: "2009" },
]

test("the addresses ask for one album's group, its releases and one release's credits", () => {
  assert.equal(new URL(releaseGroupSearchUrl('Say "Hi"', "Junior")).searchParams.get("query"), 'releasegroup:"Junior" AND artist:"Say \\"Hi\\""')
  assert.ok(groupReleasesUrl("g 1").includes("release-group=g%201&inc=labels+media"))
  assert.ok(releaseCreditsUrl("r1").includes("/release/r1?inc=") && releaseCreditsUrl("r1").includes("recording-level-rels+work-rels+work-level-rels"))
})

test("an album is found among the studio albums whatever its edition, and else by a search that credits the artist", () => {
  assert.equal(studioIndex(ALBUMS, "Junior (Deluxe Edition)"), 2)
  assert.equal(studioIndex(ALBUMS, "Senior"), null)
  const answer = {
    "release-groups": [
      { id: "x", title: "Senior", "artist-credit": [{ name: "Someone", artist: { name: "Someone" } }] },
      { id: "y", title: "Senior", "artist-credit": [{ name: "Röyksopp", artist: { name: "Röyksopp" } }] },
    ],
  }
  assert.deepEqual(parseReleaseGroupMatch(answer, "röyksopp", "Senior"), { id: "y", title: "Senior" })
  assert.equal(parseReleaseGroupMatch(answer, "Röyksopp", "Junior"), null)
})

const release = (id: string, date: string, extra: Record<string, unknown> = {}) => ({ id, title: "Melody A.M.", status: "Official", date, country: "NO", "label-info": [{ label: { name: "Wall of Sound" } }], ...extra })

test("the first release is the earliest official one, a day before a bare year, and one with a label first", () => {
  const releases = parseReleases({
    releases: [
      release("b", "2001-09-03"),
      release("a", "2001"),
      release("p", "2000", { status: "Promotion" }),
      release("c", "2001-09-03", { "label-info": [{ label: { name: "[no label]" } }], country: "XE" }),
      release("d", "2002-05", { title: "Melody A.M. (Deluxe)" }),
      release("e", "2011", { disambiguation: "10th anniversary" }),
      release("m", "2002", { disambiguation: "Australian manufactured release" }),
      release("f", "2019"),
      release("g", "2019", { country: "GB" }),
      release("h", "garbage"),
    ],
  })
  assert.equal(releases.find((one) => one.id === "c")?.labels.length, 0)
  const first = firstRelease(releases)
  assert.equal(first?.id, "b")
  assert.deepEqual(otherEditions(releases, first).map((edition) => [edition.name, edition.year]), [["Melody A.M. (Deluxe)", "2002"], ["10th anniversary", "2011"], ["Nyutgivelse", "2019"]])
  assert.equal(firstRelease([]), null)
})

test("the sleeve holds a CD when the first release's first medium is a compact disc of any kind, and a record otherwise", () => {
  const releases = parseReleases({
    releases: [
      release("v", "1985-06-01", { media: [{ format: '12" Vinyl' }, { format: "CD" }] }),
      release("c", "1985-06-01", { media: [{ format: null }, { format: "Enhanced CD" }] }),
      release("s", "2003", { media: [{ format: "Hybrid SACD" }] }),
      release("d", "2020", { media: [{ format: "Digital Media" }] }),
      release("n", "2020"),
    ],
  })
  const one = (id: string) => releases.find((release) => release.id === id) ?? null
  assert.deepEqual(one("c")?.formats, ["Enhanced CD"])
  assert.equal(discOf(one("v")), "record")
  assert.equal(discOf(one("c")), "cd")
  assert.equal(discOf(one("s")), "cd")
  assert.equal(discOf(one("d")), "record")
  assert.equal(discOf(one("n")), "record")
  assert.equal(discOf(null), "record")
  assert.equal(discOf(firstRelease(releases)), "record", "of two on the same day, the first as MusicBrainz lists them")
})

test("a country is said in Norwegian, Europe and the world too, and an unknown code not at all", () => {
  assert.equal(countryName("NO"), "Norge")
  assert.equal(countryName("XE"), "Europa")
  assert.equal(countryName("XW"), "Hele verden")
  assert.equal(countryName("XU"), null)
  assert.equal(countryName(null), null)
})

const person = (type: string, name: string, attributes: string[] = []) => ({ type, "target-type": "artist", attributes, artist: { name } })

test("the credits: producers and writers each once, those on most tracks first, and who sang and played with what, not the artist itself", () => {
  const answer = {
    "artist-credit": [{ artist: { name: "Röyksopp" } }],
    relations: [person("producer", "Röyksopp")],
    media: [
      {
        tracks: [
          { recording: { relations: [person("vocal", "Erlend Øye", ["lead vocals"]), person("instrument", "Kate Havnevik", ["guitar"]), person("instrument", "Röyksopp", ["synthesizer"]), { type: "performance", "target-type": "work", work: { relations: [person("composer", "Svein Berge"), person("lyricist", "Erlend Øye")] } }] } },
          { recording: { relations: [person("vocal", "Erlend Øye", ["background vocals"]), person("producer", "Röyksopp"), { type: "performance", "target-type": "work", work: { relations: [person("composer", "Torbjørn Brundtland"), person("composer", "Svein Berge")] } }] } },
          { recording: { relations: [person("instrument", "Anneli Drecker", ["theremin"]), person("instrument", "Anneli Drecker", ["guest"])] } },
        ],
      },
    ],
  }
  assert.deepEqual(parseCredits(answer, "Röyksopp"), {
    producers: ["Röyksopp"],
    writers: ["Svein Berge", "Erlend Øye", "Torbjørn Brundtland"],
    performers: ["Erlend Øye (vokal, kor)", "Kate Havnevik (gitar)", "Anneli Drecker (musiker)"],
  })
  assert.equal(parseCredits({ media: [] }, "Röyksopp"), null)
})

test("the place among the studio albums: which, of how many, and the ones on each side", () => {
  const place = discographyPlace(ALBUMS, 1)
  assert.deepEqual([place?.number, place?.of, place?.previous?.title, place?.next?.title], [2, 3, "Melody A.M.", "Junior"])
  assert.equal(placeText(place ?? { number: 0, of: 0, previous: null, next: null }), "2. studioalbum av 3")
  assert.equal(discographyPlace(ALBUMS, 0)?.previous, null)
  assert.equal(discographyPlace(ALBUMS, null), null)
  assert.equal(placeText({ number: 1, of: 1, previous: null, next: null }), "Eneste studioalbum")
})

test("balanced drops a bracket that closes nothing or is never closed, and keeps a pair", () => {
  assert.equal(balanced("Deluxe Edition)"), "Deluxe Edition")
  assert.equal(balanced("(remastered"), "remastered")
  assert.equal(balanced("Deluxe (2010)"), "Deluxe (2010)")
})
