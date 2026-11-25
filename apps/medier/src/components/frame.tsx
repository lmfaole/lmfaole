import type { NavItem } from "@lmfaole/designsystem/components/nav-bar"
import { PageLayout } from "@lmfaole/designsystem/components/page-layout"
import type { ReactNode } from "react"

export type Place = "front" | "music" | "film" | "tv" | "games" | "settings"

/**
 * The places of the app, for its `NavBar` (a bar at the foot on a phone, which scrolls sideways once they are more than fit, and a rail from tablet width): Forside, Musikk, Film, TV, Spill (only
 * with `games`: the site has Steam's key; without a Steam profile its page asks for one; `sales` is how many games on the Steam wishlist went on sale since the visitor last looked, a count on it) and, last, Innstillinger (current on all its subpages). The history and the wrapped of each are under Musikk, Film and TV (the foot of the section card each continues, `PageSection continues`). `current` is the place the page is in, none for a
 * page that is in none.
 */
export function navItems(base: string, current: Place | undefined, games = false, sales = 0): NavItem[] {
  const places = [
    { key: "front", label: "Forside", href: base, icon: "home" },
    { key: "music", label: "Musikk", href: `${base}musikk/`, icon: "music" },
    { key: "film", label: "Film", href: `${base}film/`, icon: "film" },
    { key: "tv", label: "TV", href: `${base}tv/`, icon: "tv" },
    { key: "games", label: "Spill", href: `${base}spill/`, icon: "game" },
    { key: "settings", label: "Innstillinger", href: `${base}innstillinger/`, icon: "settings" },
  ] as const
  return places.filter((place) => games || place.key !== "games").map((place) => ({ ...place, current: place.key === current, ...(place.key === "games" && sales > 0 ? { count: { value: sales, label: sales === 1 ? "nytt tilbud" : "nye tilbud" } } : {}) }))
}

/**
 * The frame of every page: the bar between the places, and the page's own column. The bar comes in from the Astro layout as the named slot `nav` (an island, so the part of it that scrolls the
 * current place into view on a phone runs); a slot is the way an element made in an `.astro` file reaches a React component.
 */
export function Frame({ width, nav, children }: { width: "reading" | "pane"; nav?: ReactNode; children: ReactNode }) {
  return (
    <PageLayout width={width} nav={nav}>
      {children}
    </PageLayout>
  )
}
