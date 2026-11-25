import type { Meta, StoryObj } from "@storybook/react-vite"

import { Logo } from "../../../src/components/logos"
import { square } from "../../sample"

const meta = {
  title: "Components/Media/Logo",
  component: Logo,
  tags: ["autodocs"],
  args: { name: "Studio", src: square(30, "S") },
  parameters: { docs: { description: { component: `### Use it when

one maker's or source's mark with a light plate so dark logos show.

### Do not use it when

decoration, or beside its own name in text (a screen reader would hear the name twice): for services with their names, use \`LogoList\`.

### Accessibility

**Handled by the component**

- The logo is an \`img\` with \`name\` as its \`alt\` and title ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))

**You check**

- \`name\` is the maker's or source's name, not «logo» ([1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content))

### Related

\`Logos\`, \`Picture\`` } }, },
} satisfies Meta<typeof Logo>
export default meta
type Story = StoryObj<typeof meta>

/** The light plate, so a dark logo shows. */
export const Plate: Story = {}
