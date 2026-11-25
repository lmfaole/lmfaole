/**
 * What a page needs from Last.fm, Trakt, TMDB, Spotify and MusicBrainz, for the visitor's own usernames (`users.ts`), asked for when the page is asked for. Each answer is kept for a while (`TTL`), so a page
 * is quick and the sources are asked little. Pure: the asking is done by the `get` that is passed in (`runtime.ts`), so a test hands it a fake one.
 */

import { type AlbumInfo, albumInfoUrl, allTimeArtistsUrl, allTimeTracksUrl, artistChartUrl, type ArtistInfo, artistInfoUrl, artistTopAlbumsUrl, type Music, parseAlbumInfo, type Play, parseArtistChart, parseArtistInfo, parseRecentPage, parseRecentTracks, parseSimilarArtists, parseTopAlbums, parseTopArtists, parseTopTracks, parseTrackInfo, parseUserInfo, playsInRangeUrl, similarArtistsUrl, type TopTrack, type TrackInfo, trackInfoUrl, userInfoUrl } from "./lastfm.ts"
import { albumShelf, type ShelfAlbum } from "./albums.ts"
import { listeningPeriods, type PeriodUnit, placeAmong, playsIn, similarHeard, tracksBy } from "./artist-listening.ts"
import { parseStudioAlbums, releaseGroupsUrl } from "./musicbrainz.ts"
import { albumChartUrl, albumDayCounts, albumPlaysIn, allTimeAlbumsUrl, type DiscographyAlbum, discographyPlays, parseAlbumChart, parseTopAlbumsOfUser } from "./album-listening.ts"
import { type Month, recentMonths } from "./months.ts"
import { dateAt } from "./weeks.ts"
import { type Credits, discographyPlace, type DiscographyPlace, type Edition, firstRelease, groupReleasesUrl, otherEditions, parseCredits, parseReleaseGroupMatch, parseReleases, type Release, releaseCreditsUrl, releaseGroupSearchUrl, studioIndex } from "./musicbrainz-release.ts"
import { type ArtistLink, artistUrlsUrl, type LatestRelease, latestReleasesUrl, parseArtistUrls, parseLatestRelease, parseWikipedia, wikipediaLinksUrl, withWikipedia } from "./musicbrainz-artist.ts"
import { type NowPlaying, parseAlbumMatch, parseArtistMatch, parseToken, parseTrackMatch, refreshRequest, searchAlbumUrl, searchArtistUrl, searchTrackUrl, type SpotifyAlbum, type SpotifyArtist, type SpotifyTrack } from "./spotify.ts"
import { authorize, detailsUrl, parseInfo, parsePerson, parsePoster, type Person, personUrl, type TitleInfo } from "./tmdb.ts"
import { mergeHistory, parseHistory, type Watch, type Watched } from "./trakt.ts"
import { LISTENBRAINZ_PAUSE_MS, listenCountUrl, listensUrl, parseListens, parsePlayingNow, parseTopArtists as parseLbTopArtists, parseUserFound, playingNowUrl, topArtistsUrl as lbTopArtistsUrl } from "./listenbrainz.ts"
import { type Achievements, achievementsUrl, globalAchievementsUrl, isSteamId, type OwnedGame, ownedGamesUrl, parseAchievements, parseOwnedGame, parseOwnedGames, parseOwnedList, parseRecentGames, parseVanity, profileUrl, recentGamesUrl, schemaUrl, storeDetailsUrl, vanityUrl } from "./steam.ts"
import { type GameEntry, retroEntry, steamEntry } from "./played-games.ts"
import { badgesUrl, type GameStat, parseBadges, parsePlayerSummary, parseSteamLevel, parseUserStats, playerSummariesUrl, type SteamBadges, steamLevelUrl, type SteamPresence, userStatsUrl } from "./steam-profile.ts"
import { currentPlayersUrl, type DeckCompatibility, deckUrl, type Dlc, DLC_LIMIT, dlcOf, type NewsItem, newsUrl, parseCurrentPlayers, parseDeck, parseNews, parsePrices, parseReviews, parseStoreApp, parseStoreItems, pricesUrl, type Reviews, reviewsUrl, STORE_BATCH, type StoreApp, type StoreItem, storeItemsUrl, type StorePrice } from "./steam-store.ts"
import { parseWishlist, type Wishlist, WISHLIST_LIMIT, wishlistOf, wishlistUrl } from "./steam-wishlist.ts"
import { parseRetroGame, parseRetroProfile, parseRetroRecent, type RetroGameDetail, retroGameUrl, retroProfileUrl, retroRecentUrl, retroUserPage } from "./retroachievements.ts"
import { parseSetlists, type Setlists, setlistHeaders, setlistsUrl } from "./setlistfm.ts"
import { parseWatchProviders, type WatchProviders, watchProvidersUrl } from "./watch-providers.ts"
import type { Users } from "./users.ts"

/**
 * The settings a request is asked with: the Worker's secrets (`settings.ts`), and the visitor's usernames as `LASTFM_USER`, `TRAKT_USER`, `LISTENBRAINZ_USER`, `STEAM_USER` and `RETROACHIEVEMENTS_USER` (`forUsers`). A source whose key
 * or username is not set is left out, not an error.
 */
export type Env = Readonly<Partial<Record<string, string>>>

/** The Worker's settings with the visitor's usernames, and only theirs: a username the Worker itself has (an old variable) is never one. */
export function forUsers(env: Env, users: Users): Env {
  const { LASTFM_USER: _lastfm, TRAKT_USER: _trakt, LISTENBRAINZ_USER: _listenbrainz, STEAM_USER: _steam, RETROACHIEVEMENTS_USER: _retro, ...rest } = env
  const named = (key: string, user: string | null): Env => (user === null ? {} : { [key]: user })
  return { ...rest, ...named("LASTFM_USER", users.lastfm), ...named("TRAKT_USER", users.trakt), ...named("LISTENBRAINZ_USER", users.listenbrainz), ...named("STEAM_USER", users.steam), ...named("RETROACHIEVEMENTS_USER", users.retroachievements) }
}

export interface Request {
  headers?: Record<string, string>
  method?: "GET" | "POST"
  body?: string
  /** For how many seconds the answer is kept. */
  ttl: number
  /** What the answer is kept under; the address for a GET. A POST names its own. */
  key?: string
  /** How many milliseconds the source is given to answer before the ask is given up (an error, as any); none, as long as the Worker lets it. */
  timeout?: number
}

/** Asks for an address and gives the answer read as JSON, `null` for an answer with no body (204). `hit` is true when it came from what was kept. Throws on an error answer. */
export type Get = (url: string, request: Request) => Promise<{ data: unknown; hit: boolean }>

/** How long each kind of answer is kept, in seconds. A poster does not change; what is playing now does, quickly. */
export const TTL = { nowPlaying: 15, token: 3000, user: 3600, recent: 60, topArtists: 3600, history: 300, poster: 30 * 24 * 3600, artist: 24 * 3600, weekDone: 24 * 3600, weekLive: 300, firsts: 7 * 24 * 3600, length: 7 * 24 * 3600, albums: 7 * 24 * 3600, allTime: 6 * 3600, periodDone: 30 * 24 * 3600, periodLive: 3600, release: 30 * 24 * 3600, providers: 24 * 3600, setlists: 24 * 3600, steamId: 30 * 24 * 3600, gamesRecent: 600, gamesOwned: 6 * 3600, gameStore: 24 * 3600, achievements: 600, achievementSchema: 7 * 24 * 3600, achievementShares: 24 * 3600, retroUser: 24 * 3600, retroRecent: 600, retroGame: 600, steamPresence: 60, steamBadges: 6 * 3600, steamStats: 600, wishlist: 3600, storePrices: 3600, storeItems: 7 * 24 * 3600, reviews: 6 * 3600, playersNow: 120, news: 3600, deck: 7 * 24 * 3600 } as const

/** How long Steam is given to answer one of the asks beyond a game's own (`loadGameExtras`, the profile's, the wishlist's): a page is not held up by one that is slow. */
export const STEAM_TIMEOUT = 5000

/** Most of a page's asks that are not kept already: a cold page must stay well under a Worker's limit on what it may ask for. */
export const MAX_POSTER_LOOKUPS = 12
const POSTER_BATCH = 6

/**
 * Last.fm answers an error with HTTP 200 and a body of `{ "error": 29, "message": "…" }` (a rate limit, a method that is gone, an artist it does not know), so «ok» does not say the answer is one. The message of such an error, or `null` for
 * an answer that is not one. An error is never kept: the next ask may be right, and one that was kept would be shown for as long as it is kept.
 */
export function lastfmError(data: unknown): string | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null
  const body = data as Record<string, unknown>
  return typeof body["error"] === "number" && typeof body["message"] === "string" ? body["message"] : null
}

export const setting = (env: Env, name: string): string => env[name] ?? ""

/** The music, and the song Last.fm says is playing now (a scrobble of whatever plays, Spotify included), which is not a finished play and so not in `recent`. */
export interface Listening extends Music {
  now: NowPlaying | null
  /** Whose the plays are: Last.fm's, or ListenBrainz's for a visitor without Last.fm (who then has no pages of an artist, an album or a song: those are Last.fm's). */
  source: "lastfm" | "listenbrainz"
}

/** The start of every Last.fm address: the key and the user, or `null` where there is no key or no user. */
export function lastfmBase(env: Env): string | null {
  const key = setting(env, "LASTFM_API_KEY")
  const user = setting(env, "LASTFM_USER")
  if (key === "" || user === "") return null
  return `https://ws.audioscrobbler.com/2.0/?format=json&api_key=${encodeURIComponent(key)}&user=${encodeURIComponent(user)}`
}

/**
 * Whether a username is one Last.fm has (`user.getinfo`; an unknown user is an error, which `get` throws). `true` where Last.fm is not set up: there is nothing to ask, and nothing
 * will be shown for it either.
 */
export async function lastfmUserExists(env: Env, get: Get, user: string): Promise<boolean> {
  const key = setting(env, "LASTFM_API_KEY")
  if (key === "") return true
  try {
    const answer = await get(`https://ws.audioscrobbler.com/2.0/?format=json&method=user.getinfo&api_key=${encodeURIComponent(key)}&user=${encodeURIComponent(user)}`, { ttl: TTL.user })
    const found = (answer.data as { user?: { name?: unknown } } | null)?.user?.name
    return typeof found === "string" && found !== ""
  } catch {
    return false
  }
}

/** Whether a username is one Trakt has with a public profile: a private or unknown one answers 401/403/404 (which `get` throws), or says `private`. `true` where Trakt is not set up. */
export async function traktUserExists(env: Env, get: Get, user: string): Promise<boolean> {
  const clientId = setting(env, "TRAKT_CLIENT_ID")
  if (clientId === "") return true
  try {
    const answer = await get(`https://api.trakt.tv/users/${encodeURIComponent(user)}`, { headers: { "trakt-api-version": "2", "trakt-api-key": clientId }, ttl: TTL.user })
    const profile = answer.data as { username?: unknown; private?: unknown } | null
    return typeof profile?.username === "string" && profile.private !== true
  } catch {
    return false
  }
}

export async function loadMusic(env: Env, get: Get): Promise<Listening | null> {
  const base = lastfmBase(env)
  if (base === null) return null
  const user = setting(env, "LASTFM_USER")
  const [recent, top] = await Promise.all([
    get(`${base}&method=user.getrecenttracks&limit=50`, { ttl: TTL.recent }),
    get(`${base}&method=user.gettopartists&period=1month&limit=10`, { ttl: TTL.topArtists }),
  ])
  const plays = parseRecentTracks(recent.data)
  const playing = plays.find((play) => play.playedAt === null)
  const now = playing === undefined ? null : { track: playing.track, artist: playing.artist, album: playing.album, image: playing.image, url: playing.url }
  return { at: new Date().toISOString(), user, recent: plays.filter((play) => play.playedAt !== null), topArtists: parseTopArtists(top.data), now, source: "lastfm" }
}

/** ListenBrainz's asks one after another, a second apart where the one before was not kept (it asks for at most one a second). */
function listenBrainzAsker(get: Get, pause: (ms: number) => Promise<void>): (url: string, ttl: number) => Promise<unknown> {
  let asked = false
  return async (url, ttl) => {
    if (asked) await pause(LISTENBRAINZ_PAUSE_MS)
    try {
      const answer = await get(url, { ttl })
      asked = !answer.hit
      return answer.data
    } catch (error) {
      asked = true
      throw error
    }
  }
}

/**
 * The music from ListenBrainz (`listenbrainz.ts`) for a visitor with a ListenBrainz username and no Last.fm: the last fifty listens, what plays now and the month's top artists, in Last.fm's shape. What
 * plays now and the top artists leave out only themselves when they fail. `null` without the username.
 */
export async function loadListenBrainzMusic(env: Env, get: Get, pause: (ms: number) => Promise<void>): Promise<Listening | null> {
  const user = setting(env, "LISTENBRAINZ_USER")
  if (user === "") return null
  const ask = listenBrainzAsker(get, pause)
  const listens = await ask(listensUrl(user), TTL.recent)
  const playing = await ask(playingNowUrl(user), TTL.nowPlaying).catch(() => null)
  const top = await ask(lbTopArtistsUrl(user), TTL.topArtists).catch(() => null)
  return { at: new Date().toISOString(), user, recent: parseListens(listens, user), topArtists: parseLbTopArtists(top), now: parsePlayingNow(playing, user), source: "listenbrainz" }
}

/** What ListenBrainz says plays now, for the card that keeps asking; `null` without the username or when nothing plays. */
export async function loadListenBrainzNow(env: Env, get: Get): Promise<NowPlaying | null> {
  const user = setting(env, "LISTENBRAINZ_USER")
  if (user === "") return null
  return parsePlayingNow((await get(playingNowUrl(user), { ttl: TTL.nowPlaying })).data, user)
}

/** Whether ListenBrainz has a user of that name (an unknown one answers 404, which `get` throws). */
export async function listenbrainzUserExists(get: Get, user: string): Promise<boolean> {
  try {
    return parseUserFound((await get(listenCountUrl(user), { ttl: TTL.user })).data)
  } catch {
    return false
  }
}

/**
 * Each film and show asks TMDB once (kept for a month) for its poster and a few lines to know it by (plot, genres, length, vote), both from the one answer; at most
 * `MAX_POSTER_LOOKUPS` that were not kept are asked in one page, newest first, so the rest are filled in by the next pages. What cannot be fetched is left out: the row
 * shows an empty frame, the page no plot.
 */
export async function withPosters(items: readonly Watch[], tmdbKey: string, get: Get): Promise<Watch[]> {
  const posters = new Map<string, { poster: string | null; info: TitleInfo }>()
  if (tmdbKey !== "") {
    const wanted = [...new Map(items.filter((watch) => watch.tmdbId !== null).map((watch) => [`${watch.kind}:${watch.tmdbId}`, watch])).entries()]
    let asked = 0
    for (let start = 0; start < wanted.length && asked < MAX_POSTER_LOOKUPS; start += POSTER_BATCH) {
      await Promise.all(
        wanted.slice(start, start + POSTER_BATCH).map(async ([key, watch]) => {
          try {
            const request = authorize(tmdbKey, detailsUrl(watch.kind, watch.tmdbId ?? 0))
            const answer = await get(request.url, { headers: request.headers, ttl: TTL.poster })
            if (!answer.hit) asked += 1
            posters.set(key, { poster: parsePoster(answer.data), info: parseInfo(answer.data) })
          } catch {
            // Left out: the row has an empty frame until a later page has it. A failure is an ask too, or a key TMDB refuses would be asked for every film.
            asked += 1
          }
        }),
      )
    }
  }
  return items.map((watch) => {
    const found = posters.get(`${watch.kind}:${watch.tmdbId}`)
    return { ...watch, poster: found?.poster ?? null, info: found?.info ?? null }
  })
}

export async function loadWatched(env: Env, get: Get): Promise<Watched | null> {
  const clientId = setting(env, "TRAKT_CLIENT_ID")
  const user = setting(env, "TRAKT_USER")
  if (clientId === "" || user === "") return null
  const headers = { "trakt-api-version": "2", "trakt-api-key": clientId }
  const page = async (kind: string) => parseHistory((await get(`https://api.trakt.tv/users/${encodeURIComponent(user)}/history/${kind}?limit=50`, { headers, ttl: TTL.history })).data)
  const [movies, episodes] = await Promise.all([page("movies"), page("episodes")])
  const items = mergeHistory(movies, episodes).slice(0, 50)
  return { at: new Date().toISOString(), user, items: await withPosters(items, setting(env, "TMDB_API_KEY"), get) }
}

/** A person from TMDB's page of them (their life story, dates and place), kept for a month; `null` where TMDB is not set up, does not know them, or did not answer. */
export async function loadPerson(env: Env, get: Get, id: number): Promise<Person | null> {
  const key = setting(env, "TMDB_API_KEY")
  if (key === "") return null
  const request = authorize(key, personUrl(id))
  return parsePerson((await get(request.url, { headers: request.headers, ttl: TTL.poster })).data)
}

/** Where a film or a show can be seen in Norway (`watch-providers.ts`, JustWatch's data through TMDB), kept for a day; `null` without a TMDB key or where it is nowhere there. */
export async function loadWatchProviders(env: Env, get: Get, kind: "film" | "episode", tmdbId: number): Promise<WatchProviders | null> {
  const key = setting(env, "TMDB_API_KEY")
  if (key === "") return null
  const request = authorize(key, watchProvidersUrl(kind, tmdbId))
  return parseWatchProviders((await get(request.url, { headers: request.headers, ttl: TTL.providers })).data)
}

/** The SteamID of a profile given by its SteamID or its custom name (resolved by Steam, kept for a month); `null` where Steam knows no such name. */
async function steamId(key: string, get: Get, user: string): Promise<string | null> {
  if (isSteamId(user)) return user
  return parseVanity((await get(vanityUrl(key, user), { ttl: TTL.steamId })).data)
}

/** Whether a Steam profile is one Steam knows, by its SteamID or custom name; `true` where Steam is not set up (nothing will be shown for it either). */
export async function steamUserExists(env: Env, get: Get, user: string): Promise<boolean> {
  const key = setting(env, "STEAM_API_KEY")
  if (key === "") return true
  try {
    return (await steamId(key, get, user)) !== null
  } catch {
    return false
  }
}

/** The visitor's games on one service, each as a row of «Spill» (`played-games.ts`). */
export interface GameLibrary {
  entries: GameEntry[]
  /** How many games the profile has; `null` where the service does not say, or its list is not public. */
  owned: number | null
  /** The profile on the service. */
  profile: string
}

/**
 * The visitor's games on Steam (`steam.ts`): every game of the owned list (kept for six hours), with the minutes of the last two weeks (kept for ten minutes); `null` without the key or the
 * profile, or where Steam knows no such profile. A profile whose game details are private has no games.
 */
export async function loadGames(env: Env, get: Get): Promise<GameLibrary | null> {
  const key = setting(env, "STEAM_API_KEY")
  const user = setting(env, "STEAM_USER")
  if (key === "" || user === "") return null
  const id = await steamId(key, get, user)
  if (id === null) return null
  const [recent, owned] = await Promise.all([get(recentGamesUrl(key, id), { ttl: TTL.gamesRecent }), get(ownedGamesUrl(key, id), { ttl: TTL.gamesOwned })])
  const fortnight = parseRecentGames(recent.data)
  const all = parseOwnedList(owned.data)
  const minutes = new Map(fortnight.map((game) => [game.appId, game.recentMinutes]))
  const have = new Set(all.map((game) => game.appId))
  // A game played lately that the list has not got (lent from a family member): its time from the fortnight's list.
  const lent = fortnight.filter((game) => !have.has(game.appId)).map((game) => steamEntry({ appId: game.appId, name: game.name, totalMinutes: game.totalMinutes, lastPlayed: null, platforms: [] }, game.recentMinutes))
  return { entries: [...all.map((game) => steamEntry(game, minutes.get(game.appId) ?? 0)), ...lent], owned: parseOwnedGames(owned.data)?.owned ?? null, profile: profileUrl(id) }
}

/** One game of the visitor's on Steam, for its page: their time with it, what the store says of it, and their achievements in it. */
export interface GameDetail {
  game: OwnedGame
  /** Minutes played the last two weeks. */
  recentMinutes: number
  /** All the store's page says of it (one ask, kept a day): `StoreGame`'s, and its pictures, films, machines, kinds of play, controller and DLC ids. */
  store: StoreApp | null
  achievements: Achievements | null
  /** The profile on Steam. */
  profile: string
}

/**
 * A game's page (`steam.ts`): the owned list and the last two weeks (the same answers as `loadGames`, kept already), the store's page of it (a day), and the achievements (ten
 * minutes; their names and pictures a week, the shares of all players a day). `null` without the key or the profile, or where the profile has not got the game; the store and the
 * achievements each `null` on their own where they fail (a profile whose achievements are not public).
 */
export async function loadGame(env: Env, get: Get, appId: number): Promise<GameDetail | null> {
  const key = setting(env, "STEAM_API_KEY")
  const user = setting(env, "STEAM_USER")
  if (key === "" || user === "") return null
  const id = await steamId(key, get, user)
  if (id === null) return null
  const [owned, recent] = await Promise.all([get(ownedGamesUrl(key, id), { ttl: TTL.gamesOwned }), settle(get(recentGamesUrl(key, id), { ttl: TTL.gamesRecent }))])
  const game = parseOwnedGame(owned.data, appId)
  if (game === null) return null
  const [store, achievements] = await Promise.all([
    settle(get(storeDetailsUrl(appId), { ttl: TTL.gameStore }).then((answer) => parseStoreApp(answer.data, appId))),
    settle(
      Promise.all([get(achievementsUrl(key, id, appId), { ttl: TTL.achievements }), settle(get(schemaUrl(key, appId), { ttl: TTL.achievementSchema })), settle(get(globalAchievementsUrl(appId), { ttl: TTL.achievementShares }))]).then(([player, schema, shares]) =>
        parseAchievements(player.data, schema?.data, shares?.data),
      ),
    ),
  ])
  const recentMinutes = recent === null ? 0 : (parseRecentGames(recent.data).find((one) => one.appId === appId)?.recentMinutes ?? 0)
  return { game, recentMinutes, store, achievements, profile: profileUrl(id) }
}

/** The key and the visitor's SteamID; `null` without either, or where Steam knows no such profile. */
async function steamProfile(env: Env, get: Get): Promise<{ key: string; id: string } | null> {
  const key = setting(env, "STEAM_API_KEY")
  const user = setting(env, "STEAM_USER")
  if (key === "" || user === "") return null
  const id = await steamId(key, get, user)
  return id === null ? null : { key, id }
}

/** Whether the visitor is online on Steam and what they play now (`steam-profile.ts`), kept a minute; `null` without the key or the profile. */
export async function loadSteamPresence(env: Env, get: Get): Promise<SteamPresence | null> {
  const profile = await steamProfile(env, get)
  if (profile === null) return null
  return parsePlayerSummary((await get(playerSummariesUrl(profile.key, profile.id), { ttl: TTL.steamPresence, timeout: STEAM_TIMEOUT })).data, profile.id)
}

/**
 * The visitor's Steam level and badges (`GetBadges`, kept six hours), a game's badge named by the owned list (the same answer `loadGames` keeps); where the badges are not told, the level alone
 * (`GetSteamLevel`) with no badges. `null` without the key or the profile, or where neither is told.
 */
export async function loadSteamBadges(env: Env, get: Get): Promise<SteamBadges | null> {
  const profile = await steamProfile(env, get)
  if (profile === null) return null
  const [answer, owned] = await Promise.all([settle(get(badgesUrl(profile.key, profile.id), { ttl: TTL.steamBadges, timeout: STEAM_TIMEOUT })), settle(get(ownedGamesUrl(profile.key, profile.id), { ttl: TTL.gamesOwned }))])
  const names = new Map((owned === null ? [] : parseOwnedList(owned.data)).map((game) => [game.appId, game.name] as const))
  const badges = answer === null ? null : parseBadges(answer.data, names)
  if (badges !== null) return badges
  const level = await settle(get(steamLevelUrl(profile.key, profile.id), { ttl: TTL.steamBadges, timeout: STEAM_TIMEOUT }).then((one) => parseSteamLevel(one.data)))
  return level === null ? null : { level, xp: 0, xpToNext: 0, xpLevelStart: 0, badges: [] }
}

/** The visitor's own numbers in a game (`GetUserStatsForGame`, ten minutes), named by the game's schema (the achievements' answer, a week); empty where the game keeps none, it fails, or there is no profile. */
export async function loadGameStats(env: Env, get: Get, appId: number): Promise<GameStat[]> {
  const profile = await steamProfile(env, get).catch(() => null)
  if (profile === null) return []
  const [player, schema] = await Promise.all([settle(get(userStatsUrl(profile.key, profile.id, appId), { ttl: TTL.steamStats, timeout: STEAM_TIMEOUT })), settle(get(schemaUrl(profile.key, appId), { ttl: TTL.achievementSchema, timeout: STEAM_TIMEOUT }))])
  return player === null ? [] : parseUserStats(player.data, schema?.data)
}

/** The names and the prices of many games, `STORE_BATCH` to an ask; a batch that fails leaves its games without (never the rest). */
async function namesAndPrices(get: Get, appIds: readonly number[]): Promise<{ names: Map<number, StoreItem>; prices: Map<number, StorePrice | null> }> {
  const batches = Array.from({ length: Math.ceil(appIds.length / STORE_BATCH) }, (_, at) => appIds.slice(at * STORE_BATCH, (at + 1) * STORE_BATCH))
  const answers = await Promise.all(
    batches.map((ids) =>
      Promise.all([
        settle(get(storeItemsUrl(ids), { ttl: TTL.storeItems, timeout: STEAM_TIMEOUT }).then((answer) => parseStoreItems(answer.data))),
        settle(get(pricesUrl(ids), { ttl: TTL.storePrices, timeout: STEAM_TIMEOUT }).then((answer) => parsePrices(answer.data))),
      ]),
    ),
  )
  return { names: new Map(answers.flatMap(([names]) => [...(names ?? [])])), prices: new Map(answers.flatMap(([, prices]) => [...(prices ?? [])])) }
}

/**
 * The visitor's wishlist (`steam-wishlist.ts`, kept an hour) with the names (a week) and the prices in Norway (an hour) of its first `WISHLIST_LIMIT` games, and which are on sale, now and since
 * `seen` (the visitor's cookie, `parseSeenSales`). `null` without the key or the profile, or where the wishlist is not public.
 */
export async function loadWishlist(env: Env, get: Get, seen: ReadonlySet<number> | null): Promise<Wishlist | null> {
  const profile = await steamProfile(env, get)
  if (profile === null) return null
  const wishes = parseWishlist((await get(wishlistUrl(profile.id), { ttl: TTL.wishlist, timeout: STEAM_TIMEOUT })).data)
  if (wishes === null) return null
  const first = wishes.slice(0, WISHLIST_LIMIT)
  const { names, prices } = await namesAndPrices(get, first.map((wish) => wish.appId))
  return wishlistOf(first, names, prices, seen, wishes.length > first.length)
}

/** What a game's page may show beyond `GameDetail`, each `null` (or empty) on its own where it fails: Steam's public answers, with no key and no profile. */
export interface GameExtras {
  reviews: Reviews | null
  /** How many play it on Steam now. */
  playersNow: number | null
  /** Its news and patch notes, newest first (`kind` tells them apart). */
  news: NewsItem[]
  deck: DeckCompatibility | null
  /** Its first `DLC_LIMIT` DLC, named and priced. */
  dlc: Dlc[]
}

/**
 * A game's reviews (six hours), players now (two minutes), news (an hour), Steam Deck report (a week) and DLC (`dlc`, the ids of `StoreApp`, so the store's page is not asked again: names a
 * week, prices an hour). At most six asks, each given `STEAM_TIMEOUT`.
 */
export async function loadGameExtras(get: Get, appId: number, dlc: readonly number[] = []): Promise<GameExtras> {
  const ask = (url: string, ttl: number) => settle(get(url, { ttl, timeout: STEAM_TIMEOUT }).then((answer) => answer.data))
  const ids = dlc.slice(0, DLC_LIMIT)
  const [reviews, players, news, deck, priced] = await Promise.all([
    ask(reviewsUrl(appId), TTL.reviews),
    ask(currentPlayersUrl(appId), TTL.playersNow),
    ask(newsUrl(appId), TTL.news),
    ask(deckUrl(appId), TTL.deck),
    ids.length === 0 ? null : namesAndPrices(get, ids),
  ])
  return {
    reviews: reviews === null ? null : parseReviews(reviews),
    playersNow: players === null ? null : parseCurrentPlayers(players),
    news: news === null ? [] : parseNews(news),
    deck: deck === null ? null : parseDeck(deck),
    dlc: priced === null ? [] : dlcOf(ids, priced.names, priced.prices),
  }
}

/** Whether a profile is one RetroAchievements knows (it answers 404 for one it does not); `true` where it is not set up. */
export async function retroUserExists(env: Env, get: Get, user: string): Promise<boolean> {
  const key = setting(env, "RETROACHIEVEMENTS_API_KEY")
  if (key === "") return true
  try {
    return parseRetroProfile((await get(retroProfileUrl(key, user), { ttl: TTL.retroUser })).data)
  } catch {
    return false
  }
}

/** How many of the games played lately on RetroAchievements have their time asked for: only a game's own answer says it, one request each. */
const RETRO_TIMED = 12

/**
 * The visitor's games on RetroAchievements (`retroachievements.ts`), the last played first, kept for ten minutes, each with its time played (from the game's own answer, the same one its
 * page asks for, kept as long); `null` without the key or the username. A game whose answer fails has no time.
 */
export async function loadRetroGames(env: Env, get: Get): Promise<GameLibrary | null> {
  const key = setting(env, "RETROACHIEVEMENTS_API_KEY")
  const user = setting(env, "RETROACHIEVEMENTS_USER")
  if (key === "" || user === "") return null
  const games = parseRetroRecent((await get(retroRecentUrl(key, user), { ttl: TTL.retroRecent })).data)
  const minutes = await Promise.all(games.map((game, at) => (at >= RETRO_TIMED ? null : settle(get(retroGameUrl(key, user, game.gameId), { ttl: TTL.retroGame }).then((answer) => parseRetroGame(answer.data)?.minutes ?? 0)))))
  return { entries: games.map((game, at) => retroEntry(game, minutes[at] ?? 0)), owned: null, profile: retroUserPage(user) }
}

/** One game on RetroAchievements with the visitor's progress in it, and when they last played it (from the recent list), kept for ten minutes; `null` without the key or the username, or where there is no such game. */
export async function loadRetroGame(env: Env, get: Get, gameId: number): Promise<{ game: RetroGameDetail; lastPlayed: number | null; profile: string } | null> {
  const key = setting(env, "RETROACHIEVEMENTS_API_KEY")
  const user = setting(env, "RETROACHIEVEMENTS_USER")
  if (key === "" || user === "") return null
  const [answer, recent] = await Promise.all([get(retroGameUrl(key, user, gameId), { ttl: TTL.retroGame }), settle(get(retroRecentUrl(key, user), { ttl: TTL.retroRecent }))])
  const game = parseRetroGame(answer.data)
  if (game === null) return null
  const lastPlayed = recent === null ? null : (parseRetroRecent(recent.data).find((one) => one.gameId === gameId)?.lastPlayed ?? null)
  return { game, lastPlayed, profile: retroUserPage(user) }
}

/** An artist's concerts that have been, from setlist.fm by its MusicBrainz id (`setlistfm.ts`), kept for a day; `null` without the key or the id, or where setlist.fm has none (it answers 404). */
export async function loadSetlists(env: Env, get: Get, mbid: string | null, today: string): Promise<Setlists | null> {
  const key = setting(env, "SETLISTFM_API_KEY")
  if (key === "" || mbid === null) return null
  return parseSetlists((await get(setlistsUrl(mbid), { headers: setlistHeaders(key), ttl: TTL.setlists })).data, today)
}

/** What Last.fm says plays now: one play asked for, kept for fifteen seconds. `null` where nothing plays, Last.fm is not set up or there is no username. */
export async function loadLastfmNow(env: Env, get: Get): Promise<NowPlaying | null> {
  const base = lastfmBase(env)
  if (base === null) return null
  const playing = parseRecentTracks((await get(`${base}&method=user.getrecenttracks&limit=1`, { ttl: TTL.nowPlaying })).data).find((play) => play.playedAt === null)
  return playing === undefined ? null : { track: playing.track, artist: playing.artist, album: playing.album, image: playing.image, url: playing.url }
}

/** The access token (an hour), made from the refresh token and kept for 50 minutes under its own key; `null` where Spotify is not set up or its sign-in has run out. */
async function spotifyToken(env: Env, get: Get): Promise<string | null> {
  const [clientId, secret, refresh] = [setting(env, "SPOTIFY_CLIENT_ID"), setting(env, "SPOTIFY_CLIENT_SECRET"), setting(env, "SPOTIFY_REFRESH_TOKEN")]
  if (clientId === "" || secret === "" || refresh === "") return null
  const request = refreshRequest(clientId, secret, refresh)
  return parseToken((await get(request.url, { method: request.method, headers: request.headers, body: request.body, ttl: TTL.token, key: "spotify:token" })).data)?.accessToken ?? null
}

/** An artist on Spotify by name, or `null` (not set up, not found under that name, or Spotify did not answer: a page without a picture is a page). */
async function spotifyArtist(token: string, name: string, get: Get): Promise<{ artist: SpotifyArtist | null; hit: boolean }> {
  try {
    const answer = await get(searchArtistUrl(name), { headers: { Authorization: `Bearer ${token}` }, ttl: TTL.artist })
    return { artist: parseArtistMatch(answer.data, name), hit: answer.hit }
  } catch {
    return { artist: null, hit: false }
  }
}

/** Where an artist's albums were told from the rest: MusicBrainz said which are albums, or (it could not) the titles were. */
export type AlbumsFrom = "musicbrainz" | "titles"

/**
 * What an artist's page shows beyond its plays: Last.fm's tags, listeners, text and albums, and Spotify's picture; each leaves out only itself when it fails. The albums are only
 * albums: Last.fm ranks every release, and MusicBrainz (asked by the id Last.fm gives, else by the name; kept for a week) says which are albums and when each came out (`albums.ts`).
 */
export async function loadArtist(env: Env, get: Get, name: string): Promise<{ lastfm: ArtistInfo | null; spotify: SpotifyArtist | null; albums: ShelfAlbum[]; albumsFrom: AlbumsFrom }> {
  const base = lastfmBase(env)
  const [lastfm, spotify, ranked] = await Promise.all([
    base === null ? null : settle(get(artistInfoUrl(base, name, setting(env, "LASTFM_USER")), { ttl: TTL.artist })).then((answer) => (answer === null ? null : parseArtistInfo(answer.data))),
    spotifyToken(env, get).then((token) => (token === null ? null : spotifyArtist(token, name, get).then((found) => found.artist))).catch(() => null),
    base === null ? [] : settle(get(artistTopAlbumsUrl(base, name), { ttl: TTL.artist })).then((answer) => (answer === null ? [] : parseTopAlbums(answer.data, Number.POSITIVE_INFINITY))),
  ])
  const mbid = lastfm?.mbid ?? null
  const studio = ranked.length === 0 ? null : await settle(get(releaseGroupsUrl(name, mbid), { ttl: TTL.albums })).then((answer) => (answer === null ? null : parseStudioAlbums(answer.data, name, mbid)))
  return { lastfm, spotify, albums: albumShelf(ranked, studio), albumsFrom: studio === null ? "titles" : "musicbrainz" }
}

/**
 * The artist's newest album, single or EP from the last two years, or one that is coming (`musicbrainz-artist.ts`); `null` where there is none or MusicBrainz did not answer. One
 * ask, kept for a week like the albums: a server island's, so the page's own budget of asks is not touched.
 */
export async function loadLatestRelease(get: Get, artist: string, mbid: string | null, today: string): Promise<LatestRelease | null> {
  const answer = await settle(get(latestReleasesUrl(artist, mbid, today), { ttl: TTL.albums }))
  return answer === null ? null : parseLatestRelease(answer.data, artist, mbid, today)
}

/**
 * The artist's links on from MusicBrainz (its own site, Bandcamp, YouTube…), with Wikipedia in Norwegian where Wikidata knows one, else what MusicBrainz links to: two asks at most,
 * each kept for a week. None without MusicBrainz's id of the artist (a search by name could find another), or when MusicBrainz did not answer; Wikidata failing leaves out only itself.
 */
export async function loadArtistLinks(get: Get, mbid: string | null): Promise<ArtistLink[]> {
  if (mbid === null) return []
  const answer = await settle(get(artistUrlsUrl(mbid), { ttl: TTL.albums }))
  const urls = answer === null ? null : parseArtistUrls(answer.data)
  if (urls === null) return []
  const item = urls.wikidata
  const wikipedia = item === null ? null : await settle(get(wikipediaLinksUrl(item), { ttl: TTL.albums })).then((found) => (found === null ? null : parseWikipedia(found.data, item)))
  return withWikipedia(urls.links, wikipedia ?? urls.wikipedia)
}

/** Last.fm's answer for an address, read; `null` where Last.fm is not set up or did not answer: the rest of the page is there. */
async function lastfmInfo<T>(env: Env, get: Get, address: (base: string, user: string) => string, parse: (answer: unknown) => T): Promise<T | null> {
  const base = lastfmBase(env)
  if (base === null) return null
  const answer = await settle(get(address(base, setting(env, "LASTFM_USER")), { ttl: TTL.artist }))
  return answer === null ? null : parse(answer.data)
}

/** What Spotify says of something found by a search (an album, a track), or `null`: not set up, not found under that name, or Spotify did not answer. */
async function spotifyFound<T>(env: Env, get: Get, address: string, match: (answer: unknown) => T | null): Promise<T | null> {
  try {
    const token = await spotifyToken(env, get)
    if (token === null) return null
    return match((await get(address, { headers: { Authorization: `Bearer ${token}` }, ttl: TTL.artist })).data)
  } catch {
    return null
  }
}

/** A track's page: Last.fm's tags, listeners, length and the owner's own count, and Spotify's link to it. */
export async function loadTrack(env: Env, get: Get, artist: string, track: string): Promise<{ lastfm: TrackInfo | null; spotify: SpotifyTrack | null }> {
  const [lastfm, spotify] = await Promise.all([
    lastfmInfo(env, get, (base, user) => trackInfoUrl(base, artist, track, user), parseTrackInfo),
    spotifyFound(env, get, searchTrackUrl(track, artist), (answer) => parseTrackMatch(answer, track, artist)),
  ])
  return { lastfm, spotify }
}

/**
 * An album's page: Last.fm's tags, listeners, tracks and the owner's own count, Spotify's link, day and number of tracks, and the owner's most played songs by the artist (their first thousand
 * of all time, the one answer every artist's page shares), from which each track's plays are read (`trackPlays`).
 */
export async function loadAlbum(env: Env, get: Get, artist: string, album: string): Promise<{ lastfm: AlbumInfo | null; spotify: SpotifyAlbum | null; top: TopTrack[] | null; artistPlays: number | null }> {
  const base = lastfmBase(env)
  const [lastfm, spotify, top, artistInfo] = await Promise.all([
    lastfmInfo(env, get, (base, user) => albumInfoUrl(base, artist, album, user), parseAlbumInfo),
    spotifyFound(env, get, searchAlbumUrl(album, artist), (answer) => parseAlbumMatch(answer, album, artist)),
    base === null ? null : settle(get(allTimeTracksUrl(base), { ttl: TTL.allTime })).then((answer) => (answer === null ? null : tracksBy(parseTopTracks(answer.data), artist, Number.POSITIVE_INFINITY))),
    lastfmInfo(env, get, (base, user) => artistInfoUrl(base, artist, user), parseArtistInfo),
  ])
  return { lastfm, spotify, top, artistPlays: artistInfo?.userPlays ?? null }
}

/**
 * The plays of an album in each stretch since the user started (`listeningPeriods`, as an artist's), one weekly album chart each, so every album's page shares them; a stretch that is over is kept
 * for a month, the one now for an hour. `null` where Last.fm is not set up or a chart could not be had.
 */
export async function loadAlbumTimeline(env: Env, get: Get, artist: string, title: string, nowMs: number): Promise<ArtistListening["timeline"]> {
  const base = lastfmBase(env)
  if (base === null) return null
  const user = parseUserInfo((await get(userInfoUrl(base), { ttl: TTL.user })).data)
  if (user.registered === null) return null
  const { unit, periods } = listeningPeriods(user.registered, nowMs)
  const ttl = (end: number): number => (end * 1000 <= nowMs ? TTL.periodDone : TTL.periodLive)
  const chart = (start: number, end: number): Promise<number | null> => settle(get(albumChartUrl(base, start, end), { ttl: ttl(end) })).then((answer) => (answer === null ? null : albumPlaysIn(parseAlbumChart(answer.data), artist, title)))
  const plays: (number | null)[] = []
  // A few at a time: Last.fm refuses an IP that asks too fast.
  for (let start = 0; start < periods.length; start += 3) plays.push(...(await Promise.all(periods.slice(start, start + 3).map((period) => chart(period.start, period.end)))))
  if (plays.some((one) => one === null)) return null
  return { unit, series: periods.map((period, index) => ({ label: period.label, long: period.long, plays: plays[index] ?? 0 })) }
}

/** What MusicBrainz says of an album: its first official release (label, country), its other editions, its credits and its place among the artist's albums; each is empty where it is not known. */
export interface AlbumRelease {
  /** The release group, for the link to it on MusicBrainz. */
  group: string
  first: Release | null
  editions: Edition[]
  credits: Credits | null
  place: DiscographyPlace | null
  /** The artist's studio albums in the order they came out, each with the user's plays of it (their thousand most played albums of all time, one answer every album's page shares); `null` where either is not known. */
  discography: DiscographyAlbum[] | null
}

/** How long to wait between two asks of MusicBrainz that were not kept: it allows one a second. */
const MUSICBRAINZ_PAUSE = 1100

/**
 * An album on MusicBrainz, in at most three asks of it, each kept for a month (a release changes seldom): its release group (from the artist's albums, the answer the artist's page has asked for
 * and kept, by the id Last.fm gives the artist; else a search by the title), the group's releases, and, with `credits`, the credits of the first. The asks are one after the other, a second apart
 * where they were not kept, and one that is refused (too many at once) is asked once more. `null` where MusicBrainz does not know the album or did not answer.
 */
export async function loadAlbumRelease(env: Env, get: Get, artist: string, title: string, options: { credits: boolean; pause: (ms: number) => Promise<void> }): Promise<AlbumRelease | null> {
  let asked = false
  const musicbrainz = async (url: string, ttl: number): Promise<unknown> => {
    for (let attempt = 0; ; attempt += 1) {
      if (asked) await options.pause(MUSICBRAINZ_PAUSE)
      try {
        const answer = await get(url, { ttl })
        asked = !answer.hit
        return answer.data
      } catch (error) {
        asked = true
        if (attempt > 0) throw error
      }
    }
  }
  const mbid = await lastfmInfo(env, get, (base, user) => artistInfoUrl(base, artist, user), parseArtistInfo).then((info) => info?.mbid ?? null)
  const base = lastfmBase(env)
  const [studio, topAlbums] = await Promise.all([
    settle(musicbrainz(releaseGroupsUrl(artist, mbid), TTL.albums)).then((answer) => (answer === null ? null : parseStudioAlbums(answer, artist, mbid))),
    base === null ? null : settle(get(allTimeAlbumsUrl(base), { ttl: TTL.allTime })).then((answer) => (answer === null ? null : parseTopAlbumsOfUser(answer.data))),
  ])
  const index = studio === null ? null : studioIndex(studio, title)
  const found = studio !== null && index !== null ? studio[index] : undefined
  const searched = found === undefined ? await settle(musicbrainz(releaseGroupSearchUrl(artist, title), TTL.release)).then((answer) => (answer === null ? null : parseReleaseGroupMatch(answer, artist, title))) : null
  const group: string | null = found?.id ?? searched?.id ?? null
  if (group === null) return null
  const releases = await settle(musicbrainz(groupReleasesUrl(group), TTL.release)).then((answer) => (answer === null ? null : parseReleases(answer)))
  if (releases === null) return null
  const first = firstRelease(releases)
  const credits = !options.credits || first === null ? null : await settle(musicbrainz(releaseCreditsUrl(first.id), TTL.release)).then((answer) => (answer === null ? null : parseCredits(answer, artist)))
  return { group, first, editions: otherEditions(releases, first), credits, place: studio === null ? null : discographyPlace(studio, index), discography: studio === null || topAlbums === null ? null : discographyPlays(studio, topAlbums, artist) }
}

/** The most pages of plays (200 each) the calendar of an album's days reads in one ask of its page: six months of a heavy listener (40 plays a day) fit. */
export const MAX_DAY_PAGES = 40
/** How many months back the calendar of an album's days goes, the month now included. */
export const ALBUM_DAY_MONTHS = 6

/**
 * The user's plays of an album each day of the last `ALBUM_DAY_MONTHS` months, from every play in them (the pages of `user.getrecenttracks` the history's month pages read and keep, so the two share
 * them; a month that is over is kept for a month, the one now for five minutes). Read newest first, a few pages at a time, and only whole months: a month that would go over `MAX_DAY_PAGES`, or
 * a page that could not be had, ends it, so the calendar is the months read and says from which day. `null` where Last.fm is not set up or not even this month could be read.
 */
export async function loadAlbumDays(env: Env, get: Get, artist: string, title: string, nowMs: number): Promise<{ date: string; value: number }[] | null> {
  const base = lastfmBase(env)
  if (base === null) return null
  const read: { month: Month; plays: Play[] }[] = []
  let asked = 0
  for (const month of recentMonths(nowMs, ALBUM_DAY_MONTHS - 1)) {
    if (asked >= MAX_DAY_PAGES) break
    const ttl = month.end * 1000 <= nowMs ? TTL.periodDone : TTL.weekLive
    const page = (number: number) => settle(get(playsInRangeUrl(base, month.start, month.end, number), { ttl })).then((answer) => (answer === null ? null : parseRecentPage(answer.data)))
    const first = await page(1)
    asked += 1
    if (first === null) break
    const rest = Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) => index + 2)
    if (asked + rest.length > MAX_DAY_PAGES) break
    const pages: (Play[] | null)[] = []
    // A few at a time: Last.fm refuses an IP that asks too fast.
    for (let start = 0; start < rest.length; start += 3) pages.push(...(await Promise.all(rest.slice(start, start + 3).map((number) => page(number).then((one) => one?.plays ?? null)))))
    asked += rest.length
    if (pages.some((one) => one === null)) break
    read.push({ month, plays: [...first.plays, ...pages.flatMap((one) => one ?? [])] })
  }
  if (read.length === 0) return null
  const today = dateAt(nowMs)
  const months = read.map((one) => one.month).reverse()
  return albumDayCounts(months, read.flatMap((one) => one.plays), artist, title, `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`)
}

/** Spotify's picture of each artist in a list, asked for in the order of the list and no more than `MAX_POSTER_LOOKUPS` that were not kept in one page (the rest come with the next pages). */
export async function loadArtistPictures(env: Env, get: Get, names: readonly string[]): Promise<Map<string, SpotifyArtist>> {
  const found = new Map<string, SpotifyArtist>()
  const token = await spotifyToken(env, get).catch(() => null)
  if (token === null) return found
  const wanted = [...new Set(names)]
  let asked = 0
  for (let start = 0; start < wanted.length && asked < MAX_POSTER_LOOKUPS; start += POSTER_BATCH) {
    await Promise.all(
      wanted.slice(start, start + POSTER_BATCH).map(async (name) => {
        const result = await spotifyArtist(token, name, get)
        if (!result.hit) asked += 1
        if (result.artist !== null) found.set(name, result.artist)
      }),
    )
  }
  return found
}

/** The artists like one that a page shows with their pictures: no more Spotify searches than this for them. */
export const MAX_SIMILAR = 6

/** What an artist's page says of the visitor's own listening to it; each part is `null` (or empty) where it could not be had, and the page leaves its section out. */
export interface ArtistListening {
  /** Its plays in each stretch (month, quarter, half-year or year) since the user started on Last.fm, oldest first. */
  timeline: { unit: PeriodUnit; series: { label: string; long: string; plays: number }[] } | null
  /** Its place among all the user has played, its plays, and its share of all their plays. */
  place: { rank: number; plays: number; share: number | null } | null
  /** Their most played songs by it, most first. */
  tracks: TopTrack[] | null
  /** The artists like it that they play too; their pictures are the page's server island's to ask for (`loadArtistPictures`), with a Worker's budget of questions of their own. */
  similar: { name: string; plays: number; url: string }[]
}

/**
 * The plays of an artist in each stretch since the user started (`listeningPeriods`: the finest of month, quarter, half-year and year that gives at most `MAX_PERIODS`), one weekly chart of all artists each, so
 * every artist's page shares them; a stretch that is over is kept for a month, the one now for an hour.
 */
async function artistTimeline(base: string, get: Get, name: string, nowMs: number): Promise<ArtistListening["timeline"]> {
  const user = parseUserInfo((await get(userInfoUrl(base), { ttl: TTL.user })).data)
  if (user.registered === null) return null
  const { unit, periods } = listeningPeriods(user.registered, nowMs)
  const ttl = (end: number): number => (end * 1000 <= nowMs ? TTL.periodDone : TTL.periodLive)
  const chart = (start: number, end: number): Promise<number | null> => settle(get(artistChartUrl(base, start, end), { ttl: ttl(end) })).then((answer) => (answer === null ? null : playsIn(parseArtistChart(answer.data), name)))
  const plays: (number | null)[] = []
  // A few at a time: Last.fm refuses an IP that asks too fast.
  for (let start = 0; start < periods.length; start += 3) plays.push(...(await Promise.all(periods.slice(start, start + 3).map((period) => chart(period.start, period.end)))))
  if (plays.some((one) => one === null)) return null
  return { unit, series: periods.map((period, index) => ({ label: period.label, long: period.long, plays: plays[index] ?? 0 })) }
}

/**
 * The visitor's own listening to an artist, from Last.fm: its plays over time, its place among all they have played (their first thousand artists and songs of all time, one answer each shared by every
 * artist's page) and the artists like it that they play too (at most `MAX_SIMILAR`). Each part is asked at the same time as the others and leaves out only itself when it fails. Spotify is not asked here:
 * on a cold page the charts use up the Worker's limit of questions, and the pictures of the artists like it are asked for by an island of their own.
 */
export async function loadArtistListening(env: Env, get: Get, name: string, nowMs: number): Promise<ArtistListening | null> {
  const base = lastfmBase(env)
  if (base === null) return null
  const [timeline, user, artists, tracks, similar] = await Promise.all([
    settle(artistTimeline(base, get, name, nowMs)),
    settle(get(userInfoUrl(base), { ttl: TTL.user })).then((answer) => (answer === null ? null : parseUserInfo(answer.data))),
    settle(get(allTimeArtistsUrl(base), { ttl: TTL.allTime })).then((answer) => (answer === null ? null : parseTopArtists(answer.data))),
    settle(get(allTimeTracksUrl(base), { ttl: TTL.allTime })).then((answer) => (answer === null ? null : tracksBy(parseTopTracks(answer.data), name))),
    settle(get(similarArtistsUrl(base, name), { ttl: TTL.artist })).then((answer) => (answer === null ? [] : parseSimilarArtists(answer.data))),
  ])
  const heard = artists === null ? [] : similarHeard(similar, artists, name, MAX_SIMILAR)
  return {
    timeline,
    place: artists === null ? null : placeAmong(artists, name, user?.plays ?? null),
    tracks,
    similar: heard,
  }
}

/** No more questions than this for the covers of an artist's most played songs, a few at a time: Last.fm refuses an IP that asks too fast. */
export const MAX_TRACK_COVERS = 10
const COVER_BATCH = 5

/**
 * The covers of an artist's songs that the recent plays did not show (`coversFromPlays`), from Last.fm's `track.getinfo`: one question a song, at most `MAX_TRACK_COVERS`, each kept for a week
 * under a name of its own (a track's page asks the same address for the owner's count, which is kept for a day). A song Last.fm has no cover for is not in the map.
 */
export async function loadTrackCovers(env: Env, get: Get, artist: string, titles: readonly string[]): Promise<Map<string, string>> {
  const base = lastfmBase(env)
  const found = new Map<string, string>()
  if (base === null) return found
  const wanted = [...new Set(titles)].slice(0, MAX_TRACK_COVERS)
  for (let start = 0; start < wanted.length; start += COVER_BATCH) {
    await Promise.all(
      wanted.slice(start, start + COVER_BATCH).map(async (title) => {
        const url = trackInfoUrl(base, artist, title, setting(env, "LASTFM_USER"))
        const answer = await settle(get(url, { ttl: TTL.albums, key: `cover:${url}` }))
        const cover = answer === null ? null : parseTrackInfo(answer.data).cover
        if (cover !== null) found.set(title, cover)
      }),
    )
  }
  return found
}

/** What a page shows when a source is down: the others still show. */
export async function settle<T>(work: Promise<T>): Promise<T | null> {
  try {
    return await work
  } catch {
    return null
  }
}
