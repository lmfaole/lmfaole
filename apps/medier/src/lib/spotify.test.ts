import { strict as assert } from "node:assert"
import { test } from "node:test"

import { authorizeUrl, codeRequest, parseAlbumMatch, parseArtistMatch, parseTrackMatch, searchAlbumUrl, searchTrackUrl, parseRefreshToken, parseToken, plain, refreshRequest, SCOPE, searchArtistUrl, TOKEN_URL } from "./spotify.ts"

test("the refresh request signs in with the client and carries the user's token as the grant, in the body", () => {
  const request = refreshRequest("id", "secret", "refresh me")
  assert.equal(request.url, TOKEN_URL)
  assert.equal(request.headers["Authorization"], `Basic ${btoa("id:secret")}`)
  assert.equal(request.body, "grant_type=refresh_token&refresh_token=refresh+me")
})

test("a token that was refused (invalid_grant) gives nothing, and one without a lifetime is good for an hour", () => {
  assert.equal(parseToken({ error: "invalid_grant" }), null)
  assert.deepEqual(parseToken({ access_token: "t" }), { accessToken: "t", expiresIn: 3600 })
  assert.deepEqual(parseToken({ access_token: "t", expires_in: 1800 }), { accessToken: "t", expiresIn: 1800 })
})

test("the sign-in asks for the one permission to see what plays, and carries the state back", () => {
  const url = new URL(authorizeUrl("id", "http://127.0.0.1:8888/callback", "xyz"))
  assert.equal(url.origin + url.pathname, "https://accounts.spotify.com/authorize")
  assert.equal(url.searchParams.get("scope"), SCOPE)
  assert.equal(SCOPE, "user-read-currently-playing")
  assert.equal(url.searchParams.get("state"), "xyz")
  assert.equal(url.searchParams.get("redirect_uri"), "http://127.0.0.1:8888/callback")
})

test("the code is swapped for the refresh token, and an answer without one gives nothing", () => {
  const request = codeRequest("id", "secret", "the-code", "http://127.0.0.1:8888/callback")
  assert.equal(request.body, "grant_type=authorization_code&code=the-code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback")
  assert.equal(parseRefreshToken({ access_token: "a", refresh_token: "r" }), "r")
  assert.equal(parseRefreshToken({ access_token: "a" }), null)
})

const ARTIST = (name: string, id = "1") => ({ name, genres: ["pop", "dance pop"], external_urls: { spotify: `https://open.spotify.com/artist/${id}` }, images: [{ url: "big", width: 640 }, { url: "small", width: 160 }, { url: "mid", width: 320 }] })

test("an artist is the one named the same as the one asked for, however it is spelled, and its pictures come smallest first", () => {
  const found = parseArtistMatch({ artists: { items: [ARTIST("After Life", "9"), ARTIST("Beyoncé", "2")] } }, "BEYONCE")
  assert.equal(found?.url, "https://open.spotify.com/artist/2")
  assert.deepEqual(found?.images.map((image) => image.width), [160, 320, 640])
  assert.deepEqual(found?.genres, ["pop", "dance pop"])
})

test("a search that only finds other artists gives no picture rather than the wrong one", () => {
  assert.equal(parseArtistMatch({ artists: { items: [ARTIST("After Life"), ARTIST("Afterhours")] } }, "After"), null)
  assert.equal(parseArtistMatch({ artists: { items: [{ ...ARTIST("After"), external_urls: { spotify: "https://x.com" } }] } }, "After"), null)
  assert.equal(parseArtistMatch(null, "After"), null)
  assert.equal(parseArtistMatch({ artists: { items: [ARTIST("!!!")] } }, "!!!"), null)
})

test("names are compared without case, accents or marks, and searched for by their own name in quotes", () => {
  assert.equal(plain("Beyoncé"), "beyonce")
  assert.equal(plain("The Sewing Club"), "thesewingclub")
  assert.equal(searchArtistUrl("Dev Lemons"), "https://api.spotify.com/v1/search?type=artist&limit=10&q=artist%3A%22Dev%20Lemons%22")
})

const ALBUM = (name: string, artists: string[], over: Record<string, unknown> = {}) => ({ name, artists: artists.map((one) => ({ name: one })), release_date: "2023-05-12", total_tracks: 14, external_urls: { spotify: "https://open.spotify.com/album/a1" }, ...over })

test("an album is the one named the same by the artist asked for (one of several), with its day and its number of tracks", () => {
  const found = parseAlbumMatch({ albums: { items: [ALBUM("Other", ["Shygirl"]), ALBUM("Nymph", ["Someone", "Shygirl"])] } }, "NYMPH", "shygirl")
  assert.deepEqual(found, { url: "https://open.spotify.com/album/a1", released: "2023-05-12", tracks: 14 })
})

test("an album by someone else, with another name, with a link that is not Spotify's or with a date that is no date, is left out or has no date", () => {
  assert.equal(parseAlbumMatch({ albums: { items: [ALBUM("Nymph", ["Someone Else"])] } }, "Nymph", "Shygirl"), null)
  assert.equal(parseAlbumMatch({ albums: { items: [ALBUM("Nymph", ["Shygirl"], { external_urls: { spotify: "https://x.com" } })] } }, "Nymph", "Shygirl"), null)
  assert.deepEqual(parseAlbumMatch({ albums: { items: [ALBUM("Nymph", ["Shygirl"], { release_date: "soon", total_tracks: 0 })] } }, "Nymph", "Shygirl"), { url: "https://open.spotify.com/album/a1", released: null, tracks: null })
  assert.equal(parseAlbumMatch(null, "Nymph", "Shygirl"), null)
})

test("a track is the one named the same by the artist asked for, and nothing else", () => {
  const item = (name: string, artist: string) => ({ name, artists: [{ name: artist }], external_urls: { spotify: "https://open.spotify.com/track/t1" } })
  assert.deepEqual(parseTrackMatch({ tracks: { items: [item("Submit (Remix)", "Shygirl"), item("Submit", "Shygirl")] } }, "Submit", "Shygirl"), { url: "https://open.spotify.com/track/t1" })
  assert.equal(parseTrackMatch({ tracks: { items: [item("Submit", "Cover Band")] } }, "Submit", "Shygirl"), null)
})

test("an album and a track are searched for by both names, in quotes", () => {
  assert.equal(searchAlbumUrl("Nymph", "Shygirl"), "https://api.spotify.com/v1/search?type=album&limit=10&q=album%3A%22Nymph%22%20artist%3A%22Shygirl%22")
  assert.equal(searchTrackUrl("Submit", "Shygirl"), "https://api.spotify.com/v1/search?type=track&limit=10&q=track%3A%22Submit%22%20artist%3A%22Shygirl%22")
})
