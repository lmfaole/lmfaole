import { InstallSettings, IntroSettings } from "@lmfaole/designsystem/components/app-settings"

import { SettingsSubpageLayout } from "../../../components/settings-subpage"
import type { SearchParams } from "../../../lib/username"
import { BASE } from "../../../lib/links"
import { SETTINGS_ENDPOINT } from "../../../lib/settings"
import { SEEN_PATH, settingsState } from "../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "App · Innstillinger · Startside" }

/** Installing the app, and the first-run introduction once more. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state] = await Promise.all([searchParams, settingsState()])
  return (
    <SettingsSubpageLayout title="App" lead="Legg startsiden på hjemskjermen, eller gå gjennom introen igjen." params={params} problems={state.problems}>
      <InstallSettings appName="Startside" cookiePath={SEEN_PATH} />
      <IntroSettings action={SETTINGS_ENDPOINT} back={BASE} />
    </SettingsSubpageLayout>
  )
}
