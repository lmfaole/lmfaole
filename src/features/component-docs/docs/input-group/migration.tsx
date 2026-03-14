import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "helpLabel er utfaset",
        description: "Bruk supportLabelProps med labelType: \"help\" i stedet.",
        uses: ["text-input"],
        deprecates: { name: "helpLabel", kind: "prop" },
        replacedBy: [{ name: "supportLabelProps", kind: "prop" }],
        before: `<InputGroup
    label="E-postadresse"
    helpLabel="Vi bruker e-post til å sende kvittering."
    render={(props) => <TextInput {...props} />}
/>`,
        after: `<InputGroup
    label="E-postadresse"
    supportLabelProps={{ label: "Vi bruker e-post til å sende kvittering.", labelType: "help" }}
    render={(props) => <TextInput {...props} />}
/>`,
    },
    {
        title: "errorLabel er utfaset",
        description: "Bruk supportLabelProps med labelType: \"error\" i stedet.",
        uses: ["text-input"],
        deprecates: { name: "errorLabel", kind: "prop" },
        replacedBy: [{ name: "supportLabelProps", kind: "prop" }],
        before: `<InputGroup
    label="Telefonnummer"
    errorLabel="Ugyldig telefonnummer."
    render={(props) => <TextInput {...props} aria-invalid />}
/>`,
        after: `<InputGroup
    label="Telefonnummer"
    supportLabelProps={{ label: "Ugyldig telefonnummer.", labelType: "error" }}
    render={(props) => <TextInput {...props} aria-invalid />}
/>`,
    },
];
