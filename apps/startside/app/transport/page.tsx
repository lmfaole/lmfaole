import { Freshness } from "@lmfaole/designsystem/components/freshness"
import { Text } from "@lmfaole/designsystem/components/text"

import { BikesSection } from "../../components/conditions"
import { NearbyStops } from "../../components/nearby-stops"
import { PositionControl, PositionPermission } from "../../components/position"
import { Shell } from "../../components/shell"
import { now } from "../../lib/day"
import { getBikes } from "../../lib/conditions"
import { getStops } from "../../lib/entur"
import { positionParam, type SearchParams } from "../../lib/position"
import { settle } from "../../lib/settle"

export const dynamic = "force-dynamic"
export const metadata = { title: "Transport · Startside" }

/** The page renews itself every minute (components/shell.tsx): after three missed renewals the departures may have changed. */
const STALE_AFTER = 180

/** How far from the device the stations are looked for, in metres. */
const RADIUS = 1000

/**
 * The stations nearest to where the device is and what leaves from them, and the city bikes within a short walk. The position is the one
 * in the address (`?pos=`, which the browser's own location sets, components/position.tsx); without it there is nothing to show.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const instant = now()
  const position = positionParam(await searchParams)
  const [stops, bikes] = await Promise.all([position === null ? null : settle(getStops(position, RADIUS)), getBikes(position)])

  return (
    <Shell current="transport" position={position} width="wide" title="Transport" lead={<>Nærmeste stasjoner og avganger fra der du er · <Freshness at={instant.toISOString()} now={instant.toISOString()} staleAfterSeconds={STALE_AFTER} /></>} actions={position === null ? undefined : <PositionControl current={position} />}>
      <>
        <PositionPermission
          current={position}
          title="Del posisjonen for å se avganger"
          description="Vi trenger posisjonen din for å finne stasjonene innen en kilometer fra deg. Den rundes av til omtrent hundre meter, står bare i adressen til siden og lagres ikke."
          fallback={<Text role="quiet">Uten posisjon kan ikke siden vite hvilke stasjoner som er nærmest, så den viser ingen avganger.</Text>}
        />
        <BikesSection stations={bikes} from={position} />
        {position === null || stops === null ? null : <NearbyStops stops={stops} instant={instant} from={position} />}
      </>
    </Shell>
  )
}
