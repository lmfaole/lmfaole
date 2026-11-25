import { ChartCard } from "@lmfaole/designsystem/components/chart-card"
import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { KeyFigures } from "@lmfaole/designsystem/components/key-figures"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Text, TextLink } from "@lmfaole/designsystem/components/text"
import { cookies } from "next/headers"

import { ColumnChart } from "../../components/column-chart"
import { PriceChart, priceFigures } from "../../components/conditions"
import { Shell } from "../../components/shell"
import { getPrices } from "../../lib/conditions"
import { addDays, now, osloTime } from "../../lib/day"
import { short } from "../../lib/format"
import { withBase } from "../../lib/links"
import { parsePosition, POSITION_COOKIE } from "../../lib/position"
import { averagePrice, parsePriceArea, PRICE_AREA_COOKIE, PRICE_AREA_NAMES, PRICE_CREDIT } from "../../lib/power"
import { settingsPage } from "../../lib/settings"

export const dynamic = "force-dynamic"
export const metadata = { title: "Strøm · Startside" }

/** The spot price of power where the reader is: the price now, the cheapest hours left and the day's mean as figures, today by the hour and tomorrow once it is set. */
/** The days in the chart of the last week, today the last. */
const WEEK = 7

export default async function Page() {
  const instant = now()
  const jar = await cookies()
  const position = parsePosition(jar.get(POSITION_COOKIE)?.value)
  const chosen = parsePriceArea(jar.get(PRICE_AREA_COOKIE)?.value)
  const date = osloTime(instant).date
  const week = Array.from({ length: WEEK }, (_, index) => addDays(date, index - WEEK + 1))
  const [today, tomorrow, ...days] = await Promise.all([getPrices(position, chosen, instant), getPrices(position, chosen, instant, addDays(date, 1)), ...week.slice(0, -1).map((day) => getPrices(position, chosen, instant, day))])
  const means = [...days, today].flatMap((prices, index) => {
    const mean = prices === null ? undefined : averagePrice(prices.hours)
    return mean === undefined ? [] : [{ label: index === WEEK - 1 ? "I dag" : short.format(new Date(`${week[index]}T12:00:00Z`)), value: Math.round(mean * 100) / 100 }]
  })
  const area = today ?? tomorrow
  return (
    <Shell current="power" title="Strøm" lead={area === null ? "Spotprisen time for time, uten mva og nettleie." : `Spotpris i ${area.area} (${PRICE_AREA_NAMES[area.area]}), uten mva og nettleie.`}>
      <>
        {today === null ? (
          <EmptyState reason="nothing-yet" what="strømpriser for i dag" />
        ) : (
          <PageSection id="today" title="I dag" icon="bolt" more={{ href: withBase(`/strom/${date}`), label: "Se hele dagen" }}>
            <Stack>
              <KeyFigures figures={priceFigures(today, instant)} />
              <PriceChart title="Time for time" when="i dag" prices={today} instant={instant} />
            </Stack>
          </PageSection>
        )}
        {tomorrow === null ? null : (
          <PageSection id="tomorrow" title="I morgen" icon="calendar" more={{ href: withBase(`/strom/${addDays(date, 1)}`), label: "Se morgendagen" }}>
            <PriceChart title="Time for time" when="i morgen" prices={tomorrow} instant={instant} />
          </PageSection>
        )}
        {means.length < 2 ? null : (
          <PageSection id="week" title="Siste sju dager" icon="history" more={{ href: withBase(`/strom/${addDays(date, -1)}`), label: "Se dagene før" }}>
            <ChartCard title="Snittpris per dag">
              <ColumnChart data={means} ariaLabel={`Snittprisen per dag den siste uka i ${area?.area ?? ""}`} valueLabel="kr/kWh" highlight="I dag" />
            </ChartCard>
          </PageSection>
        )}
        <Stack gap="tight">
          <Text role="note">
            {area?.chosen === true ? "Prisområdet er valgt i innstillingene" : "Prisområdet er anslått ut fra posisjonen"} – <TextLink href={settingsPage("posisjon")}>endre prisområde</TextLink>.
          </Text>
          <Text role="note">
            <TextLink external href={PRICE_CREDIT.href}>{PRICE_CREDIT.text}</TextLink>
          </Text>
        </Stack>
      </>
    </Shell>
  )
}
