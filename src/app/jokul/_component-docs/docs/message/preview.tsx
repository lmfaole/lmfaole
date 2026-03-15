"use client";
import { useState, useEffect } from "react";
import { Message } from "@fremtind/jokul/message";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function MessagePreview() {
    const isHovered = usePreviewHovered();
    const variants = ["info", "success", "warning", "error"] as const;
    const messages = { info: "Ny melding tilgjengelig.", success: "Betaling gjennomført.", warning: "Forsikring utløper snart.", error: "Noe gikk galt." };
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (!isHovered) { setIdx(0); return; }
        const id = setInterval(() => setIdx(p => (p + 1) % variants.length), 1200);
        return () => clearInterval(id);
    }, [isHovered]);
    return <Message variant={variants[idx]}>{messages[variants[idx]]}</Message>;
}
