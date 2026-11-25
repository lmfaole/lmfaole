import type { IconName } from "../lib/icons"
import { ChoiceFieldset } from "./internal/choice-fieldset"

export type ChoiceCardOption = {
  value: string
  label: string
  description?: string
  icon?: IconName
}

/**
 * One choice of a few in a form, as native radio buttons on cards: the whole card is the label, so it is a large target, and the
 * chosen one is marked by its border, a ring and the radio itself, never by colour alone. For a setting with two to five values that
 * are worth a word each; a long list is a `NativeSelect`, several of N a `CheckboxList`. `value` is the one chosen when the page is
 * drawn. Works without JavaScript; the arrow keys move between the choices as in any radio group. `error` is the server's word, as in
 * `TextField`. The look is fixed: a card per option, under each other. Theme, effects and tilt are not built with it in an app: they
 * are `AppearanceSettings` (and `ThemeChoice`, `EffectsChoice`, `TiltChoice` for a first-run step), with the pictures to choose by.
 */
export function ChoiceCards({ name, legend, value, options, hint, error }: { name: string; legend: string; value?: string; options: readonly ChoiceCardOption[]; hint?: string; error?: string }) {
  return <ChoiceFieldset name={name} legend={legend} options={options} {...(value === undefined ? {} : { value })} {...(hint === undefined ? {} : { hint })} {...(error === undefined ? {} : { error })} />
}
