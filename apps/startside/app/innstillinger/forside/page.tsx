import { ReorderList } from "@lmfaole/designsystem/components/reorder-list"
import { SettingsSection } from "@lmfaole/designsystem/components/settings-section"
import { orderSections } from "@lmfaole/designsystem/lib/preferences"

import { settingsFields } from "../../../components/settings-fields"
import { SettingsForm, SettingsSubpageLayout } from "../../../components/settings-subpage"
import { SECTIONS } from "../../../lib/plan"
import { SECTION_ICONS, SECTION_OPTIONS } from "../../../lib/settings"
import type { SearchParams } from "../../../lib/username"
import { settingsState } from "../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Forside · Innstillinger · Startside" }

/**
 * Which sections the front page has, and in which order. Two forms: the order's buttons work without JavaScript (`move=<id>:up|down`,
 * back to `#rekkefolge`), and the sections' checkboxes must not submit by them on Enter.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state] = await Promise.all([searchParams, settingsState()])
  const items = orderSections(SECTIONS, state.prefs.order).map((id) => {
    const option = SECTION_OPTIONS.find((candidate) => candidate.value === id)
    return { id, label: option?.label ?? id, description: option?.description, icon: SECTION_ICONS[id as keyof typeof SECTION_ICONS] }
  })
  return (
    <SettingsSubpageLayout title="Forside" lead="Hva forsiden viser, og i hvilken rekkefølge." params={params} problems={state.problems}>
      <SettingsSection id="deler" title="Deler" description="Forsiden viser dem når de passer tiden på døgnet.">
        <SettingsForm slug="forside">{settingsFields({ ...state, position: null }).sections}</SettingsForm>
      </SettingsSection>
      <SettingsSection id="rekkefolge" title="Rekkefølge" description="Dra i håndtaket, eller bruk knappene for å flytte en del opp eller ned.">
        <SettingsForm slug="forside">
          <ReorderList name="order" legend="Rekkefølge på forsiden" items={items} />
        </SettingsForm>
      </SettingsSection>
    </SettingsSubpageLayout>
  )
}
