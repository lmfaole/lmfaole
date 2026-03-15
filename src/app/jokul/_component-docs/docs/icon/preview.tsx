"use client";
import { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const setA = ["star", "check_circle", "favorite", "arrow_forward"];
const setB = ["home", "settings", "notifications", "close"];

export function IconPreview() {
    const isHovered = usePreviewHovered();
    const [useSetA, setUseSetA] = useState(true);

    useEffect(() => {
        if (!isHovered) { setUseSetA(true); return; }
        const id = setInterval(() => setUseSetA(s => !s), 800);
        return () => clearInterval(id);
    }, [isHovered]);

    const icons = useSetA ? setA : setB;
    return (
        <Flex gap="m" alignItems="center">
            {icons.map((name) => (
                <span key={name} style={{ display: "inline-flex" }}><Icon>{name}</Icon></span>
            ))}
        </Flex>
    );
}
