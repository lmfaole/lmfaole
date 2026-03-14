import { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

const doc: ComponentDoc = {
    id: "icon",
    name: "Icon",
    package: "@fremtind/jokul/icon",
    category: "Visning",
    description: "Icon rendrer Material Symbols-ikoner. Gi navnet på ikonet som child-tekst.",
    warnings: "Et ikon uten ledsagende tekst må ha aria-label — ellers er det usynlig for skjermlesere.",

    props,
    examples,
    migrations,
};

export default doc;
