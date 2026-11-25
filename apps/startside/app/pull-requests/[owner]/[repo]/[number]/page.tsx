import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { DetailLayout } from "@lmfaole/designsystem/components/detail-layout"
import { List } from "@lmfaole/designsystem/components/list"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import type { Status } from "@lmfaole/designsystem/components/status-line"
import { notFound } from "next/navigation"

import { AiSummary } from "../../../../../components/ai-summary"
import { About, History, TimeInState } from "../../../../../components/detail"
import { GitHubPerson } from "../../../../../components/person"
import { Byline } from "../../../../../components/byline"
import { GITHUB, Shell } from "../../../../../components/shell"
import { getPull } from "../../../../../lib/detail"
import { now } from "../../../../../lib/day"
import { long } from "../../../../../lib/format"
import { parseRef } from "../../../../../lib/links"
import { checkLook, reviewStateText, statusLabels } from "../../../../../lib/pr-status"
import { settle } from "../../../../../lib/settle"
import { prSpans, prSteps, prTimeline, truncatedNote } from "../../../../../lib/timeline"

export const dynamic = "force-dynamic"

/** One pull request: how it stands, what it is, who reviews it, the checks, the time in each state and its history. The way out to GitHub is the last action. */
export default async function Page({ params }: { params: Promise<{ owner: string; repo: string; number: string }> }) {
  const ref = parseRef(await params)
  if (ref === null) notFound()
  const result = await settle(getPull(ref))
  const trail = [GITHUB, { path: "/pull-requests", label: "Pull requests" }]
  if (!result.ok) {
    return (
      <Shell current="github" trail={trail} title={`Pull request #${ref.number}`}>
        <ErrorMessage what="pull requesten" error={result.error} retry />
      </Shell>
    )
  }
  const pull = result.value
  if (pull === null) notFound()
  const at = now().toISOString()

  const status: Status[] = [
    ...(pull.state === "MERGED" ? [{ text: "Merget", icon: "merge" as const }] : pull.state === "CLOSED" ? [{ text: "Lukket", icon: "close" as const, tone: "muted" as const }] : []),
    ...(pull.state === "OPEN" ? statusLabels({ draft: pull.draft, checks: pull.checks, review: pull.review, mergeable: pull.mergeable, openThreads: pull.openThreads, author: null, size: null }, "mine") : []),
  ]

  return (
    <Shell current="github" width="pane" trail={trail} crumb={`#${ref.number}`} title={pull.title} lead={<Byline at={ref} author={pull.author} created={pull.created} />}>
      <DetailLayout
        status={status}
        steps={{ label: `Status for pull request #${ref.number}`, steps: prSteps(pull, at), now: at }}
        facts={[
          ["Gren", `${pull.head} → ${pull.base}`],
          ["Størrelse", `+${pull.size.additions} −${pull.size.deletions} · ${pull.size.files} ${pull.size.files === 1 ? "fil" : "filer"}`],
          ["Etiketter", pull.labels],
          ["Venter på review fra", pull.requested.map((login) => <GitHubPerson key={login} login={login} />)],
          ["Reviews", pull.reviews.map((review) => <span key={review.author}><GitHubPerson login={review.author} /> · {reviewStateText(review.state)}</span>)],
        ]}
        links={[{ href: pull.url, label: "Åpne på GitHub" }]}
        updated={{ at: pull.updated, now: at }}
      >
        <AiSummary repo={`${ref.owner}/${ref.repo}`} number={ref.number} />
        <About body={pull.body} />
        {pull.checkLines.length === 0 ? null : (
          <PageSection id="checks" title="Tester" icon="tasks">
            <List
              rows={pull.checkLines.map((check) => {
                const look = checkLook(check.state)
                return { key: check.name, icon: look.icon, iconLabel: look.text, ...(look.tone === "destructive" ? { iconTone: look.tone } : {}), title: check.name, value: look.text }
              })}
              columns={{ name: "Test", value: "Status" }}
            />
          </PageSection>
        )}
        <TimeInState spans={prSpans(pull, at)} now={at} />
        <History label={`Historikk for pull request #${ref.number}`} events={prTimeline(pull)} note={truncatedNote(pull.timeline)} url={pull.url} now={at} />
      </DetailLayout>
    </Shell>
  )
}
