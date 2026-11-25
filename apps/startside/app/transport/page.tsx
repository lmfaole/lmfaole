import { Freshness } from "@lmfaole/designsystem/components/freshness"
import { IntroCallout } from "@lmfaole/designsystem/components/intro-callout"
import { MarkSeen } from "@lmfaole/designsystem/components/mark-seen"
import { Text } from "@lmfaole/designsystem/components/text"
import { cookies } from "next/headers"

import { BikesSection } from "../../components/conditions"
import { NearbyStops } from "../../components/nearby-stops"
import { PositionControl, PositionPermission } from "../../components/position"
import { Shell } from "../../components/shell"
import { now } from "../../lib/day"
import { getBikes } from "../../lib/conditions"
import { getStops } from "../../lib/entur"
import { parsePlaceName, parsePosition, PLACE_COOKIE, POSITION_COOKIE } from "../../lib/position"
import { settle } from "../../lib/settle"
import { introSeen, SEEN_PATH } from "../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Transport · Startside" }

/** The page renews itself every minute (components/shell.tsx): after three missed renewals the departures may have changed. */
const STALE_AFTER = 180

/** How far from the device the stations are looked for, in metres. */
const RADIUS = 1000

/** The stations nearest to where the device is and what leaves from them, and the city bikes within a short walk; without the device's position there is nothing to show. */
export default async function Page() {
  const instant = now()
  const jar = await cookies()
  const position = parsePosition(jar.get(POSITION_COOKIE)?.value)
  const place = parsePlaceName(jar.get(PLACE_COOKIE)?.value)
  const [stops, bikes] = await Promise.all([position === null ? null : settle(getStops(position, RADIUS)), getBikes(position)])

  return (
    <Shell current="transport" width="wide" title="Transport" lead={<>Nærmeste stasjoner og avganger fra der du er · <Freshness at={instant.toISOString()} now={instant.toISOString()} staleAfterSeconds={STALE_AFTER} /></>} actions={position === null ? undefined : <PositionControl current={position} place={place} />}>
      <MarkSeen id="new-transport" cookiePath={SEEN_PATH} />
      <>
        <IntroCallout
          id="intro-transport"
          seen={await introSeen("intro-transport")}
          title="Avgangene der du er"
          description="Siden finner stasjonene innen en kilometer fra deg og viser hva som går derfra den nærmeste tiden. Den oppdaterer seg selv hvert minutt, og følger med når du flytter deg."
          icon="bus"
          cookiePath={SEEN_PATH}
        />
        <PositionPermission
          current={position}
          title="Del posisjonen for å se avganger"
          description="Vi trenger posisjonen din for å finne stasjonene nærmest deg. Den rundes av til omtrent hundre meter og lagres bare i en informasjonskapsel i denne nettleseren."
          fallback={<Text role="quiet">Uten posisjon kan ikke siden vite hvilke stasjoner som er nærmest, så den viser ingen avganger.</Text>}
        />
        <BikesSection stations={bikes} from={position} />
        {position === null || stops === null ? null : <NearbyStops stops={stops} instant={instant} from={position} />}
      </>
    </Shell>
  )
}
