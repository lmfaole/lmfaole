import type { ComponentDoc } from "../types";
import { props } from "./props";
import { FieldGroupPreview } from "./preview";

const doc: ComponentDoc = {
    id: "field-group",
    name: "Field Group",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    description: {
        short: "FieldGroup grupperer relaterte skjemaelementer under en felles legend.",
        long: "FieldGroup grupperer relaterte skjemaelementer under en felles legend.",
    },
    warnings: "Grupper alltid Checkbox og RadioButton innenfor FieldGroup — uten det mangler skjermlesere kontekst for hva gruppen handler om.",
    relationships: {
        related: [{ id: "checkbox", description: "Wrapper flere Checkbox-elementer i FieldGroup for å gi dem en felles tilgjengelig legende." }, { id: "radio-button", description: "Wrapper RadioButton-alternativer i FieldGroup slik at skjermlesere annonserer det felles spørsmålet som en gruppeetikett." }],
    },

    preview: <FieldGroupPreview />,
    props,
};

export default doc;
