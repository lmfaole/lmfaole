"use client";
import React, { useState, useEffect } from "react";
import { Autosuggest } from "@fremtind/jokul/autosuggest";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const ALL_CITIES = ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"];
const TYPING_TARGET = "Bergen";

function AutosuggestPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");

    useEffect(() => {
        if (!isHovered) {
            setValue("");
            return;
        }
        let i = 0;
        const id = setInterval(() => {
            i++;
            setValue(TYPING_TARGET.slice(0, i));
            if (i >= TYPING_TARGET.length) clearInterval(id);
        }, 120);
        return () => clearInterval(id);
    }, [isHovered]);

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
    warnings: "Forslagene filtreres ikke automatisk — du håndterer filtrering selv og oppdaterer suggestions-prop.",
    relatedIds: ["text-input", "select"],
    preview: <AutosuggestPreview />,
    props: [
        { name: "label", type: "string", required: true, source: "custom", status: "stable", description: "Synlig label over inputfeltet." },
        { name: "suggestions", type: "string[]", required: true, source: "custom", status: "stable", description: "Liste over forslag som vises under feltet." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Kontrollert verdi." },
        { name: "onChange", type: "(value: string) => void", required: false, source: "react", status: "stable", description: "Kalles ved endring i inputverdien." },
        { name: "onSelect", type: "(value: string) => void", required: false, source: "react", status: "stable", description: "Kalles når brukeren velger et forslag." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst vist under label." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "stable", description: "Feilmelding vist under feltet." },
        { name: "noSuggestionsText", type: "string", required: false, source: "custom", status: "stable", description: "Tekst vist når ingen forslag matcher." },
        { name: "leadText", type: "string", required: false, source: "custom", status: "deprecated", statusDescription: "Bruk helpLabel, eller flytt teksten over skjemafeltets label.", description: "Tekst over inputfeltet." },
        { name: "noHitsMessage", type: "React.ReactNode", required: false, source: "custom", status: "deprecated", statusDescription: "Bruk noHits med text og evt. defaultverdier for items.", description: "Melding vist når ingen forslag matcher (gammel API)." },
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
        {
            title: "Hjelpetekst og ingen-treff-melding har fått nye props",
            description: "leadText og noHitsMessage er utfaset. Bruk helpLabel for hjelpetekst og noHits-objektet for ingen-treff-melding.",
            migrationBefore: `<Autosuggest
    label="Hjemsted"
    leadText="Begynn å skrive for å se forslag"
    noHitsMessage={<span>Ingen treff</span>}
    allItems={cities}
    onChange={setValue}
/>`,
            code: `<Autosuggest
    label="Hjemsted"
    helpLabel="Begynn å skrive for å se forslag"
    noHits={{ items: [], text: "Ingen byer funnet – prøv et annet søk" }}
    allItems={cities}
    onChange={setValue}
/>`,
        },
    ],
};

export default doc;
