import type { NavItem } from "@lmfaole/designsystem/components/nav-bar"

export type Place = "front" | "music" | "film" | "tv" | "games"

/** Which of the places beyond the front page have anything to show: a medium with no username (or, for «Spill», no key) is not in the bar. */
export type Shown = Readonly<Record<Exclude<Place, "front">, boolean>>

/**
 * The places of the app, for its `NavBar` (a bar at the foot on a phone, which scrolls sideways once they are more than fit, and a rail from tablet width): Forside, Musikk, Film, TV and Spill,
 * each only where it is `shown`. The history and the wrapped of each are under Musikk, Film and TV (the foot of the section card each continues, `PageSection continues`). `current` is the
 * place the page is in, none for a page that is in none.
 */
export function navItems(base: string, current: Place | undefined, shown: Shown): NavItem[] {
  const places = [
    { key: "front", label: "Forside", href: base, icon: "home" },
    { key: "music", label: "Musikk", href: `${base}musikk/`, icon: "music" },
    { key: "film", label: "Film", href: `${base}film/`, icon: "film" },
    { key: "tv", label: "TV", href: `${base}tv/`, icon: "tv" },
    { key: "games", label: "Spill", href: `${base}spill/`, icon: "game" },
  ] as const
  return places.filter((place) => place.key === "front" || shown[place.key]).map((place) => ({ ...place, current: place.key === current }))
}
