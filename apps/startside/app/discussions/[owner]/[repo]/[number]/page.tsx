import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { DetailLayout } from "@lmfaole/designsystem/components/detail-layout"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import type { Status } from "@lmfaole/designsystem/components/status-line"
import { Text } from "@lmfaole/designsystem/components/text"
import { notFound } from "next/navigation"

import { AiSummary } from "../../../../../components/ai-summary"
import { About, History, TimeInState } from "../../../../../components/detail"
import { GitHubPerson } from "../../../../../components/person"
import { Byline } from "../../../../../components/byline"
import { GITHUB, Shell } from "../../../../../components/shell"
import { getDiscussion } from "../../../../../lib/detail"
import { now } from "../../../../../lib/day"
import { long } from "../../../../../lib/format"
import { parseRef } from "../../../../../lib/links"
import { settle } from "../../../../../lib/settle"
import { discussionSpans, discussionSteps, discussionTimeline, truncatedNote } from "../../../../../lib/timeline"

export const dynamic = "force-dynamic"

/** One discussion: its category and whether it is answered, what it is, its answer, the time in each state and its history. The way out to GitHub is the last action. */
export default async function Page({ params }: { params: Promise<{ owner: string; repo: string; number: string }> }) {
  const ref = parseRef(await params)
  if (ref === null) notFound()
  const result = await settle(getDiscussion(ref))
  const trail = [GITHUB, { path: "/discussions", label: "Discussions" }]
  if (!result.ok) {
    return (
      <Shell current="github" trail={trail} title={`Discussion #${ref.number}`}>
        <ErrorMessage what="discussionen" error={result.error} retry />
      </Shell>
    )
  }
  const discussion = result.value
  if (discussion === null) notFound()
  const at = now().toISOString()

  const status: Status[] = [
    ...(discussion.category === "" ? [] : [{ text: discussion.category, icon: "tag" as const, tone: "muted" as const }]),
    ...(discussion.answered === null ? [] : [discussion.answered ? { text: "Besvart", icon: "success" as const } : { text: "Ubesvart", icon: "question" as const, tone: "destructive" as const }]),
  ]

  return (
    <Shell current="github" width="pane" trail={trail} crumb={`#${ref.number}`} title={discussion.title} lead={<Byline at={ref} author={discussion.author} created={discussion.created} />}>
      <DetailLayout
        status={status}
        steps={{ label: `Status for discussion #${ref.number}`, steps: discussionSteps(discussion, at), now: at }}
        facts={[["Kategori", discussion.category], ["Besvart av", discussion.answer === null ? "" : <GitHubPerson login={discussion.answer.author} />]]}
        links={[{ href: discussion.url, label: "Åpne på GitHub" }]}
        updated={{ at: discussion.updated, now: at }}
      >
        <AiSummary repo={`${ref.owner}/${ref.repo}`} number={ref.number} />
        <About body={discussion.body} />
        {discussion.answer === null ? null : (
          <PageSection id="answer" title="Svaret" icon="discussion">
            <Stack gap="tight">
              <Text role="quiet">
                <GitHubPerson login={discussion.answer.author} />
              </Text>
              <Text>{discussion.answer.text}</Text>
            </Stack>
          </PageSection>
        )}
        <TimeInState spans={discussionSpans(discussion, at)} now={at} />
        <History label={`Historikk for discussion #${ref.number}`} events={discussionTimeline(discussion)} note={truncatedNote(discussion.thread)} url={discussion.url} now={at} />
      </DetailLayout>
    </Shell>
  )
}
