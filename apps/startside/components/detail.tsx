import { DurationBars } from "@lmfaole/designsystem/components/duration-bars"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Markdown } from "@lmfaole/designsystem/components/markdown"
import { IntroCallout } from "@lmfaole/designsystem/components/intro-callout"
import { Text, TextLink } from "@lmfaole/designsystem/components/text"
import { Timeline, type TimelineEvent } from "@lmfaole/designsystem/components/timeline"

import type { Body } from "../lib/detail"
import type { DurationSpan, GitHubEvent } from "../lib/timeline"
import { introSeen, SEEN_PATH } from "../lib/visitor"

/** The first time a pull request, an issue or a discussion is opened: what the parts of the page say. One for all three. */
export async function DetailIntro() {
  return (
    <IntroCallout
      id="intro-detail"
      seen={await introSeen("intro-detail")}
      title="Hele historien på én side"
      description="Stegene øverst viser hvor saken står og hva som gjenstår. «Tid i hver tilstand» viser hvor lenge den har ventet på hva, og historikken lister alt som har skjedd, det nyeste først."
      icon="history"
      cookiePath={SEEN_PATH}
    />
  )
}

/** How long it has spent in each state (waiting for review, in draft, changes requested), as bars on a wide screen and a list on a phone. */
export function TimeInState({ spans, now }: { spans: DurationSpan[]; now: string }) {
  if (spans.length === 0) return null
  return (
    <PageSection id="time-in-state" title="Tid i hver tilstand" icon="duration">
      <DurationBars ariaLabel="Tid i hver tilstand" data={spans} now={now} />
    </PageSection>
  )
}

/** Everything that happened to it, newest first: comments in full, the rest as one line each, runs of commits and labels folded. */
export function History({ label, events, note, url, now }: { label: string; events: GitHubEvent[]; note: string | null; url: string; now: string }) {
  const items: TimelineEvent[] = events.map(({ markdown, ...event }) =>
    markdown === undefined
      ? event
      : {
          ...event,
          body:
            markdown.trim() === "" ? (
              <Text role="quiet">
                (uten tekst)
              </Text>
            ) : (
              <Markdown source={markdown} size="sm" from="h4" />
            ),
        },
  )
  return (
    <PageSection id="history" title="Historikk" icon="history">
      <Timeline label={label} events={items} now={now} groupNouns={{ commit: "commits", label: "etikettendringer" }} />
      {note === null ? null : (
        <Text role="note">
          {note} <TextLink external href={url}>Se resten på GitHub</TextLink>
        </Text>
      )}
    </PageSection>
  )
}

/** What a thing is, in its own words: its description as Markdown, cut at a paragraph (the rest is on GitHub); nothing where it has none. */
export function About({ body }: { body: Body }) {
  if (body.text === "") return null
  return (
    <PageSection id="about" title="Beskrivelse" icon="info">
      <Markdown source={body.text} />
      {body.cut ? (
        <Text role="note">
          Beskrivelsen er kortet ned. Resten er på GitHub.
        </Text>
      ) : null}
    </PageSection>
  )
}
