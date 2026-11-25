import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChoiceCards } from "../../../src/components/choice-cards"

const meta = {
  title: "Components/Forms/ChoiceCards",
  component: ChoiceCards,
  tags: ["autodocs"],
  args: {
    name: "theme",
    legend: "Tema",
    value: "system",
    options: [
      { value: "system", label: "Som enheten", description: "Lys om dagen og mørk om kvelden, om enheten gjør det.", icon: "device" },
      { value: "light", label: "Lys", icon: "sun" },
      { value: "dark", label: "Mørk", icon: "moon" },
    ],
  },
  parameters: { docs: { description: { component: `### Use it when

a setting has two to five values, each worth a word and a sentence: where to start, what to see first. The whole card is the label, so the target is large.

Choices about how the app looks (theme, effects, the light) are not made here: they are \`ThemeChoice\`, \`EffectsChoice\` and \`TiltChoice\`, and on a settings page \`AppearanceSettings\`, with the pictures drawn in.

### Do not use it when

there are many values (use \`NativeSelect\`), or more than one may be chosen (use \`CheckboxList\`), or the choice acts at once without a form (use \`FilterChips\`), or it is the theme, the effects or the light (use \`AppearanceSettings\`, or \`ThemeChoice\`, \`EffectsChoice\`, \`TiltChoice\` in a first run).

### Accessibility

**Handled by the component**

- Native radio buttons in a \`<fieldset>\` with its \`<legend>\`: the group and its name are read, and the arrow keys move between the choices ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships))
- The chosen card is marked by its border, a ring, and the radio itself, never by colour alone ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color))
- An error is in words with a symbol, tied to the group with \`aria-describedby\` ([3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification))

**You check**

- One is chosen from the start (\`value\`), unless no choice is a real answer.

### Content

The label is the value in a word or two («Lys», «Mørk»); the description says what it does, in one sentence.

### Related

\`CheckboxList\`, \`NativeSelect\`, \`AppearanceSettings\`, \`SettingsSection\`, \`FirstRun\`` } } },
} satisfies Meta<typeof ChoiceCards>
export default meta
type Story = StoryObj<typeof meta>

/** The theme, by name and symbol. */
export const Default: Story = {}

/** What the server said was wrong. */
export const WithError: Story = {
  args: {
    name: "start",
    legend: "Hva vil du se først?",
    value: undefined,
    hint: "Du kan endre det senere i innstillingene.",
    error: "Velg hva du vil se først",
    options: [
      { value: "weather", label: "Været", icon: "weather" },
      { value: "transport", label: "Avganger", icon: "bus" },
    ],
  },
}
