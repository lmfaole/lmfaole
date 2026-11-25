import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { ChartCard } from "@lmfaole/designsystem/components/chart-card"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Text } from "@lmfaole/designsystem/components/text"
import { WeatherStage } from "@lmfaole/designsystem/components/weather-stage"
import { DumbbellChart } from "@lmfaole/designsystem/components/dumbbell-chart"
import { Meteogram } from "@lmfaole/designsystem/components/meteogram"

import { PositionControl, PositionPermission } from "../../components/position"
import { Shell } from "../../components/shell"
import { addDays, dayOf, now } from "../../lib/day"
import { dailyOutlook, nextHours } from "../../lib/forecast"
import { dateLine, degrees, number } from "../../lib/format"
import { withBase } from "../../lib/links"
import { positionParam, positionQuery, type SearchParams } from "../../lib/position"
import { settle } from "../../lib/settle"
import { describeSymbol, getForecast } from "../../lib/yr"
import { getKp } from "../../lib/space-weather"
import { darkSpans } from "../../lib/sun"
import { AuroraSection, SunSection } from "../../components/sky"
import { AirSection, NowcastSection, WarningsSection } from "../../components/conditions"
import { getAir, getMoon, getNowcast, getWarnings } from "../../lib/conditions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Vær · Startside" }

/**
 * The whole forecast, in figures and charts more than words: the next 24 hours as a meteogram with the dark hours shaded and the sunrise and sunset
 * marked, the sun today with the UV and the daylight through the year, the chance of the northern lights through the night, the air hour by hour, and
 * the coming week as lowest to highest. Around it: the warnings in force (MET and Varsom) and the radar's next ninety minutes.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const instant = now()
  const day = dayOf(instant)
  const position = positionParam(await searchParams)
  const query = positionQuery(position)
  const [forecast, kp, warnings, nowcast, air, moon] = await Promise.all([
    settle(getForecast(position)),
    settle(getKp()),
    getWarnings(position, instant),
    getNowcast(position),
    getAir(position, instant),
    getMoon(position, instant),
  ])

  const current = forecast.ok ? forecast.value.timeseries[0] : undefined
  const symbol = current?.data.next_1_hours?.summary.symbol_code ?? current?.data.next_6_hours?.summary.symbol_code
  const chartHours = forecast.ok ? nextHours(forecast.value.timeseries, instant, 24) : []
  const dark = forecast.ok && chartHours.length > 1 ? darkSpans(new Date(chartHours[0]?.time ?? instant), new Date(new Date(chartHours.at(-1)?.time ?? instant).getTime() + 3_600_000), forecast.value.lat, forecast.value.lon) : []
  const outlook = forecast.ok ? dailyOutlook(forecast.value.timeseries, day.date, 7) : []

  return (
    <WeatherStage symbol={symbol ?? "cloudy"} page>
    <Shell current="weather" position={position} title={forecast.ok ? `Vær i ${forecast.value.place}` : "Vær"} lead={
        current && symbol
          ? `Nå ${degrees(current.data.instant.details.air_temperature)} og ${describeSymbol(symbol).toLowerCase()}, vind ${number.format(current.data.instant.details.wind_speed)} m/s.`
          : "Meldingen fra Yr: det neste døgnet og de neste dagene."
      } actions={position === null ? undefined : <PositionControl current={position} />}>
      <>
        <PositionPermission
          current={position}
          title="Været der du er"
          description="Del posisjonen for å få været akkurat der du er. Den rundes av, står bare i adressen til siden og lagres ikke."
          fallback={<Text role="quiet">{forecast.ok ? `Du ser været for ${forecast.value.place}, standardstedet.` : "Du ser været for standardstedet."}</Text>}
        />
        <WarningsSection warnings={warnings} instant={instant} />
        <NowcastSection nowcast={nowcast} instant={instant} />
        {!forecast.ok ? (
          <ErrorMessage what="været" error={forecast.error} retry />
        ) : (
          <>
          {chartHours.length > 1 ? (
            <WeatherStage symbol={symbol ?? "cloudy"}>
              <PageSection id="next-hours" title="Neste døgn" icon="time" more={{ href: withBase(`/vaer/${addDays(day.date, 1)}`) + query, label: "Se i morgen time for time" }}>
                <Meteogram data={chartHours} dark={dark} ariaLabel="Været de neste 24 timene" />
              </PageSection>
            </WeatherStage>
          ) : null}
          <SunSection forecast={forecast.value} instant={instant} />
          <AuroraSection kp={kp} forecast={forecast.value} instant={instant} moon={moon} />
          <AirSection air={air} />
          {outlook.length === 0 ? null : (
            <PageSection id="outlook" title="Kommende dager" icon="calendar">
              <ChartCard title="Laveste og høyeste temperatur">
                <DumbbellChart
                  data={outlook.map((one) => ({ label: `${dateLine.format(new Date(`${one.date}T12:00:00Z`))} · ${describeSymbol(one.symbol)}`, from: Math.round(one.min), to: Math.round(one.max), href: withBase(`/vaer/${one.date}`) + query }))}
                  fromLabel="Laveste"
                  toLabel="Høyeste"
                  ariaLabel="Laveste og høyeste temperatur de neste dagene"
                  formatValue={degrees}
                  keepOrder
                />
              </ChartCard>
            </PageSection>
          )}
          </>
        )}
      </>
    </Shell>
    </WeatherStage>
  )
}
