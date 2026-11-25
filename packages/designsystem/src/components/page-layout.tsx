import type { ReactNode } from "react"

import { PAGE_COLUMN, PANE_COLUMN, READING_COLUMN, SECTION_RHYTHM } from "../lib/page-width"

/** The id of the page area, which the skip link points at. */
export const MAIN_ID = "main-content"

/**
 * With a `NavBar`: room at the foot for the bar on a phone, and room at the left for the rail from tablet width up: the rail's
 * 14rem plus the column's gutter. `2xl:pl-66` is needed because `PAGE_COLUMN`'s `2xl:px-10` would otherwise win over `md:pl-60`.
 */
const WITH_NAV = "pt-10 pb-[calc(--spacing(24)+var(--safe-bottom)+var(--player-room,0rem))] md:pb-[calc(--spacing(10)+var(--player-room,0rem))] md:pl-60 2xl:pl-66"

/** Without a `NavBar`: the room above and under the page (`PAGE_PADDING_Y`), and the docked player's height under it while one shows. */
const WITHOUT_NAV = "pt-10 pb-[calc(--spacing(10)+var(--player-room,0rem))]"

/**
 * The frame of a page: the skip link, and the page in `<main>`, in the one column every page stands in. Its sections stand
 * 2rem apart (`SECTION_RHYTHM`): put them straight in it, never in a `Stack` of their own. It has no
 * state, so a server renders it and sends no script for it.
 */
export function PageLayout({ width = "reading", nav, player, children }: { /** The app's `NavBar`: the page leaves room for it, at the foot on a phone and at the left from tablet width up. */ nav?: ReactNode; /** The app's `PodcastPlayer`, where the layout that draws `PageLayout` is the one that stays between pages: docked above the bar on a phone and beside the rail from tablet width. The page leaves room under it for the player wherever the player is drawn (`--player-room`). */ player?: ReactNode; /** `reading` (the default): one column at a readable width, centred. `pane`: the reading column and a pane beside it on a wide screen (a detail page with a cover and facts). `wide`: the whole page area, for pages that are mostly pictures or charts. */ width?: "reading" | "pane" | "wide"; children: ReactNode }) {
  return (
    <>
      <a
        href={`#${MAIN_ID}`}
        className="bg-background focus:ring-ring sr-only z-[60] rounded-md px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
      >
        Hopp til innholdet
      </a>
      {nav}
      {/* A named container, so a page can bleed out of the column to the width of the page area (`margin-inline: calc(50% - 50cqw)`) without 100vw overshooting. */}
      <main id={MAIN_ID} className="[container:page/inline-size] outline-none">
        <div className={`${PAGE_COLUMN} ${nav === undefined ? WITHOUT_NAV : WITH_NAV}`}>
          <div className={`${width === "reading" ? READING_COLUMN : width === "pane" ? PANE_COLUMN : ""} ${SECTION_RHYTHM}`}>
            {children}
          </div>
        </div>
      </main>
      {player}
    </>
  )
}
