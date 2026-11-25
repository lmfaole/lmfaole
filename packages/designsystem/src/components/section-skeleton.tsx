import type { IconName } from "../lib/icons"
import { SectionTitle } from "./internal/section-title"
import { Skeleton } from "./ui/skeleton"

/**
 * The place of a section that is on its way, at the height it will have, so nothing below it jumps when it arrives. It is one status for the
 * whole part with a hidden label («Henter pull requests»), not one announcement for each bar. No `aria-busy` on it: a screen
 * reader holds back what a busy region says. The bars pulse after a second, twice (the tokens), so a quick load never flickers. `lines` is how many rows the section will
 * have, about; too few makes the page jump a little, too many leaves a gap. The section's title and icon stand where they will stand, so
 * the page is read the same before and after. It is drawn by `StreamedSection`; a page does not place one itself.
 */
export function SectionSkeleton({ title, icon, lines = 3 }: { title: string; icon: IconName; lines?: number }) {
  return (
    <div role="status" data-page-part="" className="grid gap-4 lg:gap-5">
      <span className="sr-only">Henter {title}</span>
      <p aria-hidden="true" className="text-2xl font-semibold tracking-tight">
        <SectionTitle icon={icon}>{title}</SectionTitle>
      </p>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  )
}
