import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";
import { HelpPreview } from "./preview";

const doc: ComponentDoc = {
    id: "help",
    name: "Help",
    package: "@fremtind/jokul/help",
    category: "Overlegg",
    status: "stable",
    description:
        "Help viser en liten ?-knapp som åpner en flytenede hjelpetekst i et popover. Brukes til å gi kontekstuell hjelp ved skjemafelt uten å ta opp permanent plass i grensesnittet.",
    warnings:
        "Help rendres som en knapp — ikke legg den inne i et annet interaktivt element. Bruk buttonText for en tilgjengelig skjermlesertekst.",
    preview: <HelpPreview />,

    relationships: {
        related: [{ id: "tooltip", description: "Tooltip viser et kort ikke-interaktivt hint; Help gir et avvisbart panel med fyldigere veiledningstext." }, { id: "popover", description: "Help er bygget på Popover og deler den samme flytende posisjoneringssett." }, { id: "input-group", description: "Fest Help til en InputGroup for å gi kontekstuell veiledning uten å rote til feltets etikett." }],
    },
    props,
    migrations,
};

export default doc;
