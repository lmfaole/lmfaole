import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"
import { SummaryBar } from "@lmfaole/designsystem/components/summary-bar"
import { Text } from "@lmfaole/designsystem/components/text"
import type { IconName } from "@lmfaole/designsystem/lib/icons"

import { GITHUB, Shell } from "../../components/shell"
import { now } from "../../lib/day"
import { groupDiscussions } from "../../lib/discussions"
import { getCiFailures, getDependabot, getDiscussions, getIssues, getPulls, getReplies, githubLogin } from "../../lib/github"
import { groupIssues } from "../../lib/issues"
import { BASE, withBase } from "../../lib/links"
import { groupPulls } from "../../lib/pulls"
import { settle } from "../../lib/settle"
import { countsOf, summaryItems, type SummaryArea, type SummaryEntry } from "../../lib/summary"

export const dynamic = "force-dynamic"
export const metadata = { title: "GitHub · Startside" }

/** The counts of what wants you, asked for once while the rest of the page is sent: each part's section takes its own from it, so the links to the pages under GitHub are there at once and the slowest source holds nothing back. */
async function allCounts(user: string): Promise<SummaryEntry[]> {
  const instant = now()
  const [pulls, issues, discussions, ci, replies, dependabot] = await Promise.all([
    settle(getPulls(user, "all")),
    settle(getIssues(user)),
    settle(getDiscussions(user)),
    settle(getCiFailures(user)),
    settle(getReplies(user, instant)),
    settle(getDependabot(user)),
  ])
  return summaryItems(BASE, {
    pulls: pulls.ok ? groupPulls(pulls.value) : [],
    issues: issues.ok ? groupIssues(issues.value, instant) : [],
    discussions: discussions.ok ? groupDiscussions(discussions.value) : [],
    alerts: { ci: ci.ok ? ci.value.length : 0, replies: replies.ok ? replies.value.length : 0, dependabot: dependabot.ok ? dependabot.value.length : 0 },
  })
}

/** One part's counts; nothing when it has none (the link to its page says the rest). */
async function Counts({ counts, area, label }: { counts: Promise<SummaryEntry[]>; area: SummaryArea; label: string }) {
  return <SummaryBar label={label} items={countsOf(await counts, area)} />
}

const PARTS = [
  { area: "alerts", title: "Varsler", icon: "notification", href: "/varsler", page: "Se alle varsler", description: "Feilende CI, nytt fra andre og Dependabot." },
  { area: "pulls", title: "Pull requests", icon: "pull-request", href: "/pull-requests", page: "Se alle pull requests", description: "Egne og de som venter på review." },
  { area: "issues", title: "Issues", icon: "issue", href: "/issues", page: "Se alle issues", description: "Det som er tildelt, nytt uten eier og det som har rørt seg." },
  { area: "discussions", title: "Discussions", icon: "discussion", href: "/discussions", page: "Se alle discussions", description: "Samtaler i repoene som følges, og spørsmål uten svar." },
] as const satisfies readonly { area: SummaryArea; title: string; icon: IconName; href: string; page: string; description: string }[]

/** GitHub in one place: a card for each part, with what it holds and its counts, its foot the link to its page. */
export default function Page() {
  const user = githubLogin()
  const counts = allCounts(user)
  return (
    <Shell current="github" title={GITHUB.label} lead={`Det som venter i de offentlige repoene til ${user}.`}>
      <>
        {PARTS.map((part) => (
          <PageSection key={part.area} id={`github-${part.area}`} title={part.title} icon={part.icon} continues={{ href: withBase(part.href), label: part.page, icon: part.icon }}>
            <Text role="quiet">{part.description}</Text>
            <StreamedSection title={`${part.title} i tall`} icon={part.icon} lines={1}>
              <Counts counts={counts} area={part.area} label={`${part.title} i tall`} />
            </StreamedSection>
          </PageSection>
        ))}
      </>
    </Shell>
  )
}
