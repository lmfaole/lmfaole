import { SettingsForm, SettingsSubpageLayout } from "../../../components/settings-subpage"
import { settingsFields } from "../../../components/settings-fields"
import type { SearchParams } from "../../../lib/username"
import { settingsState } from "../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Konto · Innstillinger · Startside" }

/** The GitHub username the GitHub pages are fetched for; whose data it is is shown only here and on the overview. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state] = await Promise.all([searchParams, settingsState()])
  return (
    <SettingsSubpageLayout title="Konto" lead="Hvilken GitHub-bruker startsiden henter offentlige data for." params={params} problems={state.problems}>
      <SettingsForm slug="konto">{settingsFields({ ...state, position: null }).github}</SettingsForm>
    </SettingsSubpageLayout>
  )
}
