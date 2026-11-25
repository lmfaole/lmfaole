import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { SteamPresence } from "./steam-profile.ts"
import { deckVerdict, gamePrice, mediaItems, newsKindOf, presenceFor } from "./steam-view.ts"

const NOW = new Date("2026-11-22T12:00:00Z")
const profile = (over: Partial<SteamPresence>): SteamPresence => ({ steamId: "1", name: "Ole", avatar: null, profile: "https://steamcommunity.com/id/ole/", state: "online", stateLabel: "Pålogget", online: true, playing: null, lastLogoff: null, public: true, ...over })

test("a price keeps what it cost before; none is none", () => {
  assert.deepEqual(gamePrice({ currency: "NOK", initial: 20000, final: 10000, discountPercent: 50, initialFormatted: "", finalFormatted: "" }), { final: 10000, initial: 20000, currency: "NOK" })
  assert.equal(gamePrice(null), null)
})

test("the Deck's verdict is its status; none is none", () => {
  assert.equal(deckVerdict({ category: 3, status: "verified", label: "Verifisert" }), "verified")
  assert.equal(deckVerdict(null), null)
})

test("presence: in a game links to its page where it has an app id; offline says when it was last online only for a public profile", () => {
  const playing = presenceFor(profile({ playing: { appId: 1145360, name: "Hades" } }), "/", NOW)
  assert.deepEqual(playing, { state: "in-game", game: "Hades", href: "/spill/1145360-hades/" })
  assert.deepEqual(presenceFor(profile({ playing: { appId: null, name: "Et eget spill" } }), "/", NOW), { state: "in-game", game: "Et eget spill" })
  const away = presenceFor(profile({ state: "offline", online: false, lastLogoff: 1_700_000_000 }), "/", NOW)
  assert.equal(away.state, "offline")
  assert.ok(away.state === "offline" && away.lastOnline !== undefined)
  assert.deepEqual(presenceFor(profile({ state: "offline", online: false, lastLogoff: 1_700_000_000, public: false }), "/", NOW), { state: "offline" })
})

test("a game's media: the films a browser plays, then the screenshots; a film with only a stream is left out", () => {
  const items = mediaItems({
    name: "Hades",
    media: {
      screenshots: [{ thumbnail: "t.jpg", full: "f.jpg" }],
      movies: [
        { id: 1, name: "Trailer", thumbnail: "p.jpg", highlight: true, webm: null, mp4: { low: "lo.mp4", max: "hi.mp4" }, hls: null, dash: null, dashAv1: null },
        { id: 2, name: "Strøm", thumbnail: "p2.jpg", highlight: false, webm: null, mp4: null, hls: "x.m3u8", dash: null, dashAv1: null },
      ],
    } as never,
  })
  assert.deepEqual(items.map((item) => [item.kind, item.key]), [["video", "film-1"], ["picture", "bilde-0"]])
  assert.equal(items[0]?.kind === "video" ? items[0].src : "", "hi.mp4")
})

test("only patch notes are «Oppdatering»", () => {
  assert.equal(newsKindOf({ kind: "patch" }), "patch-notes")
  assert.equal(newsKindOf({ kind: "news" }), undefined)
})
