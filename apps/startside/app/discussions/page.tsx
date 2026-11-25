import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { DiscussionsSection } from "../../components/sections"
import { GithubUserForm } from "../../components/github-user"
import { GITHUB, Shell } from "../../components/shell"
import { getDiscussions } from "../../lib/github"
import { settle } from "../../lib/settle"
import type { SearchParams } from "../../lib/username"
import { githubPage } from "../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Discussions · Startside" }

/** The discussions, asked for while the page is sent: the frame and the way back are there at once. */
async function Discussions({ user }: { user: string }) {
  return <DiscussionsSection data={await settle(getDiscussions(user))} mode="full" />
}

/** The discussions of the watched repositories, in groups: the ones you are in, the unanswered questions, and what moved lately. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { user, known, params } = await githubPage(searchParams)
  return (
    <Shell current="github" trail={[GITHUB]} title="Discussions" lead="Samtalene du er med i, spørsmål uten svar, og det som har rørt seg.">
      {user === null ? (
        <GithubUserForm back="/start/discussions" params={params} current={known ?? undefined} />
      ) : (
        <StreamedSection title="Discussions" icon="discussion" lines={4}>
          <Discussions user={user} />
        </StreamedSection>
      )}
    </Shell>
  )
}
