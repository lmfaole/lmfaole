"use client";
import { Help } from "@fremtind/jokul/help";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function HelpPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Help buttonText="Hjelp om personnummer" position={isHovered ? "right" : "top"}>
            Personnummeret ditt er et 11-sifret nummer.
        </Help>
    );
}
