import { Banner } from "@lmfaole/designsystem/components/banner"
import { FormErrorSummary } from "@lmfaole/designsystem/components/form-error-summary"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { PendingButton } from "@lmfaole/designsystem/components/pending-button"
import type { ReactNode } from "react"

import { SETTINGS_ENDPOINT, settingsPage, type Problems, type SettingsSubpage } from "../lib/settings"
import type { SearchParams } from "../lib/username"
import { Shell } from "./shell"

/** Where an error's link in the summary goes: the field itself (the first of the times). */
const FIELD_ID: Record<string, string> = { github: "github", repos: "repos", starts: "starts.morgen" }

/** The settings' crumb: every subpage is under the overview. */
const TRAIL = [{ path: "/innstillinger", label: "Innstillinger" }] as const

/** «Tid på døgnet», above its own subpages. */
export const TIME_OF_DAY = { path: "/innstillinger/tid", label: "Tid på døgnet" } as const

/**
 * One settings subpage (Innstillinger › X): «Lagret» after a save (`?lagret=1`, a status), what the server could not take, and the page.
 * «Innstillinger» stays current in the navigation. No first-run wizard here: the settings are the same choices.
 */
export async function SettingsSubpageLayout({ title, lead, params, problems, parent, children }: { title: string; lead?: string; params: SearchParams; problems: Problems | null; /** A subpage of a subpage: the one above it. */ parent?: { path: string; label: string }; children: ReactNode }) {
  const errors = Object.entries(problems?.errors ?? {}).map(([field, message]) => ({ field: FIELD_ID[field] ?? field, message: String(message) }))
  return (
    <Shell current="settings" firstRun={false} trail={parent === undefined ? TRAIL : [...TRAIL, parent]} title={title} lead={lead}>
      <>
        {params["lagret"] === "1" && errors.length === 0 ? <Banner tone="success" title="Lagret">Endringen gjelder fra nå av i denne nettleseren.</Banner> : null}
        {errors.length === 0 ? null : <FormErrorSummary errors={errors} />}
        {children}
      </>
    </Shell>
  )
}

/** A subpage's own small form to the settings endpoint, back to the subpage, with «Lagre» last. */
export function SettingsForm({ slug, sub, children, hidden, label = "Lagre" }: { slug: SettingsSubpage; sub?: string; children?: ReactNode; hidden?: Record<string, string | readonly string[]>; label?: string }) {
  return (
    <form method="post" action={SETTINGS_ENDPOINT}>
      <input type="hidden" name="back" value={settingsPage(slug, sub)} />
      {Object.entries(hidden ?? {}).flatMap(([name, value]) => (typeof value === "string" ? [value] : value).map((one) => <input key={`${name}=${one}`} type="hidden" name={name} value={one} />))}
      <Stack>
        {children}
        <div>
          <PendingButton pendingLabel="Lagrer …">{label}</PendingButton>
        </div>
      </Stack>
    </form>
  )
}
