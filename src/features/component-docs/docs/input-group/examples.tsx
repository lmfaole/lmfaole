import { useState, useEffect } from "react";
import { InputGroup, FieldGroup } from "@fremtind/jokul/input-group";
import { TextInput } from "@fremtind/jokul/text-input";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export function InputGroupPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");
    const text = "1 500";

    useEffect(() => {
        if (!isHovered) { setValue(""); return; }
        let i = 0;
        const id = setInterval(() => {
            i++;
            setValue(text.slice(0, i));
            if (i >= text.length) clearInterval(id);
        }, 120);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <InputGroup
            label="Beløp"
            render={(props) => <TextInput label="" {...props} value={value} onChange={() => {}} />}
        />
    );
}

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
                supportLabelProps={{ label: "Vi bruker e-post til å sende kvittering.", labelType: "help" }}
                render={(props) => <TextInput label="" {...props} />}
            />
            <InputGroup
                label="Telefonnummer"
                supportLabelProps={{ label: "Ugyldig telefonnummer.", labelType: "error" }}
                render={(props) => <TextInput label="" {...props} aria-invalid />}
            />
        </div>
    );
}

function FieldGroupCheckboxPreview() {
    return (
        <FieldGroup legend="Velg interesser" supportLabelProps={{ label: "Du kan velge flere alternativ.", labelType: "help" }}>
            <Checkbox name="interests" value="sport">Sport</Checkbox>
            <Checkbox name="interests" value="kultur">Kultur</Checkbox>
            <Checkbox name="interests" value="teknologi">Teknologi</Checkbox>
        </FieldGroup>
    );
}


export const examples: ComponentExample[] = [
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
                description: "Bruk supportLabelProps for støttetekst under feltet. labelType=\"help\" (standard) viser hjelpetekst, labelType=\"error\" viser feilmelding med ikon.",
                uses: ["text-input"],
                code: `import { InputGroup } from "@fremtind/jokul/input-group";
    import { TextInput } from "@fremtind/jokul/text-input";

    <InputGroup
        label="E-postadresse"
        supportLabelProps={{ label: "Vi bruker e-post til å sende kvittering.", labelType: "help" }}
        render={(props) => <TextInput {...props} />}
    />

    <InputGroup
        label="Telefonnummer"
        supportLabelProps={{ label: "Ugyldig telefonnummer.", labelType: "error" }}
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


        const id = setInterval(() => {
    <FieldGroup
        legend="Velg interesser"
        supportLabelProps={{ label: "Du kan velge flere alternativ.", labelType: "help" }}
    >
        <Checkbox name="interests" value="sport">Sport</Checkbox>
        <Checkbox name="interests" value="kultur">Kultur</Checkbox>
        <Checkbox name="interests" value="teknologi">Teknologi</Checkbox>
    </FieldGroup>`,
                preview: <FieldGroupCheckboxPreview />,
            }
];
