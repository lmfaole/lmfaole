import { ConnectionBanner } from "@lmfaole/designsystem/components/connection-banner"
import { Breadcrumbs } from "@lmfaole/designsystem/components/breadcrumbs"
import { NavBar } from "@lmfaole/designsystem/components/nav-bar"
import { NewBadge } from "@lmfaole/designsystem/components/new-badge"
import { PageHeader } from "@lmfaole/designsystem/components/page-header"
import { PageLayout } from "@lmfaole/designsystem/components/page-layout"
import { isNew, isSeen } from "@lmfaole/designsystem/lib/onboarding"
import type { ReactNode } from "react"

import { withBase } from "../lib/links"
import { now } from "../lib/day"
import { seenNotes, TRANSPORT_NEW_UNTIL } from "../lib/visitor"
import { FirstRunWizard } from "./first-run"
import { Refresh } from "./refresh"

/** How often the open page asks for itself again (components/refresh.tsx). A source is kept at the edge for as long (lib/upstream.ts) and then shown at once, as it was, while it is asked for anew: a renewal never waits for GitHub. */
const REFRESH_SECONDS = 60

export type PageId = "front" | "github" | "transport" | "weather" | "power" | "log" | "settings"

/** The pages under GitHub (pull requests, issues, discussions, alerts) have this as their first crumb. */
export const GITHUB = { path: "/github", label: "GitHub" } as const

/** The top-level places: one-word labels, the same order on every page. */
const PLACES = [
  { key: "front", label: "Forside", path: "", icon: "home" },
  { key: "github", label: "GitHub", path: "/github", icon: "branch" },
  { key: "transport", label: "Transport", path: "/transport", icon: "bus" },
  { key: "weather", label: "Vær", path: "/vaer", icon: "weather" },
  { key: "power", label: "Strøm", path: "/strom", icon: "bolt" },
  { key: "log", label: "Logg", path: "/logg", icon: "history" },
  { key: "settings", label: "Innstillinger", path: "/innstillinger", icon: "settings" },
] as const

/**
 * The frame of every page: the navigation between the places (a bar at the foot on a phone, a rail at the left from tablet width),
 * the title, and on a detail page the way back to the list it belongs to. `current` is the place the page is in; for a detail page,
 * the list it belongs to. Whose data it is shows only under «Innstillinger» (Konto), not on every page. Over it all, on a first
 * visit, the first-run wizard (not on the settings page, `firstRun={false}`, which has the same choices). A page with a form to fill
 * in (Logg) is not asked for again every minute (`refresh={false}`): that would throw away what is being written.
 */
export async function Shell({ current, firstRun = true, refresh = true, width = "reading", trail, crumb, title, lead, actions, children }: { current: PageId; firstRun?: boolean; refresh?: boolean; /** `pane` on a detail page: what is looked up (status, facts) in a pane beside what is read from a wide screen up (design system, guide «Wide screens»); `wide` for a page that is looked at more than read (the departure boards). */ width?: "reading" | "pane" | "wide"; /** On a page below another: the pages above it, outermost first; the breadcrumbs are the front page, those, and the page itself. */ trail?: readonly { path: string; label: string }[]; /** The page's name in the breadcrumbs when the title is long (a pull request's title): `#6851`. */ crumb?: string; title: string; lead?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  const seen = await seenNotes()
  // The transport page is new for a while, until the reader has been there (it records `new-transport`, app/transport/page.tsx).
  const at = now().toISOString()
  const badges: Partial<Record<PageId, ReactNode>> = isNew(TRANSPORT_NEW_UNTIL, at) && !isSeen(seen, "new-transport") ? { transport: <NewBadge until={TRANSPORT_NEW_UNTIL} now={at} /> } : {}
  return (
    <PageLayout width={width} nav={<NavBar title="Startside" glyph="sunrise" items={PLACES.map((place) => ({ key: place.key, label: place.label, href: withBase(place.path), icon: place.icon, current: place.key === current, badge: badges[place.key] }))} />}>
      {refresh ? <Refresh everySeconds={REFRESH_SECONDS} /> : null}
      <ConnectionBanner />
      {trail === undefined ? null : <Breadcrumbs items={[{ label: "Startside", href: withBase("") }, ...trail.map((page) => ({ label: page.label, href: withBase(page.path) })), { label: crumb ?? title, href: "#" }]} />}
      <PageHeader title={title} description={lead} actions={actions} />
      {children}
      {firstRun ? <FirstRunWizard /> : null}
    </PageLayout>
  )
}
