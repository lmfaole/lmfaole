import { useState, useEffect } from "react";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

function TextInputPreview() {
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

const doc: ComponentDoc = {
    id: "text-input",
    name: "Text Input",
    package: "@fremtind/jokul/text-input",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "kontrollert"],
    description: "TextInput er en enkeltlinjers tekstinndatafelt. Komponenten inkluderer label, feilmelding og hjelpetekst i ett og håndterer tilgjengelighet automatisk — label er koblet til input via htmlFor/id. Alle skjema-primitiver i Jøkul følger samme API-mønster.",
    relatedIds: ["button"],
    preview: <TextInputPreview />,

    props,
    examples,
    migrations,
};

export default doc;
