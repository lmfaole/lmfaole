"use client";
import { Countdown } from "@fremtind/jokul/countdown";
import { Flex } from "@fremtind/jokul/flex";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function CountdownPreview() {
    const isHovered = usePreviewHovered();
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (isHovered) setKey(k => k + 1);
    }, [isHovered]);

    return (
        <Flex direction="column" gap="s" style={{ width: "12rem" }}>
            <span style={{ fontSize: "var(--jkl-font-size-small)", color: "var(--jkl-color-text-subdued)" }}>
                {isHovered ? "Teller ned…" : "Hold over for å starte"}
            </span>
            <Countdown key={key} from={5000} isPaused={!isHovered} />
        </Flex>
    );
}
