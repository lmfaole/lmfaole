/**
 * The Worker's end of `sources.ts`: its settings, and the `get` that asks a source, through the relay, and keeps the answer in the Worker's cache for as long
 * as the source's `ttl` says. A page imports the loaders below, which pass the one to the other; nothing else here is the page's business.
 */

import { env } from "cloudflare:workers"

import type { AstroCookies } from "astro"

import { type Env, forUsers, type Get, lastfmError, loadGameExtras, loadGameStats, loadSteamBadges, loadSteamPresence, loadWishlist, lastfmUserExists, type Listening, loadAlbum, loadAlbumDays, loadAlbumRelease, loadAlbumTimeline, loadArtist, loadArtistLinks, loadArtistListening, loadArtistPictures, loadLastfmNow, loadLatestRelease, loadMusic, loadPerson, loadGame, loadGames, loadRetroGame, loadRetroGames, retroUserExists, loadSetlists, loadTrack, loadTrackCovers, loadWatched, loadWatchProviders, listenbrainzUserExists, loadListenBrainzMusic, loadListenBrainzNow, settle, steamUserExists, traktUserExists } from "./sources.ts"
import { MOCK_VERSION, mockFetch, mockSettings } from "./mock.ts"
import { discOf } from "./musicbrainz-release.ts"
import { loadMonth, loadTrend, loadWeek, type Medium } from "./week-source.ts"
import type { Month } from "./months.ts"
import type { Week } from "./weeks.ts"
import type { NowPlaying } from "./spotify.ts"
import type { Watched } from "./trakt.ts"
import { NO_USERS, readUsers, type Users } from "./users.ts"
import { parseSeenSales, SALES_COOKIE, type Wishlist } from "./steam-wishlist.ts"
import { failureOf, failureTtl, keptFailure, lastfmErrorCode } from "./negative-cache.ts"
import { readSignedUsers } from "./signed-cookie.ts"
import { asService, routeOf } from "./route.ts"

const AGENT = "lmfaole-medier (https://github.com/lmfaole/medier)"
/** A cache key is an address; an answer that is kept under a name (a token) gets one that no one can ask the Worker for. */
const KEY_HOST = "https://cache.medier.invalid/"

/** The settings that are text: a secret or a variable that is not a string (a binding) is not one of ours. */
const own = (): Env => Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
/** `MOCK_DATA=1` (`.dev.vars`, never a Worker's secret): the sources are answered by `mock.ts`, with no keys and no network, and any username is one. */
export const mocking = (): boolean => own()["MOCK_DATA"] === "1"
export const settings = (): Env => (mocking() ? mockSettings(own()) : own())
/** The settings for one visitor: the Worker's keys and the visitor's usernames, never anyone else's. */
const settingsFor = (users: Users): Env => forUsers(settings(), users)

/** `IMAGE_TRANSFORMS` "1": the pictures go through the zone's Image Transformations (`image-sources.ts`). */
export const imageTransforms = (): boolean => settings()["IMAGE_TRANSFORMS"] === "1"
/** `CF_BEACON_TOKEN`: the Web Analytics site's token, public; empty, no beacon. */
export const beaconToken = (): string => settings()["CF_BEACON_TOKEN"] ?? ""

/** A binding of the Worker (a rate limit, a service), as it is: not a setting. */
export const binding = (name: string): unknown => env[name]

/** The key the username cookies are signed with (`signed-cookie.ts`); without it they are taken as they are, as before (and the log says so). */
export const cookieSecret = (): string | null => {
  const secret = own()["COOKIE_SECRET"] ?? ""
  return secret === "" ? null : secret
}

/** The usernames of each request, as the middleware read them (signed: `verifyUsers`); a page reads them by its `cookies`, which are the middleware's. */
const verified = new WeakMap<AstroCookies, Users>()
let warned = false

/** Reads the request's username cookies once, checking their signatures (`src/middleware.ts`, before the page). */
export async function verifyUsers(cookies: AstroCookies): Promise<void> {
  const secret = cookieSecret()
  const cookie = (name: string): string | undefined => cookies.get(name)?.value
  if (secret === null && !warned) {
    warned = true
    console.warn("COOKIE_SECRET is not set: the username cookies are taken without a signature")
  }
  verified.set(cookies, secret === null ? readUsers(cookie) : await readSignedUsers(cookie, secret))
}

/** The visitor's usernames, from the request's cookies (`users.ts`), as `verifyUsers` found them: none where it did not read them, unless there is no key to sign with. */
export const usersOf = (cookies: AstroCookies): Users => verified.get(cookies) ?? (cookieSecret() === null ? readUsers((name) => cookies.get(name)?.value) : NO_USERS)

/**
 * Workers on this zone cannot reach an origin outside Cloudflare (every such fetch ends in 525): the relay (`upstream/`) asks on the page's behalf, only for the hosts it knows and
 * only with the key the two share, through its service binding (`UPSTREAM`), or at its address where there is none (`route.ts`).
 * Without a relay (`astro dev`) the source is asked directly.
 */
async function ask(url: string, request: { headers?: Record<string, string>; method?: "GET" | "POST"; body?: string; timeout?: number }): Promise<Response> {
  if (mocking()) return underBase(mockFetch(url, request))
  const upstream = asService(binding("UPSTREAM"))
  const route = routeOf(url, { upstream: upstream !== null, relay: settings()["UPSTREAM_URL"], key: settings()["UPSTREAM_KEY"] })
  const headers: Record<string, string> = { "User-Agent": AGENT, Accept: "application/json", ...request.headers }
  const init = { method: request.method ?? "GET", ...(request.body === undefined ? {} : { body: request.body }), ...(request.timeout === undefined ? {} : { signal: AbortSignal.timeout(request.timeout) }) }
  switch (route.via) {
    case "upstream":
      return upstream!.fetch(route.url, { ...init, headers: { ...headers, "X-Upstream-Key": route.key } })
    case "relay":
      return fetch(route.url, { ...init, headers: { ...headers, "X-Upstream-Key": route.key } })
    case "direct":
      return fetch(route.url, { ...init, headers })
  }
}

/** The made-up data's pictures (`public/mock/`, `/mock/…` in its answers) are the site's own files, so under its base (`/medier/mock/…`). */
async function underBase(answer: Response): Promise<Response> {
  const base = import.meta.env.BASE_URL
  if (base === "/") return answer
  return new Response((await answer.text()).replaceAll('"/mock/', `"${base}mock/`), answer)
}

/** Where an answer is kept. Made-up answers are kept apart, so a run on real data never gets one. */
function keptAt(url: string, key: string | undefined): Request {
  const prefix = mocking() ? `mock:${MOCK_VERSION}:` : ""
  return new Request(key === undefined && prefix === "" ? url : `${KEY_HOST}${encodeURIComponent(`${prefix}${key ?? url}`)}`)
}

/** The answer that is kept, if there is one; an error of Last.fm's that was kept before errors were refused is not an answer. A failure that is kept (`negative-cache.ts`) is thrown again. */
async function keptAnswer(kept: Request): Promise<unknown> {
  const found = await caches.default.match(kept)
  if (found === undefined) return undefined
  const data: unknown = await found.json()
  const failure = failureOf(data)
  if (failure !== null) throw new Error(failure)
  return lastfmError(data) === null ? data : undefined
}

const keep = (cache: Cache, kept: Request, data: unknown, ttl: number): Promise<unknown> =>
  cache.put(kept, new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${ttl}` } })).catch(() => undefined)

/** A failure, kept for a while where it is a «not found» (a name that is not on the service), so it is not asked about on every page; then thrown. */
async function fail(cache: Cache, kept: Request, message: string, ttl: number | null): Promise<never> {
  if (ttl !== null) await keep(cache, kept, keptFailure(message), ttl)
  throw new Error(message)
}

/** A `get` that only reads what is kept and never asks: where nothing is, it fails, as a source that is down does. */
const keptOnly: Get = async (url, request) => {
  const data = await keptAnswer(keptAt(url, request.key))
  if (data === undefined) throw new Error(`${new URL(url).host}: not kept`)
  return { data, hit: true }
}

export const get: Get = async (url, request) => {
  const cache = caches.default
  const kept = keptAt(url, request.key)
  const found = await keptAnswer(kept)
  // Ask again where nothing is kept, and the right answer takes the place of an error that was.
  if (found !== undefined) return { data: found, hit: true }
  const response = await ask(url, request)
  const host = new URL(url).host
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    return fail(cache, kept, `${host}: ${response.status}`, failureTtl(response.status, lastfmErrorCode(body)))
  }
  // 204 is «nothing» (nothing is playing): kept as that, so a quiet moment is not asked about again for its whole length either.
  const data: unknown = response.status === 204 ? null : await response.json()
  const refused = lastfmError(data)
  if (refused !== null) return fail(cache, kept, `${host}: ${refused}`, failureTtl(response.status, lastfmErrorCode(data)))
  // Not being able to keep an answer (it is large, the cache is full) must not lose it: it is the answer, and the next ask simply asks again.
  await keep(cache, kept, data, request.ttl)
  return { data, hit: false }
}

/** Each source on its own, for the visitor's usernames; `null` when it is not set up, the visitor has not given the username, or it is down: a page shows what it has. */
/** A pause between the asks to a source that wants them spaced (MusicBrainz, ListenBrainz); none on made-up data. */
const pause = (ms: number): Promise<void> => (mocking() ? Promise.resolve() : new Promise((done) => setTimeout(done, ms)))
/** The music is Last.fm's; for a visitor with only a ListenBrainz username, ListenBrainz's. */
export const music = (users: Users): Promise<Listening | null> => settle(users.lastfm === null ? loadListenBrainzMusic(settingsFor(users), get, pause) : loadMusic(settingsFor(users), get))
export const games = (users: Users) => settle(loadGames(settingsFor(users), get))
export const game = (users: Users, appId: number) => settle(loadGame(settingsFor(users), get, appId))
/** Whether the Steam user is online, and what they play now; kept for a minute. */
export const steamPresence = (users: Users) => settle(loadSteamPresence(settingsFor(users), get))
/** The Steam user's level, experience and badges. */
export const steamBadges = (users: Users) => settle(loadSteamBadges(settingsFor(users), get))
/** The Steam user's own numbers in a game (kills, distance …), labelled by the game; most games have none. */
export const gameStats = async (users: Users, appId: number) => (await settle(loadGameStats(settingsFor(users), get, appId))) ?? []
/** A game's reviews, players now, news, Steam Deck report and DLC; `dlc` is the store page's own list (`game().store.dlc`), so the page is not asked again. */
export const gameExtras = (appId: number, dlc: readonly number[] = []) => settle(loadGameExtras(get, appId, dlc))
/** The Steam user's wishlist with prices; the sales the visitor has not seen (cookie `steam_sales_seen`, set by `markSalesSeen`) are `newSales`. */
export const wishlist = (users: Users, cookies: AstroCookies): Promise<Wishlist | null> => settle(loadWishlist(settingsFor(users), get, parseSeenSales(cookies.get(SALES_COOKIE)?.value)))
/** Only the wishlist's sales, for a count in the navigation. */
export const wishlistSales = async (users: Users, cookies: AstroCookies): Promise<Pick<Wishlist, "onSale" | "newSales"> | null> => {
  const found = await wishlist(users, cookies)
  return found === null ? null : { onSale: found.onSale, newSales: found.newSales }
}
/** Whether the site has Steam's key: without it there are no games, and no «Spill» in the bar. */
export const hasSteam = (): boolean => (settings()["STEAM_API_KEY"] ?? "") !== ""
export const retroGames = (users: Users) => settle(loadRetroGames(settingsFor(users), get))
export const retroGame = (users: Users, gameId: number) => settle(loadRetroGame(settingsFor(users), get, gameId))
/** Whether the site has RetroAchievements' key: the old console games, beside Steam's under «Spill». */
export const hasRetro = (): boolean => (settings()["RETROACHIEVEMENTS_API_KEY"] ?? "") !== ""
/** Whether «Spill» is in the bar: the site has a key to either source of games. */
export const hasGames = (): boolean => hasSteam() || hasRetro()
export const watched = (users: Users): Promise<Watched | null> => settle(loadWatched(settingsFor(users), get))
export const lastfmNow = (users: Users): Promise<NowPlaying | null> => settle(users.lastfm === null ? loadListenBrainzNow(settingsFor(users), get) : loadLastfmNow(settingsFor(users), get))
export const artist = (users: Users, name: string) => loadArtist(settingsFor(users), get, name)
export const artistListening = (users: Users, name: string) => settle(loadArtistListening(settingsFor(users), get, name, Date.now()))
export const artistPictures = (names: readonly string[]) => loadArtistPictures(settings(), get, names)
export const latestRelease = (artist: string, mbid: string | null) => loadLatestRelease(get, artist, mbid, new Date().toISOString().slice(0, 10))
export const artistLinks = (mbid: string | null) => loadArtistLinks(get, mbid)
export const trackCovers = (users: Users, artist: string, titles: readonly string[]) => loadTrackCovers(settingsFor(users), get, artist, titles)
export const watchProviders = (kind: "film" | "episode", tmdbId: number) => settle(loadWatchProviders(settings(), get, kind, tmdbId))
export const setlists = (mbid: string | null) => settle(loadSetlists(settings(), get, mbid, new Date().toISOString().slice(0, 10)))
export const person = (id: number) => settle(loadPerson(settings(), get, id))
export const album = (users: Users, artist: string, title: string) => loadAlbum(settingsFor(users), get, artist, title)
export const albumTimeline = (users: Users, artist: string, title: string) => settle(loadAlbumTimeline(settingsFor(users), get, artist, title, Date.now()))
export const albumRelease = (users: Users, artist: string, title: string, credits: boolean) => settle(loadAlbumRelease(settingsFor(users), get, artist, title, { credits, pause }))
/**
 * What the sleeve in an album's head holds (`discOf`), from what MusicBrainz said of the album the last time it was asked (by the page's release island), never by asking it: the head is drawn before
 * MusicBrainz could answer, and must not change its shape once it is. So the first visit to an album has a record, and every visit after that, for as long as the answers are kept, the right one.
 */
export const albumDisc = async (users: Users, artist: string, title: string): Promise<"record" | "cd"> =>
  discOf((await settle(loadAlbumRelease(settingsFor(users), keptOnly, artist, title, { credits: false, pause: () => Promise.resolve() })))?.first ?? null)
export const albumDays = (users: Users, artist: string, title: string) => settle(loadAlbumDays(settingsFor(users), get, artist, title, Date.now()))
export const track = (users: Users, artist: string, title: string) => loadTrack(settingsFor(users), get, artist, title)
export const week = (users: Users, which: Week, medium: Medium) => settle(loadWeek(settingsFor(users), get, which, Date.now(), medium))
export const month = (users: Users, which: Month, medium: Medium) => settle(loadMonth(settingsFor(users), get, which, Date.now(), medium))
export const trend = (users: Users, periods: readonly { id: string; start: number; end: number }[]) => settle(loadTrend(settingsFor(users), get, periods, Date.now()))

/** Whether the services have this username (a Trakt profile must be public); in a run on made-up data every name is one. */
export const lastfmUserFound = (user: string): Promise<boolean> => (mocking() ? Promise.resolve(true) : lastfmUserExists(settings(), get, user))
export const traktUserFound = (user: string): Promise<boolean> => (mocking() ? Promise.resolve(true) : traktUserExists(settings(), get, user))
export const listenbrainzUserFound = (user: string): Promise<boolean> => (mocking() ? Promise.resolve(true) : listenbrainzUserExists(get, user))
export const retroUserFound = (user: string): Promise<boolean> => (mocking() ? Promise.resolve(true) : retroUserExists(settings(), get, user))
export const steamUserFound = (user: string): Promise<boolean> => (mocking() ? Promise.resolve(true) : steamUserExists(settings(), get, user))
