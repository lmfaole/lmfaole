"use client";
import { useState, useEffect } from "react";
import { RadioPanel } from "@fremtind/jokul/radio-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function RadioPanelPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("bil");

    useEffect(() => {
        if (!isHovered) { setValue("bil"); return; }
        const id = setInterval(() => setValue(v => v === "bil" ? "bat" : "bil"), 1000);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <FieldGroup legend="Velg produkt">
            <RadioPanel name="rp-preview" value="bil" label="Bil" checked={value === "bil"} onChange={() => setValue("bil")} />
            <RadioPanel name="rp-preview" value="bat" label="Båt" checked={value === "bat"} onChange={() => setValue("bat")} />
        </FieldGroup>
    );
}
