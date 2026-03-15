"use client";
import { useState, useEffect } from "react";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function ChipPreview() {
    const isHovered = usePreviewHovered();
    const [selected, setSelected] = useState<string[]>([]);
    useEffect(() => { setSelected(isHovered ? ["bil"] : []); }, [isHovered]);
    return (
        <Flex gap="xs">
            <Chip variant="filter" selected={selected.includes("bil")} onClick={() => setSelected(p => p.includes("bil") ? p.filter(x => x !== "bil") : [...p, "bil"])}>Bil</Chip>
            <Chip variant="filter" selected={selected.includes("bat")} onClick={() => setSelected(p => p.includes("bat") ? p.filter(x => x !== "bat") : [...p, "bat"])}>Båt</Chip>
            <Chip variant="filter" selected={selected.includes("hjem")} onClick={() => setSelected(p => p.includes("hjem") ? p.filter(x => x !== "hjem") : [...p, "hjem"])}>Hjem</Chip>
        </Flex>
    );
}
