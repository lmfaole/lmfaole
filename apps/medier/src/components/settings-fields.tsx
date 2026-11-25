import { PendingButton } from "@lmfaole/designsystem/components/pending-button"
import { CheckboxList } from "@lmfaole/designsystem/components/checkbox-list"
import { ThemeChoice } from "@lmfaole/designsystem/components/appearance-settings"
import { FirstRun } from "@lmfaole/designsystem/components/first-run"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { TextField } from "@lmfaole/designsystem/components/text-field"
import type { Prefs } from "@lmfaole/designsystem/lib/preferences"
import type { ReactNode } from "react"

import { FROM_FIRST_RUN, FRONT_SECTIONS, shownSections, SOURCE_FIELD, type Step } from "../lib/settings-form"
import type { UsernameField } from "../lib/users"

/*
 * The fields of a visitor's settings, the same in the first-run wizard (`MedierFirstRun`) and on the subpages of «Innstillinger» (`SettingsForm`, `src/pages/innstillinger/`): native, so both work without JavaScript, and posted to
 * `/api/innstillinger/`. The effects and the tilt are chosen by their live examples, client components, so those two fields are islands that come in from the Astro page as slots
 * (`effectsField`, `tiltField`: the design system's `EffectsChoice` and `TiltChoice`), as does the offer to install. Each wizard step asks one thing.
 */

export function UsernameInput({ field }: { field: UsernameField }) {
  return <TextField name={field.name} label={field.label} optional autoComplete="off" {...(field.hint === undefined ? {} : { hint: field.hint })} {...(field.value === undefined ? {} : { value: field.value })} {...(field.error === undefined ? {} : { error: field.error })} />
}

export function SectionsField({ prefs }: { prefs: Prefs }) {
  const shown = shownSections(prefs)
  return (
    <>
      {/* Says the field was there, so none ticked is none shown (`formPrefs`). */}
      <input type="hidden" name="sections" value="" />
      <CheckboxList name="sections" legend="Seksjoner på forsiden" hint="Det du ikke krysser av, blir borte fra forsiden. Sidene Musikk, Film og TV er der uansett." values={[...shown]} options={FRONT_SECTIONS.map((section) => ({ ...section }))} />
    </>
  )
}

interface FieldsProps {
  /** The two username fields (`usernameFields`), with what the visitor has and the error of one that was not found. */
  lastfm: UsernameField
  trakt: UsernameField
  prefs: Prefs
  effectsField?: ReactNode
  tiltField?: ReactNode
}

/**
 * The wizard of the first visit, one question a step: what the site is, the two usernames, the front page, the theme, the effects, the tilt and the offer to install, in one form. The play mark beats on
 * its first step, once, and at «Ferdig» the check is drawn over it with `finishLabel` while the next page loads (design system, «Motion» §9).
 */
export function MedierFirstRun({ open, action, back, validateUrl, initialStep, install, ...fields }: FieldsProps & { open: boolean; action: string; back: string; validateUrl: string; initialStep?: Step | undefined; install?: ReactNode }) {
  const steps: { id: Step; title: string; description?: string; icon?: "music" | "listen" | "film" | "home" | "moon" | "bolt" | "phone" | "download"; content?: ReactNode }[] = [
    {
      id: "velkommen",
      title: "Velkommen til Medier",
      description: "Medier viser hva du hører på og ser, hentet fra Last.fm og Trakt: det som spilles nå, det du har sett, og en oppsummering av hver uke og måned. Noen få valg, så er du i gang. Alt kan endres senere under Innstillinger.",
      icon: "music",
      content: <input type="hidden" name={SOURCE_FIELD} value={FROM_FIRST_RUN} />,
    },
    { id: "lastfm", title: "Hvem er du på Last.fm?", description: "Vi henter avspillingene dine fra den offentlige profilen. La feltet stå tomt om du ikke bruker Last.fm.", icon: "listen", content: <UsernameInput field={fields.lastfm} /> },
    { id: "trakt", title: "Hvem er du på Trakt?", description: "Vi henter filmene og episodene du har sett. Profilen må være offentlig. La feltet stå tomt om du ikke bruker Trakt.", icon: "film", content: <UsernameInput field={fields.trakt} /> },
    { id: "forsiden", title: "Hva vil du se på forsiden?", icon: "home", content: <SectionsField prefs={fields.prefs} /> },
    { id: "tema", title: "Lyst eller mørkt?", icon: "moon", content: <ThemeChoice value={fields.prefs.theme} /> },
    {
      id: "effekter",
      title: "Med eller uten effekter?",
      description: "Medier tegner plater og bakgrunner i 3D. Velg uten om du vil ha det roligere eller spare strøm.",
      icon: "bolt",
      content: fields.effectsField,
    },
    { id: "lys", title: "Skal lyset følge telefonen?", description: "Trykk på et av eksemplene for å velge.", icon: "phone", content: fields.tiltField },
    {
      id: "installer",
      title: "Ha Medier på hjem-skjermen",
      description: "Medier kan installeres som en app og åpnes i et eget vindu, også uten nett. I Chrome og Edge finner du det i adressefeltet, på iPhone under Del og Legg til på Hjem-skjerm.",
      icon: "download",
      ...(install === undefined ? {} : { content: install }),
    },
  ]
  return <FirstRun open={open} title="Kom i gang med Medier" glyph="play" finishLabel="Klar til å lytte og se" action={action} back={back} validateUrl={validateUrl} steps={steps} {...(initialStep === undefined ? {} : { initialStep })} />
}

/** One subpage of «Innstillinger»: its own small form to `/api/innstillinger/`, back to the subpage (`?lagret=1`), and «Lagre» at the foot. */
export function SettingsForm({ action, back, children }: { action: string; back: string; children?: ReactNode }) {
  return (
    <form method="post" action={action}>
      <input type="hidden" name="back" value={back} />
      <Stack>
        {children}
        <PendingButton pendingLabel="Lagrer …">Lagre</PendingButton>
      </Stack>
    </form>
  )
}
