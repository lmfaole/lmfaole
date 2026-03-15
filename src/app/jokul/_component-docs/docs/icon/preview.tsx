"use client";
import { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function IconPreview() {
    const isHovered = usePreviewHovered();
    const icons = ["star", "check_circle", "favorite", "arrow_forward"];
    const [active, setActive] = useState(0);
    useEffect(() => {
        if (!isHovered) { setActive(0); return; }
        let i = 0;
        const id = setInterval(() => { i = (i + 1) % icons.length; setActive(i); }, 400);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Flex gap="m" alignItems="center">
            {icons.map((name, idx) => (
                <span key={name} style={{ transition: "transform 0.2s, color 0.2s", transform: active === idx ? "scale(1.5)" : "scale(1)", color: active === idx ? "var(--jkl-color-text-link)" : undefined, display: "inline-flex" }}><Icon>{name}</Icon></span>
            ))}
        </Flex>
    );
}
