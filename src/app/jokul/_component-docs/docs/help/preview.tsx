"use client";
import { useState, useEffect } from "react";
import { Help } from "@fremtind/jokul/help";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const buttonTexts = ["Hjelp om personnummer", "Skjul hjelp om personnummer"];

export function HelpPreview() {
    const isHovered = usePreviewHovered();
    const [textIdx, setTextIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setTextIdx(0); return; }
        const id = setInterval(() => setTextIdx(i => (i + 1) % buttonTexts.length), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Help buttonText={buttonTexts[textIdx]}>
            Personnummeret ditt er et 11-sifret nummer.
        </Help>
    );
}
