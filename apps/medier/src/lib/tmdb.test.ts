import { strict as assert } from "node:assert"
import { test } from "node:test"

import { authorize, detailsUrl, parseInfo, parsePerson, parsePoster, personUrl, profileSources } from "./tmdb.ts"

test("a film is asked for as a movie and an episode as its show", () => {
  assert.equal(detailsUrl("film", 949), "https://api.themoviedb.org/3/movie/949?language=nb-NO&append_to_response=credits")
  assert.equal(detailsUrl("episode", 83867), "https://api.themoviedb.org/3/tv/83867?language=nb-NO&append_to_response=credits")
})

test("a read access token is a bearer and a short key goes in the address", () => {
  assert.deepEqual(authorize("eyJabc", "https://x/y"), { url: "https://x/y", headers: { Authorization: "Bearer eyJabc" } })
  assert.deepEqual(authorize("a b", "https://x/y"), { url: "https://x/y?api_key=a%20b", headers: {} })
  assert.equal(authorize("k", "https://x/y?language=nb-NO").url, "https://x/y?language=nb-NO&api_key=k")
})

test("the poster is the image address, and nothing where TMDB has none", () => {
  assert.equal(parsePoster({ poster_path: "/h1.jpg" }), "https://image.tmdb.org/t/p/w185/h1.jpg")
  assert.equal(parsePoster({ poster_path: null }), null)
  assert.equal(parsePoster({ poster_path: "h1.jpg" }), null)
  // The made-up data's own pictures, under the site's base or not, are not TMDB's.
  assert.equal(parsePoster({ poster_path: "/medier/mock/poster-1.jpg" }), "/medier/mock/poster-1.jpg")
  assert.equal(parsePoster({ poster_path: "/mock/poster-1.jpg" }), "/mock/poster-1.jpg")
  assert.equal(parsePoster("junk"), null)
})

test("a film's info is its plot, genres, length and vote; a show has seasons instead of a length", () => {
  const film = parseInfo({ overview: " Et ran. ", genres: [{ name: "Krim" }, { name: "" }, "junk"], runtime: 170, vote_average: 7.9, vote_count: 12000 })
  assert.deepEqual(film, { overview: "Et ran.", genres: ["Krim"], runtime: 170, seasons: null, rating: { value: 7.9, votes: 12000 }, cast: [], crew: [] })
  assert.equal(parseInfo({ number_of_seasons: 2 }).seasons, 2)
})

test("what TMDB has not got is null, not zero or an empty line, and a vote nobody gave is no rating", () => {
  assert.deepEqual(parseInfo({ overview: "", runtime: 0, vote_average: 0, vote_count: 0 }), { overview: null, genres: [], runtime: null, seasons: null, rating: null, cast: [], crew: [] })
  assert.equal(parseInfo({ vote_average: 8, vote_count: 0 }).rating, null)
  assert.deepEqual(parseInfo("junk"), { overview: null, genres: [], runtime: null, seasons: null, rating: null, cast: [], crew: [] })
})

const CREDITS = {
  cast: [{ id: 1, name: "Al Pacino", character: "Vincent Hanna", profile_path: "/a.jpg" }, { id: 2, name: "Robert De Niro", character: " ", profile_path: null }, { name: "No Id" }, { id: 3, name: "" }],
  crew: [
    { id: 10, name: "Michael Mann", job: "Director", profile_path: "/m.jpg" },
    { id: 10, name: "Michael Mann", job: "Screenplay" },
    { id: 10, name: "Michael Mann", job: "Writer" },
    { id: 11, name: "Elliot Goldenthal", job: "Original Music Composer" },
    { id: 12, name: "Someone", job: "Catering" },
  ],
}

test("the cast is the first of those named, with the part where there is one; the crew is the jobs a page names, in Norwegian, each person once for each job", () => {
  const info = parseInfo({ credits: CREDITS })
  assert.deepEqual(info.cast, [{ id: 1, name: "Al Pacino", profile: "/a.jpg", role: "Vincent Hanna" }, { id: 2, name: "Robert De Niro", profile: null, role: null }])
  assert.deepEqual(info.crew.map((one) => `${one.name}: ${one.role}`), ["Michael Mann: Regi", "Michael Mann: Manus", "Elliot Goldenthal: Musikk"])
})

test("a show's creators come first among the crew, and the cast is cut at the twelfth", () => {
  const many = { credits: { cast: Array.from({ length: 40 }, (_, index) => ({ id: index + 1, name: `P${index}`, character: "C" })) }, created_by: [{ id: 99, name: "Creator", profile_path: "/c.jpg" }] }
  const info = parseInfo(many)
  assert.equal(info.cast.length, 12)
  assert.deepEqual(info.crew, [{ id: 99, name: "Creator", profile: "/c.jpg", role: "Skaper" }])
})

test("a person's picture has the widths of a profile, and a person is asked for in Norwegian", () => {
  assert.deepEqual(profileSources("/a.jpg").map((source) => source.width), [45, 185, 421])
  assert.ok(profileSources("/a.jpg").every((source) => !source.src.includes("/w92/")))
  assert.deepEqual(profileSources(null), [])
  assert.equal(personUrl(5), "https://api.themoviedb.org/3/person/5?language=nb-NO")
})

test("a person is read with their dates to the day, the department in Norwegian and nothing that is empty or odd", () => {
  assert.deepEqual(parsePerson({ name: " Al Pacino ", biography: "", birthday: "1940-04-25", deathday: "1994", place_of_birth: "New York", known_for_department: "Acting", profile_path: "/a.jpg" }), { name: "Al Pacino", biography: null, birthday: "1940-04-25", deathday: null, place: "New York", department: "Skuespiller", profile: "/a.jpg" })
  assert.equal(parsePerson({ known_for_department: "Acting" }), null)
  assert.equal(parsePerson({ name: "X", known_for_department: "Unknown" })?.department, null)
})
