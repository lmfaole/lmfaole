import { useState, useEffect } from "react";
import { InputGroup, FieldGroup } from "@fremtind/jokul/input-group";
import { TextInput } from "@fremtind/jokul/text-input";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";

export const migrations: ComponentExample[] = [
    {
                title: "Hjelpetekst og feilmelding samles i supportLabelProps",
                description: "helpLabel og errorLabel er utfaset. Bruk supportLabelProps med label og labelType i stedet.",
                uses: ["text-input"],
                migration: {
                    deprecates: [{ name: "helpLabel", kind: "prop" }, { name: "errorLabel", kind: "prop" }],
                    replacedBy: [{ name: "supportLabelProps", kind: "prop" }],
                    before: `<InputGroup
        label="E-postadresse"
        helpLabel="Vi bruker e-post til å sende kvittering."
        render={(props) => <TextInput {...props} />}
    />
    <InputGroup
        label="Telefonnummer"
        errorLabel="Ugyldig telefonnummer."
        render={(props) => <TextInput {...props} aria-invalid />}
    />`,

                },
                code: `<InputGroup
        label="E-postadresse"
        supportLabelProps={{ label: "Vi bruker e-post til å sende kvittering.", labelType: "help" }}
        render={(props) => <TextInput {...props} />}
    />
    <InputGroup
        label="Telefonnummer"
        supportLabelProps={{ label: "Ugyldig telefonnummer.", labelType: "error" }}
        render={(props) => <TextInput {...props} aria-invalid />}
    />`,
            }
];
