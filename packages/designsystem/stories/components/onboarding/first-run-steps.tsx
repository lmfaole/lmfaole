import { EffectsChoice, ThemeChoice, TiltChoice } from "../../../src/components/appearance-settings"
import { CheckboxList } from "../../../src/components/checkbox-list"
import type { FirstRunStep } from "../../../src/components/first-run"
import { InstallPrompt } from "../../../src/components/install-prompt"
import { ListField } from "../../../src/components/list-field"
import { TextField } from "../../../src/components/text-field"

/** The fields of the start page's settings, shared by the wizard and the settings page of the stories. */
export const fields = {
  github: (error?: string) => <TextField label="GitHub-brukernavn" name="github" hint="Bare offentlige data vises." placeholder="octocat" autoComplete="username" value="lmfaole" {...(error === undefined ? {} : { error })} />,
  repos: () => <ListField label="Repoer du følger" name="repos" hint="Ett per linje, som eier/navn. Bare offentlige repoer, høyst 20." values={["withastro/astro", "vercel/next.js"]} placeholder="eier/navn" />,
  sections: () => (
    <CheckboxList
      name="sections"
      legend="Deler av forsiden"
      values={["weather", "transport", "github"]}
      options={[
        { value: "weather", label: "Været", description: "Akkurat nå og de neste timene." },
        { value: "transport", label: "Avganger", description: "Fra holdeplassene nær deg." },
        { value: "github", label: "GitHub", description: "Det som har skjedd i repoene du følger." },
      ]}
    />
  ),
  theme: () => <ThemeChoice value="system" />,
  effects: () => <EffectsChoice value="on" />,
  tilt: () => <TiltChoice value="off" />,
}

export const steps = (errors: { github?: string } = {}): FirstRunStep[] => [
  { id: "velkommen", icon: "home", title: "Velkommen til Startside", description: "Noen få valg, så blir forsiden din. Alt kan endres senere under Innstillinger." },
  { id: "github", icon: "person", title: "Hvem er du på GitHub?", description: "Vi henter bare det som er offentlig.", content: fields.github(errors.github) },
  { id: "repoer", icon: "repository", title: "Hvilke repoer vil du følge?", content: fields.repos() },
  { id: "forside", icon: "view", title: "Hva skal stå på forsiden?", content: fields.sections() },
  { id: "tema", icon: "sun", title: "Lyst eller mørkt?", content: fields.theme() },
  { id: "effekter", icon: "idea", title: "Effekter", description: "Bilder og bakgrunner kan tegnes i 3D og følge lyset. Velg det som ser best ut for deg.", content: fields.effects() },
  { id: "bevegelse", icon: "device", title: "Skal lyset følge telefonen?", description: "På en telefon kan lyset i bildene følge hvordan du holder den.", content: fields.tilt() },
  { id: "installer", icon: "download", title: "Legg Startside på hjemskjermen", description: "Da åpner den som en app, uten nettleserens knapper.", content: <InstallPrompt appName="Startside" seen={false} cookiePath="/" preview="install" /> },
]
