import type { ReactNode } from "react"

import { cn } from "cn"

import { Icon } from "../icon"
import type { IconName } from "../../lib/icons"
import type { ActionTo, LinkTo } from "../../lib/vocabulary"
import { buttonVariants } from "../ui/button"
import { EXTERNAL_REL } from "./external-mark"

/**
 * INTERNAL: the one look of an action in the design system. `primary` is filled, for the one main way on that a component owns (the
 * action of an `EmptyState`, «Prøv igjen» in an `ErrorMessage`, «Gå til forsiden» on an error page); `outline` is every other action
 * (`LinkButton`, `Button`). An app never chooses: the public components fix it.
 *
 * `central`: the anchor of a centred frame (`EmptyState`, `ErrorMessage`): a size larger, the width of a thumb's reach on a phone
 * (`min(100%, 20rem)`), its own width from 40rem up.
 *
 * The target reaches 0.25rem above and below the button (0.375rem on a touch screen), so a thumb that lands just off it still hits it.
 */
export type ActionLook = "primary" | "outline"

const REACH = "relative after:absolute after:inset-x-0 after:-inset-y-1 pointer-coarse:after:-inset-y-1.5 after:content-['']"
const CENTRAL = "w-[min(100%,20rem)] sm:w-auto sm:min-w-40 h-10 px-4 text-base"

function classes(look: ActionLook, central: boolean): string {
  return cn(buttonVariants({ variant: look === "primary" ? "default" : "outline", size: "default" }), REACH, central && CENTRAL)
}

/** The inside of an action: its icon, its words, and the external symbol (with words for a screen reader) for a link out. */
function Inside({ icon, external, children }: { icon: IconName | undefined; external: boolean; children: ReactNode }) {
  return (
    <>
      {icon === undefined ? null : <Icon name={icon} slot="start" />}
      {children}
      {external ? (
        <>
          <Icon name="external" slot="end" />
          <span className="sr-only"> (eksternt nettsted)</span>
        </>
      ) : null}
    </>
  )
}

/** An action that goes somewhere: a real `<a>`, so it works before any script and opens in a new tab like any link. A link out is `rel="noopener noreferrer"`. */
export function ActionLink({ href, external = false, icon, look, central = false, children }: { href: string; external?: boolean; icon?: IconName | undefined; look: ActionLook; central?: boolean; children: ReactNode }) {
  return (
    <a href={href} data-slot="button" className={classes(look, central)} {...(external ? { rel: EXTERNAL_REL } : {})}>
      <Inside icon={icon} external={external}>
        {children}
      </Inside>
    </a>
  )
}

/** An action that does something here: a native `<button>`. */
export function ActionButton({ type = "button", name, value, disabled = false, ariaLabel, onSelect, icon, look, central = false, children }: { type?: "button" | "submit"; name?: string | undefined; value?: string | undefined; disabled?: boolean; ariaLabel?: string | undefined; /** What it does when pressed (a client component's handler). */ onSelect?: (() => void) | undefined; icon?: IconName | undefined; look: ActionLook; central?: boolean; children: ReactNode }) {
  return (
    <button
      type={type}
      data-slot="button"
      className={classes(look, central)}
      disabled={disabled}
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(ariaLabel === undefined ? {} : { "aria-label": ariaLabel })}
      {...(onSelect === undefined ? {} : { onClick: onSelect })}
    >
      <Inside icon={icon} external={false}>
        {children}
      </Inside>
    </button>
  )
}

/** The anchor of a centred frame (`EmptyState`, `ErrorMessage`): filled, a size larger, the width of a thumb on a phone; a link or, in a client component, a button. */
export function CentralAction({ action }: { action: LinkTo | ActionTo }) {
  return "href" in action ? (
    <ActionLink href={action.href} icon={action.icon} look="primary" central>
      {action.label}
    </ActionLink>
  ) : (
    <ActionButton onSelect={action.onSelect} icon={action.icon} look="primary" central>
      {action.label}
    </ActionButton>
  )
}
