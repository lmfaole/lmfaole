"use client";
import { useState, useEffect } from "react";
import { Autosuggest } from "@fremtind/jokul/autosuggest";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function AutosuggestPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");
    const allItems = ["Bilforsikring", "Båtforsikring", "Hjemforsikring", "Reiseforsikring"];
    useEffect(() => { if (isHovered) setValue("for"); else setValue(""); }, [isHovered]);
    return (
        <Autosuggest
            label="Søk etter forsikring"
            value={value}
            allItems={allItems}
            onChange={v => setValue(v)}
        />
    );
}
