import { FirstRun } from "@lmfaole/designsystem/components/first-run"
import { FirstRunEnhancer } from "@lmfaole/designsystem/components/first-run-enhancer"
import { InstallPrompt } from "@lmfaole/designsystem/components/install-prompt"
import { Text } from "@lmfaole/designsystem/components/text"
import { EffectsChoice, ThemeChoice, TiltChoice } from "@lmfaole/designsystem/components/appearance-settings"
import { cookies } from "next/headers"

import { parsePosition, POSITION_COOKIE } from "../lib/position"
import { FIRST_RUN, SETTINGS_ENDPOINT } from "../lib/settings"
import { firstRunOpen, SEEN_PATH, settingsState } from "../lib/visitor"
import { settingsFields } from "./settings-fields"

/**
 * The first visit's introduction over whichever page it lands on: drawn open by the server until the visitor has finished or skipped
 * it (`first-run@1` in `seen`), and again at the step a submission without JavaScript failed at. One form to the settings endpoint,
 * which goes back to the page it was sent from (`back` is left empty: the server has no URL for the page, so the endpoint uses the referrer).
 */
export async function FirstRunWizard() {
  if (!(await firstRunOpen())) return null
  const [state, position] = await Promise.all([settingsState(), cookies().then((jar) => parsePosition(jar.get(POSITION_COOKIE)?.value))])
  const fields = settingsFields({ ...state, position })
  return (
    <>
      <FirstRun
        open
        title="Kom i gang med Startside"
        glyph="sunrise"
        finishLabel="Klar for dagen"
        action={SETTINGS_ENDPOINT}
        back=""
        validateUrl={SETTINGS_ENDPOINT}
        initialStep={state.problems?.step}
        steps={[
          {
            id: "welcome",
            title: "Velkommen til Startside",
            description: "Det som venter på deg på GitHub, avgangene nær deg og været, samlet på én side. Noen korte valg, så er den din. Alt kan endres senere under Innstillinger.",
            icon: "home",
            content: <input type="hidden" name="kilde" value={FIRST_RUN} />,
          },
          { id: "github", title: "Hvem er du på GitHub?", description: "Startside henter pull requests, issues og discussions for brukernavnet. Bare det som er offentlig.", icon: "person", content: fields.github },
          { id: "repos", title: "Hvilke repoer følger du?", description: "Nye issues og discussions fra disse vises på forsiden, også når du ikke er med i dem.", icon: "branch", content: fields.repos },
          { id: "position", title: "Hvor er du?", description: "Posisjonen gir avganger fra holdeplassene nær deg og været der du er.", icon: "place", content: fields.position },
          { id: "sections", title: "Hva skal forsiden vise?", description: "Velg delene du vil se. Resten finner du fortsatt i menyen.", icon: "home", content: fields.sections },
          { id: "theme", title: "Lyst eller mørkt?", icon: "sun", content: <ThemeChoice value={state.prefs.theme} /> },
          { id: "effects", title: "Vil du ha effekter?", description: "Bakgrunnen og bildene kan tegnes i 3D og følge lyset. Slå det av for en flat og stille side som bruker mindre strøm.", icon: "idea", content: <EffectsChoice value={state.prefs.effects} /> },
          { id: "tilt", title: "Skal lyset følge telefonen?", description: "Når du vipper telefonen, flytter lyset og skyggene seg. På en datamaskin følger lyset pekeren.", icon: "phone", content: <TiltChoice value={state.prefs.tilt} /> },
          {
            id: "install",
            title: "Legg den på hjemskjermen",
            description: "Startside fungerer som en app: den åpner seg i eget vindu og viser det sist hentede når du er uten nett.",
            icon: "download",
            content: (
              <>
                <InstallPrompt appName="Startside" seen={false} cookiePath={SEEN_PATH} id="install-first-run" />
                <Text role="quiet">Ser du ingen knapp, kan du legge den til fra nettleserens meny («Legg til på Hjem-skjerm» eller «Installer»). Trykk «Ferdig» for å begynne.</Text>
              </>
            ),
          },
        ]}
      />
      <FirstRunEnhancer />
    </>
  )
}
