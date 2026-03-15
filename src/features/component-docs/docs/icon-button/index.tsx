import { useState, useEffect } from "react";
import { IconButton } from "@fremtind/jokul/icon-button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { Tooltip, TooltipTrigger, TooltipContent } from "@fremtind/jokul/tooltip";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function IconButtonPreview() {
    const isHovered = usePreviewHovered();
    return <IconButton aria-label={isHovered ? "Lukk" : "Søk"}><Icon>{isHovered ? "close" : "search"}</Icon></IconButton>;
}

const doc: ComponentDoc = {
    id: "icon-button",
    name: "Icon Button",
    package: "@fremtind/jokul/icon-button",
    category: "Handling",
    status: "deprecated",
    description: "IconButton er en knapp med kun ikon. Krev alltid en aria-label som beskriver handlingen.",
    warnings: "Ikke bruk IconButton uten aria-label.",
    relationships: {
        alternatives: [{ id: "icon", description: "Bruk Icon når symbolet er rent dekorativt og ikke trenger å være et fokuserbart interaktivt element." }],
        related: [{ id: "button", description: "Button er motparten med tekstetikett; bruk den når en synlig etikett forbedrer klarheten for handlingen." }],
    },

    preview: <IconButtonPreview />,
    props,
    examples,
};

export default doc;
