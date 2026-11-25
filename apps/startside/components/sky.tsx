import { AuroraChart } from "@lmfaole/designsystem/components/aurora-chart"
import { ChartCard } from "@lmfaole/designsystem/components/chart-card"
import { KeyFigures } from "@lmfaole/designsystem/components/key-figures"
import { Grid, Stack } from "@lmfaole/designsystem/components/layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import type { ListRow } from "@lmfaole/designsystem/components/list"

import { auroraNight, bestSlot, kpNeeded, type AuroraSlot, type KpSlot } from "../lib/aurora"
import { osloTime } from "../lib/day"
import { uvHours, uvLevel, uvPeak } from "../lib/forecast"
import type { Settled } from "../lib/settle"
import { auroraFigures, CHANCE_LABEL, daylightByMonth, formatClock, nightWord, slotHours, slotLine, sunFigures } from "../lib/sky"
import { darkSpans, sunDay } from "../lib/sun"
import { litFraction, type Moon } from "../lib/moon"
import type { Forecast } from "../lib/yr"
import { ColumnChart } from "./column-chart"

/** The cloud cover of each hour of the forecast, for the aurora. */
export function cloudsOf(forecast: Forecast): { time: string; clouds: number }[] {
  return forecast.timeseries.flatMap((entry) => (entry.data.instant.details.cloud_area_fraction === undefined ? [] : [{ time: entry.time, clouds: entry.data.instant.details.cloud_area_fraction }]))
}

const HOUR = 3_600_000

/** The mean cloud cover in the three hours from a slot's start, where the forecast reaches. */
function cloudsIn(time: string, clouds: readonly { time: string; clouds: number }[]): number | null {
  const from = new Date(time).getTime()
  const inSlot = clouds.filter((one) => new Date(one.time).getTime() >= from && new Date(one.time).getTime() < from + 3 * HOUR)
  return inSlot.length === 0 ? null : Math.round(inSlot.reduce((sum, one) => sum + one.clouds, 0) / inSlot.length)
}

/** The dark slots of the next day with their chance, from the Kp and the forecast's clouds. */
export function nightOf(kp: readonly KpSlot[], forecast: Forecast, instant: Date): AuroraSlot[] {
  return auroraNight(kp, cloudsOf(forecast), instant, forecast.lat, forecast.lon)
}

const hourOf = (time: string): string => formatClock(time).slice(0, 2)

/**
 * The sun today where the forecast is for, as figures (the sunrise, the sunset, the daylight and its change, the strongest UV when it calls for care), and
 * beside them as charts the UV hour by hour and the daylight through the year, this month picked out.
 */
export function SunSection({ forecast, instant }: { forecast: Forecast; instant: Date }) {
  const today = osloTime(instant).date
  const uv = uvHours(forecast.timeseries, today)
  const peak = uvPeak(forecast.timeseries, today)
  const year = daylightByMonth(Number(today.slice(0, 4)), forecast.lat, forecast.lon)
  const month = year.find((one) => one.month === today.slice(0, 7))
  const figures = [...sunFigures(today, forecast.lat, forecast.lon), ...(peak === null || Math.round(peak.uv) < 3 ? [] : [{ value: `UV ${Math.round(peak.uv)}`, label: `${uvLevel(peak.uv).name.toLowerCase()}, rundt ${formatClock(peak.time)}` }])]
  return (
    <PageSection id="sun" title="Sola i dag" icon="sunrise">
      <Stack>
        <KeyFigures figures={figures} />
        <Grid columns="charts">
          {uv.length < 2 ? null : (
            <ChartCard title="UV-indeks i dag">
              <ColumnChart data={uv.map((hour) => ({ label: hourOf(hour.time), value: hour.uv }))} ariaLabel="UV-indeksen time for time i dag, i klarvær" valueLabel="UV" />
            </ChartCard>
          )}
          <ChartCard title="Dagslys gjennom året">
            <ColumnChart data={year.map((one) => ({ label: one.label, value: one.hours }))} ariaLabel={`Timer med dagslys midt i hver måned i ${forecast.place}`} valueLabel="timer" {...(month === undefined ? {} : { highlight: month.label })} />
          </ChartCard>
        </Grid>
      </Stack>
    </PageSection>
  )
}

/**
 * The northern lights through the coming night as figures (the best time and its chance, the Kp it takes here, the moon), and the chart of the Kp, the
 * clouds and the dark from the last half day through the forecast.
 */
export function AuroraSection({ kp, forecast, instant, moon = null }: { kp: Settled<KpSlot[]>; forecast: Forecast; instant: Date; /** The moon tonight: a bright one hides a weak aurora. */ moon?: Moon | null }) {
  if (!kp.ok)
    return (
      <PageSection id="aurora" title="Nordlys" icon="aurora" what="nordlysvarselet" error={kp.error}>
        {null}
      </PageSection>
    )
  const night = nightOf(kp.value, forecast, instant)
  // The last half day measured, then the forecast: the chart shows where tonight comes from.
  const chart = kp.value.filter((slot) => new Date(slot.time).getTime() + 3 * HOUR > instant.getTime() - 12 * HOUR)
  const [first, last] = [chart[0], chart.at(-1)]
  const clouds = cloudsOf(forecast)
  return (
    <PageSection id="aurora" title="Nordlys" icon="aurora">
      <Stack>
        <KeyFigures figures={auroraFigures(bestSlot(night), forecast.lat, moon === null ? null : litFraction(moon.phase))} />
        <ChartCard title="Nordlys de neste dagene">
          <AuroraChart
            data={chart.map((slot) => ({ ...slot, clouds: cloudsIn(slot.time, clouds) }))}
            needed={Math.round(kpNeeded(forecast.lat) * 2) / 2}
            dark={first === undefined || last === undefined ? [] : darkSpans(new Date(first.time), new Date(new Date(last.time).getTime() + 3 * HOUR), forecast.lat, forecast.lon)}
            now={instant.toISOString()}
            ariaLabel={`Nordlys i ${forecast.place} de neste dagene`}
          />
        </ChartCard>
      </Stack>
    </PageSection>
  )
}

/**
 * The sun and the aurora as rows among the hours on the front page: each sunrise and sunset between the first and the last hour shown, at its
 * place, and the best time for the aurora tonight when there is a chance, first.
 */
export function skyRows(forecast: Forecast, from: string | undefined, to: string | undefined, kp: Settled<KpSlot[]> | null, instant: Date): { sun: { time: string; row: ListRow }[]; aurora: ListRow | null } {
  const sun: { time: string; row: ListRow }[] = []
  if (from !== undefined && to !== undefined) {
    const start = new Date(from).getTime()
    const end = new Date(to).getTime()
    for (const date of new Set([osloTime(new Date(from)).date, osloTime(new Date(to)).date])) {
      const day = sunDay(date, forecast.lat, forecast.lon)
      if (day.kind !== "normal") continue
      for (const [kind, at] of [["rise", day.rise], ["set", day.set]] as const) {
        if (at.getTime() <= start || at.getTime() >= end) continue
        sun.push({
          time: at.toISOString(),
          row: {
            key: `${kind}-${at.toISOString()}`,
            icon: kind === "rise" ? "sunrise" : "sunset",
            title: `${formatClock(at)} ${kind === "rise" ? "Soloppgang" : "Solnedgang"}`,
          },
        })
      }
    }
  }
  const best = kp?.ok ? bestSlot(nightOf(kp.value, forecast, instant)) : undefined
  const aurora: ListRow | null =
    best === undefined || best.chance === "liten"
      ? null
      : {
          key: "aurora",
          icon: "aurora",
          ...(best.chance === "god" ? { iconTone: "primary" as const } : {}),
          title: `${slotHours(best)} Nordlys ${nightWord(best)}: ${CHANCE_LABEL[best.chance].toLowerCase()}`,
          meta: [slotLine(best)],
        }
  return { sun, aurora }
}
