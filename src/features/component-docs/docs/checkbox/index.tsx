import { useState, useEffect } from "react";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import toggleSwitchDoc from "../toggle-switch";
import checkboxPanelDoc from "../checkbox-panel";

const doc: ComponentDoc = {
    id: "checkbox",
    name: "Checkbox",
    package: "@fremtind/jokul/checkbox",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "tilgjengelighet"],
    description: "Checkbox brukes for binære valg i skjemaer, typisk for samtykke eller flervalgslister.",
    warnings: "Bruk ToggleSwitch for innstillinger som trer i kraft umiddelbart — Checkbox er for skjemainnsending.",
    relatedIds: [toggleSwitchDoc.id, checkboxPanelDoc.id],

    props,
    examples,
};

export default doc;
