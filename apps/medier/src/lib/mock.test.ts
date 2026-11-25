import { strict as assert } from "node:assert"
import { test } from "node:test"

import { allTimeArtistsUrl, allTimeTracksUrl, parseSimilarArtists, parseTopTracks, parseUserInfo, similarArtistsUrl, userInfoUrl } from "./lastfm.ts"
import { similarHeard, tracksBy } from "./artist-listening.ts"
import { artistChartUrl, artistInfoUrl, artistTopAlbumsUrl, albumInfoUrl, parseAlbumInfo, parseArtistChart, parseArtistInfo, parseRecentPage, parseRecentTracks, parseTopAlbums, parseTopArtists, parseTrackInfo, playsInRangeUrl, playsTotalUrl, trackInfoUrl } from "./lastfm.ts"
import { albumShelf, realAlbums } from "./albums.ts"
import { MOCK_ARTISTS, mockFetch, mockSettings } from "./mock.ts"
import { parseStudioAlbums, releaseGroupsUrl } from "./musicbrainz.ts"
import { albumChartUrl, albumPlaysIn, allTimeAlbumsUrl, discographyChartText, discographyPlays, parseAlbumChart, parseTopAlbumsOfUser } from "./album-listening.ts"
import { firstRelease, groupReleasesUrl, parseCredits, parseReleaseGroupMatch, parseReleases, releaseCreditsUrl, releaseGroupSearchUrl, studioIndex } from "./musicbrainz-release.ts"
import { artistUrlsUrl, latestReleasesUrl, parseArtistUrls, parseLatestRelease, parseWikipedia, wikipediaLinksUrl } from "./musicbrainz-artist.ts"
import { parseAlbumMatch, parseArtistMatch, parseToken, parseTrackMatch, refreshRequest, searchAlbumUrl, searchArtistUrl, searchTrackUrl } from "./spotify.ts"
import { authorize, detailsUrl, parseInfo, parsePerson, parsePoster, personUrl } from "./tmdb.ts"
import { parseHistory } from "./trakt.ts"
import { parseWatchProviders, watchProvidersUrl } from "./watch-providers.ts"
import { listensUrl, parseListens, parsePlayingNow, parseTopArtists as parseLbTopArtists, playingNowUrl, topArtistsUrl } from "./listenbrainz.ts"
import { ownedGamesUrl, parseOwnedGames, parseRecentGames, parseVanity, recentGamesUrl, vanityUrl } from "./steam.ts"
import { loadGame, loadGameExtras, loadGameStats, loadSteamBadges, loadSteamPresence, loadWishlist, type Get } from "./sources.ts"
import { latestSetlist, parseSetlists, setlistsUrl } from "./setlistfm.ts"

const NOW = Date.UTC(2026, 10, 20, 12, 0, 0)
const SECONDS = NOW / 1000
const DAY = 86400
const newest = MOCK_ARTISTS.at(-1)
const BASE = "https://ws.audioscrobbler.com/2.0/?format=json&api_key=mock&user=ola"
const ask = async (url: string, request: Parameters<typeof mockFetch>[1] = {}): Promise<unknown> => mockFetch(url, request, NOW).json()

test("Last.fm: the recent plays, the top artists and the charts are read by the site's own parsers", async () => {
  const recent = parseRecentTracks(await ask(`${BASE}&method=user.getrecenttracks&limit=50`))
  assert.equal(recent[0]?.playedAt, null)
  assert.equal(recent.filter((play) => play.playedAt !== null).length, 50)
  assert.ok(recent.every((play) => /^\/mock\/cover-\d+-\d+\.(jpg|png)$/.test(play.image ?? "")))
  assert.ok(parseTopArtists(await ask(`${BASE}&method=user.gettopartists&period=1month&limit=10`)).length > 3)

  const week = parseRecentPage(await ask(playsInRangeUrl(BASE, SECONDS - 7 * DAY, SECONDS, 1)))
  assert.ok(week.total > 50 && week.plays.length > 0 && week.plays.every((play) => Date.parse(play.playedAt ?? "") >= (SECONDS - 7 * DAY) * 1000))
  assert.equal(parseRecentPage(await ask(playsTotalUrl(BASE, SECONDS - 7 * DAY, SECONDS))).total, week.total)
  const month = parseRecentPage(await ask(playsInRangeUrl(BASE, SECONDS - 30 * DAY, SECONDS, 1)))
  assert.ok(month.totalPages > 1 && month.page === 1)

  const before = parseArtistChart(await ask(artistChartUrl(BASE, 0, SECONDS - 30 * DAY)))
  assert.ok(before.length >= 6 && !before.some((artist) => artist.name === newest))
  assert.ok(parseArtistChart(await ask(artistChartUrl(BASE, SECONDS - 7 * DAY, SECONDS))).some((artist) => artist.name === newest))
})

test("Last.fm: info for an artist, an album and a track; an unknown name is Last.fm's own error", async () => {
  const name = MOCK_ARTISTS[0] ?? ""
  const artist = parseArtistInfo(await ask(artistInfoUrl(BASE, name, "ola")))
  assert.ok(artist.tags.length > 0 && (artist.userPlays ?? 0) > 0 && artist.bio !== null)
  const ranked = parseTopAlbums(await ask(artistTopAlbumsUrl(BASE, name)), Number.POSITIVE_INFINITY)
  assert.equal(ranked.length, 5)
  const albums = realAlbums(ranked, parseStudioAlbums(await ask(releaseGroupsUrl(name, artist.mbid)), name, artist.mbid))
  assert.equal(albums.length, 2)
  const album = parseAlbumInfo(await ask(albumInfoUrl(BASE, name, albums[0]?.title ?? "", "ola")))
  assert.ok(album.tracks.length > 0 && album.bio !== null)
  const track = parseTrackInfo(await ask(trackInfoUrl(BASE, name, album.tracks[0]?.title ?? "", "ola")))
  assert.ok((track.seconds ?? 0) > 100 && track.cover?.startsWith("/mock/"))
  const shelf = albumShelf(ranked, parseStudioAlbums(await ask(releaseGroupsUrl(name, artist.mbid)), name, artist.mbid))
  assert.ok(shelf.length === 2 && shelf.every((one) => one.released !== null && one.image?.startsWith("/mock/") && (one.plays ?? 0) > 0))
  assert.deepEqual(await ask(artistInfoUrl(BASE, "Finnes ikke", "ola")), { error: 6, message: "The artist you supplied could not be found" })
})

test("Last.fm: an artist's page has years of plays to chart, the user's top artists and songs of all time, and artists like it, some of them played here", async () => {
  const user = parseUserInfo(await ask(userInfoUrl(BASE)))
  assert.ok((user.registered ?? SECONDS) < SECONDS - 3 * 365 * DAY && (user.plays ?? 0) > 1000)
  const name = MOCK_ARTISTS[1] ?? ""
  const top = parseTopArtists(await ask(allTimeArtistsUrl(BASE)))
  assert.equal(top.length, MOCK_ARTISTS.length)
  assert.ok(parseArtistChart(await ask(artistChartUrl(BASE, SECONDS - 3 * 365 * DAY, SECONDS - 2 * 365 * DAY))).some((artist) => artist.name === name))
  assert.ok(tracksBy(parseTopTracks(await ask(allTimeTracksUrl(BASE))), name).length >= 5)
  const similar = parseSimilarArtists(await ask(similarArtistsUrl(BASE, name)))
  const heard = similarHeard(similar, top, name)
  assert.ok(heard.length >= 3 && heard.length < similar.length)
})

test("MusicBrainz: an artist's albums by the id Last.fm gives, or by name, and an EP, a live album and a compilation are not among them", async () => {
  const name = MOCK_ARTISTS.find((artist) => artist === "Todd Terje") ?? ""
  const { mbid } = parseArtistInfo(await ask(artistInfoUrl(BASE, name, "ola")))
  assert.ok(mbid !== null)
  const byId = parseStudioAlbums(await ask(releaseGroupsUrl(name, mbid)), name, mbid)
  assert.deepEqual(byId?.map((album) => album.title), ["It's Album Time"])
  assert.deepEqual(parseStudioAlbums(await ask(releaseGroupsUrl(name, null)), name, null), byId)
  assert.equal(parseStudioAlbums(await ask(releaseGroupsUrl("Ukjent", null)), "Ukjent", null), null)
  const ranked = parseTopAlbums(await ask(artistTopAlbumsUrl(BASE, name)), Number.POSITIVE_INFINITY)
  assert.deepEqual(realAlbums(ranked, byId).map((album) => album.title), ["It's Album Time"])
})

test("MusicBrainz and Wikidata: an artist's newest release (coming, new or stale) and its links, with Wikipedia in bokmål", async () => {
  const today = new Date(NOW).toISOString().slice(0, 10)
  const latest = async (name: string) => {
    const { mbid } = parseArtistInfo(await ask(artistInfoUrl(BASE, name, "ola")))
    return parseLatestRelease(await ask(latestReleasesUrl(name, mbid, today)), name, mbid, today)
  }
  assert.deepEqual(await latest("Röyksopp").then((release) => [release?.type, release?.upcoming]), ["Single", true])
  assert.deepEqual(await latest("a-ha").then((release) => [release?.title, release?.upcoming]), ["Scoundrel Days", false])
  assert.equal(await latest("Kings of Convenience"), null)
  const { mbid } = parseArtistInfo(await ask(artistInfoUrl(BASE, "Röyksopp", "ola")))
  const urls = parseArtistUrls(await ask(artistUrlsUrl(mbid ?? "")))
  assert.deepEqual(urls?.links.map((link) => link.label).slice(0, 2), ["Offisiell nettside", "Bandcamp"])
  assert.equal(urls?.wikidata, "Q193218")
  assert.deepEqual(parseWikipedia(await ask(wikipediaLinksUrl("Q193218")), "Q193218")?.language, "no")
})

test("MusicBrainz: an album's group among the albums or by a search (an EP), its real releases and the credits of the first; and Last.fm's weekly album chart counts its plays", async () => {
  const { mbid } = parseArtistInfo(await ask(artistInfoUrl(BASE, "Röyksopp", "ola")))
  const studio = parseStudioAlbums(await ask(releaseGroupsUrl("Röyksopp", mbid)), "Röyksopp", mbid) ?? []
  const group = studio[studioIndex(studio, "Melody A.M.") ?? -1]?.id ?? ""
  const releases = parseReleases(await ask(groupReleasesUrl(group)))
  const first = firstRelease(releases)
  assert.ok(releases.length > 5 && first?.labels.includes("Wall of Sound"))
  const credits = parseCredits(await ask(releaseCreditsUrl(first?.id ?? "")), "Röyksopp")
  assert.ok((credits?.producers.length ?? 0) > 0 && (credits?.performers.length ?? 0) > 0)
  assert.ok(parseReleaseGroupMatch(await ask(releaseGroupSearchUrl("Todd Terje", "It's the Arps")), "Todd Terje", "It's the Arps") !== null)
  assert.equal(parseReleaseGroupMatch(await ask(releaseGroupSearchUrl("Todd Terje", "Ukjent")), "Todd Terje", "Ukjent"), null)
  const chart = parseAlbumChart(await ask(albumChartUrl(BASE, SECONDS - 3 * 365 * DAY, SECONDS)))
  assert.ok(chart.length > 3 && MOCK_ARTISTS.some((artist) => chart.some((album) => album.artist === artist && albumPlaysIn(chart, artist, album.title) > 0)))
  const discography = discographyPlays(studio, parseTopAlbumsOfUser(await ask(allTimeAlbumsUrl(BASE))), "Röyksopp")
  assert.ok(discographyChartText(discography, "Melody A.M.", "Röyksopp") !== null && discography.filter((album) => album.plays > 0).length >= 2)
})

test("Trakt and TMDB: history in a range, then each title's poster, facts, credits and each person", async () => {
  const range = `start_at=${encodeURIComponent(new Date(NOW - 30 * DAY * 1000).toISOString())}&end_at=${encodeURIComponent(new Date(NOW).toISOString())}&limit=100&page=1`
  const films = parseHistory(await ask(`https://api.trakt.tv/users/ola/history/movies?${range}`))
  const episodes = parseHistory(await ask(`https://api.trakt.tv/users/ola/history/episodes?${range}`))
  assert.ok(films.length > 0 && episodes.length > 0 && episodes.every((watch) => watch.episode !== null))
  assert.ok(parseHistory(await ask("https://api.trakt.tv/users/ola/history/movies?limit=50")).length > 0)

  const film = films[0]
  const request = authorize("mock", detailsUrl("film", film?.tmdbId ?? 0))
  const answer = await ask(request.url)
  const info = parseInfo(answer)
  assert.ok(parsePoster(answer)?.startsWith("/mock/") && info.overview !== null && info.cast.length === 5 && info.crew.some((one) => one.role === "Regi"))
  assert.ok(parseInfo(await ask(detailsUrl("episode", episodes[0]?.tmdbId ?? 0))).seasons !== null)
  const providers = await Promise.all([...films, ...episodes].map((watch) => ask(watchProvidersUrl(watch.kind, watch.tmdbId ?? 0)).then(parseWatchProviders)))
  assert.ok(providers.some((one) => one !== null && one.stream.length > 0 && one.rent.length > 0 && one.link.includes("locale=NO")))

  const person = parsePerson(await ask(personUrl(info.cast[0]?.id ?? 0)))
  assert.ok(person?.biography !== null && person?.department === "Skuespiller")
})

test("Spotify: the token, and the searches that find an artist, an album and a track by name", async () => {
  const request = refreshRequest("mock", "mock", "mock")
  assert.equal(parseToken(await ask(request.url, request))?.accessToken, "mock-access-token")

  const name = MOCK_ARTISTS[2] ?? ""
  assert.ok((parseArtistMatch(await ask(searchArtistUrl(name)), name)?.images.length ?? 0) > 0)
  const album = realAlbums(parseTopAlbums(await ask(artistTopAlbumsUrl(BASE, name))), null)[0]?.title ?? ""
  const tracks = parseAlbumInfo(await ask(albumInfoUrl(BASE, name, album, "ola"))).tracks
  assert.equal(parseAlbumMatch(await ask(searchAlbumUrl(album, name)), album, name)?.tracks, tracks.length)
  const first = tracks[0]?.title ?? ""
  assert.ok(parseTrackMatch(await ask(searchTrackUrl(first, name)), first, name) !== null)
  assert.equal(parseArtistMatch(await ask(searchArtistUrl("Ukjent")), "Ukjent"), null)
})

test("an address that is none of the sources' is 404, and made-up settings give every source a key without overriding one, and no username (the visitor gives it)", () => {
  assert.equal(mockFetch("https://example.com/", {}, NOW).status, 404)
  assert.equal(mockSettings({ LASTFM_API_KEY: "meg", TMDB_API_KEY: "x" })["LASTFM_API_KEY"], "meg")
  assert.equal(mockSettings({})["LASTFM_USER"], undefined)
  assert.equal(mockSettings({})["TRAKT_CLIENT_ID"], "mock")
})

test("setlist.fm: an artist's concerts by its MusicBrainz id, the newest that has been with its setlist, the coming one left out", async () => {
  const name = MOCK_ARTISTS[0] ?? ""
  const { mbid } = parseArtistInfo(await ask(artistInfoUrl(BASE, name, "ola")))
  const setlists = parseSetlists(await ask(setlistsUrl(mbid ?? "")), new Date(NOW).toISOString().slice(0, 10))
  assert.ok(setlists !== null && setlists.concerts.length === 6)
  const latest = latestSetlist(setlists)
  assert.ok(latest !== null && latest.songs.some((song) => song.encore) && latest.songs.some((song) => !song.encore))
  assert.equal(parseSetlists(await ask(setlistsUrl("unknown")), "2026-11-20"), null)
})

test("Steam: a custom name is a profile, with games played the last two weeks and the most played of all", async () => {
  const id = parseVanity(await ask(vanityUrl("mock", "demo")))
  assert.ok(id !== null)
  const recent = parseRecentGames(await ask(recentGamesUrl("mock", id)))
  assert.ok(recent.length === 5 && recent.every((game, at) => game.recentMinutes > 0 && game.image.startsWith("https://cdn.cloudflare.steamstatic.com/") && (at === 0 || (recent[at - 1]?.recentMinutes ?? 0) >= game.recentMinutes)))
  const owned = parseOwnedGames(await ask(ownedGamesUrl("mock", id)))
  assert.ok(owned !== null && owned.owned > owned.most.length && owned.most[0]?.name === "Baldur's Gate 3")
})

test("Steam beyond the games: presence, level and badges, stats, the wishlist and its sales, and a game's whole store page and extras, through the site's own loaders", async () => {
  const asked: string[] = []
  const get: Get = async (url, request) => {
    asked.push(url)
    const response = mockFetch(url, request, NOW)
    if (!response.ok) throw new Error(`${response.status}`)
    return { data: await response.json(), hit: false }
  }
  const env = { ...mockSettings({}), STEAM_USER: "demo" }
  const presence = await loadSteamPresence(env, get)
  assert.ok(presence !== null && presence.avatar !== null && presence.public)
  assert.ok(presence.online ? presence.playing === null || presence.playing.appId !== null : true)
  const badges = await loadSteamBadges(env, get)
  assert.ok(badges !== null && badges.level === 42 && badges.badges.some((one) => one.appId !== null && one.name !== null) && badges.badges.some((one) => one.name === "År i tjeneste"))
  assert.ok((await loadGameStats(env, get, 1086940)).every((stat) => stat.label !== stat.key) && (await loadGameStats(env, get, 1086940)).length === 4)
  assert.deepEqual(await loadGameStats(env, get, 620 + 1), [])
  const wishlist = await loadWishlist(env, get, null)
  assert.ok(wishlist !== null && wishlist.games.length === 8 && wishlist.games.every((game) => game.name !== null) && wishlist.games[0]?.priority === 1)
  assert.equal(wishlist.newSales.length, wishlist.onSale.length)
  const seen = await loadWishlist(env, get, new Set(wishlist.onSale.map((game) => game.appId)))
  assert.equal(seen?.newSales.length, 0)
  const game = await loadGame(env, get, 1145360)
  assert.ok(game?.store !== null && game?.store !== undefined)
  assert.ok(game.store.media.screenshots.length === 3 && game.store.media.movies[0]?.hls !== null && game.store.features.singlePlayer && game.store.controller === "full" && game.store.dlc.length === 2)
  const before = asked.length
  const extras = await loadGameExtras(get, 1145360, game.store.dlc)
  assert.ok(extras.reviews !== null && extras.reviews.label !== "" && extras.playersNow !== null && extras.deck !== null)
  assert.ok(extras.news.some((one) => one.kind === "patch") && extras.news.some((one) => one.kind === "news") && extras.news.every((one) => !/[[\]<>{}]/.test(one.contents)))
  assert.deepEqual(extras.dlc.map((one) => one.name), ["Hades – Lydsporet", "Hades – Utvidelsen"])
  // The store's page of the game is not asked again: its DLC came with it.
  assert.ok(asked.slice(before).every((url) => !url.includes("appdetails?appids=1145360&")))
})

test("ListenBrainz: the same plays as listens, what plays now and the month's top artists, read by its own parsers", async () => {
  const lastfm = parseRecentTracks(await ask(`${BASE}&method=user.getrecenttracks&limit=50`)).filter((play) => play.playedAt !== null)
  const plays = parseListens(await ask(listensUrl("ola")), "ola")
  assert.equal(plays.length, 50)
  assert.deepEqual(plays.map((play) => [play.artist, play.track, play.playedAt]), lastfm.map((play) => [play.artist, play.track, play.playedAt]))
  assert.ok(parsePlayingNow(await ask(playingNowUrl("ola")), "ola") !== null)
  assert.ok(parseLbTopArtists(await ask(topArtistsUrl("ola"))).length > 3)
})
