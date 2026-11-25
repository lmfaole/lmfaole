import { Icon } from "./icon"
import type { LinkTo } from "../lib/vocabulary"

/** A page on the way: where it is and its name, as in the `NavBar` or its title. */
export type Crumb = Omit<LinkTo, "icon">

/**
 * Where the page is in the app, from the top: the group (`Hjem`, `Medier`), the app, the page, and the page the reader is on last.
 * It is on EVERY page below a place in the `NavBar`: a subpage and a detail page (in an app that belongs to a group, the group is the first
 * crumb, which is how the reader reaches the other apps). A page that IS a place in the `NavBar` (the front page, «Musikk», «Innstillinger»)
 * has no breadcrumbs: the bar marks where the reader is, and «Medier › Innstillinger» would only say it again. The last item is the page itself (`aria-current="page"`, not a link). The first item is the group, and links to the page that
 * lists the apps of it: that is how the reader moves between apps. Do not repeat the page's title in a second heading to say where
 * you are: the breadcrumbs say where, the title says what.
 *
 * On a phone only the parent is shown, as a way back («‹ AdGuard», naming where it goes, never «Tilbake»); from tablet width the
 * whole trail. It is plain links, so it works without a script. The way back is 2.75rem tall and reaches past its words (a thumb's target
 * without a larger look), and each crumb of the trail is the 2.5rem height of the trail.
 */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  if (items.length < 2) return null
  const parent = items[items.length - 2]
  return (
    <nav aria-label="Brødsmuler" className="mb-3 text-sm">
      {parent === undefined ? null : (
        <a href={parent.href} className="text-muted-foreground hover:text-foreground -my-0.5 flex min-h-11 max-w-full items-center gap-1 pr-3 md:hidden">
          <Icon name="back" />
          <span className="min-w-0 truncate">{parent.label}</span>
        </a>
      )}
      <ol className="text-muted-foreground hidden min-h-10 flex-wrap items-center gap-x-1 md:flex">
        {items.map((item, index) => {
          const current = index === items.length - 1
          return (
            <li key={item.href} className="inline-flex min-w-0 items-center gap-1">
              {index === 0 ? null : <span className="shrink-0"><Icon name="chevron-right" size="sm" /></span>}
              {current ? (
                <span aria-current="page" className="text-foreground min-w-0 truncate font-medium">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={`hover:text-foreground inline-flex min-h-10 min-w-0 items-center underline underline-offset-4 ${index === 0 ? "" : "max-w-[16ch]"}`}>
                  <span className="min-w-0 truncate">{item.label}</span>
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
