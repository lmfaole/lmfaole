/**
 * Long titles are the design system's to handle, never the app's: a podcast episode's title of two hundred characters, a file name with no
 * spaces («Episode_2026_11_22_FINAL_v2»), a URL. One behaviour per context, the same in every app:
 *
 * - A row, a tile, the compact player: the title is clamped to two lines (`ROW_TITLE`), the line under it to one with an ellipsis
 *   (`ROW_META`). The full text stays in the page, and a row's link is named by it, so nothing is lost to a screen reader; there is no
 *   `title=` tooltip.
 * - A head (`PageHeader`, `DetailHeader`, the Now Playing dialog): the title is never cut. It wraps in balanced lines, hyphenates (the page's
 *   `lang` is `nb`), breaks a word that has no place to break, and is set a step smaller when it is long (`titleStep`).
 * - Everywhere: what holds text in a flex or grid row has `min-w-0`, so it shrinks instead of widening the page; what sits beside a title
 *   (a badge, a value, an action) has `shrink-0` and keeps its size.
 */

/** A title longer than this many characters is set one step smaller in a head, and longer than the second two steps smaller. */
export const LONG_TITLE = [60, 120] as const

/** How many steps smaller a head's title is set: 0, 1 or 2, from its length. */
export function titleStep(title: string): 0 | 1 | 2 {
  const length = [...title].length
  return length > LONG_TITLE[1] ? 2 : length > LONG_TITLE[0] ? 1 : 0
}

/** A head's title: wrapped in balanced lines, hyphenated, a long word broken; never cut. */
export const HEAD_TITLE = "min-w-0 text-balance hyphens-auto [overflow-wrap:anywhere]"

/** A row's or a tile's title: at most two lines, a long word broken. */
export const ROW_TITLE = "line-clamp-2 min-w-0 [overflow-wrap:anywhere]"

/** The line under a row's title: one line, cut with an ellipsis. */
export const ROW_META = "block min-w-0 truncate"
