import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien som sendes ved innsending." },
        { name: "name", type: "string", required: true, source: "native", status: "stable", description: "Skjemafeltets navn (felles for gruppen)." },
        { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Innhold i panelet." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved valg." },
    ];
