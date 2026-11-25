import { Icon } from "../icon"

/**
 * INTERNAL: what says a link leaves the site, at the end of its text: the external symbol for the eye and «(eksternt nettsted)» for a
 * screen reader, so both know before they follow it. Every link out in the design system ends with it (`TextLink external`, the rows and
 * lists that link out). The links themselves open with `rel="noopener noreferrer"` (`EXTERNAL_REL`).
 */
export function ExternalMark() {
  return (
    <>
      <span className="ml-1 inline-block align-text-bottom">
        <Icon name="external" size="sm" tone="muted" />
      </span>
      <span className="sr-only"> (eksternt nettsted)</span>
    </>
  )
}

/** A link out opens without handing the new page a `window.opener`: a safety property, never a prop. */
export const EXTERNAL_REL = "noopener noreferrer"
