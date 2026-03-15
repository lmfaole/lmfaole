import { useState, useEffect } from "react";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function ChipPreview() {
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

const doc: ComponentDoc = {
    id: "chip",
    name: "Chip",
    package: "@fremtind/jokul/chip",
    category: "Handling",
    description: "Chip brukes for interaktive filtre og tagger som brukeren kan velge og velge bort.",
    relationships: {
        related: [{ id: "tag", description: "Bruk Tag for skrivebeskyttede kategorietiketter; Chip er for interaktive filtreringshandlinger." }],
    },

    preview: <ChipPreview />,
    props,
    examples,
};

export default doc;
