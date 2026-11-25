import type { ReactNode } from "react"

import { Heading } from "./text"

/**
 * A page's own `<h1>` (the one page-title look of `Heading`) and an optional one-line `description` under it, above its content, with
 * room for the page's controls beside the title. The room under it is fixed.
 */
export function PageHeader({ title, description, actions }: { title: string; /** One line on what is on the page, as text or with inline parts (a `Person` in a byline). */ description?: ReactNode; /** Buttons or menus shown alongside the title. */ actions?: ReactNode }) {
  return (
    <header className="mb-8 grid min-w-0 gap-3 lg:mb-12">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-[1_1_14rem]">
          <Heading level={1}>{title}</Heading>
        </div>
        {actions === undefined || actions === null ? null : <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {description !== undefined && description !== null && description !== false && description !== "" ? (
        <p className="text-muted-foreground max-w-prose min-w-0 text-base [overflow-wrap:anywhere]">{description}</p>
      ) : null}
    </header>
  )
}
