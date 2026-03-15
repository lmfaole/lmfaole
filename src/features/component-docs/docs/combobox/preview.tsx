"use client";
import { useState, useEffect } from "react";
import { Combobox } from "@fremtind/jokul/combobox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function ComboboxBasicPreview() {
    const isHovered = usePreviewHovered();
    const [selected, setSelected] = useState<string[]>([]);
    const items = [
        { value: "bil", label: "Bilforsikring" },
        { value: "bat", label: "Båtforsikring" },
        { value: "hjem", label: "Hjemforsikring" },
        { value: "reise", label: "Reiseforsikring" },
    ];
    useEffect(() => { if (!isHovered) setSelected([]); }, [isHovered]);
    return (
        <Combobox
            label="Velg forsikringer"
            name="forsikringer"
            items={items}
            onChange={e => setSelected(e.target.selectedOptions.map(o => o.value))}
        />
    );
}
