import type { ReactNode } from "react"

/**
 * Longer content kept out of the way behind one line, as a native `<details>`: it works without script and from the keyboard.
 * Only for what the reader does not need to decide (the full text of a log, the notes of a chart); what matters is on the page at
 * rest, never here («Complete at rest»), and it never replaces a page with an address. It stays closed on load and is not nested.
 * Where the browser can animate to `height: auto`, it opens and closes on the motion tokens (`motion.css`). The whole line of the summary is the
 * target, the width of the column and 2.5rem tall (its padding reaches into the space around it, so the layout is as before).
 */
export function Disclosure({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details data-motion="disclosure" className="text-sm">
      <summary className="focus-visible:ring-ring -my-1.5 cursor-pointer rounded-md py-2.5 focus-visible:ring-2 focus-visible:outline-none">{summary}</summary>
      <div className="grid gap-2 pt-2">{children}</div>
    </details>
  )
}
