import { useState, useEffect } from "react";
import { SegmentedControl, SegmentedControlButton } from "@fremtind/jokul/segmented-control";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "segmented-control",
    name: "Segmented Control",
    package: "@fremtind/jokul/segmented-control",
    category: "Handling",
    description: "SegmentedControl er en gruppe av knapper der kun ett alternativ kan velges om gangen.",
    relatedIds: ["radio-button"],

    props,
    subComponents: [
        {
            name: "SegmentedControlButton",
            description: "Et enkelt alternativ i SegmentedControl.",
            props: [
                { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien som sendes ved valg." },
                { name: "checked", type: "boolean", required: false, source: "native", status: "stable", description: "Om dette alternativet er valgt (kontrollert)." },
                { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles når alternativet velges." },
                { name: "disabled", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Deaktiverer alternativet." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold i knappen." },
            ],
        },
    ],
    examples,
};

export default doc;
