/** The submit buttons that show they are waiting while their form is sent: `PendingButton` draws them, `listenForPendingForms` sets them busy. */
export const PENDING_SUBMIT = "button[type='submit'][data-pending-label]"

/** The quiet live region beside a `PendingButton`, which says its `pendingLabel` when the form is sent. */
export const PENDING_STATUS = "[data-pending-status]"

/**
 * The button to show as waiting when `form` is sent by `submitter`: the submitter when it is a `PendingButton`, else, when it is none
 * (Enter in a field, `requestSubmit()`) or a hidden default button, the form's first `PendingButton`. Another visible button that sent the
 * form («Hopp over») gets none, so the wrong one never spins.
 */
export function pendingButton(form: HTMLFormElement, submitter: HTMLElement | null): HTMLButtonElement | null {
  if (submitter instanceof HTMLButtonElement && submitter.matches(PENDING_SUBMIT)) return submitter
  if (submitter !== null && !submitter.matches("[aria-hidden='true'], [hidden], .sr-only")) return null
  const first = form.querySelector(PENDING_SUBMIT)
  return first instanceof HTMLButtonElement ? first : null
}

function setPending(form: HTMLFormElement, button: HTMLButtonElement | null) {
  form.setAttribute("aria-busy", "true")
  if (button === null) return
  button.setAttribute("aria-busy", "true")
  button.setAttribute("aria-disabled", "true")
  const status = button.nextElementSibling
  if (status?.matches(PENDING_STATUS)) status.textContent = button.getAttribute("data-pending-label") ?? ""
}

function clearPending(root: Document | HTMLElement) {
  for (const form of root.querySelectorAll("form[aria-busy='true']")) form.removeAttribute("aria-busy")
  for (const button of root.querySelectorAll(`${PENDING_SUBMIT}[aria-busy='true']`)) {
    button.removeAttribute("aria-busy")
    button.removeAttribute("aria-disabled")
    const status = button.nextElementSibling
    if (status?.matches(PENDING_STATUS)) status.textContent = ""
  }
}

/**
 * Shows that a native form is being sent, for the seconds a server may take to answer (a username checked with the service, settings
 * saved): its `PendingButton` turns busy (`aria-busy`, `aria-disabled`), swaps its label for `pendingLabel` with a small spinner, and the
 * live region beside it says so. A second press while it waits sends nothing. A form another script stopped (`preventDefault`) is left
 * alone; a page come back to with the browser's back button (bfcache) is waiting no more. Listens on `root`, so a server-drawn page
 * (Astro, a server component) needs no island: put it once in the layout (`PendingForms` in React). Without it the form is sent as before.
 */
export function listenForPendingForms(root: Document | HTMLElement = document): () => void {
  const onSubmit = (event: Event) => {
    const form = event.target
    if (!(form instanceof HTMLFormElement)) return
    if (form.getAttribute("aria-busy") === "true") {
      event.preventDefault()
      return
    }
    if (event.defaultPrevented) return
    const submitter = "submitter" in event && event.submitter instanceof HTMLElement ? event.submitter : null
    setPending(form, pendingButton(form, submitter))
  }
  const onShow = (event: PageTransitionEvent) => {
    if (event.persisted) clearPending(root)
  }
  root.addEventListener("submit", onSubmit)
  window.addEventListener("pageshow", onShow)
  return () => {
    root.removeEventListener("submit", onSubmit)
    window.removeEventListener("pageshow", onShow)
  }
}
