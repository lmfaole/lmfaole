import type { ReactNode } from "react"

import { Heading, Text } from "./text"

/**
 * One part of a settings page («Innstillinger»): a heading, a sentence on what it changes, and its fields. The sections stand under
 * each other in the reading column, divided by a line, in one form or each in its own; `id` makes it a place to link to
 * (`/innstillinger#tema`). The fields are the native ones (`TextField`, `ChoiceCards`, `CheckboxList`, `ListField`), so the page works
 * without JavaScript.
 */
export function SettingsSection({ id, title, description, children }: { id: string; title: string; /** What it changes, in one sentence. */ description?: string; children: ReactNode }) {
  const titleId = `${id}-title`
  return (
    <section id={id} aria-labelledby={titleId} className="border-border grid scroll-mt-4 gap-4 border-t pt-6 first:border-t-0 first:pt-0">
      <div className="grid gap-1">
        <Heading level={2} id={titleId}>
          {title}
        </Heading>
        {description === undefined ? null : <Text role="quiet">{description}</Text>}
      </div>
      {children}
    </section>
  )
}
