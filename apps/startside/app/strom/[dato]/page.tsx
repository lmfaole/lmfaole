import { ChartCard } from "@lmfaole/designsystem/components/chart-card"
import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { KeyFigures } from "@lmfaole/designsystem/components/key-figures"
import { Inline } from "@lmfaole/designsystem/components/layout"
import { LinkButton } from "@lmfaole/designsystem/components/link-button"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Text, TextLink } from "@lmfaole/designsystem/components/text"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { ColumnChart } from "../../../components/column-chart"
import { PriceChart, priceDayFigures } from "../../../components/conditions"
import { Shell } from "../../../components/shell"
import { getPrices } from "../../../lib/conditions"
import { addDays, now, osloTime } from "../../../lib/day"
import { dateLine } from "../../../lib/format"
import { withBase } from "../../../lib/links"
import { parsePosition, POSITION_COOKIE } from "../../../lib/position"
import { averagePrice, FIRST_PRICE_DATE, isPriceDate, parsePriceArea, PRICE_AREA_COOKIE, PRICE_AREA_NAMES, PRICE_AREAS, PRICE_CREDIT } from "../../../lib/power"

export const dynamic = "force-dynamic"

const TRAIL = [{ path: "/strom", label: "Strøm" }]

const title = (date: string): string => {
  const text = dateLine.format(new Date(`${date}T12:00:00Z`))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** One day's spot price: its mean and its cheapest and dearest hour, the day hour by hour, the price areas side by side, and the day before and after a click away. */
export default async function Page({ params }: { params: Promise<{ dato: string }> }) {
  const { dato } = await params
  const instant = now()
  const today = osloTime(instant).date
  const tomorrow = addDays(today, 1)
  if (!isPriceDate(dato, tomorrow)) notFound()
  const jar = await cookies()
  const position = parsePosition(jar.get(POSITION_COOKIE)?.value)
  const chosen = parsePriceArea(jar.get(PRICE_AREA_COOKIE)?.value)
  const [prices, ...areas] = await Promise.all([getPrices(position, chosen, instant, dato), ...PRICE_AREAS.map((area) => getPrices(null, area, instant, dato))])
  const means = areas.flatMap((one) => {
    const mean = one === null ? undefined : averagePrice(one.hours)
    return one === null || mean === undefined ? [] : [{ label: one.area, value: Math.round(mean * 100) / 100 }]
  })
  const when = dateLine.format(new Date(`${dato}T12:00:00Z`))
  const before = addDays(dato, -1)
  const after = addDays(dato, 1)

  return (
    <Shell
      current="power"
      trail={TRAIL}
      title={title(dato)}
      lead={prices === null ? "Spotpris time for time, uten mva og nettleie." : `Spotpris i ${prices.area} (${PRICE_AREA_NAMES[prices.area]}), uten mva og nettleie.`}
      actions={
        <Inline>
          {before < FIRST_PRICE_DATE ? null : <LinkButton href={withBase(`/strom/${before}`)} icon="arrow-left">Dagen før</LinkButton>}
          {after > tomorrow ? null : <LinkButton href={withBase(`/strom/${after}`)} icon="arrow-right">Dagen etter</LinkButton>}
        </Inline>
      }
    >
      <>
        {prices === null ? (
          dato === tomorrow ? <EmptyState reason="nothing-yet" what="strømpriser for i morgen" description="Prisene for i morgen settes rundt klokka ett." /> : <EmptyState reason="nothing-yet" what="strømpriser for denne dagen" />
        ) : (
          <>
            <KeyFigures figures={priceDayFigures(prices)} />
            <PriceChart title="Time for time" when={when} prices={prices} instant={instant} />
          </>
        )}
        {means.length < 2 ? null : (
          <PageSection id="areas" title="Prisområdene" icon="map">
            <ChartCard title="Snittpris i hvert prisområde">
              <ColumnChart data={means} ariaLabel={`Snittprisen ${when} i hvert av de fem prisområdene`} valueLabel="kr/kWh" {...(prices === null ? {} : { highlight: prices.area })} />
            </ChartCard>
          </PageSection>
        )}
        <Text role="note">
          <TextLink external href={PRICE_CREDIT.href}>{PRICE_CREDIT.text}</TextLink>
        </Text>
      </>
    </Shell>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ dato: string }> }) {
  const { dato } = await params
  return { title: `${/^\d{4}-\d{2}-\d{2}$/.test(dato) ? title(dato) : "Strøm"} · Strøm · Startside` }
}
