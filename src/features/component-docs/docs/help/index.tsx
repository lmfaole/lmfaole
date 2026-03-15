import { Help } from "@fremtind/jokul/help";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

function HelpPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Help buttonText="Hjelp om personnummer" position={isHovered ? "right" : "top"}>
            Personnummeret ditt er et 11-sifret nummer.
        </Help>
    );
}

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
    examples,
    migrations,
};

export default doc;
