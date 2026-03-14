import type { PropDef } from "../types";

export const props: PropDef[] = [
        {
            name: "children",
            type: "React.ReactNode",
            required: true,
            source: "react",
            status: "stable",
            description: "Label-teksten. Beskriv tilstanden som er på, f.eks. «Mørkt tema» eller «Varsler aktivert».",
        },
        {
            name: "checked",
            type: "boolean",
            required: false,
            source: "native",
            status: "stable",
            description: "Kontrollert av/på-tilstand.",
        },
        {
            name: "defaultChecked",
            type: "boolean",
            required: false,
            source: "native",
            status: "stable",
            default: "false",
            description: "Initiell tilstand for ukontrollert bruk.",
        },
        {
            name: "onChange",
            type: "React.ChangeEventHandler<HTMLInputElement>",
            required: false,
            source: "react",
            status: "stable",
            description: "Kalles umiddelbart når brukeren veksler bryteren. Utfør handlingen direkte her.",
        },
        {
            name: "disabled",
            type: "boolean",
            required: false,
            source: "native",
            status: "stable",
            default: "false",
            description: "Deaktiverer bryteren. Forklar alltid for brukeren hvorfor den er deaktivert.",
        },
        {
            name: "className",
            type: "string",
            required: false,
            source: "react",
            status: "stable",
            description: "Egendefinerte CSS-klasser.",
        },
    ];
