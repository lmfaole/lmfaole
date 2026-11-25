import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { IssuesSection } from "../../components/sections"
import { GithubUserForm } from "../../components/github-user"
import { GITHUB, Shell } from "../../components/shell"
import { now } from "../../lib/day"
import { getIssues } from "../../lib/github"
import { settle } from "../../lib/settle"
import type { SearchParams } from "../../lib/username"
import { githubPage } from "../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Issues · Startside" }

/** The issues, asked for while the page is sent: the frame and the way back are there at once. */
async function Issues({ user }: { user: string }) {
  const instant = now()
  return <IssuesSection data={await settle(getIssues(user))} mode="full" instant={instant} />
}

/** The issues that are for you, in groups: assigned to you, ones you are involved in, new ones nobody owns, and what moved lately. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { user, known, params } = await githubPage(searchParams)
  return (
    <Shell current="github" trail={[GITHUB]} title="Issues" lead="Det som er tildelt deg, det du er med i, det nye som ingen eier, og det som har rørt seg.">
      {user === null ? (
        <GithubUserForm back="/start/issues" params={params} current={known ?? undefined} />
      ) : (
        <StreamedSection title="Issues" icon="issue" lines={4}>
          <Issues user={user} />
        </StreamedSection>
      )}
    </Shell>
  )
}
