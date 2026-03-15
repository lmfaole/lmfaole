import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innhold i panelet." },
        { name: "name", type: "string", required: true, source: "native", status: "stable", description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien ved innsending." },
        { name: "checked", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Kontrollert tilstand." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved endring." },
    ];
