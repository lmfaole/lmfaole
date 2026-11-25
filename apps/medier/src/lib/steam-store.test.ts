import { strict as assert } from "node:assert"
import { test } from "node:test"

import { bbcodeText, deckUrl, dlcOf, newsUrl, parseCurrentPlayers, parseDeck, parseNews, parsePrices, parseReviews, parseStoreApp, parseStoreItems, pricesUrl, reviewsUrl, storeItemsUrl } from "./steam-store.ts"

/** Trimmed from the store's real answer for Baldur's Gate 3 (the newer films: streams only) with an older film of WebM and MP4 files. */
const BG3 = { "1086940": { success: true, data: {
  type: "game", name: "Baldur's Gate 3", steam_appid: 1086940, is_free: false, controller_support: "full", dlc: [2378500, 2956320],
  short_description: "Samle sammen gruppa.", developers: ["Larian Studios"], publishers: ["Larian Studios"], release_date: { coming_soon: false, date: "3. aug. 2023" }, genres: [{ id: "25", description: "Eventyr" }],
  header_image: "https://shared.akamai.steamstatic.com/header.jpg", capsule_image: "https://shared.akamai.steamstatic.com/capsule_231x87.jpg",
  background: "https://store.akamai.steamstatic.com/images/storepagebackground/app/1086940", background_raw: "https://shared.akamai.steamstatic.com/page_bg_raw.jpg",
  price_overview: { currency: "NOK", initial: 59900, final: 29950, discount_percent: 50, initial_formatted: "599,00 kr", final_formatted: "299,50 kr" },
  platforms: { windows: true, mac: true, linux: false },
  categories: [{ id: 2, description: "Enkeltspiller" }, { id: 1, description: "Flerspiller" }, { id: 9, description: "Samarbeid" }, { id: 38, description: "Samarbeid på nett" }, { id: 22, description: "Steam-prestasjoner" }, { id: 28, description: "Full støtte for kontroller" }, { id: 23, description: "Steam Cloud" }],
  screenshots: [{ id: 0, path_thumbnail: "ss.600x338.jpg", path_full: "ss.1920x1080.jpg" }, { id: 1, path_thumbnail: "" }],
  movies: [
    { id: 256987424, name: "Accolades Trailer", thumbnail: "movie.293x165.jpg", dash_av1: "dash_av1.mpd", dash_h264: "dash_h264.mpd", hls_h264: "hls_264_master.m3u8", highlight: true },
    { id: 5787, name: "Old", thumbnail: "old.jpg", webm: { "480": "movie480.webm", max: "movie_max.webm" }, mp4: { "480": "movie480.mp4", max: "movie_max.mp4" }, highlight: false },
  ],
  recommendations: { total: 762208 },
} } }

test("a game's whole store page from one answer: StoreGame's, its pictures, films, machines, kinds of play, controller, DLC and price", () => {
  const app = parseStoreApp(BG3, 1086940)
  assert.equal(app?.description, "Samle sammen gruppa.")
  assert.equal(app?.price, "299,50 kr")
  assert.equal(app?.name, "Baldur's Gate 3")
  assert.deepEqual(app?.priceNow, { currency: "NOK", initial: 59900, final: 29950, discountPercent: 50, initialFormatted: "599,00 kr", finalFormatted: "299,50 kr" })
  assert.equal(app?.media.hero, "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_hero.jpg")
  assert.equal(app?.media.logo, "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/logo.png")
  assert.equal(app?.media.backgroundRaw, "https://shared.akamai.steamstatic.com/page_bg_raw.jpg")
  assert.deepEqual(app?.media.screenshots, [{ thumbnail: "ss.600x338.jpg", full: "ss.1920x1080.jpg" }])
  assert.deepEqual(app?.media.movies[0], { id: 256987424, name: "Accolades Trailer", thumbnail: "movie.293x165.jpg", highlight: true, webm: null, mp4: null, hls: "hls_264_master.m3u8", dash: "dash_h264.mpd", dashAv1: "dash_av1.mpd" })
  assert.deepEqual([app?.media.movies[1]?.webm, app?.media.movies[1]?.mp4?.max, app?.media.movies[1]?.hls], [{ low: "movie480.webm", max: "movie_max.webm" }, "movie_max.mp4", null])
  assert.deepEqual(app?.platforms, { windows: true, mac: true, linux: false })
  assert.equal(app?.categories.length, 7)
  assert.deepEqual([app?.features.singlePlayer, app?.features.coop, app?.features.onlineCoop, app?.features.localCoop, app?.features.pvp, app?.features.cloud, app?.features.workshop], [true, true, true, false, false, true, false])
  assert.equal(app?.controller, "full")
  assert.deepEqual(app?.dlc, [2378500, 2956320])
  assert.equal(app?.recommendations, 762208)
  assert.equal(parseStoreApp({ "1": { success: false } }, 1), null)
})

test("a controller's support by the categories where the store has no field for it; none where neither says", () => {
  const partial = parseStoreApp({ "1": { success: true, data: { categories: [{ id: 18, description: "Delvis støtte for kontroller" }] } } }, 1)
  assert.equal(partial?.controller, "partial")
  assert.equal(parseStoreApp({ "1": { success: true, data: {} } }, 1)?.controller, null)
})

test("prices of many in one: the discount, before and now; a game with none (free, not out) is null", () => {
  assert.equal(pricesUrl([620, 10]), "https://store.steampowered.com/api/appdetails?appids=620,10&filters=price_overview&cc=no")
  const prices = parsePrices({
    "3840230": { success: true, data: { price_overview: { currency: "NOK", initial: 21900, final: 12045, discount_percent: 45, initial_formatted: "219,00 kr", final_formatted: "120,45 kr" } } },
    "620": { success: true, data: { price_overview: { currency: "NOK", initial: 10500, final: 10500, discount_percent: 0, initial_formatted: "", final_formatted: "105,00 kr" } } },
    "438210": { success: true, data: [] },
    "1": { success: false },
  })
  assert.equal(prices.get(3840230)?.discountPercent, 45)
  assert.equal(prices.get(620)?.initialFormatted, "105,00 kr")
  assert.equal(prices.get(438210), null)
  assert.equal(prices.has(1), false)
})

test("names of many in one, from the store's items; one it does not know is left out", () => {
  assert.match(storeItemsUrl([620]), /^https:\/\/api\.steampowered\.com\/IStoreBrowseService\/GetItems\/v1\/\?input_json=%7B%22ids%22%3A%5B%7B%22appid%22%3A620%7D%5D/)
  const items = parseStoreItems({ response: { store_items: [{ id: 620, success: 1, name: "Portal 2", appid: 620 }, { id: 438210, success: 1, name: "MULE Returns", appid: 438210, is_coming_soon: true }, { id: 5, success: 42 }] } })
  assert.deepEqual([...items.values()], [{ appId: 620, name: "Portal 2", comingSoon: false }, { appId: 438210, name: "MULE Returns", comingSoon: true }])
  assert.deepEqual(dlcOf([438210, 7, 620], items, new Map([[620, null]])).map((one) => [one.name, one.price, one.url]), [["MULE Returns", null, "https://store.steampowered.com/app/438210/"], ["Portal 2", null, "https://store.steampowered.com/app/620/"]])
})

test("reviews in Norwegian, by the score or its English words, with the share positive; with too few, how many", () => {
  assert.equal(reviewsUrl(620), "https://store.steampowered.com/appreviews/620?json=1&language=all&purchase_type=all&num_per_page=0")
  assert.deepEqual(parseReviews({ success: 1, query_summary: { num_reviews: 0, review_score: 9, review_score_desc: "Overwhelmingly Positive", total_positive: 980, total_negative: 20, total_reviews: 1000 } }), { score: 9, label: "Overveldende positive", positive: 980, negative: 20, total: 1000, percent: 98 })
  assert.equal(parseReviews({ success: 1, query_summary: { review_score_desc: "Very Positive", total_positive: 9, total_negative: 1, total_reviews: 10 } })?.label, "Svært positive")
  assert.equal(parseReviews({ success: 1, query_summary: { review_score: 5, total_positive: 1, total_negative: 1, total_reviews: 2 } })?.label, "Blandede")
  assert.deepEqual(parseReviews({ success: 1, query_summary: { review_score: 0, review_score_desc: "3 user reviews", total_positive: 3, total_negative: 0, total_reviews: 3 } }), { score: null, label: "3 anmeldelser", positive: 3, negative: 0, total: 3, percent: 100 })
  assert.equal(parseReviews({ success: 1, query_summary: { review_score: 0, total_reviews: 0 } })?.percent, null)
  assert.equal(parseReviews({ success: 2 }), null)
})

test("players now", () => {
  assert.equal(parseCurrentPlayers({ response: { player_count: 2092, result: 1 } }), 2092)
  assert.equal(parseCurrentPlayers({ response: { result: 42 } }), null)
})

test("BBCode, Steam's picture placeholders and HTML as plain text", () => {
  assert.equal(bbcodeText("[h2]Endringer[/h2][list][*]Rettet [b]krasj[/b].[*]Se [url=https://x.no]her[/url][/list][img]{STEAM_CLAN_IMAGE}/1/a.png[/img]"), "Endringer Rettet krasj. Se her")
  assert.equal(bbcodeText('Ny <a href="https://bg3books.com/">bok</a>&nbsp;ute {STEAM_CLAN_IMAGE}/4/b.gif &amp; mer[previewyoutube=abc;full][/previewyoutube]'), "Ny bok ute & mer")
})

test("news newest first, patch notes told from the rest, and the maker's own from the press's", () => {
  assert.equal(newsUrl(620), "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=620&count=10&maxlength=300&format=json")
  const news = parseNews({ appnews: { newsitems: [
    { gid: "1", title: "Omtale", url: "https://pcgamer", is_external_url: true, author: "", contents: "Les <b>mer</b>...", feedlabel: "PC Gamer", date: 100, feedname: "PC Gamer", feed_type: 0 },
    { gid: "2", title: "Hotfix #36", url: "https://steam/2", is_external_url: true, author: "SaloAtLarian", contents: "[p]Fikset[/p]", feedlabel: "Community Announcements", date: 200, feedname: "steam_community_announcements", feed_type: 1, tags: ["patchnotes"] },
    { gid: "3", title: "", url: "x", date: 1 },
  ] } })
  assert.deepEqual(news.map((one) => [one.id, one.kind, one.official, one.author, one.contents]), [["2", "patch", true, "SaloAtLarian", "Fikset"], ["1", "news", false, null, "Les mer..."]])
  assert.deepEqual(parseNews({}), [])
})

test("Steam Deck: the report's category, in Norwegian", () => {
  assert.equal(deckUrl(620), "https://store.steampowered.com/saleaction/ajaxgetdeckappcompatibilityreport?nAppID=620")
  const labels = [0, 1, 2, 3].map((category) => parseDeck({ success: 1, results: { appid: 620, resolved_category: category } })?.label)
  assert.deepEqual(labels, ["Ukjent", "Ikke støttet", "Spillbar", "Verifisert"])
  assert.equal(parseDeck({ success: 1, results: { resolved_category: 3 } })?.status, "verified")
  assert.equal(parseDeck({ success: 1, results: { resolved_category: 7 } })?.status, "unknown")
  assert.equal(parseDeck({ success: 2 }), null)
})
