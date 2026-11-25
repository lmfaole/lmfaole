import { orderSections } from "@lmfaole/designsystem/lib/preferences"
import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { Freshness } from "@lmfaole/designsystem/components/freshness"
import { InstallPrompt } from "@lmfaole/designsystem/components/install-prompt"
import { IntroCallout } from "@lmfaole/designsystem/components/intro-callout"
import { cookies } from "next/headers"

import { AlertsOwnerOnly, GithubUserForm } from "../components/github-user"
import { conditionRows, WarningsSection } from "../components/conditions"
import { PositionControl } from "../components/position"
import { AlertsSection, DiscussionsSection, IssuesSection, PullsSection, WeatherDigest } from "../components/sections"
import { Shell } from "../components/shell"
import { dayOf, now } from "../lib/day"
import { groupDiscussions } from "../lib/discussions"
import { dateLine } from "../lib/format"
import { getCiFailures, getDependabot, getDiscussions, getIssues, getPulls, getReplies, isTokenOwner } from "../lib/github"
import { groupIssues } from "../lib/issues"
import { BASE } from "../lib/links"
import { chosenSections, planFor } from "../lib/plan"
import { parsePlaceName, parsePosition, PLACE_COOKIE, POSITION_COOKIE } from "../lib/position"
import { groupPulls } from "../lib/pulls"
import { settle } from "../lib/settle"
import { settingsPage } from "../lib/settings"
import { countsOf, summaryItems } from "../lib/summary"
import { formState, type SearchParams } from "../lib/username"
import { githubPage, introSeen, SEEN_PATH, visitorDaySettings, visitorPrefs } from "../lib/visitor"
import { getAir, getNowcast, getPrices, getWarnings } from "../lib/conditions"
import { parsePriceArea, PRICE_AREA_COOKIE } from "../lib/power"
import { getKp } from "../lib/space-weather"
import { getForecast } from "../lib/yr"

/** The page renews itself every minute (components/shell.tsx); after three missed renewals it says its data may be old. */
const STALE_AFTER = 180

// Rendered on the server for every request: the page shows what is true now.
export const dynamic = "force-dynamic"

/**
 * The front page is a digest: the few things that need you most from each source, each section with its own counts under its
 * title (each a link to what it counts) and a way to all of it. Which sections are shown follows the time of day as the visitor set it
 * (lib/plan.ts, lib/day-settings.ts), in the one order the visitor chose (`order` in `prefs`, the design system's `orderSections`); what is left out
 * is not fetched either. The lists, and a page for each thing, are one level down. GitHub is fetched for the visitor's username
 * (lib/visitor.ts); before there is one, the form asking for it stands where the first GitHub section would be. The alerts are the
 * token owner's only.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const instant = now()
  const jar = await cookies()
  const position = parsePosition(jar.get(POSITION_COOKIE)?.value)
  const place = parsePlaceName(jar.get(PLACE_COOKIE)?.value)
  const [{ user, known, params }, prefs, daySettings] = await Promise.all([githubPage(searchParams), visitorPrefs(), visitorDaySettings()])
  const day = dayOf(instant, daySettings)
  const planned = planFor(day, daySettings)
  const plan = { ...planned, sections: orderSections(chosenSections(planned.sections, prefs.sections), prefs.order) }
  const asking = user === null
  const owner = user === null ? false : await isTokenOwner(user).catch(() => false)
  const wants = (id: (typeof plan.sections)[number]) => plan.sections.includes(id)
  const github = (id: (typeof plan.sections)[number]) => user !== null && wants(id)

  const weather = wants("weather")
  const [pulls, issues, discussions, forecast, ci, replies, dependabot, kp, warnings, nowcast, air, prices] = await Promise.all([
    github("pulls") && user !== null ? settle(getPulls(user, plan.pulls)) : null,
    github("issues") && user !== null ? settle(getIssues(user)) : null,
    github("discussions") && user !== null ? settle(getDiscussions(user)) : null,
    weather ? settle(getForecast(position, place)) : null,
    owner && user !== null && wants("alerts") ? settle(getCiFailures(user)) : null,
    owner && user !== null && wants("alerts") ? settle(getReplies(user, instant)) : null,
    owner && user !== null && wants("alerts") ? settle(getDependabot(user)) : null,
    weather ? settle(getKp()) : null,
    // A warning is worth the front page whatever the time of day: it is asked for always.
    getWarnings(position, instant),
    weather ? getNowcast(position) : null,
    weather ? getAir(position, instant) : null,
    weather ? getPrices(position, parsePriceArea(jar.get(PRICE_AREA_COOKIE)?.value), instant) : null,
  ])
  const isGithub = (id: (typeof plan.sections)[number]) => id !== "weather"
  const formAt = asking ? (plan.sections.find(isGithub) ?? (formState(params, "github").error === undefined ? null : "end")) : null
  const form = <GithubUserForm key="github-user" back="/start" params={params} current={known ?? undefined} />

  const summary = summaryItems(BASE, {
    pulls: pulls?.ok ? groupPulls(pulls.value) : [],
    issues: issues?.ok ? groupIssues(issues.value, instant) : [],
    discussions: discussions?.ok ? groupDiscussions(discussions.value) : [],
    alerts: { ci: ci?.ok ? ci.value.length : 0, replies: replies?.ok ? replies.value.length : 0, dependabot: dependabot?.ok ? dependabot.value.length : 0 },
  })

  return (
    <Shell current="front" title={plan.greeting ?? "Startside"} lead={<>{dateLine.format(instant)} · <Freshness at={instant.toISOString()} now={instant.toISOString()} staleAfterSeconds={STALE_AFTER} /></>} actions={<PositionControl current={position} place={place} />}>
      <>
        {formAt === null ? (
          <IntroCallout
            id="intro-front"
            seen={await introSeen("intro-front")}
            title="Det du trenger nå, på én side"
            description="Startsiden samler det som venter på deg på GitHub, været og avgangene i nærheten. Hva som vises, følger tiden på døgnet; hver del har en lenke videre til alt."
            icon="home"
            cookiePath={SEEN_PATH}
          />
        ) : null}
        <WarningsSection warnings={warnings} instant={instant} compact />
        {plan.sections.map((id) => {
          if (id === formAt) return form
          if (user === null && isGithub(id)) return null
          if (id === "alerts" && !owner) return <AlertsOwnerOnly key={id} />
          if (id === "alerts" && ci && replies && dependabot) return <AlertsSection key={id} data={{ ci, replies, dependabot }} mode="digest" instant={instant} counts={countsOf(summary, "alerts")} />
          if (id === "pulls" && pulls) return <PullsSection key={id} data={pulls} mode="digest" instant={instant} counts={countsOf(summary, "pulls")} />
          if (id === "issues" && issues) return <IssuesSection key={id} data={issues} mode="digest" instant={instant} counts={countsOf(summary, "issues")} />
          if (id === "discussions" && discussions) return <DiscussionsSection key={id} data={discussions} mode="digest" counts={countsOf(summary, "discussions")} />
          if (id === "weather" && forecast) return <WeatherDigest key={id} data={forecast} kp={kp} window={plan.weatherWindow} day={day} instant={instant} extras={forecast.ok ? conditionRows({ nowcast, timeseries: forecast.value.timeseries, air, prices, instant, window: plan.weatherWindow }) : []} />
          return null
        })}
        {formAt === "end" ? form : null}
        {plan.sections.length === 0 ? <EmptyState reason="no-results" what="deler" description="Forsiden viser bare delene du har valgt, og bare når de passer tiden på døgnet. Velg flere i innstillingene." action={{ href: settingsPage("forside"), label: "Velg hva forsiden viser" }} /> : null}
        <InstallPrompt appName="Startside" seen={await introSeen("install")} cookiePath={SEEN_PATH} />
      </>
    </Shell>
  )
}
