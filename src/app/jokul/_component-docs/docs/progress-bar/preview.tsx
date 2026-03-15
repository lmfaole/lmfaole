"use client";
import { useState, useEffect } from "react";
import { ProgressBar } from "@fremtind/jokul/progress-bar";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function ProgressBarPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!isHovered) { setValue(0); return; }
        let v = 0;
        const id = setInterval(() => {
            v = Math.min(v + 2, 100);
            setValue(v);
            if (v >= 100) clearInterval(id);
        }, 50);
        return () => clearInterval(id);
    }, [isHovered]);
    return <ProgressBar aria-valuenow={value} title="Fremdrift" aria-valuetext={`${value} prosent fullført`} />;
}
