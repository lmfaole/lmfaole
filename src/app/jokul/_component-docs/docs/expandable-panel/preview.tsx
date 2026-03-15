"use client";
import { useState, useEffect } from "react";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function ExpandablePanelPreview() {
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
