import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "children", type: "ReactNode | ReactNode[]", required: true, source: "custom", status: "experimental", description: "Innholdet i nedtrekksmenyen — typisk <option>-elementer." },
        { name: "label", type: "string", required: true, source: "custom", status: "experimental", description: "Synlig label over nedtrekksmenyen." },
        { name: "placeholder", type: "string", required: false, source: "custom", status: "experimental", default: '"Velg"', description: "Plassholdertekst som vises når ingenting er valgt." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "experimental", description: "Feilmelding vist under feltet." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "experimental", description: "Hjelpetekst vist under feltet." },
        { name: "value", type: "string", required: false, source: "native", status: "experimental", description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "ChangeEvent<HTMLSelectElement>", required: false, source: "react", status: "experimental", description: "Standard React onChange — merk: ikke SelectChangeEventHandler som i stabil Select." },
        { name: "name", type: "string", required: false, source: "native", status: "experimental", description: "Skjemafeltets navn." },
        { name: "disabled", type: "boolean", required: false, source: "native", status: "experimental", description: "Deaktiverer feltet." },
    ];
