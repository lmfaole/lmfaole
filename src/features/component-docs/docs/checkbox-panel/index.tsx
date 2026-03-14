import { useState, useEffect } from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import checkboxDoc from "../checkbox";
import radioPanelDoc from "../radio-panel";

const doc: ComponentDoc = {
    id: "checkbox-panel",
    name: "Checkbox Panel",
    package: "@fremtind/jokul/checkbox-panel",
    category: "Skjema",
    tags: ["input", "skjema", "panel", "interaktiv", "pris"],
    description: "CheckboxPanel er en utvidet avkrysningsboks med et synlig paneldesign.",
    relatedIds: [checkboxDoc.id, radioPanelDoc.id],

    props,
    examples,
};

export default doc;
