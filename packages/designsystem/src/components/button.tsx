import type { IconName } from "../lib/icons"
import { ActionButton } from "./internal/action"

/**
 * A button for a secondary action that does something on this page: reset, re-run the intro, cancel a download, use my position. It is
 * always the outline look and has one size: an app says what it does, never how it looks. The submit of a form is a `PendingButton` (the
 * only filled button), and an action that goes somewhere is a `LinkButton`.
 *
 * `onClick` is for a client component (an island); in a form, give `type="submit"` with `name` and `value`. `ariaLabel` names it in
 * full where its words lean on the row they stand in («Slett» → «Slett nedlastingen av …»).
 */
export function Button({ type = "button", name, value, disabled = false, ariaLabel, onClick, icon, children }: { type?: "button" | "submit"; name?: string; value?: string; disabled?: boolean; /** Its full name, where the visible words lean on the row around it. */ ariaLabel?: string; onClick?: () => void; icon?: IconName; children: string }) {
  return (
    <ActionButton type={type} name={name} value={value} disabled={disabled} ariaLabel={ariaLabel} onSelect={onClick} icon={icon} look="outline">
      {children}
    </ActionButton>
  )
}
