import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";
import { RadioButtonPreview } from "./preview";

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
    migrations,
};

export default doc;
