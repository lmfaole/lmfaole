import React from "react";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "autosuggest",
    name: "Autosuggest",
    package: "@fremtind/jokul/autosuggest",
    category: "Skjema",
    description: "Autosuggest er et tekstinputfelt som viser forslag mens brukeren skriver. Passer for søk og fritekstfelt med et endelig sett av gyldige valg.",
    notes: "Krev ikke valg fra forslagslisten — brukeren skal kunne skrive fritt.",
    relatedIds: ["text-input", "select"],
    props: [
        { name: "label", type: "string", required: true, description: "Synlig label over inputfeltet." },
        { name: "suggestions", type: "string[]", required: true, description: "Liste over forslag som vises under feltet." },
        { name: "value", type: "string", required: false, description: "Kontrollert verdi." },
        { name: "onChange", type: "(value: string) => void", required: false, description: "Kalles ved endring i inputverdien." },
        { name: "onSelect", type: "(value: string) => void", required: false, description: "Kalles når brukeren velger et forslag." },
        { name: "helpLabel", type: "string", required: false, description: "Hjelpetekst vist under label." },
        { name: "errorLabel", type: "string", required: false, description: "Feilmelding vist under feltet." },
        { name: "noSuggestionsText", type: "string", required: false, description: "Tekst vist når ingen forslag matcher." },
    ],
    examples: [
        {
            title: "Grunnleggende bruk",
            description: "Autosuggest med statisk forslagsliste.",
            code: `const [value, setValue] = React.useState("");
const allSuggestions = ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"];
const suggestions = allSuggestions.filter(s =>
    s.toLowerCase().startsWith(value.toLowerCase())
);

<Autosuggest
    label="Hjemsted"
    suggestions={suggestions}
    value={value}
    onChange={setValue}
    onSelect={setValue}
    helpLabel="Begynn å skrive for å se forslag"
/>`,
        },
    ],
};

export default doc;
