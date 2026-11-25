import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Text } from "@lmfaole/designsystem/components/text"
import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { summarize } from "../lib/ai"
import type { SummaryInput, SummaryKind } from "../lib/summarize"

async function Summary({ kind, input }: { kind: SummaryKind; input: SummaryInput }) {
  const text = await summarize(kind, input)
  if (text === null) return null
  return (
    <PageSection id="summary" title="Oppsummering" icon="idea">
      <Text role="quiet">{text}</Text>
      <Text role="note">
        Skrevet av KI ut fra teksten, så den kan ha feil.
      </Text>
    </PageSection>
  )
}

/** The summary at the top of a page: made while the rest of the page is sent, so it never holds the page back, and left out if it cannot be made. */
export function AiSummary({ kind, input }: { kind: SummaryKind; input: SummaryInput }) {
  return (
    <StreamedSection title="Oppsummering" icon="idea" lines={1}>
      <Summary kind={kind} input={input} />
    </StreamedSection>
  )
}
