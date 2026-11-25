import { ColumnChart } from "./column-chart"
import { ChartCard } from "@lmfaole/designsystem/components/chart-card"
import { KeyFigures } from "@lmfaole/designsystem/components/key-figures"
import { HazardList, type Hazard } from "@lmfaole/designsystem/components/hazard-list"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { List, type ListMeta, type ListRow } from "@lmfaole/designsystem/components/list"
import { Text, TextLink } from "@lmfaole/designsystem/components/text"

import { AIR_LEVEL_NAMES, type Air } from "../lib/air"
import { BIKE_CREDIT, bikeLine, type BikeStation } from "../lib/bikes"
import type { Prices } from "../lib/conditions"
import { osloTime } from "../lib/day"
import type { Position } from "../lib/position"
import { uvLevel, uvPeak, type Timeseries } from "../lib/forecast"
import { clock, number } from "../lib/format"
import { rainSummary, type Nowcast } from "../lib/nowcast"
import { averagePrice, cheapestSpan, formatPrice, PRICE_AREA_NAMES, PRICE_CREDIT, priceExtremes, priceNow } from "../lib/power"
import { withBase } from "../lib/links"
import { warningIcon, warningWhen, type Warning } from "../lib/warnings"

// What the weather page and the front page say beside the forecast: the warnings, the radar, the UV, the air, the moon, the price of power and the
// city bikes. Each says nothing where there is nothing to say.

const hourOf = (time: string): string => clock.format(new Date(time)).slice(0, 2)
const span = (from: string, to: string): string => `${hourOf(from)}–${hourOf(to).replace(/^00$/, "24")}`

const hazard = (warning: Warning, instant: Date, compact: boolean): Hazard => ({
  key: warning.key,
  level: warning.level,
  title: warning.title,
  ...(warning.area === "" ? {} : { area: warning.area }),
  when: warningWhen(warning.from, warning.to, instant),
  ...(compact || warning.description === undefined ? {} : { description: warning.description }),
  source: warning.source,
  href: warning.href,
  icon: warningIcon(warning),
})

/**
 * The warnings in force where the reader is, MET's and Varsom's together, the most serious first, each with a link to the full warning at its
 * source and the credit the sources ask for. Nothing when there is none: a calm day needs no section.
 */
export function WarningsSection({ warnings, instant, compact = false }: { warnings: readonly Warning[]; instant: Date; compact?: boolean }) {
  if (warnings.length === 0) return null
  const sources = new Set(warnings.map((warning) => warning.source))
  const credit = [sources.has("MET") ? "Meteorologisk institutt" : null, sources.has("Varsom") ? "Varsom.no (NVE)" : null].filter(Boolean).join(" og ")
  return (
    <PageSection id="warnings" title={warnings.length === 1 ? "Farevarsel" : `Farevarsler (${warnings.length})`} icon="warning">
      <HazardList hazards={warnings.map((warning) => hazard(warning, instant, compact))} compact={compact} footer={`Farevarsler fra ${credit}.`} />
    </PageSection>
  )
}

const line = (strong: string, rest: string, ...meta: ListMeta[]): Pick<ListRow, "title" | "meta"> => ({ title: rest === "" ? strong : `${strong} ${rest}`, meta })

/** The rows the front page's weather adds above the hours: rain on the way, a strong sun, poor air and the price of power now. */
export function conditionRows({ nowcast, timeseries, air, prices, instant, window }: { nowcast: Nowcast | null; timeseries: readonly Timeseries[]; air: Air | null; prices: Prices | null; instant: Date; window: "today" | "tomorrow" }): ListRow[] {
  const rows: ListRow[] = []
  const rain = window === "today" ? rainSummary(nowcast, instant) : null
  if (rain !== null && rain.kind !== "dry") rows.push({ key: "nowcast", icon: "rain-drop", iconTone: "primary", ...line(rain.text, "", "Fra radaren, de neste 90 minuttene") })
  const uv = uvPeak(timeseries, window === "today" ? osloTime(instant).date : osloTime(new Date(instant.getTime() + 86_400_000)).date)
  if (uv !== null && Math.round(uv.uv) >= 3 && (window === "tomorrow" || Date.parse(uv.time) + 3 * 3_600_000 > instant.getTime())) {
    const level = uvLevel(uv.uv)
    rows.push({ key: "uv", icon: "sun", ...line(`UV ${Math.round(uv.uv)}`, `${level.name.toLowerCase()} rundt ${clock.format(new Date(uv.time))}`, level.advice) })
  }
  if (window === "today" && air !== null && air.level !== "low") rows.push({ key: "air", icon: "wind", ...(air.level === "moderate" ? {} : { iconTone: "destructive" as const }), ...line(AIR_LEVEL_NAMES[air.level], `luft rundt ${clock.format(new Date(air.time))}`, air.cause === null ? null : `Mest ${air.cause}`) })
  const price = window === "today" && prices !== null ? priceNow(prices.hours, instant) : undefined
  if (prices !== null && price !== undefined) {
    const cheap = cheapestSpan(prices.hours, instant)
    rows.push({
      key: "power",
      icon: "bolt",
      href: withBase("/strom"),
      ...line(formatPrice(price.price), "strøm nå", cheap === undefined ? null : `Billigst ${span(cheap.start, cheap.end)} (${formatPrice(cheap.price)})`, "uten mva og nettleie", { label: PRICE_CREDIT.text, href: PRICE_CREDIT.href, external: true }),
    })
  }
  return rows
}

/** The radar's next ninety minutes: the rain every five minutes as columns, said in a line under the title; a line alone when it stays dry or without the radar. */
export function NowcastSection({ nowcast, instant }: { nowcast: Nowcast | null; instant: Date }) {
  if (nowcast === null) return null
  const summary = rainSummary(nowcast, instant)
  const points = nowcast.points.filter((point) => Date.parse(point.time) > instant.getTime() - 5 * 60_000)
  return (
    <PageSection id="nowcast" title="Nedbør neste 90 minutter" icon="rain-drop">
      {summary === null ? (
        <Text role="quiet">
          {nowcast.coverage === "no coverage" ? "Radaren dekker ikke stedet ditt." : "Radaren er utilgjengelig akkurat nå."}
        </Text>
      ) : summary.kind === "dry" ? (
        <KeyFigures figures={[{ value: "Opphold", label: "de neste 90 minuttene" }]} />
      ) : (
        <ChartCard title={summary.text}>
          <ColumnChart data={points.map((point) => ({ label: clock.format(new Date(point.time)), value: Math.round(point.rate * 10) / 10 }))} ariaLabel="Nedbør hvert femte minutt de neste 90 minuttene" valueLabel="mm/t" />
        </ChartCard>
      )}
    </PageSection>
  )
}

/** The air today: its index and level, the worst hour when it is not clean, and the index hour by hour. */
export function AirSection({ air }: { air: Air | null }) {
  if (air === null) return null
  const figures = [
    { value: number.format(air.aqi), label: `indeks, ${AIR_LEVEL_NAMES[air.level].toLowerCase()}` },
    ...(air.level === "low" ? [] : [{ value: clock.format(new Date(air.time)), label: air.cause === null ? "verst" : `verst, mest ${air.cause}` }]),
  ]
  return (
    <PageSection id="air" title="Luftkvalitet" icon="wind">
      <Stack>
        <KeyFigures figures={figures} />
        {air.hours.length < 2 ? null : (
          <ChartCard title={air.place === null ? "Resten av dagen" : `Resten av dagen, ${air.place}`}>
            <ColumnChart data={air.hours.map((hour) => ({ label: hourOf(hour.time), value: Math.round(hour.aqi * 10) / 10 }))} ariaLabel="Luftkvalitetsindeksen time for time resten av dagen: under 2 er lite forurenset, 2–3 moderat, 3–4 høy, over 4 svært høy" valueLabel="indeks" />
          </ChartCard>
        )}
      </Stack>
    </PageSection>
  )
}

/** A day's spot price by the hour, the hour now picked out when it is today. */
export function PriceChart({ title, when, prices, instant }: { title: string; /** «i dag», «i morgen»: the chart's name to a screen reader, and its id. */ when: string; prices: Prices; instant: Date }) {
  const current = priceNow(prices.hours, instant)
  return (
    <ChartCard title={title}>
      <ColumnChart data={prices.hours.map((hour) => ({ label: hourOf(hour.start), value: Math.round(hour.price * 100) / 100 }))} ariaLabel={`Strømpris time for time ${when} i ${prices.area} (${PRICE_AREA_NAMES[prices.area]})`} valueLabel="kr/kWh" {...(current === undefined ? {} : { highlight: hourOf(current.start) })} />
    </ChartCard>
  )
}

/** The price of power as figures: now, the cheapest three hours left, and the day's mean. */
export function priceFigures(prices: Prices, instant: Date): { value: string; label: string }[] {
  const current = priceNow(prices.hours, instant)
  const cheap = cheapestSpan(prices.hours, instant)
  const mean = averagePrice(prices.hours)
  return [
    ...(current === undefined ? [] : [{ value: formatPrice(current.price), label: "nå" }]),
    ...(cheap === undefined ? [] : [{ value: span(cheap.start, cheap.end), label: `billigst, ${formatPrice(cheap.price)}` }]),
    ...(mean === undefined ? [] : [{ value: formatPrice(mean), label: "snitt i dag" }]),
  ]
}

/** A whole day's price as figures: its mean, and its cheapest and dearest hour. */
export function priceDayFigures(prices: Prices): { value: string; label: string }[] {
  const mean = averagePrice(prices.hours)
  const extremes = priceExtremes(prices.hours)
  return [
    ...(mean === undefined ? [] : [{ value: formatPrice(mean), label: "snitt" }]),
    ...(extremes === undefined ? [] : [{ value: formatPrice(extremes.lowest.price), label: `lavest, kl. ${span(extremes.lowest.start, extremes.lowest.end)}` }, { value: formatPrice(extremes.highest.price), label: `høyest, kl. ${span(extremes.highest.start, extremes.highest.end)}` }]),
  ]
}

const bikeRow = (station: BikeStation, from: Position | null): ListRow => ({
  key: station.id,
  map: { at: { lat: station.lat, lon: station.lon }, ...(from === null ? {} : { from }), label: `Kart over ${station.name}, på OpenStreetMap` },
  title: station.name,
  meta: [`${station.distance} m`, bikeLine(station)],
})

/** Oslo Bysykkel's stations within a short walk, with bikes and free docks now, each with a small map of where it is; nothing where there is none (outside Oslo). */
export function BikesSection({ stations, from = null }: { stations: readonly BikeStation[]; from?: Position | null }) {
  if (stations.length === 0) return null
  return (
    <PageSection id="bikes" title="Bysykkel" icon="bike">
      <Stack>
        <List rows={stations.map((station) => bikeRow(station, from))} columns={{ name: "Stasjon og avstand", value: "Sykler og ledige plasser" }} />
        <Text role="note">
          <TextLink external href={BIKE_CREDIT.href}>{BIKE_CREDIT.text}</TextLink>
        </Text>
      </Stack>
    </PageSection>
  )
}
