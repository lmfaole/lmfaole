"use client";
import { useState, useEffect } from "react";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function CheckboxPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState(false);
    useEffect(() => { setChecked(isHovered); }, [isHovered]);
    return <Checkbox name="preview" value="x" checked={checked} onChange={e => setChecked(e.target.checked)}>Godta vilkårene</Checkbox>;
}
