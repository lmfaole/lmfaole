"use client";
import { useState, useEffect } from "react";
import { TextArea } from "@fremtind/jokul/text-area";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function TextAreaPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");
    const text = "Bilen min ble skadet i et trafikkuhell 15. mars. Jeg ønsker å melde inn en skade.";
    useEffect(() => {
        if (!isHovered) { setValue(""); return; }
        let i = 0;
        const id = setInterval(() => {
            setValue(text.slice(0, ++i));
            if (i >= text.length) clearInterval(id);
        }, 60);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <TextArea
            label="Skadbeskrivelse"
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={4}
        />
    );
}
