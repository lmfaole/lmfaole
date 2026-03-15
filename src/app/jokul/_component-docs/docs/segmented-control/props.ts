import type { PropDef } from "../types";

export const props: PropDef[] = [
        { name: "legend", type: "string", required: true, source: "custom", status: "stable", description: "Tilgjengelig gruppenavn." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "SegmentedControlButton-elementer." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved valg." },
    ];
