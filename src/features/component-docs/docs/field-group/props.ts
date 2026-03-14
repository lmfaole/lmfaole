import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "legend", type: "string", required: true, source: "custom", status: "stable", description: "Overskrift for gruppen." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Skjemaelementer i gruppen." },
        { name: "errorLabel", type: "string", required: false, source: "react", status: "stable", description: "Feilmelding for hele gruppen." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst for hele gruppen." },
    ];
