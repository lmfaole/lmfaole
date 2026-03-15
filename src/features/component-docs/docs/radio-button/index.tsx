import { useState, useEffect } from "react";
import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

function RadioButtonPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("card");
    useEffect(() => { setValue(isHovered ? "invoice" : "card"); }, [isHovered]);
    return (
        <RadioButtonGroup legend="Velg betaling" name="pay-preview" value={value} onChange={e => setValue(e.target.value)}>
            <RadioButton value="card">Bankkort</RadioButton>
            <RadioButton value="invoice">Faktura</RadioButton>
        </RadioButtonGroup>
    );
}

const doc: ComponentDoc = {
    id: "radio-button",
    name: "Radio Button",
    package: "@fremtind/jokul/radio-button",
    category: "Skjema",
    description: "RadioButton og RadioButtonGroup brukes for enovalgslister.",
    warnings: "Aldri bruk RadioButton uten RadioButtonGroup — den er ikke tilgjengelig uten riktig name og grouping.",
    relationships: {
        alternatives: [{ id: "radio-panel", description: "Bruk RadioPanel når du trenger et større klikkbart kortområde rundt hvert alternativ." }],
        related: [{ id: "checkbox", description: "Bruk Checkbox i stedet når brukeren kan velge flere alternativer samtidig." }],
    },

    preview: <RadioButtonPreview />,
    props,
    examples,
    migrations,
};

export default doc;
