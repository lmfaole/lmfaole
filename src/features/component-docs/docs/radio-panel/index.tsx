import { useState, useEffect } from "react";
import { RadioPanel } from "@fremtind/jokul/radio-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "radio-panel",
    name: "Radio Panel",
    package: "@fremtind/jokul/radio-panel",
    category: "Skjema",
    tags: ["input", "skjema", "panel", "interaktiv", "pris"],
    description: "RadioPanel er et panelbasert envalgsalternativ.",
    warnings: "Grupper RadioPanel-er i FieldGroup med legend — uten det mangler skjermlesere kontekst for gruppen.",
    relatedIds: ["radio-button", "checkbox-panel"],

    props,
    examples,
};

export default doc;
