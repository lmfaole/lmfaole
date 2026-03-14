import { useState, useEffect } from "react";
import { InputGroup, FieldGroup } from "@fremtind/jokul/input-group";
import { TextInput } from "@fremtind/jokul/text-input";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";
import { InputGroupPreview } from "./examples";

const doc: ComponentDoc = {
    id: "input-group",
    name: "Input Group",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    tags: ["skjema", "input", "label", "feil", "hjelp", "fieldset"],
    status: "stable",
    description:
        "InputGroup kombinerer et skjemafelt med label, hjelpetekst og feilmelding på en tilgjengelig måte. FieldGroup bruker et fieldset-element for grupper av relaterte felt som avkrysningsbokser og radioknapper.",
    warnings: "Bruk render-prop-mønsteret for å spre tilgjengelighetsprops (id, aria-describedby, aria-invalid) automatisk til det underliggende feltet.",
    preview: <InputGroupPreview />,

    relatedIds: ["text-input", "checkbox", "radio-button", "help"],
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
    examples: [...examples, ...migrations],
};

export default doc;
