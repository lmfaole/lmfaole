import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";
import { InputGroupPreview } from "./preview";

const doc: ComponentDoc = {
    id: "input-group",
    name: "Input Group",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    status: "stable",
    description:
        "InputGroup kombinerer et skjemafelt med label, hjelpetekst og feilmelding på en tilgjengelig måte. FieldGroup bruker et fieldset-element for grupper av relaterte felt som avkrysningsbokser og radioknapper.",
    warnings: "Bruk render-prop-mønsteret for å spre tilgjengelighetsprops (id, aria-describedby, aria-invalid) automatisk til det underliggende feltet.",
    preview: <InputGroupPreview />,

    relationships: {
        related: [{ id: "text-input", description: "InputGroup wrapper TextInput (og lignende felt) for å legge til prefiks-/suffiksikoner eller knapper." }, { id: "checkbox", description: "Integrer Checkbox inne i InputGroup når en boolsk modifikator er tett koblet til inndataverdien." }, { id: "radio-button", description: "Grupper RadioButtons inne i InputGroups FieldGroup-underkomponent for en felles tilgjengelig legende." }, { id: "help", description: "Fest Help til en InputGroup for å gi kontekstuell veiledning uten å rote til etiketten." }],
    },
    props,
    subComponents: [
        {
            name: "FieldGroup",
            description: "Grupperer relaterte skjemaelementer (f.eks. avkrysningsbokser, radioknapper) under en felles legend ved hjelp av fieldset.",
            props: [
                { name: "legend", type: "string", required: true, source: "custom", status: "stable", description: "Overskrift for gruppen." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Skjemaelementer i gruppen." },
                { name: "errorLabel", type: "string", required: false, source: "react", status: "stable", description: "Feilmelding for hele gruppen." },
                { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst for hele gruppen." },
            ],
        },
    ],
    migrations,
};

export default doc;
