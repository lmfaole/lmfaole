import { ChoiceCards } from "@lmfaole/designsystem/components/choice-cards"
import { notFound } from "next/navigation"

import { SettingsForm, SettingsSubpageLayout, TIME_OF_DAY } from "../../../../components/settings-subpage"
import type { DayPart } from "../../../../lib/day"
import { PART_LABEL, PARTS, partSpan } from "../../../../lib/day-settings"
import type { SearchParams } from "../../../../lib/username"
import { settingsState, visitorDaySettings } from "../../../../lib/visitor"

export const dynamic = "force-dynamic"

const partOf = (value: string): DayPart | null => (PARTS as readonly string[]).includes(value) ? (value as DayPart) : null

export async function generateMetadata({ params }: { params: Promise<{ del: string }> }) {
  const part = partOf((await params).del)
  return { title: `${part === null ? "Tid på døgnet" : PART_LABEL[part]} · Tid på døgnet · Startside` }
}

/** One part of the day (`/tid/morgen`, `/arbeidsdag`, `/kveld`, `/natt`): its weather and its pull requests. */
export default async function Page({ params, searchParams }: { params: Promise<{ del: string }>; searchParams: Promise<SearchParams> }) {
  const part = partOf((await params).del)
  if (part === null) notFound()
  const [query, state, settings] = await Promise.all([searchParams, settingsState(), visitorDaySettings()])
  return (
    <SettingsSubpageLayout title={`${PART_LABEL[part]}, ${partSpan(settings.starts, part)}`} lead="Været og pull requestene forsiden viser i denne delen av døgnet." parent={TIME_OF_DAY} params={query} problems={state.problems}>
      <SettingsForm slug="tid" sub={part} hidden={{ day: "1" }}>
        <ChoiceCards
          name={`weather.${part}`}
          legend="Været"
          value={settings.weather[part]}
          hint={part === "morgen" || part === "arbeidsdag" ? "I helgen er det alltid været for i dag." : undefined}
          options={[
            { value: "today", label: "Resten av i dag" },
            { value: "tomorrow", label: "I morgen" },
          ]}
        />
        <ChoiceCards
          name={`pulls.${part}`}
          legend="Pull requests"
          value={settings.pulls[part]}
          hint="I helgen er det alltid bare dine egne."
          options={[
            { value: "all", label: "Alle", description: "Også de som venter på review fra deg." },
            { value: "mine", label: "Bare mine" },
          ]}
        />
      </SettingsForm>
    </SettingsSubpageLayout>
  )
}
