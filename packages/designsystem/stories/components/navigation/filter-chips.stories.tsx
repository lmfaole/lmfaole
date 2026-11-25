import type { Meta, StoryObj } from "@storybook/react-vite"

import { FilterChips } from "../../../src/components/filter-chips"

const meta = {
  title: "Components/Navigation/FilterChips",
  component: FilterChips,
  tags: ["autodocs"],
  args: { label: "Kategori", chips: [{ key: "a", label: "Alle", href: "#a", current: true }, { key: "b", label: "Teknologi", href: "#b", current: false }, { key: "c", label: "Politikk", href: "#c", current: false }] },
  parameters: { docs: { description: { component: `### Use it when

the reader switches between views of the same page: a day, a line, a period, a kind. Each choice is a link to the page with it on. It is the ONE view switcher: with more than six choices (\`MAX_CHIPS\`) it is a native \`<select>\` by itself, whose options go to their page (\`data-href\`, \`enableNavigatingSelects\` run once by the page), so a long list of days or months is the platform's own picker.

### Do not use it when

a choice in a form that is saved (\`ChoiceCards\`, \`NativeSelect\`) or free text (\`SearchField\`).

### Accessibility

**Handled by the component**

- A \`nav\` named by \`label\`, with real links, so it works from the keyboard and without a script ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard)).
- The chip that is on is \`aria-current="true"\`, and also filled and medium weight, not only another colour ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).
- Each chip, and the select, is 3rem high ([2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).
- The chips wrap onto more lines instead of scrolling sideways ([1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).
- As a select, it says in advance that a choice changes the page («Siden bytter når du velger.», its description), and the arrow keys of a closed select step without leaving: the page changes on Enter or when focus leaves ([3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input)).

**You check**

- \`label\` names what is filtered («Kategori») ([2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)).
- Exactly one chip is \`current\`, and it matches what the list below shows ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)).
- Each chip's label is the kind it filters to, so the link reads right by itself ([2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context)).

### Content

Short nouns; say how many there are after filtering.

### Related

\`SearchField\`, \`NativeSelect\`, \`ChoiceCards\`` } }, },
} satisfies Meta<typeof FilterChips>
export default meta
type Story = StoryObj<typeof meta>

/** Three chips with «Alle» on, marked with `aria-current`. */
export const Default: Story = {}

const MONTHS = ["november", "oktober", "september", "august", "juli", "juni", "mai", "april"]

/** Eight months: more than six, so a navigating select with the current month chosen (what `PeriodPicker` was). */
export const ManyChoices: Story = {
  args: { label: "Periode", chips: MONTHS.map((month, index) => ({ key: month, label: `${month[0]?.toUpperCase() ?? ""}${month.slice(1)} 2026`, href: `#${month}`, current: index === 0 })) },
}
