"use client";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";

export function IconPreview() {
    const icons = ["star", "check_circle", "favorite", "arrow_forward"];
    return (
        <Flex gap="m" alignItems="center">
            {icons.map((name) => (
                <span key={name} style={{ display: "inline-flex" }}><Icon>{name}</Icon></span>
            ))}
        </Flex>
    );
}
