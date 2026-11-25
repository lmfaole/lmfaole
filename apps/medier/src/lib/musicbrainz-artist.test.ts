import { strict as assert } from "node:assert"
import { test } from "node:test"

import { artistUrlsUrl, latestReleasesUrl, latestReleaseText, parseArtistUrls, parseLatestRelease, parseWikipedia, playedCovers, releaseCover, wikipediaLinksUrl, withWikipedia } from "./musicbrainz-artist.ts"

const MBID = "1c70a3fc-fa3c-4be1-8b55-c3192db8a884"
const TODAY = "2026-11-21"
const credit = (name: string, id = MBID) => [{ name, artist: { id, name } }]
const group = (title: string, released: string, more: Record<string, unknown> = {}) => ({ id: `id-${title}`, title, "primary-type": "Album", "first-release-date": released, "artist-credit": credit("Röyksopp"), ...more })

test("the search for the newest releases asks for albums, singles and EPs with no secondary type, from whole years back, by id or by name", () => {
  const query = new URL(latestReleasesUrl("Röyksopp", MBID, TODAY)).searchParams.get("query")
  assert.equal(query, `arid:${MBID} AND status:official AND (primarytype:album OR primarytype:single OR primarytype:ep) AND firstreleasedate:[2024 TO *] AND NOT secondarytype:[* TO *]`)
  assert.match(new URL(latestReleasesUrl('A "B"', null, TODAY)).searchParams.get("query") ?? "", /^artist:"A \\"B\\"" AND/)
})

test("the newest release is the latest one out or coming, an album before a single on the same day, credited to the artist and with no secondary type", () => {
  const answer = {
    "release-groups": [
      group("Nebulous Nights", "2024-12-13"),
      group("Beacons", "2025-01-03", { "primary-type": "Single" }),
      group("Eat the Fruit", "2026-10-09", { "primary-type": "Single" }),
      group("Same Day Album", "2026-10-09"),
      group("Remix", "2026-11-01", { "primary-type": "Single", "secondary-types": ["Remix"] }),
      group("Someone Else's", "2026-11-10", { "artist-credit": credit("Robyn", "other") }),
      group("Broadcast", "2026-11-11", { "primary-type": "Broadcast" }),
    ],
  }
  assert.deepEqual(parseLatestRelease(answer, "Röyksopp", MBID, TODAY), { id: "id-Same Day Album", title: "Same Day Album", type: "Album", released: "2026-10-09", upcoming: false })
  const coming = parseLatestRelease({ "release-groups": [...answer["release-groups"], group("Next", "2027-03-14", { "primary-type": "EP" })] }, "Röyksopp", MBID, TODAY)
  assert.deepEqual(coming, { id: "id-Next", title: "Next", type: "EP", released: "2027-03-14", upcoming: true })
  assert.equal(parseLatestRelease({ "release-groups": [group("By Name", "2026-01-01", { "artist-credit": [{ name: "Royksopp" }] })] }, "Röyksopp", null, TODAY)?.title, "By Name")
})

test("a release older than two years is no news, and a date known only to the month or the year counts until its end", () => {
  assert.equal(parseLatestRelease({ "release-groups": [group("Old", "2024-11-20")] }, "Röyksopp", MBID, TODAY), null)
  assert.equal(parseLatestRelease({ "release-groups": [group("Just", "2024-11-21")] }, "Röyksopp", MBID, TODAY)?.title, "Just")
  assert.equal(parseLatestRelease({ "release-groups": [group("Month", "2024-11")] }, "Röyksopp", MBID, TODAY)?.title, "Month")
  assert.equal(parseLatestRelease({ "release-groups": [group("This year", "2026")] }, "Röyksopp", MBID, TODAY)?.upcoming, false)
  assert.equal(parseLatestRelease({ "release-groups": [group("Undated", "")] }, "Röyksopp", MBID, TODAY), null)
  assert.equal(parseLatestRelease({ error: "x" }, "Röyksopp", MBID, TODAY), null)
})

test("the newest release in words: what it is, and when it came or comes", () => {
  const release = { id: "x", title: "T", type: "Album" as const, released: "2025-03-14", upcoming: false }
  assert.deepEqual(latestReleaseText(release, TODAY), { kind: "Nytt album", when: "14. mars 2025" })
  assert.deepEqual(latestReleaseText({ ...release, type: "Single", released: "2026-12-14", upcoming: true }, TODAY), { kind: "Singel", when: "Kommer 14. desember" })
  assert.deepEqual(latestReleaseText({ ...release, type: "EP", released: "2027-03-14", upcoming: true }, TODAY), { kind: "EP", when: "Kommer 14. mars 2027" })
  assert.deepEqual(latestReleaseText({ ...release, released: "2027", upcoming: true }, TODAY), { kind: "Album", when: "Kommer i 2027" })
  assert.equal(latestReleaseText({ ...release, type: "EP", released: "2025-03" }, TODAY).when, "mars 2025")
})

test("the artist's links: one of each kind we show, in our order, ended ones left out, with its Wikidata item and any Wikipedia article", () => {
  assert.equal(artistUrlsUrl(MBID), `https://musicbrainz.org/ws/2/artist/${MBID}?inc=url-rels&fmt=json`)
  const rel = (type: string, resource: string, ended = false) => ({ type, ended, url: { resource } })
  const urls = parseArtistUrls({
    relations: [
      rel("discogs", "https://www.discogs.com/artist/15596"),
      rel("discogs", "https://www.discogs.com/artist/786258"),
      rel("social network", "https://twitter.com/royksopp"),
      rel("social network", "https://www.instagram.com/royksopp/"),
      rel("social network", "https://plus.google.com/+RoyksoppMusic", true),
      rel("youtube", "https://www.youtube.com/channel/UC9"),
      rel("youtube music", "https://music.youtube.com/channel/UCa"),
      rel("bandcamp", "https://royksopp.bandcamp.com/"),
      rel("official homepage", "http://royksopp.com/"),
      rel("free streaming", "https://open.spotify.com/artist/5n"),
      rel("wikidata", "https://www.wikidata.org/wiki/Q193218"),
      rel("wikipedia", "https://en.wikipedia.org/wiki/R%C3%B6yksopp"),
      rel("wikipedia", "https://no.wikipedia.org/wiki/R%C3%B6yksopp"),
      rel("other databases", "not a url"),
    ],
  })
  assert.deepEqual(
    urls?.links.map((link) => [link.label, link.url]),
    [
      ["Offisiell nettside", "https://royksopp.com/"],
      ["Bandcamp", "https://royksopp.bandcamp.com/"],
      ["YouTube", "https://www.youtube.com/channel/UC9"],
      ["Instagram", "https://www.instagram.com/royksopp/"],
      ["Discogs", "https://www.discogs.com/artist/15596"],
    ],
  )
  assert.equal(urls?.wikidata, "Q193218")
  assert.deepEqual(urls?.wikipedia, { language: "no", url: "https://no.wikipedia.org/wiki/R%C3%B6yksopp" })
  assert.equal(parseArtistUrls({ error: "Not Found" }), null)
})

test("Wikipedia from Wikidata: bokmål first, then nynorsk, then English, put after the artist's own site", () => {
  assert.match(wikipediaLinksUrl("Q193218"), /^https:\/\/www\.wikidata\.org\/w\/api\.php\?.*sitefilter=nowiki%7Cnnwiki%7Cenwiki&ids=Q193218$/)
  const site = (language: string) => ({ site: `${language}wiki`, url: `https://${language}.wikipedia.org/wiki/X` })
  const answer = (sites: string[]) => ({ entities: { Q1: { sitelinks: Object.fromEntries(sites.map((one) => [`${one}wiki`, site(one)])) } } })
  assert.equal(parseWikipedia(answer(["en", "nn", "no"]), "Q1")?.language, "no")
  assert.equal(parseWikipedia(answer(["en", "nn"]), "Q1")?.language, "nn")
  assert.equal(parseWikipedia(answer(["en"]), "Q1")?.language, "en")
  assert.equal(parseWikipedia(answer([]), "Q1"), null)
  const links = [
    { kind: "official" as const, label: "Offisiell nettside", url: "https://royksopp.com/" },
    { kind: "discogs" as const, label: "Discogs", url: "https://www.discogs.com/artist/1" },
  ]
  assert.deepEqual(
    withWikipedia(links, { language: "en", url: "https://en.wikipedia.org/wiki/X" }).map((link) => link.label),
    ["Offisiell nettside", "Wikipedia (engelsk)", "Discogs"],
  )
  assert.deepEqual(withWikipedia(links, null), links)
})

test("the newest release's cover is the one the plays show for its album, or for its song where it is a single, else the Cover Art Archive's", () => {
  const play = (track: string, album: string, image: string | null) => ({ track, artist: "Röyksopp", album, image, url: "u", playedAt: null })
  const covers = new Map(playedCovers([play("Eat the Fruit", "Eat the Fruit - Single", "single.jpg"), play("Beacons", "Nebulous Nights (Deluxe)", "album.jpg"), play("Other", "Other", null)]))
  const release = { id: "rg", title: "Nebulous Nights", type: "Album" as const, released: "2024-12-13", upcoming: false }
  assert.equal(releaseCover(release, covers), "album.jpg")
  assert.equal(releaseCover({ ...release, title: "Eat the Fruit", type: "Single" }, covers), "single.jpg")
  assert.equal(releaseCover({ ...release, title: "Beacons" }, covers), "https://coverartarchive.org/release-group/rg/front-250")
})
