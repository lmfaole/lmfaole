/**
 * Steam's answers as the design system's words and props: a price as `GamePrice`, the Deck's report as its verdict, a profile's state as `Presence`, the store's pictures and films as the
 * items of a `MediaGallery`, a news item as a row's `news`. Pure, with a test.
 */

import type { MediaItem } from "@lmfaole/designsystem/components/media-gallery"
import type { DeckCompatibility as DeckVerdict, GamePrice, NewsKind, Presence } from "@lmfaole/designsystem/lib/games"

import { gameHref } from "./pages.ts"
import type { PersonaState, SteamPresence } from "./steam-profile.ts"
import type { DeckCompatibility, NewsItem, StoreApp, StorePrice } from "./steam-store.ts"

/** A store price in the design system's terms (øre, with what it cost before a sale). */
export const gamePrice = (price: StorePrice | null): GamePrice | null => (price === null ? null : { final: price.final, initial: price.initial, currency: price.currency })

/** Valve's report as the design system's verdict. */
export const deckVerdict = (deck: DeckCompatibility | null): DeckVerdict | null => (deck === null ? null : deck.status)

/** Steam's states the design system has a word for; trading and wanting to play are on line. */
const STATE: Record<PersonaState, Exclude<Presence["state"], "in-game">> = { offline: "offline", online: "online", busy: "busy", away: "away", snooze: "snooze", trade: "online", play: "online" }

/**
 * Where the Steam user is now (as the design system's `presenceOf`, which is not imported as a value: Node does not run TypeScript under `node_modules`, so the test could not); the game they
 * play links to its page here where it is a Steam game of the store's (it has an app id).
 */
export function presenceFor(presence: SteamPresence, base: string, now: Date): Presence {
  const playing = presence.playing
  if (playing !== null && playing.name !== "") return playing.appId === null ? { state: "in-game", game: playing.name } : { state: "in-game", game: playing.name, href: gameHref(base, playing.appId, playing.name) }
  const state = STATE[presence.state]
  const lastLogoff = presence.public ? presence.lastLogoff : null
  return state === "offline" && lastLogoff !== null && lastLogoff > 0 ? { state, lastOnline: { at: new Date(lastLogoff * 1000).toISOString(), now: now.toISOString() } } : { state }
}

/** A game's films that a browser plays (MP4 or WebM; one with only a stream is left out) and then its screenshots. */
export function mediaItems(store: Pick<StoreApp, "name" | "media">): MediaItem[] {
  const films = store.media.movies.flatMap((movie): MediaItem[] => {
    const src = movie.mp4?.max ?? movie.mp4?.low ?? movie.webm?.max ?? movie.webm?.low ?? null
    return src === null || movie.thumbnail === null ? [] : [{ kind: "video", key: `film-${movie.id}`, src, poster: movie.thumbnail, label: movie.name }]
  })
  const pictures = store.media.screenshots.map((shot, index): MediaItem => ({ kind: "picture", key: `bilde-${index}`, src: shot.full, sources: [{ src: shot.thumbnail, width: 600 }, { src: shot.full, width: 1920 }], label: `Skjermbilde ${index + 1} fra ${store.name}` }))
  return [...films, ...pictures]
}

/** The patch notes of a game are «Oppdatering»; other news has no badge. */
export const newsKindOf = (item: Pick<NewsItem, "kind">): NewsKind | undefined => (item.kind === "patch" ? "patch-notes" : undefined)
