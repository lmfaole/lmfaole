import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "label", type: "React.ReactNode", required: true, source: "custom", status: "stable", description: "Synlig label over tekstfeltet." },
        { name: "rows", type: "number", required: false, source: "native", status: "stable", default: "4", description: "Antall synlige linjer." },
        { name: "autoExpand", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Feltet vokser med innholdet." },
        { name: "counter", type: "{ maxLength: number; hideProgress?: boolean }", required: false, source: "custom", status: "stable", description: "Tegngrense med visuell teller." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "stable", description: "Feilmelding." },
    ];
