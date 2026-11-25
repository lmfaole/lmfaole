import { SettingsForm, SettingsSubpageLayout } from "../../../components/settings-subpage"
import { settingsFields } from "../../../components/settings-fields"
import type { SearchParams } from "../../../lib/username"
import { settingsState } from "../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Repoer · Innstillinger · Startside" }

/** The public repositories the visitor follows (`github_repos`): their new issues and discussions are on the front page. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state] = await Promise.all([searchParams, settingsState()])
  return (
    <SettingsSubpageLayout title="Repoer" lead="Repoene du følger, også der du ikke selv er med." params={params} problems={state.problems}>
      <SettingsForm slug="repoer">{settingsFields({ ...state, position: null }).repos}</SettingsForm>
    </SettingsSubpageLayout>
  )
}
