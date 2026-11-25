import type { Meta, StoryObj } from "@storybook/react-vite"

import { FactList } from "../../../src/components/fact-list"
import { LogoList } from "../../../src/components/logos"
import { square } from "../../sample"

const meta = {
  title: "Components/Media/LogoList",
  component: LogoList,
  tags: ["autodocs"],
  args: { label: "Strømming", items: [{ name: "Netflix", src: square(0, "N") }, { name: "NRK TV", src: square(210, "N") }, { name: "Viaplay", src: square(280, "V") }] },
  parameters: { docs: { description: { component: `### Use it when

services by their small square logos and their names, side by side: where a film streams, which shops rent or sell it. As the value of a
\`FactList\` term («Strømming», «Leie», «Kjøp») it groups them.

### Do not use it when

the logos of a thing's makers in a page head (\`Logos\`), or one logo beside its own name in text (\`Logo decorative\`).

### Accessibility

**Handled by the component**

- A list named by \`label\`, the names in text; the logos are decoration beside them (\`alt=""\`) ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))
- A logo that is missing or fails leaves an empty tile, so the names stay level ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))

**You check**

- The source's credit is on the page where its terms ask for it (TMDB's watch providers: «Strømmedata fra JustWatch»)

### Related

\`Logos\`, \`Logo\`, \`FactList\`` } } },
} satisfies Meta<typeof LogoList>
export default meta
type Story = StoryObj<typeof meta>

/** Three services, each its logo and its name. */
export const Default: Story = {}

/** As the values of a description list: one term for each way to see it. */
export const Grouped: Story = {
  render: () => (
    <FactList
      facts={[
        ["Strømming", <LogoList key="s" label="Strømming" items={[{ name: "Netflix", src: square(0, "N") }]} />],
        ["Leie", <LogoList key="l" label="Leie" items={[{ name: "Apple TV", src: square(40, "A") }, { name: "Google Play", src: square(120, "G") }, { name: "SF Anytime", src: null }]} />],
      ]}
    />
  ),
}
