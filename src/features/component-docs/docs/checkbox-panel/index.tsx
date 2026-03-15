import { useState, useEffect } from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function CheckboxPanelPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState(false);
    useEffect(() => { setChecked(isHovered); }, [isHovered]);
    return <CheckboxPanel name="preview" value="x" label="Inkluder tillegg" checked={checked} onChange={e => setChecked(e.target.checked)} />;
}

const doc: ComponentDoc = {
    id: "checkbox-panel",
    name: "Checkbox Panel",
    package: "@fremtind/jokul/checkbox-panel",
    category: "Skjema",
    description: "CheckboxPanel er en utvidet avkrysningsboks med et synlig paneldesign.",
    relationships: {
        alternatives: [{ id: "checkbox", description: "Bruk Checkbox for kompakte innebygde valg der et kortlignende klikkområde ikke er nødvendig." }],
        related: [{ id: "radio-panel", description: "RadioPanel følger samme kortmønster, men begrenser valget til ett alternativ om gangen." }],
    },

    preview: <CheckboxPanelPreview />,
    props,
    examples,
};

export default doc;
