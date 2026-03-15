"use client";
import { useState, useEffect } from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function CheckboxPanelPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState<string[]>([]);

    const toggle = (val: string) => setChecked(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

    useEffect(() => {
        if (!isHovered) { setChecked([]); return; }
        setChecked(["bil"]);
    }, [isHovered]);

    return (
        <FieldGroup legend="Velg tillegg">
            <CheckboxPanel name="preview" value="bil" label="Bilforsikring" checked={checked.includes("bil")} onChange={() => toggle("bil")} />
            <CheckboxPanel name="preview" value="bat" label="Båtforsikring" checked={checked.includes("bat")} onChange={() => toggle("bat")} />
        </FieldGroup>
    );
}
