import { ToggleMatrix } from "@lmfaole/designsystem/components/toggle-matrix"

import { SettingsForm, SettingsSubpageLayout, TIME_OF_DAY } from "../../../../components/settings-subpage"
import { PART_LABEL, PARTS } from "../../../../lib/day-settings"
import { SECTION_OPTIONS } from "../../../../lib/settings"
import type { SearchParams } from "../../../../lib/username"
import { settingsState, visitorDaySettings } from "../../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Hva forsiden viser · Tid på døgnet · Startside" }

/** The sections each part of the day has (`show.<part>`, with `has=show`: none ticked is none). */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state, settings] = await Promise.all([searchParams, settingsState(), visitorDaySettings()])
  return (
    <SettingsSubpageLayout title="Hva forsiden viser" lead="Delene forsiden har til hver tid på døgnet." parent={TIME_OF_DAY} params={params} problems={state.problems}>
      <SettingsForm slug="tid" sub="innhold" hidden={{ day: "1", has: "show" }}>
        <ToggleMatrix
          legend="Deler per tid på døgnet"
          name="show"
          rows={SECTION_OPTIONS.map((option) => ({ id: option.value, label: option.label }))}
          columns={PARTS.map((part) => ({ id: part, label: PART_LABEL[part] }))}
          values={settings.show}
          hint="Det du har slått av under Forside vises ikke, uansett tid."
        />
      </SettingsForm>
    </SettingsSubpageLayout>
  )
}
