import { useState, useEffect } from "react";
import { Autosuggest } from "@fremtind/jokul/autosuggest";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const ALL_CITIES = ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"];

const TYPING_TARGET = "Bergen";


export function AutosuggestPreview() {
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


export const examples: ComponentExample[] = [
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
            }
];
