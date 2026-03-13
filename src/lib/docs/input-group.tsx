import React from "react";
import { InputGroup, FieldGroup } from "@fremtind/jokul/input-group";
import { TextInput } from "@fremtind/jokul/text-input";
import { Checkbox } from "@fremtind/jokul/checkbox";
import type { ComponentDoc } from "./types";

function BasicInputGroupPreview() {
    return (
        <InputGroup
            label="Fornavn"
            render={(props) => <TextInput label="" {...props} />}
        />
    );
}

function InputGroupWithLabelsPreview() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-m)" }}>
            <InputGroup
                label="E-postadresse"
                helpLabel="Vi bruker e-post til å sende kvittering."
                render={(props) => <TextInput label="" {...props} />}
            />
            <InputGroup
                label="Telefonnummer"
                errorLabel="Ugyldig telefonnummer."
                render={(props) => <TextInput label="" {...props} aria-invalid />}
            />
        </div>
    );
}

function FieldGroupCheckboxPreview() {
    return (
        <FieldGroup legend="Velg interesser" helpLabel="Du kan velge flere alternativ.">
            <Checkbox name="interests" value="sport">Sport</Checkbox>
            <Checkbox name="interests" value="kultur">Kultur</Checkbox>
            <Checkbox name="interests" value="teknologi">Teknologi</Checkbox>
        </FieldGroup>
    );
}

const doc: ComponentDoc = {
    id: "input-group",
    name: "InputGroup",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    tags: ["skjema", "input", "label", "feil", "hjelp", "fieldset"],
    status: "stable",
    description:
        "InputGroup kombinerer et skjemafelt med label, hjelpetekst og feilmelding på en tilgjengelig måte. FieldGroup bruker et fieldset-element for grupper av relaterte felt som avkrysningsbokser og radioknapper.",
    notes:
        "Bruk render-prop for å sende tilgjengelighetsprops (aria-describedby, aria-invalid, id) automatisk videre til det underliggende inputfeltet. Bruk FieldGroup for grupper av felt med felles legend.",
    props: [
        {
            name: "label",
            type: "React.ReactNode",
            required: true,
            source: "custom",
            status: "stable",
            description: "Tekstetikett for inputfeltet.",
        },
        {
            name: "render",
            type: "(props: { 'aria-describedby'?: string; 'aria-invalid'?: boolean; id?: string }) => JSX.Element",
            required: false,
            source: "custom",
            status: "stable",
            description: "Funksjon som rendrer inputfeltet med tilgjengelighetsprops injisert.",
        },
        {
            name: "helpLabel",
            type: "React.ReactNode",
            required: false,
            source: "custom",
            status: "stable",
            description: "Hjelpetekst vist under feltet.",
        },
        {
            name: "errorLabel",
            type: "React.ReactNode",
            required: false,
            source: "custom",
            status: "stable",
            description: "Feilmelding vist under feltet. Legger til aria-invalid automatisk.",
        },
        {
            name: "description",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Ekstra beskrivelsestekst.",
        },
        {
            name: "tooltip",
            type: "React.ReactNode",
            required: false,
            source: "custom",
            status: "stable",
            description: "Tooltip-komponent ved siden av labelen.",
        },
        {
            name: "inline",
            type: "boolean",
            required: false,
            source: "custom",
            status: "stable",
            default: "false",
            description: "Viser label og felt på én linje.",
        },
        { name: "id", type: "string", required: false, source: "native", status: "stable", description: "Overstyrer generert HTML id." },
    ],
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
    examples: [
        {
            title: "Grunnleggende InputGroup",
            description: "Bruk render-prop for å injisere tilgjengelighetsprops i inputfeltet.",
            uses: ["text-input"],
            code: `import { InputGroup } from "@fremtind/jokul/input-group";
import { TextInput } from "@fremtind/jokul/text-input";

<InputGroup
    label="Fornavn"
    render={(props) => <TextInput {...props} />}
/>`,
            preview: <BasicInputGroupPreview />,
        },
        {
            title: "Med hjelpetekst og feilmelding",
            description: "helpLabel og errorLabel kobles automatisk til feltet via aria-describedby.",
            uses: ["text-input"],
            code: `import { InputGroup } from "@fremtind/jokul/input-group";
import { TextInput } from "@fremtind/jokul/text-input";

<InputGroup
    label="E-postadresse"
    helpLabel="Vi bruker e-post til å sende kvittering."
    render={(props) => <TextInput {...props} />}
/>

<InputGroup
    label="Telefonnummer"
    errorLabel="Ugyldig telefonnummer."
    render={(props) => <TextInput {...props} aria-invalid />}
/>`,
            preview: <InputGroupWithLabelsPreview />,
        },
        {
            title: "FieldGroup med avkrysningsbokser",
            description: "FieldGroup rendrer et fieldset og er riktig element for grupper av relaterte valg.",
            uses: ["checkbox"],
            code: `import { FieldGroup } from "@fremtind/jokul/input-group";
import { Checkbox } from "@fremtind/jokul/checkbox";

<FieldGroup legend="Velg interesser" helpLabel="Du kan velge flere alternativ.">
    <Checkbox name="interests" value="sport">Sport</Checkbox>
    <Checkbox name="interests" value="kultur">Kultur</Checkbox>
    <Checkbox name="interests" value="teknologi">Teknologi</Checkbox>
</FieldGroup>`,
            preview: <FieldGroupCheckboxPreview />,
        },
    ],
    relatedIds: ["text-input", "checkbox", "radio-button", "help"],
};

export default doc;
