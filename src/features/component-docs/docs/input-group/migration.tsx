import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "Hjelpetekst og feilmelding samles i supportLabelProps",
        description: "helpLabel og errorLabel er utfaset. Bruk supportLabelProps med label og labelType i stedet.",
        uses: ["text-input"],
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
        after: `<InputGroup
    label="E-postadresse"
    supportLabelProps={{ label: "Vi bruker e-post til å sende kvittering.", labelType: "help" }}
    render={(props) => <TextInput {...props} />}
/>
<InputGroup
    label="Telefonnummer"
    supportLabelProps={{ label: "Ugyldig telefonnummer.", labelType: "error" }}
    render={(props) => <TextInput {...props} aria-invalid />}
/>`,
    },
];
