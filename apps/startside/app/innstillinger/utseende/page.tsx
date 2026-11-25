import { AppearanceSettings } from "@lmfaole/designsystem/components/appearance-settings"

import { SettingsSubpageLayout } from "../../../components/settings-subpage"
import { SETTINGS_ENDPOINT, settingsPage } from "../../../lib/settings"
import type { SearchParams } from "../../../lib/username"
import { settingsState } from "../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Utseende · Innstillinger · Startside" }

/** Theme, effects and the light: the `prefs` cookie, on `<html>` from the first frame. Vibration («Vibrasjon», under Effekter) is kept in this browser's `localStorage` and applies at once, so it is not sent with the form. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state] = await Promise.all([searchParams, settingsState()])
  return (
    <SettingsSubpageLayout title="Utseende" lead="Lyst eller mørkt, og hvor levende siden er." params={params} problems={state.problems}>
      <AppearanceSettings prefs={state.prefs} action={SETTINGS_ENDPOINT} back={settingsPage("utseende")} />
    </SettingsSubpageLayout>
  )
}
