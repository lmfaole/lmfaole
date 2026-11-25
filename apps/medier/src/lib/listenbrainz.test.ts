import { strict as assert } from "node:assert"
import { test } from "node:test"

import { listensUrl, parseListens, parsePlayingNow, parseTopArtists, parseUserFound } from "./listenbrainz.ts"

const LISTEN = {
  listened_at: 1771414109,
  track_metadata: {
    artist_name: "Röyksopp",
    track_name: "Some Resolve",
    release_name: "Profound Mysteries II",
    additional_info: { recording_mbid: "30d08f4c-d825-4ae1-b79c-44242cddd7c0", release_mbid: "f1418001-7f1e-46af-bfdb-95faeded8841" },
    mbid_mapping: { caa_release_mbid: "f1418001-7f1e-46af-bfdb-95faeded8841", recording_mbid: "30d08f4c-d825-4ae1-b79c-44242cddd7c0", release_mbid: "e96c2e7b-94fd-4fbe-9c44-1a27d8664825" },
  },
  user_name: "rob",
}

test("a user's listens are plays as Last.fm's are, with the Cover Art Archive's cover and the recording on MusicBrainz", () => {
  assert.equal(listensUrl("a b"), "https://api.listenbrainz.org/1/user/a%20b/listens?count=50")
  const plays = parseListens({ payload: { count: 3, listens: [LISTEN, { listened_at: 1771413706, track_metadata: { artist_name: "Aurora", track_name: "Runaway", release_name: "" } }, { listened_at: 1, track_metadata: { track_name: "" } }] } }, "rob")
  assert.deepEqual(plays, [
    { track: "Some Resolve", artist: "Röyksopp", album: "Profound Mysteries II", image: "https://coverartarchive.org/release/f1418001-7f1e-46af-bfdb-95faeded8841/front-250", url: "https://musicbrainz.org/recording/30d08f4c-d825-4ae1-b79c-44242cddd7c0", playedAt: "2026-02-18T11:28:29.000Z" },
    { track: "Runaway", artist: "Aurora", album: "", image: null, url: "https://listenbrainz.org/user/rob/", playedAt: "2026-02-18T11:21:46.000Z" },
  ])
})

test("what plays now is the one listen ListenBrainz says plays, or none", () => {
  const { listened_at: _at, ...playing } = LISTEN
  assert.equal(parsePlayingNow({ payload: { count: 1, playing_now: true, listens: [{ ...playing, playing_now: true }] } }, "rob")?.track, "Some Resolve")
  assert.equal(parsePlayingNow({ payload: { count: 0, playing_now: false, listens: [] } }, "rob"), null)
})

test("the month's top artists, none before ListenBrainz has counted them, and a user is one with a listen count", () => {
  assert.deepEqual(parseTopArtists({ payload: { artists: [{ artist_mbid: "1c70a3fc-fa3c-4be1-8b55-c3192db8a884", artist_name: "Röyksopp", listen_count: 42 }, { artist_mbid: null, artist_name: "Ukjent", listen_count: 3 }] } }), [
    { name: "Röyksopp", plays: 42, url: "https://listenbrainz.org/artist/1c70a3fc-fa3c-4be1-8b55-c3192db8a884/" },
    { name: "Ukjent", plays: 3, url: "https://listenbrainz.org/search/?search_term=Ukjent&search_type=artist" },
  ])
  assert.deepEqual(parseTopArtists(null), [])
  assert.ok(parseUserFound({ payload: { count: 1200 } }) && !parseUserFound({ code: 404, error: "Cannot find user: x" }))
})
