import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { List, type ListRow } from "@lmfaole/designsystem/components/list"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { SummaryBar } from "@lmfaole/designsystem/components/summary-bar"
import { Time } from "@lmfaole/designsystem/components/time"
import type { IconName } from "@lmfaole/designsystem/lib/icons"

import { groupDiscussions, type DiscussionGroupId } from "../lib/discussions"
import { takeFirst } from "../lib/digest"
import { replyText, type CiFailure, type Reply } from "../lib/alerts"
import { clock, degrees, number } from "../lib/format"
import { hoursOf, type Forecast } from "../lib/yr"
import { weatherIcon } from "../lib/forecast"
import type { KpSlot } from "../lib/aurora"
import { skyRows } from "./sky"
import type { Item } from "../lib/github"
import { groupIssues, type IssueGroupId } from "../lib/issues"
import { internalHref, withBase } from "../lib/links"
import { USERNAME_PAGE } from "../lib/username"
import { ageLabels, compactLabels, statusLabels, type Label } from "../lib/pr-status"
import { groupPulls, type GroupId } from "../lib/pulls"
import type { Settled } from "../lib/settle"
import type { SummaryEntry } from "../lib/summary"
import { now, type Day } from "../lib/day"
import { describeSymbol } from "../lib/yr"
import type { DiscussionItem } from "../lib/discussions"

/** How many a section of the front page shows: the digest of a longer list, which has a page of its own. */
export const DIGEST = { pulls: 3, issues: 2, discussions: 2, weather: 4, alerts: 4 } as const

/** A row in the digest is compact: no repository line and at most two statuses; the whole of it is on the page of the thing. */
const COMPACT_LABELS = 2

/** What each group of pull requests, issues and discussions is, as an icon in front of its title. */
const PULL_ICONS = { blocked: "warning", ready: "merge", review: "view", waiting: "waiting", notReady: "pull-request-draft", drafts: "edit", open: "pull-request" } as const satisfies Record<GroupId, IconName>
const ISSUE_ICONS = { assigned: "tasks", involved: "person", new: "inbox", recent: "time" } as const satisfies Record<IssueGroupId, IconName>
const DISCUSSION_ICONS = { involved: "person", unanswered: "question", recent: "time" } as const satisfies Record<DiscussionGroupId, IconName>

const COLUMNS = { name: "Tittel", value: "Sist oppdatert" } as const

/** What a row stands for: its icon, what a screen reader hears for it, and `destructive` where it stops something. */
interface Kind {
  icon: IconName
  label?: string
  tone?: "muted" | "destructive"
}

/** A row of a list: the name links to the app's own page for it (never straight out to GitHub), where the way out is the last action. */
function row(item: Pick<Item, "key" | "href" | "title" | "repo" | "updated">, labels: Label[], kind: Kind, compact = false): ListRow {
  const own = internalHref(item.href)
  return {
    key: item.key,
    icon: kind.icon,
    ...(kind.label === undefined ? {} : { iconLabel: kind.label }),
    ...(kind.tone === "destructive" ? { iconTone: kind.tone } : {}),
    title: item.title,
    ...(own === null ? { href: item.href, external: true } : { href: own }),
    meta: [compact ? null : item.repo, <Time key="updated" value={item.updated} now={now()} />],
    status: compact ? compactLabels(labels, COMPACT_LABELS) : labels,
  }
}

function Failed({ id, title, icon, what, error }: { id: string; title: string; icon: IconName; what: string; error: unknown }) {
  return (
    <PageSection id={id} title={title} icon={icon} what={what} error={error}>
      {null}
    </PageSection>
  )
}

/** An empty list: what would be here, and why there is nothing. */
function Quiet({ id, title, icon, what }: { id: string; title: string; icon: IconName; what: string }) {
  return (
    <PageSection id={id} title={title} icon={icon}>
      <EmptyState reason="all-done" what={what} />
    </PageSection>
  )
}

/** When a GitHub list is empty, the name may be the wrong one. */
const CHANGE_USER = { href: USERNAME_PAGE, label: "Bytt brukernavn" }

const PULLS_PATH = withBase("/pull-requests")
const ISSUES_PATH = withBase("/issues")
const DISCUSSIONS_PATH = withBase("/discussions")

export type PullsData = { reviews: Item[]; mine: Item[] }

type PullEntry = ReturnType<typeof groupPulls>[number]["entries"][number]

const pullRow = ({ item, whose }: PullEntry, group: GroupId, instant: Date, compact = false): ListRow =>
  row(
    item,
    [...(item.status === undefined ? [] : statusLabels(item.status, whose)), ...ageLabels(item, whose, instant)],
    { icon: item.status?.draft ? "pull-request-draft" : "pull-request", label: item.status?.draft ? "Utkast" : "Pull request", ...(group === "blocked" ? { tone: "destructive" as const } : {}) },
    compact,
  )

/** Pull requests: on the front page the few that need you most, with a way to all of them; on their own page all of them, in groups by what needs you most. */
export function PullsSection({ data, mode, instant, counts = [] }: { data: Settled<PullsData>; mode: "digest" | "full"; instant: Date; counts?: readonly SummaryEntry[] }) {
  if (!data.ok) return <Failed id="pulls" title="Pull requests" icon="pull-request" what="pull requests" error={data.error} />
  const groups = groupPulls(data.value)
  if (groups.length === 0) return <Quiet id="pulls" title="Pull requests" icon="pull-request" what="åpne pull requests" />
  if (mode === "full") {
    return (
      <>
        {groups.map((group) => (
          <PageSection key={group.id} id={`pulls-${group.id}`} title={group.title} icon={PULL_ICONS[group.id]}>
            <List rows={group.entries.map((entry) => pullRow(entry, group.id, instant))} columns={COLUMNS} />
          </PageSection>
        ))}
      </>
    )
  }
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0)
  const first = takeFirst(groups.map((group) => group.entries.map((entry) => ({ entry, group: group.id }))), DIGEST.pulls)
  return (
    <PageSection id="pulls" title="Krever deg" icon="pull-request" continues={{ href: PULLS_PATH, label: "Se alle pull requests", icon: "pull-request", count: total === 1 ? "1 åpen" : `${total} åpne` }}>
      <SummaryBar label="Pull requests i tall" items={counts} />
      <List rows={first.map(({ entry, group }) => pullRow(entry, group, instant, true))} columns={COLUMNS} />
    </PageSection>
  )
}

export type IssuesData = Parameters<typeof groupIssues>[0]

/** Issues: the few that are for you on the front page; all of them, in groups, on their own page. */
export function IssuesSection({ data, mode, instant, counts = [] }: { data: Settled<IssuesData>; mode: "digest" | "full"; instant: Date; counts?: readonly SummaryEntry[] }) {
  if (!data.ok) return <Failed id="issues" title="Issues" icon="issue" what="issues" error={data.error} />
  const groups = groupIssues(data.value, instant)
  if (groups.length === 0) return <Quiet id="issues" title="Issues" icon="issue" what="åpne issues" />
  const issueRow = (item: Item, compact = false) => row(item, [], { icon: "issue", label: "Issue" }, compact)
  if (mode === "full") {
    return (
      <>
        {groups.map((group) => (
          <PageSection key={group.id} id={`issues-${group.id}`} title={group.title} icon={ISSUE_ICONS[group.id]}>
            <List rows={group.items.map((item) => issueRow(item))} columns={COLUMNS} />
          </PageSection>
        ))}
      </>
    )
  }
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  return (
    <PageSection id="issues" title="Issues til deg" icon="issue" continues={{ href: ISSUES_PATH, label: "Se alle issues", icon: "issue", count: total === 1 ? "1 åpen" : `${total} åpne` }}>
      <SummaryBar label="Issues i tall" items={counts} />
      <List rows={takeFirst(groups.map((group) => group.items), DIGEST.issues).map((item) => issueRow(item, true))} columns={COLUMNS} />
    </PageSection>
  )
}

export type DiscussionsData = Parameters<typeof groupDiscussions>[0]

const discussionRow = (item: DiscussionItem, compact = false): ListRow =>
  row(
    item,
    [...(item.category === "" ? [] : [{ text: item.category, tone: "muted" as const, icon: "tag" as const }]), { text: item.comments === 1 ? "1 svar" : `${item.comments} svar`, tone: "muted" as const, icon: "discussion" as const }],
    { icon: item.answered === false ? "question" : "discussion", label: item.answered === false ? "Spørsmål" : "Discussion" },
    compact,
  )

/** Discussions: the few on the front page; all of them, in groups, on their own page. Nothing where there are none. */
export function DiscussionsSection({ data, mode, counts = [] }: { data: Settled<DiscussionsData>; mode: "digest" | "full"; counts?: readonly SummaryEntry[] }) {
  if (!data.ok) return <Failed id="discussions" title="Discussions" icon="discussion" what="discussions" error={data.error} />
  const groups = groupDiscussions(data.value)
  if (groups.length === 0) return mode === "full" ? (
      <PageSection id="discussions" title="Discussions" icon="discussion">
        <EmptyState reason="nothing-yet" what="discussions" description="Her kommer offentlige discussions brukeren har startet, svart i eller er nevnt i. Venter du noen her, kan brukernavnet være feil." action={CHANGE_USER} />
      </PageSection>
    ) : null
  if (mode === "full") {
    return (
      <>
        {groups.map((group) => (
          <PageSection key={group.id} id={`discussions-${group.id}`} title={group.title} icon={DISCUSSION_ICONS[group.id]}>
            <List rows={group.items.map((item) => discussionRow(item))} columns={COLUMNS} />
          </PageSection>
        ))}
      </>
    )
  }
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  return (
    <PageSection id="discussions" title="Discussions" icon="discussion" continues={{ href: DISCUSSIONS_PATH, label: "Se alle discussions", icon: "discussion", count: `${total} i alt` }}>
      <SummaryBar label="Discussions i tall" items={counts} />
      <List rows={takeFirst(groups.map((group) => group.items), DIGEST.discussions).map((item) => discussionRow(item, true))} columns={COLUMNS} />
    </PageSection>
  )
}

/** The hours of the weather as rows: a symbol, the time and what it is, and the figures. */
export function hourRows(forecast: Forecast, window: "today" | "tomorrow", day: Day, instant: Date, limit?: number): ListRow[] {
  const hours = hoursOf(forecast, window, day, instant)
  return (limit === undefined ? hours : hours.slice(0, limit)).map((hour) => ({
    key: hour.time,
    icon: weatherIcon(hour.symbol),
    title: `${clock.format(new Date(hour.time))} ${describeSymbol(hour.symbol)}`,
    meta: [`${number.format(hour.precipitation)} mm`, `${number.format(hour.wind)} m/s`],
    value: degrees(hour.temperature),
  }))
}

/**
 * The weather on the front page: the next few hours, with a sunrise or a sunset among them at its time, and first the best time for the northern lights
 * tonight when there is a chance of them (also when the section shows tomorrow, since the night is what matters), and a way to the whole forecast.
 */
export function WeatherDigest({ data, kp, window, day, instant, extras = [] }: { data: Settled<Forecast>; kp: Settled<KpSlot[]> | null; window: "today" | "tomorrow"; day: Day; instant: Date; /** Rows above the hours: rain on the way, the UV, the air, the price of power (`conditionRows`). */ extras?: readonly ListRow[] }) {
  if (!data.ok) return <Failed id="weather" title="Vær" icon="weather" what="været" error={data.error} />
  const hours = hoursOf(data.value, window, day, instant).slice(0, DIGEST.weather)
  const sky = skyRows(data.value, hours[0]?.time, hours.at(-1)?.time, kp, instant)
  const rows = [...hourRows(data.value, window, day, instant, DIGEST.weather).map((row, index) => ({ time: hours[index]?.time ?? "", row })), ...sky.sun]
    .toSorted((a, b) => a.time.localeCompare(b.time))
    .map((one) => one.row)
  return (
    <PageSection id="weather" title={`Vær i ${data.value.place} ${window === "today" ? "nå" : "i morgen"}`} icon="weather" continues={{ href: withBase("/vaer"), label: "Se hele værmeldingen", icon: "weather" }}>
      <List rows={[...extras, ...(sky.aurora === null ? [] : [sky.aurora]), ...rows]} columns={{ name: "Tid og vær", value: "Temperatur, nedbør og vind" }} />
    </PageSection>
  )
}

export type AlertsData = { ci: Settled<CiFailure[]>; replies: Settled<Reply[]>; dependabot: Settled<Item[]> }

const ALERT_ICONS = { ci: "failure", replies: "discussion", dependabot: "package" } as const satisfies Record<string, IconName>
const ALERT_TITLES = { ci: "Feilende CI", replies: "Nytt fra andre", dependabot: "Dependabot" } as const

// A repository has no page of its own here: the checks of the red commit are on GitHub, so the link out is marked.
const ciRow = (failure: CiFailure): ListRow => ({
  key: `ci/${failure.repo}`,
  icon: "failure",
  iconLabel: "Feilende CI",
  iconTone: "destructive",
  title: failure.repo,
  href: failure.href,
  external: true,
  meta: [failure.headline],
  status: [{ text: `Feilet på ${failure.branch}`, icon: "failure" }],
  value: <Time value={failure.committed} now={now()} />,
})

const replyRow = (reply: Reply): ListRow =>
  row(
    { key: reply.key, href: reply.href, title: reply.title, repo: reply.repo, updated: reply.when },
    [{ text: `${reply.who} ${replyText(reply.what)}`, tone: reply.what === "changes" ? "destructive" : "default", icon: reply.what === "approved" ? "success" : reply.what === "changes" ? "changes" : "discussion" }],
    { icon: "discussion", label: "Svar" },
  )

/**
 * What wants a look beyond your own pull requests: repositories whose default branch is red, replies and reviews from others on what you are
 * in, and Dependabot's open pull requests. On the front page the first few of them, red first; on their own page each as a group. A source
 * that fails shows its own error; nothing is shown where there is nothing.
 */
export function AlertsSection({ data, mode, instant, counts = [] }: { data: AlertsData; mode: "digest" | "full"; instant: Date; counts?: readonly SummaryEntry[] }) {
  const errors = [data.ci, data.replies, data.dependabot].flatMap((result) => (result.ok ? [] : [result.error]))
  const groups = [
    { id: "ci" as const, rows: data.ci.ok ? data.ci.value.map(ciRow) : [] },
    { id: "replies" as const, rows: data.replies.ok ? data.replies.value.map(replyRow) : [] },
    { id: "dependabot" as const, rows: data.dependabot.ok ? data.dependabot.value.map((item) => row(item, [...(item.status === undefined ? [] : statusLabels(item.status, "mine")), ...ageLabels(item, "mine", instant)], { icon: "package", label: "Dependabot" })) : [] },
  ].filter((group) => group.rows.length > 0)
  const failed = errors.length === 0 ? null : <ErrorMessage what="varslene fra GitHub" error={errors[0]} retry />
  if (groups.length === 0 && errors.length === 0) return mode === "full" ? <Quiet id="alerts" title="Varsler" icon="notification" what="varsler" /> : null
  if (mode === "full") {
    return (
      <>
        {groups.map((group) => (
          <PageSection key={group.id} id={`alerts-${group.id}`} title={ALERT_TITLES[group.id]} icon={ALERT_ICONS[group.id]}>
            <List rows={group.rows} columns={COLUMNS} />
          </PageSection>
        ))}
        {failed}
      </>
    )
  }
  if (groups.length === 0) return <Failed id="alerts" title="Følg opp" icon="notification" what="varslene fra GitHub" error={errors[0]} />
  const total = groups.reduce((sum, group) => sum + group.rows.length, 0)
  return (
    <PageSection id="alerts" title="Følg opp" icon="notification" continues={{ href: withBase("/varsler"), label: "Se alle varsler", icon: "notification", count: `${total} i alt` }}>
      <SummaryBar label="Varsler i tall" items={counts} />
      <List rows={takeFirst(groups.map((group) => group.rows), DIGEST.alerts)} columns={COLUMNS} />
      {failed}
    </PageSection>
  )
}
