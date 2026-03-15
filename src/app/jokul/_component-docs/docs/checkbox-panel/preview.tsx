"use client";
import { useState } from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";

export function CheckboxPanelPreview() {
    const [checked, setChecked] = useState<string[]>([]);
    const toggle = (val: string) => setChecked(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    return (
        <FieldGroup legend="Velg tillegg">
            <CheckboxPanel name="preview" value="bil" label="Bilforsikring" checked={checked.includes("bil")} onChange={() => toggle("bil")} />
            <CheckboxPanel name="preview" value="bat" label="Båtforsikring" checked={checked.includes("bat")} onChange={() => toggle("bat")} />
        </FieldGroup>
    );
}
