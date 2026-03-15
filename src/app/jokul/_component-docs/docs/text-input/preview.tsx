"use client";
import { useState, useEffect } from "react";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function TextInputPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");
    const text = "Ole Jorgen Bakken";
    useEffect(() => {
        if (!isHovered) { setValue(""); return; }
        let i = 0;
        const id = setInterval(() => {
            setValue(text.slice(0, ++i));
            if (i >= text.length) clearInterval(id);
        }, 120);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <TextInput
            label="Fullt navn"
            value={value}
            onChange={e => setValue(e.target.value)}
        />
    );
}
