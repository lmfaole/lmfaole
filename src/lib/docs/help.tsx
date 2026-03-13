import React from "react";
import { Help } from "@fremtind/jokul/help";
import type { ComponentDoc } from "./types";

function BasicHelpPreview() {
    return (
        <div style={{ padding: "var(--jkl-spacing-xl) 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--jkl-spacing-s)" }}>
                <span>Personnummer</span>
                <Help buttonText="Hjelp om personnummer" position="right">
                    Personnummeret ditt er et 11-sifret nummer som identifiserer deg i offentlige registre.
                </Help>
            </div>
        </div>
    );
}

function PositionsPreview() {
    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--jkl-spacing-xl)",
                padding: "var(--jkl-spacing-xl)",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Help buttonText="Hjelp øverst" position="top">
                Popover vises over knappen.
            </Help>
            <Help buttonText="Hjelp nederst" position="bottom">
                Popover vises under knappen.
            </Help>
            <Help buttonText="Hjelp til venstre" position="left">
                Popover vises til venstre.
            </Help>
            <Help buttonText="Hjelp til høyre" position="right">
                Popover vises til høyre.
            </Help>
        </div>
    );
}

function LongContentPreview() {
    return (
        <div style={{ padding: "var(--jkl-spacing-xl) 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--jkl-spacing-s)" }}>
                <span>Hva er en fullmakt?</span>
                <Help buttonText="Forklaring av fullmakt" position="bottom">
                    En fullmakt er et dokument som gir en person rett til å handle på vegne av en annen. Fullmakten kan
                    være generell eller begrenset til spesifikke handlinger, og kan trekkes tilbake når som helst.
                </Help>
            </div>
        </div>
    );
}

const doc: ComponentDoc = {
    id: "help",
    name: "Help",
    package: "@fremtind/jokul/help",
    category: "Skjema",
    tags: ["hjelp", "popover", "tooltip", "informasjon", "kontekstuell"],
    status: "stable",
    description:
        "Help viser en liten ?-knapp som åpner en flytenede hjelpetekst i et popover. Brukes til å gi kontekstuell hjelp ved skjemafelt uten å ta opp permanent plass i grensesnittet.",
    notes:
        "Help rendres som en knapp — ikke legg den inne i et annet interaktivt element. Bruk buttonText for en tilgjengelig skjermlesertekst.",
    props: [
        {
            name: "buttonText",
            type: "string",
            required: true,
            description: "Tilgjengelig label for ?-knappen (leses av skjermlesere).",
        },
        {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: "Innholdet som vises i popoveret.",
        },
        {
            name: "position",
            type: '"top" | "bottom" | "left" | "right"',
            required: false,
            default: '"top"',
            description: "Hvilken side popoveret åpner på.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende bruk",
            description: "Plasser Help ved siden av et felt for å gi kontekstuell hjelp.",
            code: `import { Help } from "@fremtind/jokul/help";

<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <span>Personnummer</span>
    <Help buttonText="Hjelp om personnummer" position="right">
        Personnummeret ditt er et 11-sifret nummer som identifiserer deg i offentlige registre.
    </Help>
</div>`,
            preview: <BasicHelpPreview />,
        },
        {
            title: "Popover-posisjon",
            description: "Velg hvilken side popoveret åpner på med position-prop.",
            code: `import { Help } from "@fremtind/jokul/help";

<Help buttonText="Hjelp øverst" position="top">Popover vises over knappen.</Help>
<Help buttonText="Hjelp nederst" position="bottom">Popover vises under knappen.</Help>
<Help buttonText="Hjelp til venstre" position="left">Popover vises til venstre.</Help>
<Help buttonText="Hjelp til høyre" position="right">Popover vises til høyre.</Help>`,
            preview: <PositionsPreview />,
        },
        {
            title: "Langt innhold",
            description: "Popoveret kan inneholde lengre forklaringstekst.",
            code: `import { Help } from "@fremtind/jokul/help";

<Help buttonText="Forklaring av fullmakt" position="bottom">
    En fullmakt er et dokument som gir en person rett til å handle på vegne av en annen.
    Fullmakten kan være generell eller begrenset til spesifikke handlinger.
</Help>`,
            preview: <LongContentPreview />,
        },
    ],
    relatedIds: ["tooltip", "popover", "input-group"],
};

export default doc;
