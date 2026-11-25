import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Text } from "@lmfaole/designsystem/components/text"
import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { storedSummary } from "../lib/ai"

async function Summary({ repo, number }: { repo: string; number: number }) {
  const summary = await storedSummary(repo, number)
  if (summary === null) return null
  return (
    <PageSection id="summary" title="Oppsummering" icon="idea">
      <Text role="quiet">{summary.text}</Text>
      <Text role="note">
        Skrevet av KI ut fra teksten, så den kan ha feil. Den lages jevnlig, så den kan ligge litt etter siste endring.
      </Text>
    </PageSection>
  )
}

/** The summary at the top of a page, as the scheduled job made it (`lib/summaries.ts`): sent after the rest of the page, and left out if there is none. */
export function AiSummary({ repo, number }: { repo: string; number: number }) {
  return (
    <StreamedSection title="Oppsummering" icon="idea" lines={1}>
      <Summary repo={repo} number={number} />
    </StreamedSection>
  )
}
