import { useState, useEffect } from "react";
import { ExpandablePanel, Expander } from "@fremtind/jokul/expander";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "expander",
    name: "Expander",
    package: "@fremtind/jokul/expander",
    category: "Visning",
    description: "Expander er en klikkbar knapp som brukes som trigger for ExpandablePanel. Den kan også brukes frittstående som en styrt toggle der du håndterer åpen-tilstand selv.",

    relatedIds: ["expandable-panel"],

    props,
    examples,
};

export default doc;
