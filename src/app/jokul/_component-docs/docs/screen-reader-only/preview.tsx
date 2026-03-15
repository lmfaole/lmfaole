"use client";
import { useState, useEffect } from "react";
import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const visibleTexts = ["Innhold skjult visuelt", "Tekst kun for skjermlesere"];

export function ScreenReaderOnlyPreview() {
    const isHovered = usePreviewHovered();
    const [textIdx, setTextIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setTextIdx(0); return; }
        const id = setInterval(() => setTextIdx(i => (i + 1) % visibleTexts.length), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <div style={{ padding: "var(--jkl-spacing-m)", border: "1px dashed var(--jkl-color-border-default)", borderRadius: "4px" }}>
            <ScreenReaderOnly>Denne teksten er kun synlig for skjermlesere</ScreenReaderOnly>
            <span aria-hidden style={{ color: "var(--jkl-color-text-subdued)", fontStyle: "italic", fontSize: "0.9em" }}>
                {visibleTexts[textIdx]}
            </span>
        </div>
    );
}
