import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "label", type: "string", required: true, source: "custom", status: "stable", description: "Synlig label over inputfeltet." },
        { name: "labelProps", type: 'Omit<LabelProps, "children" | "htmlFor" | "standAlone">', required: false, source: "custom", status: "stable", description: "Egenskaper for label-elementet. Bruk f.eks. srOnly: true for å skjule labelen visuelt men beholde tilgjengelighet." },
        { name: "suggestions", type: "string[]", required: true, source: "custom", status: "stable", description: "Liste over forslag som vises under feltet." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Kontrollert verdi." },
        { name: "onChange", type: "(value: string) => void", required: false, source: "react", status: "stable", description: "Kalles ved endring i inputverdien." },
        { name: "onSelect", type: "(value: string) => void", required: false, source: "react", status: "stable", description: "Kalles når brukeren velger et forslag." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst vist under label." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "stable", description: "Feilmelding vist under feltet." },
        { name: "noSuggestionsText", type: "string", required: false, source: "custom", status: "stable", description: "Tekst vist når ingen forslag matcher." },
        { name: "leadText", type: "string", required: false, source: "custom", status: "deprecated", statusDescription: "Bruk helpLabel, eller flytt teksten over skjemafeltets label.", description: "Tekst over inputfeltet." },
        { name: "noHitsMessage", type: "React.ReactNode", required: false, source: "custom", status: "deprecated", statusDescription: "Bruk noHits med text og evt. defaultverdier for items.", description: "Melding vist når ingen forslag matcher (gammel API)." },
    ];
