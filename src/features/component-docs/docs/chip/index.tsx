import { useState, useEffect } from "react";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "chip",
    name: "Chip",
    package: "@fremtind/jokul/chip",
    category: "Handling",
    description: "Chip brukes for interaktive filtre og tagger som brukeren kan velge og velge bort.",
    relationships: {
        related: [{ id: "tag", description: "Bruk Tag for skrivebeskyttede kategorietiketter; Chip er for interaktive filtreringshandlinger." }],
    },

    props,
    examples,
};

export default doc;
