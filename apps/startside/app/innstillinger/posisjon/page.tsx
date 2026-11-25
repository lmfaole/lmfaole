import { ChoiceCards } from "@lmfaole/designsystem/components/choice-cards"
import { SearchField } from "@lmfaole/designsystem/components/search-field"
import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { cookies } from "next/headers"

import { PositionControl } from "../../../components/position"
import { settingsFields } from "../../../components/settings-fields"
import { SettingsForm, SettingsSubpageLayout } from "../../../components/settings-subpage"
import { searchPlaces } from "../../../lib/place"
import { formatChosenPlace, parsePlaceName, parsePosition, PLACE_COOKIE, POSITION_COOKIE } from "../../../lib/position"
import { parsePriceArea, PRICE_AREA_COOKIE, PRICE_AREA_NAMES, PRICE_AREAS, priceAreaFor } from "../../../lib/power"
import type { SearchParams } from "../../../lib/username"
import { settingsPage } from "../../../lib/settings"
import { settingsState } from "../../../lib/visitor"
import { weatherPosition } from "../../../lib/yr"

export const dynamic = "force-dynamic"
export const metadata = { title: "Posisjon · Innstillinger · Startside" }

/**
 * The position: the device's, shared from its own button and kept at once (no form); a place searched for (`?sted=`, OpenStreetMap's Nominatim) and chosen,
 * for those who would rather not share the device's; or the default place. Under it the price area for the price of power, guessed from the position until chosen.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [params, state, jar] = await Promise.all([searchParams, settingsState(), cookies()])
  const position = parsePosition(jar.get(POSITION_COOKIE)?.value)
  const place = parsePlaceName(jar.get(PLACE_COOKIE)?.value)
  const query = typeof params["sted"] === "string" ? params["sted"].trim() : ""
  const found = query === "" ? [] : await searchPlaces(query)
  const chosen = parsePriceArea(jar.get(PRICE_AREA_COOKIE)?.value)
  const guess = priceAreaFor(weatherPosition(position))
  return (
    <SettingsSubpageLayout title="Posisjon" lead="Gir avganger fra holdeplassene og været der du er. Del posisjonen til enheten, eller søk opp et sted om du heller vil det." params={params} problems={state.problems}>
      {settingsFields({ ...state, position, place }).position}
      {position === null ? null : <PositionControl current={position} place={place} />}
      <SearchField label="Eller søk etter et sted" action={settingsPage("posisjon")} name="sted" value={query} />
      {query === "" ? null : found === null ? (
        <ErrorMessage what="søketreff" error="Stedssøket svarte ikke." retry />
      ) : found.length === 0 ? (
        <EmptyState reason="no-results" what="steder" query={query} description="Prøv et annet navn, eller legg til kommunen." />
      ) : (
        <SettingsForm slug="posisjon" label="Bruk stedet">
          <ChoiceCards
            name="sted"
            legend={`${found.length} ${found.length === 1 ? "treff" : "treff"} for «${query}»`}
            hint="Været, avgangene og strømprisen følger stedet til du deler posisjonen din eller går tilbake til standardstedet."
            value={formatChosenPlace(found[0]!.position, found[0]!.name)}
            options={found.map((one) => ({ value: formatChosenPlace(one.position, one.name), label: one.name, description: one.detail, icon: "place" as const }))}
          />
        </SettingsForm>
      )}
      <SettingsForm slug="posisjon">
        <ChoiceCards
          name="strom"
          legend="Prisområde for strøm"
          hint="Strømprisen på Vær følger prisområdet. Grensene går etter strømnettet, ikke fylkene, så nær en grense kan anslaget bli feil."
          value={chosen ?? "auto"}
          options={[
            { value: "auto", label: "Ut fra posisjonen", description: `Nå ${guess} (${PRICE_AREA_NAMES[guess]}).`, icon: "place" },
            ...PRICE_AREAS.map((area) => ({ value: area, label: `${area} ${PRICE_AREA_NAMES[area]}`, icon: "bolt" as const })),
          ]}
        />
      </SettingsForm>
    </SettingsSubpageLayout>
  )
}
