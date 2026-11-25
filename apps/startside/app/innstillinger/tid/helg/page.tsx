import { CheckboxList } from "@lmfaole/designsystem/components/checkbox-list"
import { ChoiceCards } from "@lmfaole/designsystem/components/choice-cards"

import { SettingsForm, SettingsSubpageLayout, TIME_OF_DAY } from "../../../../components/settings-subpage"
import { WEEKDAYS } from "../../../../lib/day-settings"
import type { SearchParams } from "../../../../lib/username"
import { settingsState, visitorDaySettings } from "../../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Helg · Tid på døgnet · Startside" }

/** Whether weekends have their own front page, and which days they are (`has=weekenddays`: none ticked is none). */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state, settings] = await Promise.all([searchParams, settingsState(), visitorDaySettings()])
  return (
    <SettingsSubpageLayout title="Helg" lead="I helgen viser forsiden ikke jobb (issues og discussions), bare dine egne pull requests." parent={TIME_OF_DAY} params={params} problems={state.problems}>
      <SettingsForm slug="tid" sub="helg" hidden={{ day: "1", has: "weekenddays" }}>
        <ChoiceCards
          name="weekend"
          legend="Egen helg"
          value={settings.weekend}
          options={[
            { value: "on", label: "Ja", description: "Helgedagene under er fri for jobb." },
            { value: "off", label: "Nei", description: "Alle dager er like." },
          ]}
        />
        <CheckboxList name="weekenddays" legend="Helgedager" values={settings.weekendDays.map(String)} options={WEEKDAYS} hint="Gjelder bare når helgen er på." />
      </SettingsForm>
    </SettingsSubpageLayout>
  )
}
