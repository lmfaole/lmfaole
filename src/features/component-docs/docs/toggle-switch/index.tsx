import { useState, useEffect } from "react";
import { ToggleSwitch } from "@fremtind/jokul/toggle-switch";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function ToggleSwitchPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState(false);
    useEffect(() => { setChecked(isHovered); }, [isHovered]);
    return <ToggleSwitch aria-pressed={checked} onChange={(_e, pressed) => setChecked(pressed)}>Aktiver varsler</ToggleSwitch>;
}

const doc: ComponentDoc = {
    id: "toggle-switch",
    name: "Toggle Switch",
    package: "@fremtind/jokul/toggle-switch",
    category: "Handling",
    description: "ToggleSwitch er et binært vippebryter-element for innstillinger som skal tre i kraft umiddelbart. Forskjellen fra en checkbox er viktig: en checkbox er en del av et skjema som sendes inn, mens ToggleSwitch utløser en umiddelbar handling. Bruk ToggleSwitch for innstillinger som «Slå på varsler», og checkbox for «Godta vilkårene».",
    warnings: "Bruk Checkbox i stedet hvis valget ikke trer i kraft umiddelbart — ToggleSwitch impliserer øyeblikkelig effekt.",
    relationships: {
        related: [{ id: "button", description: "Bruk Button for engangshendelser som krever et separat innsendingstrinn i stedet for en umiddelbar veksling." }],
    },

    preview: <ToggleSwitchPreview />,
    props,
};

export default doc;
