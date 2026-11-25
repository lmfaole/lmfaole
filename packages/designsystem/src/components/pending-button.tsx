import type { ReactNode } from "react"

import { Button } from "./ui/button"

/**
 * The inside of a button that can wait: its label, and in the same place `pendingLabel` with a small spinner (still where motion is
 * reduced), shown while the button is `aria-busy="true"`. Both share one width, so nothing beside the button moves. For a `Button` set busy
 * by its own script (`FirstRun`'s «Neste» while a step is checked); a form's submit button is a `PendingButton`.
 */
export function PendingLabel({ children, pendingLabel }: { children: ReactNode; pendingLabel: string }) {
  return (
    <span className="inline-grid">
      <span className="col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 group-aria-busy/button:invisible">{children}</span>
      <span className="invisible col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 group-aria-busy/button:visible">
        <span aria-hidden="true" className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
        {pendingLabel}
      </span>
    </span>
  )
}

/**
 * The submit button of a native form that shows it is waiting while the server answers. When the form is sent, `listenForPendingForms`
 * (`lib/pending-forms`, `PendingForms` in React, once in the layout) makes it `aria-busy` and `aria-disabled`: its label gives way to
 * `pendingLabel` («Lagrer …», «Sjekker brukernavnet …») with a spinner, a quiet live region after it says the same, and a second press
 * sends nothing. Without the script it is a plain submit button, in the filled look of the main action: the only filled button an app places, in one size. With `reach` its target reaches 0.25rem above and below it.
 */
export function PendingButton({ children, pendingLabel, reach = false }: { children: string; /** Said while it waits: the verb going on, «Lagrer …». */ pendingLabel: string; reach?: boolean }) {
  return (
    <>
      <Button type="submit" data-pending-label={pendingLabel} className={reach ? "relative after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] aria-busy:cursor-progress" : "aria-busy:cursor-progress"}>
        <PendingLabel pendingLabel={pendingLabel}>{children}</PendingLabel>
      </Button>
      <span role="status" className="sr-only" data-pending-status="" />
    </>
  )
}
