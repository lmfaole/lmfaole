import React from "react";
import { Search } from "@fremtind/jokul/search";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "search",
    name: "SearchInput",
    package: "@fremtind/jokul/search",
    category: "Skjema",
    tags: ["input", "søk", "skjema", "interaktiv"],
    description: "SearchInput er et søkeinputfelt med søkeikon og valgfri label.",
    notes: "Bruk label for tilgjengelighet, selv om den er visuelt skjult.",
    relatedIds: ["text-input", "autosuggest"],
    props: [
        { name: "label", type: "string", required: false, default: '"Søk"', description: "Tilgjengelig label." },
        { name: "placeholder", type: "string", required: false, description: "Plassholdertekst." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, description: "Kalles ved endring." },
        { name: "value", type: "string", required: false, description: "Kontrollert verdi." },
    ],
    examples: [
        {
            title: "Søkefelt",
            description: "Standard søkefelt med placeholder.",
            code: `<Search label="Søk" placeholder="Søk etter forsikring..." />`,
            preview: <Search label="Søk" placeholder="Søk etter forsikring..." />,
        },
        {
            title: "Med kontrollert verdi",
            description: "Kontrollert søkefelt som viser antall tegn skrevet.",
            code: `const [query, setQuery] = React.useState("");

<>
  <Search
    label="Søk i avtaler"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Skriv for å søke..."
  />
  {query.length > 0 && (
    <p>Søker etter: «{query}»</p>
  )}
</>`,
            tags: ["controlled"],
        },
        {
            title: "Uten synlig label",
            description: "Søkefelt med aria-label i stedet for synlig label, for kompakte flater.",
            code: `<Search
    aria-label="Søk i dokumenter"
    placeholder="Søk i dokumenter..."
/>`,
            preview: <Search aria-label="Søk i dokumenter" placeholder="Søk i dokumenter..." />,
        },
    ],
};

export default doc;
