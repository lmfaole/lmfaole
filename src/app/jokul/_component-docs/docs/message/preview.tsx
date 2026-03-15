"use client";
import { useState, useEffect } from "react";
import { Message } from "@fremtind/jokul/message";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const variants = ["info", "success", "warning", "error"] as const;
type Variant = typeof variants[number];

export function MessagePreview() {
    const isHovered = usePreviewHovered();
    const [variantIdx, setVariantIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setVariantIdx(0); return; }
        const id = setInterval(() => setVariantIdx(i => (i + 1) % variants.length), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <div style={{ maxWidth: "22rem", width: "100%" }}>
            <Message variant={variants[variantIdx]}>Ny melding tilgjengelig.</Message>
        </div>
    );
}
