import { ConnectionBanner } from "@lmfaole/designsystem/components/connection-banner"
import { Breadcrumbs } from "@lmfaole/designsystem/components/breadcrumbs"
import { NavBar } from "@lmfaole/designsystem/components/nav-bar"
import { PageHeader } from "@lmfaole/designsystem/components/page-header"
import { PageLayout } from "@lmfaole/designsystem/components/page-layout"
import type { ReactNode } from "react"

import { withBase } from "../lib/links"
import { positionQuery, type Position } from "../lib/position"
import { Refresh } from "./refresh"

/** How often the open page asks for itself again (components/refresh.tsx). A source is kept at the edge for as long (lib/upstream.ts) and then shown at once, as it was, while it is asked for anew: a renewal never waits for GitHub. */
const REFRESH_SECONDS = 60

export type PageId = "front" | "github" | "transport" | "weather" | "power" | "about"

/** The pages under GitHub (pull requests, issues, discussions, alerts) have this as their first crumb. */
export const GITHUB = { path: "/github", label: "GitHub" } as const

/** The top-level places: one-word labels, the same order on every page. `located`: the place follows the position, so its link carries it on (`?pos=`). */
const PLACES = [
  { key: "front", label: "Forside", path: "", icon: "home", located: true },
  { key: "github", label: "GitHub", path: "/github", icon: "branch", located: false },
  { key: "transport", label: "Transport", path: "/transport", icon: "bus", located: true },
  { key: "weather", label: "Vær", path: "/vaer", icon: "weather", located: true },
  { key: "power", label: "Strøm", path: "/strom", icon: "bolt", located: true },
  { key: "about", label: "Om", path: "/om", icon: "info", located: false },
] as const

/**
 * The frame of every page: the navigation between the places (a bar at the foot on a phone, a rail at the left from tablet width),
 * the title, and on a detail page the way back to the list it belongs to. `current` is the place the page is in; for a detail page,
 * the list it belongs to. The page is the same for every visitor; the only thing of theirs is the position, in the address
 * (`position`), which the links to the places that follow it carry on. Whose data it is and what is kept is on «Om».
 */
/** Whether a page follows the position: one of the located places, or a page below one (a stop under Transport). */
const follows = (path: string): boolean => PLACES.some((place) => place.located && place.path !== "" && (path === place.path || path.startsWith(`${place.path}/`)))

export function Shell({ current, position = null, refresh = true, width = "reading", trail, crumb, title, lead, actions, children }: { current: PageId; /** The position in the page's address (`?pos=`), carried on by the links to the places that follow it. */ position?: Position | null; refresh?: boolean; /** `pane` on a detail page: what is looked up (status, facts) in a pane beside what is read from a wide screen up (design system, guide «Wide screens»); `wide` for a page that is looked at more than read (the departure boards). */ width?: "reading" | "pane" | "wide"; /** On a page below another: the pages above it, outermost first; the breadcrumbs are the front page, those, and the page itself. */ trail?: readonly { path: string; label: string }[]; /** The page's name in the breadcrumbs when the title is long (a pull request's title): `#6851`. */ crumb?: string; title: string; lead?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  const query = positionQuery(position)
  return (
    <PageLayout width={width} nav={<NavBar title="Startside" glyph="sunrise" items={PLACES.map((place) => ({ key: place.key, label: place.label, href: withBase(place.path) + (place.located ? query : ""), icon: place.icon, current: place.key === current }))} />}>
      {refresh ? <Refresh everySeconds={REFRESH_SECONDS} /> : null}
      <ConnectionBanner />
      {trail === undefined ? null : <Breadcrumbs items={[{ label: "Startside", href: withBase("") + query }, ...trail.map((page) => ({ label: page.label, href: withBase(page.path) + (follows(page.path) ? query : "") })), { label: crumb ?? title, href: "#" }]} />}
      <PageHeader title={title} description={lead} actions={actions} />
      {children}
    </PageLayout>
  )
}
