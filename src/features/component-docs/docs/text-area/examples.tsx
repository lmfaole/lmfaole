import { useState, useEffect } from "react";
import { TextArea } from "@fremtind/jokul/text-area";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
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
            }
];
