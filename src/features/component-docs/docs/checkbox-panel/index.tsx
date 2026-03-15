import { useState, useEffect } from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "checkbox-panel",
    name: "Checkbox Panel",
    package: "@fremtind/jokul/checkbox-panel",
    category: "Skjema",
    description: "CheckboxPanel er en utvidet avkrysningsboks med et synlig paneldesign.",
    relationships: {
        alternatives: [{ id: "checkbox", description: "Bruk Checkbox for kompakte innebygde valg der et kortlignende klikkområde ikke er nødvendig." }],
        related: [{ id: "radio-panel", description: "RadioPanel følger samme kortmønster, men begrenser valget til ett alternativ om gangen." }],
    },

    props,
    examples,
};

export default doc;
