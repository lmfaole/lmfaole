"use client";
import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function ButtonPreview() {
    const hovered = usePreviewHovered();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (hovered) {
            setLoading(true);
            const t = setTimeout(() => setLoading(false), 1500);
            return () => clearTimeout(t);
        }
    }, [hovered]);
    return loading
        ? <Button loader={{ showLoader: true, textDescription: "Laster" }}>Send inn</Button>
        : <Button>Send inn</Button>;
}
