"use client";
import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function ScreenReaderOnlyPreview() {
    const isHovered = usePreviewHovered();
    return (
        <div style={{ padding: "var(--jkl-spacing-m)", border: "1px dashed var(--jkl-color-border-default)", borderRadius: "4px" }}>
            <ScreenReaderOnly>Denne teksten er kun synlig for skjermlesere</ScreenReaderOnly>
            <span aria-hidden style={{ color: isHovered ? "var(--jkl-color-text-link)" : "var(--jkl-color-text-subdued)", fontStyle: "italic", transition: "color 0.3s", fontSize: "0.9em" }}>
                {isHovered ? "Skjult tekst finnes her →" : "Innhold skjult visuelt"}
            </span>
        </div>
    );
}
