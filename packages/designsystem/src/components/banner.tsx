import type { ReactNode } from "react"

import { Notice } from "./internal/notice"

/**
 * A message about the whole page or a whole section, in the reading column above what it is about: that what the reader did has worked
 * (`success`), or a notice that holds for the page (`info`: this is a snapshot, the data is from yesterday). A message about one action or one
 * field stands next to it, not here. It cannot be dismissed (what matters stays until it is solved), there is no toast in the design system,
 * and the symbol and the title say what kind it is, so colour never carries it alone. It is announced politely (`role="status"`).
 *
 * A `success` title is the deed in the past tense, one word without a full stop: «Lagret», «Slettet», «Glemt», on a settings page after the
 * server saved it and sent the reader back (`?lagret=1`), under the page's title. A banner is never a failure: what could not be fetched is
 * an `ErrorMessage`, and being offline is the `ConnectionBanner`.
 */
export function Banner({ tone = "info", title, children }: { tone?: "success" | "info"; title: string; children?: ReactNode }) {
  return (
    <div role="status">
      <Notice icon={tone} title={title}>
        {children}
      </Notice>
    </div>
  )
}
