"use client";
import { useState, useEffect } from "react";
import { ToggleSwitch } from "@fremtind/jokul/toggle-switch";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function ToggleSwitchPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState(false);
    useEffect(() => { setChecked(isHovered); }, [isHovered]);
    return <ToggleSwitch aria-pressed={checked} onChange={(_e, pressed) => setChecked(pressed)}>Aktiver varsler</ToggleSwitch>;
}
