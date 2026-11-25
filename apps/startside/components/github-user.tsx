import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { PageSection } from "@lmfaole/designsystem/components/page-section"

import { formState, USERNAME_ENDPOINT, withoutError, type SearchParams } from "../lib/username"
import { UsernameForm } from "@lmfaole/designsystem/components/username-form"

/** The form that asks for the GitHub username, shown where GitHub data would be until there is one; prefilled with `current`, or with what failed and why. */
export function GithubUserForm({ back, params = {}, current, headingLevel = 2 }: { back: string; params?: SearchParams; current?: string; headingLevel?: 2 | 3 }) {
  const state = formState(params, "github")
  return (
    <UsernameForm
      title="Hvem skal vi hente data for?"
      description="Skriv inn et GitHub-brukernavn. Bare det som er offentlig, vises. Navnet huskes i en informasjonskapsel i denne nettleseren."
      action={USERNAME_ENDPOINT}
      back={withoutError(back)}
      headingLevel={headingLevel}
      fields={[{ name: "github", label: "GitHub-brukernavn", hint: "For eksempel octocat.", value: state.value ?? current, error: state.error, autoComplete: "username" }]}
    />
  )
}

/** Where the alerts would be for someone other than the token's owner: they are the owner's only. */
export function AlertsOwnerOnly({ heading = true }: { heading?: boolean }) {
  const quiet = <EmptyState reason="all-done" what="varsler her" description="Varsler vises bare for eieren av startsiden. De andre GitHub-sidene viser det som er offentlig for brukernavnet du har valgt." />
  return heading ? (
    <PageSection id="alerts" title="Følg opp" icon="notification">
      {quiet}
    </PageSection>
  ) : (
    quiet
  )
}
