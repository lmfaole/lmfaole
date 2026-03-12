import React from "react";
import { Search } from "@fremtind/jokul/search";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "search",
    name: "SearchInput",
    package: "@fremtind/jokul/search",
    category: "Skjema",
    description: "SearchInput er et søkeinputfelt med søkeikon og valgfri label.",
    notes: "Bruk label for tilgjengelighet, selv om den er visuelt skjult.",
    relatedIds: ["text-input", "autosuggest"],
    props: [
        { name: "label", type: "string", required: false, description: "Tilgjengelig label." },
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
    ],
};

export default doc;
