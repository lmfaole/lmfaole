"use client";
import { useState, useEffect } from "react";
import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function RadioButtonPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("card");
    useEffect(() => { setValue(isHovered ? "invoice" : "card"); }, [isHovered]);
    return (
        <RadioButtonGroup legend="Velg betaling" name="pay-preview" value={value} onChange={e => setValue(e.target.value)}>
            <RadioButton value="card">Bankkort</RadioButton>
            <RadioButton value="invoice">Faktura</RadioButton>
        </RadioButtonGroup>
    );
}
