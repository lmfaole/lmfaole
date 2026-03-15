"use client";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function DescriptionListPreview() {
    const isHovered = usePreviewHovered();
    const [highlight, setHighlight] = useState(false);
    useEffect(() => { setHighlight(isHovered); }, [isHovered]);
    return (
        <DescriptionList>
            <DescriptionTerm>Navn</DescriptionTerm>
            <DescriptionDetail><span style={{ fontWeight: highlight ? "bold" : "normal", transition: "font-weight 0.2s" }}>Ola Nordmann</span></DescriptionDetail>
            <DescriptionTerm>Adresse</DescriptionTerm>
            <DescriptionDetail>Storgata 1, 0001 Oslo</DescriptionDetail>
        </DescriptionList>
    );
}
