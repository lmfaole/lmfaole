// The one table of what the relay may ask: a host not in it is not found. Each source gets only the headers of the ask it needs (`forward`); its key,
// where it has one, comes with the ask (in the address or a header), except GitHub's, which is the relay's (`sources/github.ts`).

import { MEDIER_AGENT, STARTSIDE_AGENT, type Source } from "./source.ts"
import { GITHUB } from "./sources/github.ts"
import { SPOTIFY } from "./sources/spotify.ts"

const medier = (more: Partial<Source> = {}): Source => ({ for: "medier", agent: MEDIER_AGENT, ...more })
const startside = (more: Partial<Source> = {}): Source => ({ for: "startside", agent: STARTSIDE_AGENT, ...more })

export const ROUTES: ReadonlyMap<string, Source> = new Map(
  Object.entries({
    // medier: what is played and watched, and what is known of it. Last.fm, Steam and RetroAchievements take their key in the address.
    "ws.audioscrobbler.com": medier(),
    "api.trakt.tv": medier({ forward: ["trakt-api-version", "trakt-api-key"] }),
    // A read access token (`Authorization`), or the key in the address.
    "api.themoviedb.org": medier({ forward: ["authorization"] }),
    "musicbrainz.org": medier(),
    // An artist's Wikipedia article in Norwegian.
    "www.wikidata.org": medier(),
    "api.setlist.fm": medier({ forward: ["x-api-key"] }),
    "api.steampowered.com": medier(),
    // A game's page, its reviews and its Steam Deck report.
    "store.steampowered.com": medier(),
    "retroachievements.org": medier(),
    "api.listenbrainz.org": medier(),

    // Both.
    ...SPOTIFY,

    // startside: the working day's sources.
    "api.github.com": GITHUB,
    "api.met.no": startside(),
    "nominatim.openstreetmap.org": startside(),
    "api.entur.io": startside({ set: { "ET-Client-Name": "lmfaole-startside" }, post: { "journey-planner/v3/graphql": "graphql" } }),
    "services.swpc.noaa.gov": startside(),
    "www.hvakosterstrommen.no": startside(),
    "api01.nve.no": startside(),
    // Oslo Bysykkel's open data asks every client to say who it is.
    "gbfs.urbansharing.com": startside({ set: { "Client-Identifier": "lmfaole-startside" } }),
    "ws.geonorge.no": startside(),
  }),
)
