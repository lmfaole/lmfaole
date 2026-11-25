import { InstallPrompt } from "./install-prompt"
import { SourceList, type Source } from "./internal/source-list"
import { SettingsSection } from "./settings-section"
import { Text } from "./text"
import { Button } from "./button"

export type { Source }

/*
 * The parts of «Innstillinger» every app has, with the same words in every app: installing the app, the first-run introduction once
 * more, and where the data comes from. The server actions, the `seen` cookie and the field names (`back`, `rerun`) stay the app's.
 */

/**
 * «Installer»: the offer to install the app (`InstallPrompt`, recorded as `install-settings` in the `seen` cookie under
 * `cookiePath`), and the way by hand where the browser has no button. The app subpage («Innstillinger › App»). It needs the browser
 * (in Astro: `client:idle`).
 */
export function InstallSettings({ appName, cookiePath }: { appName: string; cookiePath: string }) {
  return (
    <SettingsSection id="installer" title="Installer" description={`${appName} kan legges på hjemskjermen og åpnes i eget vindu, også uten nett.`}>
      <InstallPrompt appName={appName} seen={false} cookiePath={cookiePath} id="install-settings" />
      <Text role="quiet">Ser du ingen knapp, kan du legge den til fra nettleserens meny («Legg til på Hjem-skjerm» eller «Installer»).</Text>
    </SettingsSection>
  )
}

/**
 * «Introen»: «Vis introen igjen», a form to the app's settings endpoint (`action`) with `rerun=1`, which takes the first run out of
 * the `seen` cookie and sends the reader to `back` (the front page), where the wizard opens. On the overview, under `SubPages`, and on
 * the app subpage.
 */
export function IntroSettings({ action, back }: { action: string; back: string }) {
  return (
    <SettingsSection id="intro" title="Introen" description="Gå gjennom de første valgene igjen, ett om gangen. Den åpner seg på forsiden.">
      <form method="post" action={action}>
        <input type="hidden" name="back" value={back} />
        <input type="hidden" name="rerun" value="1" />
        <Button type="submit">
          Vis introen igjen
        </Button>
      </form>
    </SettingsSection>
  )
}

/**
 * «Kilder»: where the app's data comes from, said once, last on the overview rather than on every page that uses it. Each source with
 * its mark, its name linking to it, what the app gets from it, and the credit its terms ask for.
 */
export function SourcesSettings({ sources }: { sources: readonly Source[] }) {
  return (
    <SettingsSection id="kilder" title="Kilder" description="Hvor dataene kommer fra, hva hver kilde gir, og det kildene ber oss si.">
      <SourceList sources={sources} />
    </SettingsSection>
  )
}
