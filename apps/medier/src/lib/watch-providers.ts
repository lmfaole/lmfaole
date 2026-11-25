/**
 * Where a film or a show can be seen in Norway: TMDB's watch providers (`/watch/providers`), whose data is JustWatch's. TMDB's terms ask that JustWatch is credited where it is shown, and the link is TMDB's
 * page of the title's providers (which links on to JustWatch). Pure, with a test.
 */

import { isMockPicture } from "./tmdb.ts"

const API = "https://api.themoviedb.org/3"
const LOGOS = "https://image.tmdb.org/t/p/w92"

/** The country asked for: the site is Norwegian. */
export const REGION = "NO"

/** The address of a film's or a show's providers in every country (TMDB has no filter by country); an episode has its show's. */
export const watchProvidersUrl = (kind: "film" | "episode", tmdbId: number): string => `${API}/${kind === "film" ? "movie" : "tv"}/${tmdbId}/watch/providers`

export interface Provider {
  name: string
  /** The logo's address, `null` where TMDB has none. */
  logo: string | null
}

/** The ways to see it: in a subscription, to rent or to buy, each in TMDB's order (its `display_priority`); empty where there is none of that kind. */
export interface WatchProviders {
  /** TMDB's page of the title's providers in Norway. */
  link: string
  stream: Provider[]
  rent: Provider[]
  buy: Provider[]
}

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})

function providers(value: unknown): Provider[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value
    .map(record)
    .filter((one) => typeof one["provider_name"] === "string" && one["provider_name"] !== "")
    .map((one, index) => ({ one, index, priority: typeof one["display_priority"] === "number" ? one["display_priority"] : Number.POSITIVE_INFINITY }))
    .sort((a, b) => a.priority - b.priority || a.index - b.index)
    .flatMap(({ one }) => {
      const name = String(one["provider_name"])
      if (seen.has(name)) return []
      seen.add(name)
      const path = one["logo_path"]
      return [{ name, logo: typeof path === "string" && path.startsWith("/") ? (isMockPicture(path) ? path : `${LOGOS}${path}`) : null }]
    })
}

/** The providers in Norway from TMDB's answer; `null` where it has none there (not even to rent or buy), so the page leaves the section out. */
export function parseWatchProviders(answer: unknown, region = REGION): WatchProviders | null {
  const country = record(record(record(answer)["results"])[region])
  const found = { stream: providers(country["flatrate"]), rent: providers(country["rent"]), buy: providers(country["buy"]) }
  if (found.stream.length + found.rent.length + found.buy.length === 0) return null
  const link = country["link"]
  return { link: typeof link === "string" && link.startsWith("https://") ? link : "https://www.themoviedb.org", ...found }
}
