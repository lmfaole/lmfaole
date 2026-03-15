"use client";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import { Flex } from "@fremtind/jokul/flex";

export function FlexPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Flex gap={isHovered ? "l" : "s"} wrap="wrap" alignItems="center" style={{ transition: "gap 0.3s" }}>
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-focus)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-info)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-success)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-warning)", borderRadius: "4px" }} />
        </Flex>
    );
}
