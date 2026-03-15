import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "label", type: "string", required: false, source: "custom", status: "stable", default: '"Søk"', description: "Tilgjengelig label." },
        { name: "labelProps", type: 'Omit<LabelProps, "children">', required: false, source: "custom", status: "stable", description: 'Egenskaper for label-elementet. Sett srOnly: false for å vise labelen visuelt — den er skjult for seende brukere som standard.' },
        { name: "placeholder", type: "string", required: false, source: "native", status: "stable", description: "Plassholdertekst." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved endring." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Kontrollert verdi." },
    ];
