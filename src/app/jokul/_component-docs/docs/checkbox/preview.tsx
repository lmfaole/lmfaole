"use client";
import { useState } from "react";
import { Checkbox } from "@fremtind/jokul/checkbox";

export function CheckboxPreview() {
    const [checked, setChecked] = useState(false);
    return <Checkbox name="preview" value="x" checked={checked} onChange={e => setChecked(e.target.checked)}>Godta vilkårene</Checkbox>;
}
