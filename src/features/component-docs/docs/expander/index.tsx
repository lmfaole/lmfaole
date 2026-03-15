import { useState, useEffect } from "react";
import { ExpandablePanel, Expander } from "@fremtind/jokul/expander";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function ExpanderPreview() {
    const isHovered = usePreviewHovered();
    const [open, setOpen] = useState(false);
    useEffect(() => { setOpen(isHovered); }, [isHovered]);
    return (
        <ExpandablePanel open={open} onOpenChange={setOpen}>
            <Expander>Vilkår og betingelser</Expander>
            <ExpandablePanel.Content>
                <p>Forsikringen gjelder fra betalingsdato.</p>
            </ExpandablePanel.Content>
        </ExpandablePanel>
    );
}

const doc: ComponentDoc = {
    id: "expander",
    name: "Expander",
    package: "@fremtind/jokul/expander",
    category: "Visning",
    description: "Expander er en klikkbar knapp som brukes som trigger for ExpandablePanel. Den kan også brukes frittstående som en styrt toggle der du håndterer åpen-tilstand selv.",

    relationships: {
        alternatives: [{ id: "expandable-panel", description: "Bruk ExpandablePanel når det sammenleggbare innholdet trenger en visuelt distinkt innrammet beholder." }],
    },

    preview: <ExpanderPreview />,
    props,
};

export default doc;
