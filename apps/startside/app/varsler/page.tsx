import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { AiSummary } from "../../components/ai-summary"
import { AlertsSection } from "../../components/sections"
import { AlertsOwnerOnly, GithubUserForm } from "../../components/github-user"
import { GITHUB, Shell } from "../../components/shell"
import { replyText } from "../../lib/alerts"
import { now } from "../../lib/day"
import { getCiFailures, getDependabot, getReplies, isTokenOwner } from "../../lib/github"
import { settle } from "../../lib/settle"
import type { SearchParams } from "../../lib/username"
import { githubPage } from "../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Varsler · Startside" }

/** The alerts, asked for while the page is sent: the frame and the way back are there at once. The summary is asked for after them, so it never holds them back. */
async function Alerts({ user }: { user: string }) {
  if (!(await isTokenOwner(user).catch(() => false))) return <AlertsOwnerOnly heading={false} />
  const instant = now()
  const [ci, replies, dependabot] = await Promise.all([settle(getCiFailures(user)), settle(getReplies(user, instant)), settle(getDependabot(user))])
  const lines = [
    ...(ci.ok ? ci.value.map((failure) => `${failure.repo}: CI feilet på ${failure.branch} (${failure.headline})`) : []),
    ...(replies.ok ? replies.value.map((reply) => `${reply.repo}: ${reply.who} ${replyText(reply.what)} på «${reply.title}»`) : []),
    ...(dependabot.ok ? dependabot.value.map((item) => `${item.repo}: Dependabot: ${item.title}`) : []),
  ]
  return (
    <>
      {lines.length === 0 ? null : <AiSummary kind="varsler" input={{ title: "Varsler", lines }} />}
      <AlertsSection data={{ ci, replies, dependabot }} mode="full" instant={instant} />
    </>
  )
}

/** What wants a look: repositories whose default branch is red, replies and reviews from others on what you are in, and Dependabot's open pull requests. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { user, known, params } = await githubPage(searchParams)
  return (
    <Shell current="github" trail={[GITHUB]} title="Varsler" lead="Det som er rødt, det som er nytt fra andre, og det Dependabot venter på.">
      {user === null ? (
        <GithubUserForm back="/start/varsler" params={params} current={known ?? undefined} />
      ) : (
        <StreamedSection title="Varsler" icon="notification" lines={4}>
          <Alerts user={user} />
        </StreamedSection>
      )}
    </Shell>
  )
}
