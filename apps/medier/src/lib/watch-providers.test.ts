import { strict as assert } from "node:assert"
import { test } from "node:test"

import { parseWatchProviders, watchProvidersUrl } from "./watch-providers.ts"

const provider = (name: string, priority: number, logo: string | null = `/${name.toLowerCase()}.png`) => ({ provider_name: name, display_priority: priority, logo_path: logo, provider_id: priority })

test("a film's and a show's providers are asked for by their TMDB id", () => {
  assert.equal(watchProvidersUrl("film", 603), "https://api.themoviedb.org/3/movie/603/watch/providers")
  assert.equal(watchProvidersUrl("episode", 1399), "https://api.themoviedb.org/3/tv/1399/watch/providers")
})

test("Norway's providers are grouped as streaming, rent and buy, each in TMDB's order, with the logo's address", () => {
  const answer = {
    results: {
      SE: { link: "https://www.themoviedb.org/movie/603/watch?locale=SE", flatrate: [provider("Viaplay", 1)] },
      NO: { link: "https://www.themoviedb.org/movie/603/watch?locale=NO", flatrate: [provider("Max", 9), provider("Netflix", 2)], rent: [provider("Apple TV", 4, null)], buy: [provider("SF Anytime", 7), provider("SF Anytime", 8)] },
    },
  }
  assert.deepEqual(parseWatchProviders(answer), {
    link: "https://www.themoviedb.org/movie/603/watch?locale=NO",
    stream: [
      { name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/netflix.png" },
      { name: "Max", logo: "https://image.tmdb.org/t/p/w92/max.png" },
    ],
    rent: [{ name: "Apple TV", logo: null }],
    buy: [{ name: "SF Anytime", logo: "https://image.tmdb.org/t/p/w92/sf anytime.png" }],
  })
})

test("a title with nothing in Norway, or an answer that is not one, has no section", () => {
  assert.equal(parseWatchProviders({ results: { SE: { flatrate: [provider("Viaplay", 1)] } } }), null)
  assert.equal(parseWatchProviders({ results: { NO: { link: "https://www.themoviedb.org/x", flatrate: [] } } }), null)
  assert.equal(parseWatchProviders(null), null)
})
