import { useState, useEffect } from "react";
import { ProgressBar } from "@fremtind/jokul/progress-bar";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function ProgressBarPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!isHovered) { setValue(0); return; }
        let v = 0;
        const id = setInterval(() => {
            v = Math.min(v + 2, 100);
            setValue(v);
            if (v >= 100) clearInterval(id);
        }, 50);
        return () => clearInterval(id);
    }, [isHovered]);
    return <ProgressBar aria-valuenow={value} title="Fremdrift" aria-valuetext={`${value} prosent fullført`} />;
}

const doc: ComponentDoc = {
    id: "progress-bar",
    name: "Progress Bar",
    package: "@fremtind/jokul/progress-bar",
    category: "Tilbakemelding",
    description: "ProgressBar viser fremgang i en prosess.",
    warnings: "Gi alltid en beskrivende title og aria-valuetext for skjermlesere.",

    preview: <ProgressBarPreview />,
    props,
    examples,
};

export default doc;
