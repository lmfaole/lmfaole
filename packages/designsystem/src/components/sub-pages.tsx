import { Icon } from "./icon"
import type { IconName } from "../lib/icons"
import type { LinkTo } from "../lib/vocabulary"

/** A page under this page: where it goes, its name and its icon. */
export interface SubPage extends LinkTo {
  icon: IconName
  /** What the page is, in one line: the reader decides from it, so it says what is on the page, not what the page is called. */
  description?: string
  /** What is chosen there now, in a few words («Mørkt · effekter av», «snowpony69 og lmfaole»): the overview of a settings page. Shown under the name, before `description`. */
  value?: string
}

/** The settings pages every app has, first in its overview and in this order (`appearancePage`, `appPage`). */
const SHARED = ["Utseende", "App"]
const rank = (page: SubPage): number => (SHARED.includes(page.label) ? SHARED.indexOf(page.label) : SHARED.length)

/**
 * Links to the pages under this page, as a list: an icon, the name as a link, and one line of what is on it. It is the ONE way a
 * page shows its subpages: not as cards, not as buttons, not in a second menu. One column, in the order they matter (`ICONS` and
 * `List` have the same look), so the reader chooses from a list they can read, not a grid they have to scan.
 *
 * It is for a page that is nothing but its subpages (a settings overview, «Innstillinger»): the list straight under its title, each
 * row with its `value`, what is chosen there now, so the reader sees the settings without opening them; and for several subpages
 * that belong together. ONE subpage that continues a section (the history under «Siste avspillinger») is not a `SubPages`: it is
 * the section's own foot, `PageSection` with `continues`, a card with one link to the subpage at its foot.
 *
 * The settings overview has one order in every app: «Utseende» (`appearancePage` in `lib/settings-pages`), «App» (`appPage`), then the app's own pages in the
 * order given; under the list, `IntroSettings` and `SourcesSettings`. The shared rows come first whatever order they are passed in.
 */
export function SubPages({ label, pages }: { label: string; pages: readonly SubPage[] }) {
  if (pages.length === 0) return null
  return (
    <nav aria-label={label}>
      <ul className="grid gap-1">
        {pages.toSorted((one, other) => rank(one) - rank(other)).map((page) => (
          <li key={page.href}>
            <a href={page.href} className="hover:bg-muted/50 grid min-h-12 grid-cols-[1rem_1fr_auto] items-start gap-x-3 rounded-lg px-2 py-2">
              <span className="shrink-0 pt-0.5">
                <Icon name={page.icon} tone="muted" />
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span className="line-clamp-2 font-medium underline decoration-dotted underline-offset-4 [overflow-wrap:anywhere]">{page.label}</span>
                {page.value === undefined ? null : <span className="text-muted-foreground truncate text-sm">{page.value}</span>}
                {page.description === undefined ? null : <span className="text-muted-foreground text-sm [overflow-wrap:anywhere]">{page.description}</span>}
              </span>
              <span className="pt-0.5">
                <Icon name="chevron-right" size="sm" tone="muted" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
