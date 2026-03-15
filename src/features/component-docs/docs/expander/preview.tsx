"use client";
import { useState, useEffect } from "react";
import { ExpandablePanel, Expander } from "@fremtind/jokul/expander";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function ExpanderPreview() {
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
