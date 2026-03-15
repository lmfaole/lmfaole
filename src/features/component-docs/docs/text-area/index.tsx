import { useState, useEffect } from "react";
import { TextArea } from "@fremtind/jokul/text-area";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function TextAreaPreview() {
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

const doc: ComponentDoc = {
    id: "text-area",
    name: "Text Area",
    package: "@fremtind/jokul/text-area",
    category: "Skjema",
    description: "TextArea er et flerlinjers tekstinputfelt for lengre tekstinnhold.",
    relationships: {
        related: [{ id: "text-input", description: "Bruk TextInput for enkeltlinjeverdi; TextArea er for flerlinjers fritekst som kommentarer eller beskrivelser." }],
    },
    preview: <TextAreaPreview />,

    props,
};

export default doc;
