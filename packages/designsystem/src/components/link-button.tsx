import type { IconName } from "../lib/icons"
import { ActionLink } from "./internal/action"

/**
 * A link that looks like a button, for an action that goes somewhere: «Åpne på GitHub». It is always the outline look; the one filled
 * action of a frame is drawn by the component that owns it (`EmptyState`, `ErrorMessage`, the error pages), never chosen by an app.
 * `external` is a link out to another site: it is marked with the external symbol, opened without handing the new page a `window.opener`,
 * and is the LAST action on a page, never the first (see «Links» in the README). A link that only continues in the same place is a
 * `TextLink`, not a button. Its target reaches 0.25rem above and below the button (0.375rem on a touch screen).
 */
export function LinkButton({ href, external = false, icon, children }: { href: string; /** A link out to another site. */ external?: boolean; icon?: IconName; children: string }) {
  return (
    <ActionLink href={href} external={external} icon={icon} look="outline">
      {children}
    </ActionLink>
  )
}
