import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, PopupTip } from "@fremtind/jokul/tooltip";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "tooltip",
    name: "Tooltip",
    package: "@fremtind/jokul/tooltip",
    category: "Overlegg",
    description: "Tooltip og PopupTip viser tilleggsinformasjon ved hover eller klikk.",
    warnings: [
    "Ikke legg Tooltip på ikke-interaktive elementer — det er ikke tilgjengelig for tastaturbrukere.",
    "Tooltip må aldri inneholde kritisk informasjon som ikke finnes andre steder på siden.",
],
    props,
    examples
};

export default doc;
