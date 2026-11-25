import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { PullsSection } from "../../components/sections"
import { GithubUserForm } from "../../components/github-user"
import { GITHUB, Shell } from "../../components/shell"
import { now } from "../../lib/day"
import { getPulls } from "../../lib/github"
import { settle } from "../../lib/settle"
import type { SearchParams } from "../../lib/username"
import { githubPage } from "../../lib/visitor"

export const dynamic = "force-dynamic"
export const metadata = { title: "Pull requests · Startside" }

/** The pull requests, asked for while the page is sent: the frame and the way back are there at once. */
async function Pulls({ user }: { user: string }) {
  const instant = now()
  return <PullsSection data={await settle(getPulls(user, "all"))} mode="full" instant={instant} />
}

/** Every pull request, in groups by what needs you most: blocked, ready to merge, waiting for your review, and the rest. */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { user, known, params } = await githubPage(searchParams)
  return (
    <Shell current="github" trail={[GITHUB]} title="Pull requests" lead="Dine egne og de som venter på din review, med det som krever deg først.">
      {user === null ? (
        <GithubUserForm back="/start/pull-requests" params={params} current={known ?? undefined} />
      ) : (
        <StreamedSection title="Pull requests" icon="pull-request" lines={4}>
          <Pulls user={user} />
        </StreamedSection>
      )}
    </Shell>
  )
}
