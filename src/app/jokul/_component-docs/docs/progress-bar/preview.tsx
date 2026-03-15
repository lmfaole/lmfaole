"use client";
import { useState, useEffect } from "react";
import { ProgressBar } from "@fremtind/jokul/progress-bar";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function ProgressBarPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState(40);

    useEffect(() => {
        if (!isHovered) {
            setValue(40);
            return;
        }
        setValue(0);
        let v = 0;
        const id = setInterval(() => {
            v = Math.min(v + 2, 100);
            setValue(v);
            if (v >= 100) clearInterval(id);
        }, 40);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <div style={{ width: "12rem", display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-s)" }}>
            <span style={{ fontSize: "var(--jkl-font-size-small)", color: "var(--jkl-color-text-subdued)" }}>
                {value}%
            </span>
            <ProgressBar aria-valuenow={value} title="Fremdrift" aria-valuetext={`${value} prosent fullført`} />
        </div>
    );
}
