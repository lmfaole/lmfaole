import { useState, useEffect } from "react";
import { RadioPanel } from "@fremtind/jokul/radio-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function RadioPanelPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("bil");
    useEffect(() => { setValue(isHovered ? "bat" : "bil"); }, [isHovered]);
    return (
        <FieldGroup legend="Velg produkt">
            <Flex gap="s">
                <RadioPanel name="rp-preview" value="bil" label="Bil" checked={value === "bil"} onChange={() => setValue("bil")} />
                <RadioPanel name="rp-preview" value="bat" label="Båt" checked={value === "bat"} onChange={() => setValue("bat")} />
            </Flex>
        </FieldGroup>
    );
}

const doc: ComponentDoc = {
    id: "radio-panel",
    name: "Radio Panel",
    package: "@fremtind/jokul/radio-panel",
    category: "Skjema",
    description: "RadioPanel er et panelbasert envalgsalternativ.",
    warnings: "Grupper RadioPanel-er i FieldGroup med legend — uten det mangler skjermlesere kontekst for gruppen.",
    relationships: {
        alternatives: [{ id: "radio-button", description: "Bruk RadioButton for kompakte vertikale lister der et kortlignende valgområde ikke er nødvendig." }],
        related: [{ id: "checkbox-panel", description: "CheckboxPanel følger samme kortmønster, men tillater flere samtidige valg." }],
    },

    preview: <RadioPanelPreview />,
    props,
    examples,
};

export default doc;
