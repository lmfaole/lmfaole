"use client";
import { useState, useEffect } from "react";
import { IconButton } from "@fremtind/jokul/icon-button";
import { Icon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const icons = ["search", "edit", "delete", "settings"];
const labels: Record<string, string> = { search: "Søk", edit: "Rediger", delete: "Slett", settings: "Innstillinger" };

export function IconButtonPreview() {
    const isHovered = usePreviewHovered();
    const [iconIdx, setIconIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setIconIdx(0); return; }
        const id = setInterval(() => setIconIdx(i => (i + 1) % icons.length), 900);
        return () => clearInterval(id);
    }, [isHovered]);

    const icon = icons[iconIdx];
    return <IconButton aria-label={labels[icon]}><Icon>{icon}</Icon></IconButton>;
}
