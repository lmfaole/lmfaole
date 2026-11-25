import { CheckboxList } from "@lmfaole/designsystem/components/checkbox-list"
import { ListField } from "@lmfaole/designsystem/components/list-field"
import { Text } from "@lmfaole/designsystem/components/text"
import { TextField } from "@lmfaole/designsystem/components/text-field"
import type { Prefs } from "@lmfaole/designsystem/lib/preferences"
import type { ReactNode } from "react"

import { formatPosition, type Position } from "../lib/position"
import { MAX_REPOS, SECTION_OPTIONS, type Problems } from "../lib/settings"
import { PositionPermission } from "./position"

export type SettingsState = { user: string | null; repos: string[]; prefs: Prefs; problems: Problems | null; position: Position | null; /** A place searched for and chosen, in place of the device's position. */ place?: string | null }

/**
 * The fields the first-run wizard and the settings page share, one per choice, each as it was chosen (or the suggestion), with what
 * the server said about a failed submission. Plain form fields: the same form posts them all to the settings endpoint.
 */
export function settingsFields({ user, repos, prefs, problems, position, place = null }: SettingsState): Record<"github" | "repos" | "position" | "sections", ReactNode> {
  return {
    github: (
      <TextField
        label="GitHub-brukernavn"
        name="github"
        hint="Bare offentlige data hentes. La feltet stå tomt for å ikke vise GitHub."
        error={problems?.errors.github}
        value={problems?.values.github ?? user ?? ""}
        autoComplete="username"
        placeholder="octocat"
        optional
      />
    ),
    repos: (
      <ListField
        label="Repoer du følger"
        name="repos"
        values={problems?.values.repos === undefined ? repos : problems.values.repos.split("\n")}
        hint={`Ett per linje, som eier/navn. Bare offentlige repoer, høyst ${MAX_REPOS}. Nye issues og discussions derfra vises på forsiden.`}
        error={problems?.errors.repos}
        placeholder="vercel/next.js"
        optional
      />
    ),
    position: (
      <>
        <PositionPermission
          current={position}
          title="Avganger og vær der du er"
          description="Del posisjonen for å finne holdeplassene nærmest deg og været der du er. Den rundes av og lagres bare i en informasjonskapsel i denne nettleseren."
          fallback={<Text role="quiet">Uten posisjon brukes standardstedet. Du kan dele den senere, eller søke opp et sted under Innstillinger › Posisjon.</Text>}
        />
        {position === null ? null : place !== null ? <Text role="quiet">Siden bruker {place}, som du valgte selv. Posisjonen til enheten brukes ikke.</Text> : <Text role="quiet">Posisjonen din er delt ({formatPosition(position)}). Du kan oppdatere den fra Transport eller Vær.</Text>}
      </>
    ),
    sections: (
      <>
        <input type="hidden" name="sections-shown" value="1" />
        <CheckboxList name="sections" legend="Vis på forsiden" values={prefs.sections ?? SECTION_OPTIONS.map((option) => option.value)} options={SECTION_OPTIONS} hint="Forsiden viser dem når de passer tiden på døgnet." />
      </>
    ),
  }
}
