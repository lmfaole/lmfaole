"use client";
import { useState } from "react";
import { ToggleSwitch } from "@fremtind/jokul/toggle-switch";

export function ToggleSwitchPreview() {
    const [checked, setChecked] = useState(false);
    return <ToggleSwitch aria-pressed={checked} onChange={(_e, pressed) => setChecked(pressed)}>Aktiver varsler</ToggleSwitch>;
}
