import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { FilterChips } from "@lmfaole/designsystem/components/filter-chips"
import { KeyFigures } from "@lmfaole/designsystem/components/key-figures"
import { Meteogram } from "@lmfaole/designsystem/components/meteogram"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { WeatherStage } from "@lmfaole/designsystem/components/weather-stage"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { Shell } from "../../../components/shell"
import { now, osloTime } from "../../../lib/day"
import { dayHours, dayLabel, dayOutlook, forecastDates, summariseHours, uvLevel, uvPeak } from "../../../lib/forecast"
import { dateLine, degrees, number } from "../../../lib/format"
import { withBase } from "../../../lib/links"
import { parsePlaceName, parsePosition, PLACE_COOKIE, POSITION_COOKIE } from "../../../lib/position"
import { settle } from "../../../lib/settle"
import { formatClock, sunFigures } from "../../../lib/sky"
import { darkSpans } from "../../../lib/sun"
import { describeSymbol, getForecast } from "../../../lib/yr"

export const dynamic = "force-dynamic"

const TRAIL = [{ path: "/vaer", label: "Vær" }]

const title = (date: string): string => {
  const text = dateLine.format(new Date(`${date}T12:00:00Z`))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** One day of the forecast: its figures (lowest and highest, the rain, the strongest wind, the sun) and every hour of it as a meteogram, with the other days a chip away. */
export default async function Page({ params }: { params: Promise<{ dato: string }> }) {
  const { dato } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dato)) notFound()
  const instant = now()
  const today = osloTime(instant).date
  const jar = await cookies()
  const position = parsePosition(jar.get(POSITION_COOKIE)?.value)
  const place = parsePlaceName(jar.get(PLACE_COOKIE)?.value)
  const forecast = await settle(getForecast(position, place))
  if (!forecast.ok) {
    return (
      <Shell current="weather" trail={TRAIL} title={title(dato)}>
        <ErrorMessage what="været" error={forecast.error} retry />
      </Shell>
    )
  }
  const { timeseries, lat, lon } = forecast.value
  const dates = forecastDates(timeseries, today)
  const outlook = dayOutlook(timeseries, dato)
  if (!dates.includes(dato) || outlook === null) notFound()
  const hours = dayHours(timeseries, dato, dato === today ? instant : undefined)
  const sum = summariseHours(hours)
  const sixHourly = hours.some((hour, index) => index > 0 && Date.parse(hour.time) - Date.parse(hours[index - 1]?.time ?? hour.time) > 3_600_000)
  const dark = hours.length > 1 ? darkSpans(new Date(hours[0]?.time ?? instant), new Date(Date.parse(hours.at(-1)?.time ?? "") + (sixHourly ? 6 : 1) * 3_600_000), lat, lon) : []
  const peak = uvPeak(timeseries, dato)
  const figures = [
    { value: `${degrees(outlook.min)} til ${degrees(outlook.max)}`, label: "laveste og høyeste" },
    { value: `${number.format(outlook.precipitation)} mm`, label: outlook.precipitation === 0 ? "nedbør, oppholdsvær" : "nedbør" },
    ...(sum === null ? [] : [{ value: `${number.format(sum.wind)} m/s`, label: "sterkeste vind" }]),
    ...(peak === null || Math.round(peak.uv) < 3 ? [] : [{ value: `UV ${Math.round(peak.uv)}`, label: `${uvLevel(peak.uv).name.toLowerCase()}, rundt ${formatClock(peak.time)}` }]),
    ...sunFigures(dato, lat, lon),
  ]

  return (
    <WeatherStage symbol={outlook.symbol} page>
      <Shell current="weather" trail={TRAIL} title={title(dato)} lead={`${forecast.value.place}: ${describeSymbol(outlook.symbol).toLowerCase()}.`}>
        <>
          <FilterChips label="Dag" chips={dates.map((date) => ({ key: date, label: dayLabel(date, today), href: withBase(`/vaer/${date}`), current: date === dato }))} />
          <KeyFigures figures={figures} />
          <PageSection id="hours" title={sixHourly ? "Gjennom dagen" : "Time for time"} icon="time">
            <Meteogram data={hours} dark={dark} symbolEvery={sixHourly ? 1 : 3} ariaLabel={`Været i ${forecast.value.place} ${dayLabel(dato, today).toLowerCase()}, ${sixHourly ? "gjennom dagen" : "time for time"}`} />
          </PageSection>
        </>
      </Shell>
    </WeatherStage>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ dato: string }> }) {
  const { dato } = await params
  return { title: `${/^\d{4}-\d{2}-\d{2}$/.test(dato) ? title(dato) : "Vær"} · Vær · Startside` }
}
