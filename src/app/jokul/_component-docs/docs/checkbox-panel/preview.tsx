"use client";
import { useState, useEffect } from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function CheckboxPanelPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState(false);
    useEffect(() => { setChecked(isHovered); }, [isHovered]);
    return <CheckboxPanel name="preview" value="x" label="Inkluder tillegg" checked={checked} onChange={e => setChecked(e.target.checked)} />;
}
