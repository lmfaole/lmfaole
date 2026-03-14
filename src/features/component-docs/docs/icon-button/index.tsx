import { useState, useEffect } from "react";
import { IconButton } from "@fremtind/jokul/icon-button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { Tooltip, TooltipTrigger, TooltipContent } from "@fremtind/jokul/tooltip";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "icon-button",
    name: "Icon Button",
    package: "@fremtind/jokul/icon-button",
    category: "Handling",
    status: "deprecated",
    tags: ["knapp", "ikon", "interaktiv"],
    description: "IconButton er en knapp med kun ikon. Krev alltid en aria-label som beskriver handlingen.",
    warnings: "Ikke bruk IconButton uten aria-label.",
    relatedIds: ["button", "icon"],

    props,
    examples,
};

export default doc;
