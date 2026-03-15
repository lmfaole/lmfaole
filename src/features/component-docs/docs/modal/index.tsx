import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function ModalPreview() {
    return (
        <div style={{ border: "1px solid var(--jkl-color-border-default, #ccc)", borderRadius: 4, padding: "16px", maxWidth: 280, width: "100%" }}>
            <Flex direction="column" gap="s">
                <strong>Bekreft handling</strong>
                <p style={{ margin: 0, fontSize: "0.9em" }}>Er du sikker på at du vil fortsette?</p>
                <Flex gap="xs">
                    <Button>Bekreft</Button>
                    <Button variant="secondary">Avbryt</Button>
                </Flex>
            </Flex>
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
};

export default doc;
