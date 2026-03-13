import React, { useState } from "react";
import { Autosuggest } from "@fremtind/jokul/autosuggest";
import { TextInput } from "@fremtind/jokul/text-input";
import type { ComponentDoc } from "./types";

const ALL_CITIES = ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"];

function AutosuggestPreview() {
    const [value, setValue] = useState("");
    return (
        <Autosuggest
            label="Hjemsted"
            allItems={ALL_CITIES}
            value={value}
            onInputValueChange={setValue}
            onChange={setValue}
            helpLabel="Begynn å skrive for å se forslag"
        />
    );
}

function AutosuggestErrorPreview() {
    const [value, setValue] = useState("xyz");
    return (
        <Autosuggest
            label="Hjemsted"
            allItems={ALL_CITIES}
            value={value}
            onInputValueChange={setValue}
            onChange={setValue}
            errorLabel="Velg en gyldig by fra listen"
        />
    );
}

function AutosuggestNoHitsPreview() {
    const [value, setValue] = useState("");
    return (
        <Autosuggest
            label="Hjemsted"
            allItems={ALL_CITIES}
            value={value}
            onInputValueChange={setValue}
            onChange={setValue}
            noHits={{ items: [], text: "Ingen byer funnet – prøv et annet søk" }}
        />
    );
}

const doc: ComponentDoc = {
    id: "autosuggest",
    name: "Autosuggest",
    package: "@fremtind/jokul/autosuggest",
    category: "Skjema",
    tags: ["input", "skjema", "søk", "interaktiv", "kontrollert"],
    description: "Autosuggest er et tekstinputfelt som viser forslag mens brukeren skriver. Passer for søk og fritekstfelt med et endelig sett av gyldige valg.",
    notes: "Krev ikke valg fra forslagslisten — brukeren skal kunne skrive fritt.",
    relatedIds: ["text-input", "select"],
    props: [
        { name: "label", type: "string", required: true, source: "custom", description: "Synlig label over inputfeltet." },
        { name: "suggestions", type: "string[]", required: true, source: "custom", description: "Liste over forslag som vises under feltet." },
        { name: "value", type: "string", required: false, source: "native", description: "Kontrollert verdi." },
        { name: "onChange", type: "(value: string) => void", required: false, source: "custom", description: "Kalles ved endring i inputverdien." },
        { name: "onSelect", type: "(value: string) => void", required: false, source: "custom", description: "Kalles når brukeren velger et forslag." },
        { name: "helpLabel", type: "string", required: false, source: "custom", description: "Hjelpetekst vist under label." },
        { name: "errorLabel", type: "string", required: false, source: "custom", description: "Feilmelding vist under feltet." },
        { name: "noSuggestionsText", type: "string", required: false, source: "custom", description: "Tekst vist når ingen forslag matcher." },
    ],
    examples: [
        {
            title: "Grunnleggende bruk",
            description: "Autosuggest med statisk forslagsliste.",
            code: `const [value, setValue] = React.useState("");

<Autosuggest
    label="Hjemsted"
    allItems={["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"]}
    value={value}
    onInputValueChange={setValue}
    onChange={setValue}
    helpLabel="Begynn å skrive for å se forslag"
/>`,
            tags: ["controlled"],
            preview: <TextInput label="Hjemsted" value="" helpLabel="Begynn å skrive for å se forslag" onChange={() => {}} />,
        },
        {
            title: "Interaktivt eksempel",
            description: "Skriv i feltet for å filtrere forslag fra listen.",
            code: `const [value, setValue] = React.useState("");

<Autosuggest
    label="Hjemsted"
    allItems={["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"]}
    value={value}
    onInputValueChange={setValue}
    onChange={setValue}
    helpLabel="Begynn å skrive for å se forslag"
/>`,
            tags: ["controlled", "interaktiv"],
            preview: <AutosuggestPreview />,
        },
        {
            title: "Med feilmelding",
            description: "Autosuggest viser feilmelding når input er ugyldig.",
            code: `const [value, setValue] = React.useState("xyz");

<Autosuggest
    label="Hjemsted"
    allItems={["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"]}
    value={value}
    onInputValueChange={setValue}
    onChange={setValue}
    errorLabel="Velg en gyldig by fra listen"
/>`,
            tags: ["error-state", "controlled"],
            preview: <AutosuggestErrorPreview />,
        },
        {
            title: "Ingen treff-tekst",
            description: "Viser tilpasset tekst når ingen forslag matcher det brukeren har skrevet.",
            code: `const [value, setValue] = React.useState("");

<Autosuggest
    label="Hjemsted"
    allItems={["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"]}
    value={value}
    onInputValueChange={setValue}
    onChange={setValue}
    noHits={{ items: [], text: "Ingen byer funnet – prøv et annet søk" }}
/>`,
            preview: <AutosuggestNoHitsPreview />,
        },
    ],
};

export default doc;
