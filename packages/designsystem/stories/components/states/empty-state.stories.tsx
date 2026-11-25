import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import { EmptyState } from "../../../src/components/empty-state"
import { PageHeader } from "../../../src/components/page-header"
import { PageLayout } from "../../../src/components/page-layout"
import { PageSection } from "../../../src/components/page-section"

/** A page with its header, so the empty state fills the rest of the screen as it does in an app. */
function Page({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <PageLayout>
      <PageHeader title={title} {...(description === undefined ? {} : { description })} />
      {children}
    </PageLayout>
  )
}

const meta = {
  title: "Components/States/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: { reason: "nothing-yet", what: "episoder" },
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: `### Use it when

a page or a section has nothing to show. Say why (\`reason\`) and what would be here (\`what\`, a plural noun); the picture, the words, the
height and the action's look follow, after Apple's \`ContentUnavailableView\`:

| \`reason\` | title | line under it | action |
| --- | --- | --- | --- |
| \`first-run\` | «Ingen {what} ennå» | the app's own (required) | required: the way to fill it |
| \`nothing-yet\` | «Ingen {what} ennå» | «De dukker opp her når det kommer noe.» | optional |
| \`no-results\` | «Ingen treff for «{query}»» or «Ingen treff» | «Sjekk stavemåten eller prøv et annet søk.» | optional; «Tøm søket» by default with a \`query\` |
| \`all-done\` | «Ingen {what}» | «Alt er behandlet.» | none (a type error) |

Straight in a page it fills the rest of the screen, centred both ways; in a \`PageSection\` it is a block of its own calm height, so
several empty sections on one page look alike.

### Do not use it when

a source failed (\`ErrorMessage\`, which shares this frame with a warning), or something was done (\`Banner tone="success"\`).

### Accessibility

**Handled by the component**

- It replaces the empty structure, so no table header is read over no rows ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The picture is decoration and hidden from assistive technology; the title says the same in words ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- The action is a real link (or a button in a client component), reached and followed from the keyboard, at least 2.5rem tall ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum))
- The picture settles in once and not at all under reduced motion ([2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions))
- Colours are theme tokens whose contrast the theme tests, light and dark ([1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum))

**You check**

- The title is text, not a heading: the page or the section around it gives the heading ([2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels))
- The action's words say where it goes ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context))
- When a list empties without a page load (a filter), say the result in a status message ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages))

### Content

\`what\` is a plural noun in lower case («podkaster», «pull requests»). A \`first-run\` description says what the app gathers and how it
starts, in one sentence. Never «Noe gikk galt», never «Kunne ikke»: that is an \`ErrorMessage\`.

### Related

\`ErrorMessage\`, \`Banner\`, \`PageSection\`, \`Skeleton\`` } },
  },
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>

/** An app's first, empty start: the «+» in the app's hue (here Podkast's `violet`), and the way to fill it is the one action. */
export const FirstRun: Story = {
  args: { reason: "first-run", what: "podkaster", description: "Finn podkaster du liker, så samles de nye episodene her.", action: { href: "#", label: "Finn podkaster", icon: "search" } },
  render: (args) => (
    <div data-brand="violet">
      <Page title="Podkaster">
        <EmptyState {...args} />
      </Page>
    </div>
  ),
}

/** Nothing has come yet, and nothing needs doing: it comes by itself. */
export const NothingYet: Story = {
  args: { reason: "nothing-yet", what: "episoder" },
  render: (args) => (
    <Page title="Nye episoder" description="Det siste fra podkastene du følger.">
      <EmptyState {...args} />
    </Page>
  ),
}

/** A search that found nothing: the query is quoted, and «Tøm søket» is the way out. */
export const NoResults: Story = {
  args: { reason: "no-results", what: "podkaster", query: "radioresepsjonen" },
  render: (args) => (
    <Page title="Søk">
      <EmptyState {...args} />
    </Page>
  ),
}

/** Filters that left nothing: no query to quote, so it says to loosen them. */
export const NoResultsFiltered: Story = {
  args: { reason: "no-results", what: "pull requests", action: { href: "#", label: "Vis alle" } },
  render: (args) => (
    <Page title="Pull requests">
      <EmptyState {...args} />
    </Page>
  ),
}

/** Everything is handled: the message is that nothing needs doing, so there is no action. */
export const AllDone: Story = {
  args: { reason: "all-done", what: "åpne pull requests" },
  render: (args) => (
    <Page title="Til gjennomgang">
      <EmptyState {...args} />
    </Page>
  ),
}

/** In a section, the same frame at the section's calm height. */
export const InSection: Story = {
  args: { reason: "nothing-yet", what: "avspillinger", action: { href: "#", label: "Koble til Last.fm" } },
  render: (args) => (
    <PageLayout>
      <PageSection id="sist" title="Sist spilt" icon="history">
        <EmptyState {...args} />
      </PageSection>
    </PageLayout>
  ),
}

/** A front page where three sections are empty at once: each says so the same way, at the same height, and the page still reads as a page. */
export const ThreeEmptySections: Story = {
  render: () => (
    <Page title="Startside" description="Det viktigste fra kildene dine.">
      <div className="grid gap-10">
        <PageSection id="nye" title="Nye episoder" icon="podcast">
          <EmptyState reason="nothing-yet" what="episoder" />
        </PageSection>
        <PageSection id="prs" title="Til gjennomgang" icon="pull-request">
          <EmptyState reason="all-done" what="åpne pull requests" />
        </PageSection>
        <PageSection id="sok" title="Treff" icon="search">
          <EmptyState reason="no-results" what="saker" query="strømpris" />
        </PageSection>
      </div>
    </Page>
  ),
}
