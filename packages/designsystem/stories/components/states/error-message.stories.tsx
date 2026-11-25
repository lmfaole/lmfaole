import type { Meta, StoryObj } from "@storybook/react-vite"

import { ErrorMessage } from "../../../src/components/error-message"

import type { ReactNode } from "react"

import { PageHeader } from "../../../src/components/page-header"
import { PageLayout } from "../../../src/components/page-layout"
import { PageSection } from "../../../src/components/page-section"

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PageLayout>
      <PageHeader title={title} />
      {children}
    </PageLayout>
  )
}

const meta = {
  title: "Components/States/ErrorMessage",
  component: ErrorMessage,
  tags: ["autodocs"],
  args: { what: "episodene", error: new Error("Feeden svarte 502 Bad Gateway"), retry: true },
  parameters: { layout: "fullscreen", docs: { description: { component: `### Use it when

the data of a page or a section could not be fetched. It is the only way to say so: the frame of \`EmptyState\` with a warning, the fixed
title «Kunne ikke hente {what}», the error's own words folded under «Detaljer», and «Prøv igjen» (\`retry\`: \`true\` reloads the page,
a \`LinkTo\` goes to its address). A section whose source failed passes \`what\` and \`error\` to \`PageSection\`, which draws it.

### Do not use it when

there is simply nothing (\`EmptyState\`), the page itself does not exist (\`NotFoundPage\`), the whole page crashed (\`ServerErrorPage\`), or
the device is offline (\`ConnectionBanner\`).

### Accessibility

**Handled by the component**

- \`role="alert"\`, so it is announced when it appears ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages))
- The warning picture is hidden from assistive technology; the title says it in words, so colour is never alone ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- The detail is a native \`<details>\`, opened from the keyboard; long messages wrap instead of scrolling sideways ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow))
- «Prøv igjen» is a real link, at least 2.5rem tall ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum))

**You check**

- \`what\` names the thing in the words of the page («været», «pull requests»)
- One per failed part: several alerts at once interrupt each other ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages))

### Content

The title is fixed; \`what\` is the definite form or a name («episodene», «GitHub»). No «Vennligst», «Ups» or «Noe gikk galt».

### Related

\`EmptyState\`, \`PageSection\`, \`Banner\`, \`NotFoundPage\`` } } },
} satisfies Meta<typeof ErrorMessage>
export default meta
type Story = StoryObj<typeof meta>

/** A page whose data could not be fetched: the frame fills the rest of the screen, with «Prøv igjen» as its one action. */
export const Default: Story = {
  render: (args) => (
    <Page title="Nye episoder">
      <ErrorMessage {...args} />
    </Page>
  ),
}

/** In a section: `PageSection` draws it when its source returned a failure (`what` + `error`), at the section's height. */
export const InSection: Story = {
  render: () => (
    <PageLayout>
      <PageSection id="vaer" title="Været" icon="weather" what="været" error={new Error("api.met.no svarte 503")}>
        innhold
      </PageSection>
    </PageLayout>
  ),
}
