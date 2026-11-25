import type { OnOff, Prefs, Theme } from "../lib/preferences"
import { ChoiceFieldset, type ChoiceOption } from "./internal/choice-fieldset"
import { EffectsPreview } from "./internal/effects-preview"
import { HapticsSetting } from "./internal/haptics-setting"
import { ThemeSample } from "./internal/theme-sample"
import { TiltPreview } from "./internal/tilt-preview"
import { PendingButton } from "./pending-button"
import { SettingsSection } from "./settings-section"

/*
 * The look of an app (theme, effects, the light and vibration), the same screen with the same words in every app. The radios keep the
 * names the apps' settings endpoints read (`theme`, `effects`, `tilt`, `back`), so only the UI moved here: the server action and the
 * `prefs` cookie stay the app's.
 */

const THEME_OPTIONS: readonly ChoiceOption[] = [
  { value: "system", label: "Som enheten", description: "Lyst om dagen og mørkt om kvelden, som enheten er stilt inn.", icon: "settings", preview: <ThemeSample theme="system" /> },
  { value: "light", label: "Lyst", icon: "sun", preview: <ThemeSample theme="light" /> },
  { value: "dark", label: "Mørkt", icon: "moon", preview: <ThemeSample theme="dark" /> },
]

const EFFECTS_OPTIONS: readonly ChoiceOption[] = [
  { value: "on", label: "Med effekter", description: "Bakgrunnen og bildene tegnes i 3D og følger lyset.", preview: <EffectsPreview mode="on" /> },
  { value: "off", label: "Uten effekter", description: "Flatt og stille. Bruker mindre strøm og passer om bevegelse er ubehagelig.", preview: <EffectsPreview mode="off" /> },
]

const TILT_OPTIONS: readonly ChoiceOption[] = [
  { value: "on", label: "Følg telefonen", description: "Vipp telefonen, så flytter lyset og skyggene seg. Telefonen kan spørre om lov først.", preview: <TiltPreview mode="follow" /> },
  { value: "off", label: "Fast lys", description: "Lyset følger pekeren, eller står stille.", preview: <TiltPreview mode="still" /> },
]

/** The theme as a choice of three pictures, «Tema» (`name="theme"`): for a first-run step. On a settings page it is part of `AppearanceSettings`. */
export function ThemeChoice({ value }: { value: Theme }) {
  return <ChoiceFieldset name="theme" legend="Tema" value={value} options={THEME_OPTIONS} />
}

/** The effects, live and flat, «Effekter» (`name="effects"`): for a first-run step. On a settings page it is part of `AppearanceSettings`. */
export function EffectsChoice({ value }: { value: OnOff }) {
  return <ChoiceFieldset name="effects" legend="Effekter" value={value} options={EFFECTS_OPTIONS} />
}

/** The light, following the phone or still, «Lyset» (`name="tilt"`): for a first-run step. On a settings page it is part of `AppearanceSettings`. */
export function TiltChoice({ value }: { value: OnOff }) {
  return <ChoiceFieldset name="tilt" legend="Lyset" value={value} options={TILT_OPTIONS} />
}

/**
 * The appearance subpage («Innstillinger › Utseende»), whole: «Tema», «Effekter» (with «Vibrasjon») and «Lyset», each a section
 * with the choices as pictures, in one form to the app's settings endpoint (`action`) that comes back to `back`, and «Lagre» last.
 * `prefs` is what is chosen now (the `prefs` cookie, `parsePrefs`). The fields are `theme`, `effects`, `tilt` and `back`, as before;
 * vibration is kept in the browser and sends nothing. Works without JavaScript; the live pictures and the tilt's question to the
 * phone need it (in Astro: `client:visible`).
 */
export function AppearanceSettings({ prefs, action, back }: { prefs: Pick<Prefs, "theme" | "effects" | "tilt">; action: string; back: string }) {
  return (
    <form method="post" action={action} className="grid gap-8">
      <input type="hidden" name="back" value={back} />
      <SettingsSection id="tema" title="Tema" description="Lyst, mørkt, eller som enheten.">
        <ChoiceFieldset name="theme" legend="Tema" legendHidden value={prefs.theme} options={THEME_OPTIONS} />
      </SettingsSection>
      <SettingsSection id="effekter" title="Effekter" description="Bakgrunnen og bildene kan tegnes i 3D og følge lyset.">
        <ChoiceFieldset name="effects" legend="Effekter" legendHidden value={prefs.effects} options={EFFECTS_OPTIONS} />
        <HapticsSetting />
      </SettingsSection>
      <SettingsSection id="lys" title="Lyset" description="Når du vipper telefonen, flytter lyset og skyggene seg.">
        <ChoiceFieldset name="tilt" legend="Lyset" legendHidden value={prefs.tilt} options={TILT_OPTIONS} />
      </SettingsSection>
      <div>
        <PendingButton pendingLabel="Lagrer …">Lagre</PendingButton>
      </div>
    </form>
  )
}
