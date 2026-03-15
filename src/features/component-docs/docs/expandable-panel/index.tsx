import { useState, useEffect } from "react";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function ExpandablePanelPreview() {
    const isHovered = usePreviewHovered();
    const [open, setOpen] = useState(false);
    useEffect(() => { setOpen(isHovered); }, [isHovered]);
    return (
        <ExpandablePanel open={open} onOpenChange={setOpen}>
            <ExpandablePanel.Header>Hva er inkludert?</ExpandablePanel.Header>
            <ExpandablePanel.Content><p>Forsikringen dekker skader og ansvar.</p></ExpandablePanel.Content>
        </ExpandablePanel>
    );
}

const doc: ComponentDoc = {
    id: "expandable-panel",
    name: "Expandable Panel",
    package: "@fremtind/jokul/expander",
    category: "Visning",
    description: "ExpandablePanel er et utviddbart panel med header og innhold.",

    relationships: {
        alternatives: [{ id: "expander", description: "Bruk Expander for en lettere, innebygd utvid/skjul uten den innrammede panelbeholderen." }],
    },

    preview: <ExpandablePanelPreview />,
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
};

export default doc;
