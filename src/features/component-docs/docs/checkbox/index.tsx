import { useState, useEffect } from "react";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function CheckboxPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState(false);
    useEffect(() => { setChecked(isHovered); }, [isHovered]);
    return <Checkbox name="preview" value="x" checked={checked} onChange={e => setChecked(e.target.checked)}>Godta vilkårene</Checkbox>;
}

const doc: ComponentDoc = {
    id: "checkbox",
    name: "Checkbox",
    package: "@fremtind/jokul/checkbox",
    category: "Skjema",
    description: "Checkbox brukes for binære valg i skjemaer, typisk for samtykke eller flervalgslister.",
    warnings: "Bruk ToggleSwitch for innstillinger som trer i kraft umiddelbart — Checkbox er for skjemainnsending.",
    relationships: {
        alternatives: [{ id: "checkbox-panel", description: "Bruk CheckboxPanel når du trenger et større klikkbart kortområde som inkluderer etiketten." }],
        related: [{ id: "toggle-switch", description: "Bruk ToggleSwitch for binære av/på-innstillinger som trer i kraft umiddelbart uten en innsendingshandling." }],
    },

    preview: <CheckboxPreview />,
    props,
};

export default doc;
