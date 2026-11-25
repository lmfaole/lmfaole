import type { ReactNode } from "react"

import { Icon } from "./icon"
import { NavBarScroll } from "./nav-bar-scroll"
import { Wordmark } from "./wordmark"
import type { AppGlyph } from "../lib/brand"
import type { IconName } from "../lib/icons"
import type { LinkTo } from "../lib/vocabulary"

/** A place in the bar. Its `label` is one word: it must fit under its icon on a phone. */
export interface NavItem extends LinkTo {
  key: string
  icon: IconName
  /** The place you are in (for a detail page, the list it belongs to). */
  current: boolean
  /** A mark beside the place, such as a `NewBadge` for a place that is new: over the icon on a phone, after the label on the rail. */
  badge?: ReactNode
  /** How many new things wait there (games on the wishlist that came on sale since the last visit): a number in a pill, in place of `badge`. `label` says it in words to a screen reader («2 nye tilbud»); 0 draws nothing. */
  count?: { value: number; label: string }
}

/** A count in a pill: the number to the eye (99+ above 99), the words to a screen reader, after the place's name. */
function Count({ count }: { count: { value: number; label: string } }) {
  return (
    <span className="bg-primary text-primary-foreground inline-block min-w-[1.25rem] rounded-full px-1.5 text-center text-xs leading-5 font-semibold tabular-nums">
      <span aria-hidden="true">{count.value > 99 ? "99+" : count.value}</span>
      <span className="sr-only">, {count.label}</span>
    </span>
  )
}

/**
 * The way between the top-level places of an app: a **bar at the foot of the screen on a phone** (an icon over a short label, in
 * the reach of the thumb) and a **rail down the left side from tablet width up**. It is NAVIGATION, not tabs: tabs switch
 * between views of the same content on one page; this goes to another page (Material 3 uses a navigation bar and a rail for
 * this and keeps tabs for secondary content; GOV.UK's tabs "switch views within a page", its service navigation "links across a
 * service"). Three to five places is best; more is allowed (an app's «Innstillinger» last, with the `settings` icon): on a phone the bar then scrolls sideways
 * with each place snapping into place, at least 4.5 rem wide (a place cut at the edge, and a fade there, show that there is more), and the current place is scrolled into view
 * when the page opens (`NavBarScroll`, drawn inside); the rail shows every place. One-word labels, the same order on every page, the current one marked (`aria-current="page"`).
 * Give it to `PageLayout` as `nav`: the page leaves room for it. It is chrome, not content, so it does not break the reading
 * column (README, rule 7). The current place takes the app's brand (`data-brand`): its icon in the hue on a tint of it; without a brand, the ink on
 * the muted surface. With `glyph`, the name at the top of the rail is the app's `Wordmark`, and `family` the family that vouches for it. In an app
 * that asks for view transitions (`transitionAttributes()` on `<html>`), the current place's indicator slides from the old place to the new as the
 * page changes (guide «Motion», «Brand motion»); elsewhere it simply is there. A place is 3.5rem high on a phone; on the rail 2.5rem, with its target
 * reaching 0.125rem into the gap above and below (2.75rem), so the places meet without overlapping.
 */
export function NavBar({
  label = "Hovedmeny",
  title,
  glyph,
  family = "lmfaole",
  items,
}: {
  /** Names the menu: «Hovedmeny», the default. */
  label?: string
  /** The app's name, shown at the top of the rail (not on a phone). */
  title?: string
  /** The app's glyph: the name is drawn as its `Wordmark`. */
  glyph?: AppGlyph
  /** The family the app belongs to, after the name and quieter («Medier · lmfaole»); only with `glyph`. `lmfaole` by default. */
  family?: string
  items: readonly NavItem[]
}) {
  return (
    <nav
      aria-label={label}
      data-nav-bar=""
      className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[var(--safe-bottom)] backdrop-blur md:inset-x-auto md:inset-y-0 md:left-0 md:w-56 md:overflow-y-auto md:border-t-0 md:border-r md:px-3 md:pt-8 md:pb-6"
    >
      {title === undefined ? null : glyph === undefined ? (
        <p className="font-heading hidden px-3 pb-5 text-sm font-medium md:block">{title}</p>
      ) : (
        <p className="hidden px-3 pb-5 md:flex">
          <Wordmark name={title} glyph={glyph} family={family} size="sm" />
        </p>
      )}
      <ul className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] data-more-end:mask-r-from-[calc(100%-2rem)] data-more-start:mask-l-from-[calc(100%-2rem)] md:snap-none md:flex-col md:gap-1 md:overflow-visible md:mask-none">
        {items.map((item) => {
          const mark = item.count !== undefined && item.count.value > 0 ? <Count count={item.count} /> : item.badge
          return (
          <li key={item.key} className={`min-w-[4.5rem] flex-1 snap-start md:min-w-0 md:flex-none ${item.current ? "[scroll-initial-target:nearest]" : ""}`}>
            <a
              href={item.href}
              className="group hover:bg-muted/50 relative isolate flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-xs md:min-h-10 md:flex-row md:justify-start md:gap-3 md:rounded-lg md:px-3 md:py-2 md:text-sm md:after:absolute md:after:inset-x-0 md:after:-inset-y-0.5 md:after:content-[''] aria-[current=page]:font-medium"
              {...(item.current ? { "aria-current": "page" as const } : {})}
            >
              {/* The current place's indicator: the whole row on the rail, a pill under the icon on a phone (the indicator of a navigation bar). One element,
                  shown at one width at a time, so a change of page can move it from the old place to the new (`data-nav-indicator`, shell.css). */}
              {item.current ? <span data-nav-indicator="" aria-hidden="true" className="bg-brand-subtle absolute inset-0 -z-10 hidden rounded-lg md:block" /> : null}
              <span className="group-aria-[current=page]:text-brand relative isolate rounded-full px-4 py-1 md:p-0">
                {item.current ? <span data-nav-indicator="" aria-hidden="true" className="bg-brand-subtle absolute inset-0 -z-10 rounded-full md:hidden" /> : null}
                <Icon name={item.icon} />
                {mark === undefined ? null : <span className="bg-background absolute -top-2 left-1/2 rounded-full md:hidden">{mark}</span>}
              </span>
              <span className="max-w-full min-w-0 truncate">{item.label}</span>
              {mark === undefined ? null : <span className="hidden shrink-0 md:ml-auto md:inline-flex">{mark}</span>}
            </a>
          </li>
          )
        })}
      </ul>
      <NavBarScroll />
    </nav>
  )
}
