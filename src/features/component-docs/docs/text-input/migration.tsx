import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "action er utfaset",
        description: "Bruk actionButton med et ferdig React-element — typisk en Button eller IconButton.",
        uses: ["button"],
        deprecates: { name: "action", kind: "prop" },
        replacedBy: [{ name: "actionButton", kind: "prop" }],
        before: `<TextInput
    label="Søk"
    action={{ icon: "search", label: "Søk", onClick: handleSearch }}
/>`,
        after: `import { Button } from "@fremtind/jokul/button";

<TextInput
    label="Søk"
    actionButton={
        <Button variant="secondary" onClick={handleSearch}>
            Søk
        </Button>
    }
/>`,
    },
];
