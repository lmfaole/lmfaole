import { Banner } from "@lmfaole/designsystem/components/banner"
import { FormErrorSummary } from "@lmfaole/designsystem/components/form-error-summary"
import { IntroSettings, SourcesSettings } from "@lmfaole/designsystem/components/app-settings"
import { SubPages } from "@lmfaole/designsystem/components/sub-pages"
import { orderSections } from "@lmfaole/designsystem/lib/preferences"
import { appearancePage, appPage } from "@lmfaole/designsystem/lib/settings-pages"
import { cookies } from "next/headers"

import { SOURCES } from "../../components/credits"
import { OldSettingsAnchor } from "../../components/old-settings-anchor"
import { Shell } from "../../components/shell"
import { BASE } from "../../lib/links"
import { daySummary } from "../../lib/day-settings"
import { SECTIONS } from "../../lib/plan"
import { parsePosition, POSITION_COOKIE } from "../../lib/position"
import { parsePriceArea, PRICE_AREA_COOKIE } from "../../lib/power"
import { parseReposCookie, REPOS_COOKIE, reposSummary, sectionsSummary, SETTINGS_ENDPOINT, settingsPage } from "../../lib/settings"
import type { SearchParams } from "../../lib/username"
import { settingsState, visitorDaySettings } from "../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Innstillinger · Startside" }

/**
 * The settings' overview: one row per subpage with what is chosen there now, «Vis introen igjen», and at the bottom where the data comes from (`SourcesSettings`). Each subpage has its
 * own small form to the settings endpoint. «Lagret» here is for a save that came back to the overview (an older form).
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state, day, jar] = await Promise.all([searchParams, settingsState(), visitorDaySettings(), cookies()])
  const position = parsePosition(jar.get(POSITION_COOKIE)?.value)
  const errors = Object.entries(state.problems?.errors ?? {}).map(([field, message]) => ({ field, message: String(message) }))
  return (
    <Shell current="settings" firstRun={false} title="Innstillinger" lead="Hvem startsiden henter data for, hva den viser og hvordan den ser ut. Alt lagres i informasjonskapsler i denne nettleseren.">
      <OldSettingsAnchor />
      <>
        {params["lagret"] === "1" && errors.length === 0 ? <Banner tone="success" title="Lagret">Endringen gjelder fra nå av i denne nettleseren.</Banner> : null}
        {errors.length === 0 ? null : <FormErrorSummary errors={errors} />}
        <SubPages
          label="Innstillinger"
          pages={[
            { href: settingsPage("konto"), label: "Konto", icon: "person", value: state.user ?? "Ikke valgt", description: "GitHub-brukeren startsiden henter offentlige data for." },
            { href: settingsPage("repoer"), label: "Repoer", icon: "repository", value: reposSummary(parseReposCookie(jar.get(REPOS_COOKIE)?.value)), description: "Repoene du følger, også der du ikke selv er med." },
            { href: settingsPage("forside"), label: "Forside", icon: "home", value: sectionsSummary(orderSections(SECTIONS, state.prefs.order), state.prefs.sections), description: "Hvilke deler forsiden viser, og i hvilken rekkefølge." },
            { href: settingsPage("tid"), label: "Tid på døgnet", icon: "time", value: daySummary(day), description: "Hva forsiden viser om morgenen, på jobb, om kvelden og i helgen." },
            { href: settingsPage("posisjon"), label: "Posisjon", icon: "place", value: `${position === null ? "Standardsted" : "Delt"} · strøm ${parsePriceArea(jar.get(PRICE_AREA_COOKIE)?.value) ?? "automatisk"}`, description: "Avganger, vær og strømpris der du er." },
            appearancePage(settingsPage("utseende"), state.prefs),
            appPage(settingsPage("app"), "Startside"),
          ]}
        />
        <IntroSettings action={SETTINGS_ENDPOINT} back={BASE} />
        <SourcesSettings sources={SOURCES} />
      </>
    </Shell>
  )
}
