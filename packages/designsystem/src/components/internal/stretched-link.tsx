import type { ReactNode } from "react"

import { ENTITY_LINK, STRETCHED_LINK } from "../../lib/link-style"
import { EXTERNAL_REL, ExternalMark } from "./external-mark"

/**
 * INTERNAL: the one link of a row, tile or card that covers it whole (on a container with `STRETCHED_ROW` or `LINKED_ROW`), while its
 * name stays only its text. It is what `TextLink stretched` was: stretching is the list's decision (`List`, `Tiles`, `SourceList`), never an app's.
 */
export function StretchedLink({ href, external = false, children }: { href: string; external?: boolean; children: ReactNode }) {
  return (
    <a href={href} className={`${ENTITY_LINK} ${STRETCHED_LINK}`} data-stretched="" {...(external ? { rel: EXTERNAL_REL } : {})}>
      {children}
      {external ? <ExternalMark /> : null}
    </a>
  )
}
