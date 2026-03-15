"use client";
import { Link } from "@fremtind/jokul/link";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function LinkPreview() {
    const isHovered = usePreviewHovered();
    const full = "Les mer om bilforsikring";
    const [text, setText] = useState(full);
    useEffect(() => {
        if (!isHovered) { setText(full); return; }
        setText("");
        let i = 0;
        const id = setInterval(() => {
            setText(full.slice(0, ++i));
            if (i >= full.length) clearInterval(id);
        }, 60);
        return () => clearInterval(id);
    }, [isHovered]);
    return <Link href="#">{text || "\u00a0"}</Link>;
}
