/**
 * Motion an app asks for on its `<html>` (guide «Motion», «Brand motion»). The tokens and the reduced-motion safety net are in `motion.css`, for
 * every app; what is here is opt-in, because it needs every page of the app to have the same frame.
 */

/**
 * Named view transitions between the pages of an app, beside `brandAttributes`: `<html {...brandAttributes("amber")} {...transitionAttributes()}>`.
 * As the page changes, the `NavBar`'s current place slides to the new place, and the page's `<main>` rises in as the old one gives way; the rest of
 * the page crossfades as before. Only where the reader has not asked for less motion, and only in a browser with view transitions: elsewhere the
 * page simply changes. An MPA (Astro) needs nothing more: `shell.css` asks for `@view-transition { navigation: auto }`. A Next.js app moves between
 * pages without loading them, so it starts the transition itself (React's `<ViewTransition>`; guide «Motion»).
 */
export function transitionAttributes(): { "data-motion": "transitions" } {
  return { "data-motion": "transitions" }
}
