"use client";
import { useState, useEffect } from "react";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function FlexPreview() {
    const isHovered = usePreviewHovered();
    const [direction, setDirection] = useState<"row" | "column">("row");

    useEffect(() => {
        if (!isHovered) { setDirection("row"); return; }
        const id = setInterval(() => setDirection(d => d === "row" ? "column" : "row"), 1000);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Flex direction={direction} gap="m" wrap="wrap" alignItems="center">
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-focus)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-info)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-success)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-warning)", borderRadius: "4px" }} />
        </Flex>
    );
}
