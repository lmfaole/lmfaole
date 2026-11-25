import { Stack } from "@lmfaole/designsystem/components/layout"
import { TimeField } from "@lmfaole/designsystem/components/time-field"

import { SettingsForm, SettingsSubpageLayout, TIME_OF_DAY } from "../../../../components/settings-subpage"
import { formatTime, PART_LABEL, PARTS } from "../../../../lib/day-settings"
import type { SearchParams } from "../../../../lib/username"
import { settingsState, visitorDaySettings } from "../../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Når delene begynner · Tid på døgnet · Startside" }

/** When each part of the day starts. A wrong start comes back here at `#tider`, with what was written. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state, settings] = await Promise.all([searchParams, settingsState(), visitorDaySettings()])
  const written = state.problems?.values.starts?.split(",")
  return (
    <SettingsSubpageLayout title="Når delene begynner" lead="Hver del varer til den neste begynner. Natten går over midnatt til morgenen." parent={TIME_OF_DAY} params={params} problems={state.problems}>
      <SettingsForm slug="tid" sub="deler" hidden={{ day: "1" }}>
        <Stack id="tider">
          {PARTS.map((part, index) => (
            <TimeField key={part} name={`starts.${part}`} label={PART_LABEL[part]} value={written?.[index] ?? formatTime(settings.starts[part])} error={index === 0 ? state.problems?.errors.starts : undefined} hint={index === 0 ? "I hele kvarter, for eksempel 06:00." : undefined} />
          ))}
        </Stack>
      </SettingsForm>
    </SettingsSubpageLayout>
  )
}
