"use client";
import { Flex } from "@fremtind/jokul/flex";

export function FlexPreview() {
    return (
        <Flex gap="m" wrap="wrap" alignItems="center">
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-focus)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-info)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-success)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-warning)", borderRadius: "4px" }} />
        </Flex>
    );
}
