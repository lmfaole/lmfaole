import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "leadText er utfaset",
        description: "Bruk helpLabel for hjelpetekst under etiketten.",
        deprecates: { name: "leadText", kind: "prop" },
        replacedBy: [{ name: "helpLabel", kind: "prop" }],
        before: `<Autosuggest
    label="Hjemsted"
    leadText="Begynn å skrive for å se forslag"
    allItems={cities}
    onChange={setValue}
/>`,
        after: `<Autosuggest
    label="Hjemsted"
    helpLabel="Begynn å skrive for å se forslag"
    allItems={cities}
    onChange={setValue}
/>`,
    },
    {
        title: "noHitsMessage er utfaset",
        description: "Bruk noHits-objektet med items og text for å håndtere ingen-treff-tilstanden.",
        deprecates: { name: "noHitsMessage", kind: "prop" },
        replacedBy: [{ name: "noHits", kind: "prop" }],
        before: `<Autosuggest
    label="Hjemsted"
    noHitsMessage={<span>Ingen treff</span>}
    allItems={cities}
    onChange={setValue}
/>`,
        after: `<Autosuggest
    label="Hjemsted"
    noHits={{ items: [], text: "Ingen byer funnet – prøv et annet søk" }}
    allItems={cities}
    onChange={setValue}
/>`,
    },
];
