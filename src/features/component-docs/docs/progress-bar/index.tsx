import { useState, useEffect } from "react";
import { ProgressBar } from "@fremtind/jokul/progress-bar";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "progress-bar",
    name: "Progress Bar",
    package: "@fremtind/jokul/progress-bar",
    category: "Tilbakemelding",
    description: "ProgressBar viser fremgang i en prosess.",
    warnings: "Gi alltid en beskrivende title og aria-valuetext for skjermlesere.",

    props,
    examples,
};

export default doc;
