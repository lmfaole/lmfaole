import { useState, useEffect } from "react";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function FieldGroupPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState<string[]>([]);
    useEffect(() => { setChecked(isHovered ? ["bil"] : []); }, [isHovered]);
    return (
        <FieldGroup legend="Velg produkt">
            <Checkbox name="fg" value="bil" checked={checked.includes("bil")} onChange={e => setChecked(p => e.target.checked ? [...p, "bil"] : p.filter(x => x !== "bil"))}>Bil</Checkbox>
            <Checkbox name="fg" value="bat" checked={checked.includes("bat")} onChange={e => setChecked(p => e.target.checked ? [...p, "bat"] : p.filter(x => x !== "bat"))}>Båt</Checkbox>
        </FieldGroup>
    );
}

const doc: ComponentDoc = {
    id: "field-group",
    name: "Field Group",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    description: "FieldGroup grupperer relaterte skjemaelementer under en felles legend.",
    warnings: "Grupper alltid Checkbox og RadioButton innenfor FieldGroup — uten det mangler skjermlesere kontekst for hva gruppen handler om.",
    relationships: {
        related: [{ id: "checkbox", description: "Wrapper flere Checkbox-elementer i FieldGroup for å gi dem en felles tilgjengelig legende." }, { id: "radio-button", description: "Wrapper RadioButton-alternativer i FieldGroup slik at skjermlesere annonserer det felles spørsmålet som en gruppeetikett." }],
    },

    preview: <FieldGroupPreview />,
    props,
};

export default doc;
