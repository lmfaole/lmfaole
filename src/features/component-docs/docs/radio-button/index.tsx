import { useState, useEffect } from "react";
import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";
import checkboxDoc from "../checkbox";
import radioPanelDoc from "../radio-panel";

const doc: ComponentDoc = {
    id: "radio-button",
    name: "Radio Button",
    package: "@fremtind/jokul/radio-button",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "tilgjengelighet"],
    description: "RadioButton og RadioButtonGroup brukes for enovalgslister.",
    warnings: "Aldri bruk RadioButton uten RadioButtonGroup — den er ikke tilgjengelig uten riktig name og grouping.",
    relatedIds: [checkboxDoc.id, radioPanelDoc.id],

    props,
    examples,
    migrations,
};

export default doc;
