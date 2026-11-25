/**
 * The three parts of the site, kept apart: the music (Last.fm), the films and the TV (both Trakt: the films, and the shows' episodes). Each has its overview, its history and its wrapped (a week, a
 * month) under its own address, and shows only its own source. Old addresses lead straight to the new ones (`oldAddress`): the shared pages (`/historikk/`, `/uke/…`, `/maned/…`) to the music's,
 * and the pages of film and TV together (`/film-og-tv/…`) to the film's; a film's or a show's own page under `/film-og-tv/<slug>/` is found by its page (`src/pages/film-og-tv/[slug].astro`).
 */
import type { Medium } from "./week-source.ts"

export interface MediumInfo {
  /** Its overview, under the site's base: `musikk/`. */
  path: string
  label: string
  /** Its place in the navigation (`navItems`). */
  place: "music" | "film" | "tv"
}

export const MEDIA: Readonly<Record<Medium, MediumInfo>> = {
  music: { path: "musikk/", label: "Musikk", place: "music" },
  film: { path: "film/", label: "Film", place: "film" },
  tv: { path: "tv/", label: "TV", place: "tv" },
}

/** The pages of a medium: its overview, history, and the wrapped of a week and a month (the address of one, or the place that opens the latest). */
export const mediumHref = (base: string, medium: Medium, page: "" | "historikk/" | "uke/" | "maned/" = "", id?: string): string => `${base}${MEDIA[medium].path}${page}${id === undefined ? "" : `${id}/`}`

/** The medium a film or an episode (of a show) is in. */
export const mediumOfKind = (kind: "film" | "episode"): Medium => (kind === "film" ? "film" : "tv")

/** The page of a film (`/film/<slug>/`) or a show (`/tv/<slug>/`). */
export const titleHref = (base: string, slug: string, kind: "film" | "episode"): string => mediumHref(base, mediumOfKind(kind)) + `${slug}/`

/**
 * The new address of an old one, with its query: the shared `/historikk/`, `/uke/2026-47/`, `/maned/2026-11/` are the music's, and `/film-og-tv/` with its history and wrapped the film's. `null` for any
 * other (a title's old page, `/film-og-tv/<slug>/`, is told by its page, which knows whether it is a film or a show).
 */
export function oldAddress(base: string, pathname: string, search: string): string | null {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : null
  if (rest === null) return null
  if (/^film-og-tv\/?$/.test(rest)) return `${mediumHref(base, "film")}${search}`
  const match = /^(film-og-tv\/)?(historikk|uke|maned)(?:\/([^/]+))?\/?$/.exec(rest)
  if (match === null) return null
  const [, film, page, id] = match
  return `${mediumHref(base, film === undefined ? "music" : "film", `${page}/` as "historikk/" | "uke/" | "maned/", id)}${search}`
}
