import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function ModalPreview() {
    return (
        <div style={{ border: "1px solid var(--jkl-color-border-default, #ccc)", borderRadius: 4, padding: "16px", maxWidth: 280, width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <strong>Bekreft handling</strong>
            <p style={{ margin: 0, fontSize: "0.9em" }}>Er du sikker på at du vil fortsette?</p>
            <div style={{ display: "flex", gap: 8 }}>
                <Button>Bekreft</Button>
                <Button variant="secondary">Avbryt</Button>
            </div>
        </div>
    );
}

const doc: ComponentDoc = {
    id: "modal",
    name: "Modal",
    package: "@fremtind/jokul/modal",
    category: "Overlegg",
    status: "stable",
    description:
        "Modal er en dialogboks som vises over resten av innholdet. Den brukes til å be om bekreftelse, vise viktig informasjon eller samle inn data uten å navigere bort fra siden.",
    warnings: [
        "Krev useModal()-hooken for å sette opp instansen og spre trigger- og dialog-props korrekt.",
        "Bruk role='alertdialog' hvis brukeren ikke skal kunne lukke dialogen med Escape eller klikk utenfor.",
    ],

    preview: <ModalPreview />,
        props,
    examples
};

export default doc;
