import { useId } from "react"

import type { LinkTo } from "../lib/vocabulary"
import { NativeSelect, NativeSelectOption } from "./ui/native-select"

/** One chip: a link to the page filtered on it, `current` for the one that is on. */
export interface FilterChip extends Omit<LinkTo, "icon"> {
  key: string
  current: boolean
}

/** More than this many and the chips are a navigating select: a row of seven or more is not scanned, it is read. */
export const MAX_CHIPS = 6

const CHIP =
  "motion-press inline-flex min-h-12 items-center rounded-full border px-4 text-sm hover:bg-muted/50 active:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=true]:bg-muted aria-[current=true]:font-medium"

/**
 * The one way to switch between views of the same page (a day, a line, a period): each choice is a link to the page with it on, so
 * it works without a script. Up to six (`MAX_CHIPS`) they are a row of chips; with more they are a native `<select>` whose options
 * are the same links (`data-href`), the platform's own picker, and `enableNavigatingSelects` (`lib/navigating-select`), run once by
 * the page, goes there on a choice. A screen reader is told in advance that a choice changes the page, and the arrow keys of a closed
 * select step without leaving until Enter or Tab (WCAG 3.2.2). `label` names what is chosen («Dag», «Linje», «Periode»).
 */
export function FilterChips({ label, chips }: { label: string; chips: readonly FilterChip[] }) {
  const hint = useId()
  if (chips.length > MAX_CHIPS) {
    return (
      <nav aria-label={label}>
        <span id={hint} hidden>
          Siden bytter når du velger.
        </span>
        <NativeSelect
          aria-label={label}
          aria-describedby={hint}
          defaultValue={chips.find((chip) => chip.current)?.key}
          data-navigates=""
          className="min-w-40 [&_select]:h-12 [&_select]:rounded-xl [&_select]:pl-3 [&_select]:text-base"
        >
          {chips.map((chip) => (
            <NativeSelectOption key={chip.key} value={chip.key} data-href={chip.href}>
              {chip.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </nav>
    )
  }
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <a key={chip.key} href={chip.href} className={CHIP} aria-current={chip.current}>
          {chip.label}
        </a>
      ))}
    </nav>
  )
}
