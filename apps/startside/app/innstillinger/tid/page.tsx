import { Banner } from "@lmfaole/designsystem/components/banner"
import { ChoiceCards } from "@lmfaole/designsystem/components/choice-cards"
import { SubPages } from "@lmfaole/designsystem/components/sub-pages"

import { SettingsForm, SettingsSubpageLayout } from "../../../components/settings-subpage"
import { PART_LABEL, PARTS, partSummary, showSummary, startsSummary, weekendSummary } from "../../../lib/day-settings"
import { SECTION_OPTIONS, settingsPage } from "../../../lib/settings"
import type { SearchParams } from "../../../lib/username"
import { settingsState, visitorDaySettings } from "../../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Tid på døgnet · Innstillinger · Startside" }

/**
 * The time of day (`startside_day`, lib/day-settings.ts): the switch itself and the greeting here, in a small form with `day=1`, and the
 * rest on subpages, each with what is chosen there now. With the time control off the rest is kept for when it is on again.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state, settings] = await Promise.all([searchParams, settingsState(), visitorDaySettings()])
  return (
    <SettingsSubpageLayout title="Tid på døgnet" lead="Forsiden kan endre seg gjennom dagen: hva den viser om morgenen, på jobb, om kvelden og om natten." params={params} problems={state.problems}>
      <SettingsForm slug="tid" hidden={{ day: "1" }}>
        <ChoiceCards
          name="mode"
          legend="Følg tiden på døgnet"
          value={settings.mode}
          options={[
            { value: "auto", label: "Automatisk", description: "Forsiden følger delene av døgnet og helgen.", icon: "time" },
            { value: "off", label: "Av", description: "Den samme forsiden hele dagen: alle delene, været i dag og alle pull requests.", icon: "pause" },
          ]}
        />
        <ChoiceCards
          name="greeting"
          legend="Hilsen øverst"
          value={settings.greeting}
          options={[
            { value: "on", label: "Med hilsen", description: "«God morgen», «God dag», «God kveld» eller «God natt»." },
            { value: "off", label: "Uten hilsen" },
          ]}
        />
      </SettingsForm>
      {settings.mode === "off" ? (
        <Banner tone="info" title="Tidsstyringen er av">
          Du kan likevel endre det under. Det tas i bruk når du slår tidsstyringen på igjen.
        </Banner>
      ) : null}
      <SubPages
        label="Tid på døgnet"
        pages={[
          { href: settingsPage("tid", "deler"), label: "Når delene begynner", icon: "time", value: startsSummary(settings.starts), description: "Morgen, arbeidsdag, kveld og natt." },
          { href: settingsPage("tid", "helg"), label: "Helg", icon: "calendar", value: weekendSummary(settings), description: "Helgedager uten jobb." },
          { href: settingsPage("tid", "innhold"), label: "Hva forsiden viser", icon: "home", value: showSummary(settings.show, SECTION_OPTIONS.length), description: "Delene forsiden har til hver tid på døgnet." },
          ...PARTS.map((part) => ({ href: settingsPage("tid", part), label: PART_LABEL[part], icon: part === "natt" ? ("moon" as const) : part === "kveld" ? ("sunset" as const) : part === "morgen" ? ("sunrise" as const) : ("sun" as const), value: partSummary(settings, part) })),
        ]}
      />
    </SettingsSubpageLayout>
  )
}
