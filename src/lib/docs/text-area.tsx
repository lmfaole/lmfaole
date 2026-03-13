import React, { useState, useEffect } from "react";
import { TextArea } from "@fremtind/jokul/text-area";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function TextAreaPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");
    const text = "Bilen min ble skadet i et trafikkuhell 15. mars. Jeg ønsker å melde inn en skade.";

    useEffect(() => {
        if (!isHovered) { setValue(""); return; }
        let i = 0;
        const id = setInterval(() => {
            i++;
            setValue(text.slice(0, i));
            if (i >= text.length) clearInterval(id);
        }, 80);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <TextArea
            label="Beskriv hendelsen"
            value={value}
            onChange={() => {}}
            rows={4}
        />
    );
}

const doc: ComponentDoc = {
    id: "text-area",
    name: "TextArea",
    package: "@fremtind/jokul/text-area",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging"],
    description: "TextArea er et flerlinjers tekstinputfelt for lengre tekstinnhold.",
    relatedIds: ["text-input"],
    preview: <TextAreaPreview />,
    props: [
        { name: "label", type: "React.ReactNode", required: true, source: "custom", status: "stable", description: "Synlig label over tekstfeltet." },
        { name: "rows", type: "number", required: false, source: "native", status: "stable", default: "4", description: "Antall synlige linjer." },
        { name: "autoExpand", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Feltet vokser med innholdet." },
        { name: "counter", type: "{ maxLength: number; hideProgress?: boolean }", required: false, source: "custom", status: "stable", description: "Tegngrense med visuell teller." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "stable", description: "Feilmelding." },
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
            tags: ["error-state"],
            preview: <TextArea label="Begrunnelse" errorLabel="Beskriv hendelsen med minst 20 tegn" rows={3} />,
        },
    ],
};

export default doc;
