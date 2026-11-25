"use client"

import { usePathname } from "next/navigation"
import { ViewTransition, type ReactNode } from "react"

/**
 * The page as one React `<ViewTransition>` (design system, «Motion» §9), so a client-side navigation in Next starts a view transition and
 * the `NavBar`'s current place (`nav-current`) and `<main>` move with it, from the design system's `shell.css`. The page is keyed by its path:
 * a change of page is an exit and an enter, which animate; a refresh of the same page (`Refresh` every minute, a new position) is an update,
 * which does not (`update="none"`), so the departure board and the weather are redrawn in place and nothing replays.
 * The links between the places are plain `<a>`, so most changes of page load a new document, and there the browser's cross-document
 * transition (`@view-transition` in `shell.css`) does the same work. Without view transitions, or under reduced motion, the page just changes.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <ViewTransition key={pathname} update="none">
      {children}
    </ViewTransition>
  )
}
