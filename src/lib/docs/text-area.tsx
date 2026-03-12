import React from "react";
import { TextArea } from "@fremtind/jokul/text-area";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "text-area",
    name: "TextArea",
    package: "@fremtind/jokul/text-area",
    category: "Skjema",
    description: "TextArea er et flerlinjers tekstinputfelt for lengre tekstinnhold.",
    notes: "Bruk autoExpand for å la feltet vokse automatisk med innholdet.",
    relatedIds: ["text-input"],
    props: [
        { name: "label", type: "React.ReactNode", required: true, description: "Synlig label over tekstfeltet." },
        { name: "rows", type: "number", required: false, default: "4", description: "Antall synlige linjer." },
        { name: "autoExpand", type: "boolean", required: false, description: "Feltet vokser med innholdet." },
        { name: "counter", type: "{ maxLength: number; hideProgress?: boolean }", required: false, description: "Tegngrense med visuell teller." },
        { name: "helpLabel", type: "string", required: false, description: "Hjelpetekst." },
        { name: "errorLabel", type: "string", required: false, description: "Feilmelding." },
    ],
    examples: [
        {
            title: "Grunnleggende tekstfelt",
            description: "Et enkelt flerlinjers tekstfelt.",
            code: `<TextArea label="Beskriv skaden" rows={4} helpLabel="Vær så detaljert som mulig" />`,
            preview: <TextArea label="Beskriv skaden" rows={4} helpLabel="Vær så detaljert som mulig" />,
        },
        {
            title: "Med tegngrense",
            description: "Bruk counter for å begrense og vise antall tegn.",
            code: `<TextArea
    label="Kommentar"
    counter={{ maxLength: 200 }}
    rows={3}
/>`,
            preview: <TextArea label="Kommentar" counter={{ maxLength: 200 }} rows={3} />,
        },
        {
            title: "Auto-utvidende felt",
            description: "autoExpand gjør at feltet vokser med innholdet — ingen synlig scrollebar.",
            code: `<TextArea
    label="Skadbeskrivelse"
    autoExpand
    helpLabel="Feltet vokser automatisk når du skriver"
    rows={2}
/>`,
            preview: <TextArea label="Skadbeskrivelse" autoExpand helpLabel="Feltet vokser automatisk når du skriver" rows={2} />,
        },
        {
            title: "Med feilmelding",
            description: "errorLabel vises i stedet for helpLabel og markerer feltet som ugyldig.",
            code: `<TextArea
    label="Begrunnelse"
    errorLabel="Beskriv hendelsen med minst 20 tegn"
    rows={3}
/>`,
            preview: <TextArea label="Begrunnelse" errorLabel="Beskriv hendelsen med minst 20 tegn" rows={3} />,
        },
    ],
};

export default doc;
