import { useId } from "react"

import { Icon } from "./icon"
import { Heading, Text } from "./text"
import { TextField } from "./text-field"
import { PendingButton } from "./pending-button"

export interface UsernameField {
  /** The form field's name, which the app's endpoint reads (`github`, `lastfm`, `trakt`), and the input's id. */
  name: string
  label: string
  value?: string
  hint?: string
  /** Why the name was not taken («Fant ingen GitHub-bruker med navnet …»), from the endpoint's redirect. */
  error?: string
  autoComplete?: string
}

/**
 * The question an app asks before it shows anything personal: whose data to fetch. A plain HTML form (`method="post"`) to the app's
 * `action`, with no script, so it works on the server and before anything has loaded; the endpoint checks that the name exists, keeps
 * it in a cookie and sends the reader back to `back` (a hidden field), or back with the error to show beside the field. Each field is a
 * `TextField` typed exactly (no capital letter, no spelling check). Say in `description` that only public data is shown and where the name
 * is kept. One form for the names a page needs; an empty field clears its name. The button says «Hent data», and «Sjekker brukernavnet …» while the
 * endpoint checks (`listenForPendingForms` in the layout). The submit button's target reaches 0.25rem above and below it (2.5rem).
 */
export function UsernameForm({ title, description, action, back, fields, headingLevel = 2 }: { title: string; description?: string; action: string; back: string; fields: readonly UsernameField[]; headingLevel?: 2 | 3 }) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="border-border grid gap-4 rounded-lg border p-4">
      <div className="grid gap-1">
        <div className="flex items-center gap-2">
          <Icon name="person" tone="muted" />
          <Heading level={headingLevel} look="section" id={titleId}>
            {title}
          </Heading>
        </div>
        {description === undefined ? null : (
          <Text role="quiet">
            {description}
          </Text>
        )}
      </div>
      <form method="post" action={action} className="grid justify-items-start gap-4">
        <input type="hidden" name="back" value={back} />
        {fields.map((field) => (
          <div key={field.name} className="w-full">
            <TextField label={field.label} name={field.name} value={field.value} hint={field.hint} error={field.error} autoComplete={field.autoComplete ?? "off"} />
          </div>
        ))}
        <PendingButton pendingLabel="Sjekker brukernavnet …" reach>
          Hent data
        </PendingButton>
      </form>
    </section>
  )
}
