import { Freshness } from "@lmfaole/designsystem/components/freshness"

import { conditionRows, WarningsSection } from "../components/conditions"
import { PositionControl } from "../components/position"
import { AlertsSection, DiscussionsSection, IssuesSection, PullsSection, WeatherDigest } from "../components/sections"
import { Shell } from "../components/shell"
import { dayOf, now } from "../lib/day"
import { groupDiscussions } from "../lib/discussions"
import { dateLine } from "../lib/format"
import { getCiFailures, getDependabot, getDiscussions, getIssues, getPulls, getReplies, githubLogin } from "../lib/github"
import { groupIssues } from "../lib/issues"
import { BASE } from "../lib/links"
import { planFor } from "../lib/plan"
import { firstParam, positionParam, type SearchParams } from "../lib/position"
import { groupPulls } from "../lib/pulls"
import { settle } from "../lib/settle"
import { countsOf, summaryItems } from "../lib/summary"
import { getAir, getNowcast, getPrices, getWarnings } from "../lib/conditions"
import { AREA_PARAM, parsePriceArea } from "../lib/power"
import { getKp } from "../lib/space-weather"
import { getForecast } from "../lib/yr"

/** The page renews itself every minute (components/shell.tsx); after three missed renewals it says its data may be old. */
const STALE_AFTER = 180

// Rendered on the server for every request (and kept a minute at the edge, worker.mjs): the page shows what is true now.
export const dynamic = "force-dynamic"

/**
 * The front page is a digest: the few things that need attention most from each source, each section with its own counts under its
 * title (each a link to what it counts) and a way to all of it. Which sections are shown follows the time of day (lib/plan.ts,
 * lib/day-settings.ts); what is left out is not fetched either. The lists, and a page for each thing, are one level down. GitHub is the
 * fixed user's public activity (`GITHUB_USER`); the weather is for the position in the address (`?pos=`, set by the browser's own
 * location, components/position.tsx) or the default place.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const instant = now()
  const params = await searchParams
  const position = positionParam(params)
  const user = githubLogin()
  const day = dayOf(instant)
  const plan = planFor(day)
  const wants = (id: (typeof plan.sections)[number]) => plan.sections.includes(id)
  const alerts = wants("alerts")

  const weather = wants("weather")
  const [pulls, issues, discussions, forecast, ci, replies, dependabot, kp, warnings, nowcast, air, prices] = await Promise.all([
    wants("pulls") ? settle(getPulls(user, plan.pulls)) : null,
    wants("issues") ? settle(getIssues(user)) : null,
    wants("discussions") ? settle(getDiscussions(user)) : null,
    weather ? settle(getForecast(position)) : null,
    alerts ? settle(getCiFailures(user)) : null,
    alerts ? settle(getReplies(user, instant)) : null,
    alerts ? settle(getDependabot(user)) : null,
    weather ? settle(getKp()) : null,
    // A warning is worth the front page whatever the time of day: it is asked for always.
    getWarnings(position, instant),
    weather ? getNowcast(position) : null,
    weather ? getAir(position, instant) : null,
    weather ? getPrices(position, parsePriceArea(firstParam(params[AREA_PARAM])), instant) : null,
  ])

  const summary = summaryItems(BASE, {
    pulls: pulls?.ok ? groupPulls(pulls.value) : [],
    issues: issues?.ok ? groupIssues(issues.value, instant) : [],
    discussions: discussions?.ok ? groupDiscussions(discussions.value) : [],
    alerts: { ci: ci?.ok ? ci.value.length : 0, replies: replies?.ok ? replies.value.length : 0, dependabot: dependabot?.ok ? dependabot.value.length : 0 },
  })

  return (
    <Shell current="front" position={position} title={plan.greeting ?? "Startside"} lead={<>{dateLine.format(instant)} · <Freshness at={instant.toISOString()} now={instant.toISOString()} staleAfterSeconds={STALE_AFTER} /></>} actions={<PositionControl current={position} />}>
      <>
        <WarningsSection warnings={warnings} instant={instant} compact />
        {plan.sections.map((id) => {
          if (id === "alerts" && ci && replies && dependabot) return <AlertsSection key={id} data={{ ci, replies, dependabot }} mode="digest" instant={instant} counts={countsOf(summary, "alerts")} />
          if (id === "pulls" && pulls) return <PullsSection key={id} data={pulls} mode="digest" instant={instant} counts={countsOf(summary, "pulls")} />
          if (id === "issues" && issues) return <IssuesSection key={id} data={issues} mode="digest" instant={instant} counts={countsOf(summary, "issues")} />
          if (id === "discussions" && discussions) return <DiscussionsSection key={id} data={discussions} mode="digest" counts={countsOf(summary, "discussions")} />
          if (id === "weather" && forecast) return <WeatherDigest key={id} data={forecast} kp={kp} window={plan.weatherWindow} day={day} instant={instant} extras={forecast.ok ? conditionRows({ nowcast, timeseries: forecast.value.timeseries, air, prices, instant, window: plan.weatherWindow }) : []} />
          return null
        })}
      </>
    </Shell>
  )
}
