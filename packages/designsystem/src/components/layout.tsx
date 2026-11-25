import type { ReactNode } from "react"

import { PAGE_COLUMN, PAGE_PADDING_Y, READING_COLUMN } from "../lib/page-width"

/**
 * How an app puts things next to and under each other without a class of its own (`docs/UI-COMPONENTS.md`). The space between
 * is the system's, not the page's: a `Stack` has two steps, `Inline` and `Grid` one each, and the space between the sections of a
 * page is `PageLayout`'s. The classes are written out whole, since Tailwind reads them as text.
 */
const GAPS = { tight: "gap-2", default: "gap-4" } as const
const JUSTIFY = { start: "justify-start", between: "justify-between" } as const
const COLUMNS = {
  /** Charts: two or three across on a desktop. */
  charts: "grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))]",
  /** Pictures: as many 9rem columns as fit. */
  tiles: "grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]",
} as const

/** `tight`: lines that belong together (a title and its details, the states of a download). `default`: the blocks inside a section. */
export type Gap = keyof typeof GAPS

/** Things under each other. The sections of a page are not put in one: `PageLayout` spaces them. */
export function Stack({ gap = "default", id, children }: { gap?: Gap; /** A place to link to (`#tider`). */ id?: string; children?: ReactNode }) {
  return (
    <div id={id} className={`grid min-w-0 content-start ${GAPS[gap]}`}>
      {children}
    </div>
  )
}

const INLINE = "flex min-w-0 flex-wrap items-center gap-2"

/**
 * Things next to each other, wrapping to a new line when the row is full, centred on each other's middle. Given `items`, it is a list
 * (`ul`, each item an `li`), named by `label`; given `children`, it is a plain row (a title and its actions).
 */
export function Inline({ justify = "start", children, items, label }: { justify?: keyof typeof JUSTIFY } & (
  | { children?: ReactNode; items?: undefined; label?: undefined }
  | { /** Things of one kind (tags, links), read as a list. */ items: readonly ReactNode[]; /** What the list is, for a screen reader («Sjangre»). */ label: string; children?: undefined }
)) {
  if (items !== undefined) {
    return (
      <ul role="list" aria-label={label} className={`${INLINE} ${JUSTIFY[justify]}`}>
        {items.map((item, index) => (
          <li key={index} className="min-w-0">{item}</li>
        ))}
      </ul>
    )
  }
  return <div className={`${INLINE} ${JUSTIFY[justify]}`}>{children}</div>
}

/**
 * Things in columns, for what is LOOKED AT and not read: pictures (`tiles`) and charts (`charts`), as many across as there is
 * room for. Never for text, lists or the sections of a page: those stand under each other in the reading column (README, rule 7).
 */
export function Grid({ columns, children }: { columns: keyof typeof COLUMNS; children?: ReactNode }) {
  return <div className={`grid min-w-0 gap-4 ${COLUMNS[columns]}`}>{children}</div>
}

/** The column every page stands in (`PAGE_COLUMN`), with the page's parts under each other in the reading column, as `PageLayout`. */
export function PageColumn({ children }: { children?: ReactNode }) {
  return (
    <div className={`${PAGE_COLUMN} ${PAGE_PADDING_Y}`}>
      <div className={`grid content-start gap-6 ${READING_COLUMN}`}>{children}</div>
    </div>
  )
}
