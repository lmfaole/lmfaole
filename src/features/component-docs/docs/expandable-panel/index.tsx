import { useState, useEffect } from "react";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionListContactPreview } from "../description-list/examples";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "expandable-panel",
    name: "Expandable Panel",
    package: "@fremtind/jokul/expander",
    category: "Visning",
    tags: ["panel", "interaktiv", "animasjon", "tilgjengelighet"],
    description: "ExpandablePanel er et utviddbart panel med header og innhold.",

    relatedIds: ["expander"],

    props,
    subComponents: [
        {
            name: "ExpandablePanel.Header",
            description: "Klikkbar header som viser/skjuler innholdet. Rendres som en knapp.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tittelinnholdet i headeren." },
                { name: "icon", type: "React.ReactNode", required: false, source: "custom", status: "stable", description: "Egendefinert ikon i stedet for standard chevron." },
            ],
        },
        {
            name: "ExpandablePanel.Content",
            description: "Innholdsområdet som vises og skjules.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innholdet som vises når panelet er åpent." },
            ],
        },
    ],
    examples,
};

export default doc;
