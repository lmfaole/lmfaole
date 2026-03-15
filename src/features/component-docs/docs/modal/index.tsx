import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

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

        props,
    examples,
    tokens: ["colors", "spacing", "motion", "border-radius"],
};

export default doc;
