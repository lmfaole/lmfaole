"use client";
import React, { useEffect, useRef } from "react";
import { Search } from "@fremtind/jokul/search";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function SearchPreview() {
    const isHovered = usePreviewHovered();
    const inputRef = useRef<HTMLInputElement>(null);
    const text = "bilforsikring";

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        if (!isHovered) {
            input.value = "";
            return;
        }
        let i = 0;
        const id = setInterval(() => {
            i++;
            input.value = text.slice(0, i);
            if (i >= text.length) clearInterval(id);
        }, 120);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Search
            ref={inputRef}
            label="Søk"
            placeholder="Søk etter forsikring..."
            name="search-preview"
        >
            <Search.Button label="Søk" />
        </Search>
    );
}

const doc: ComponentDoc = {
    id: "search",
    name: "SearchInput",
    package: "@fremtind/jokul/search",
    category: "Skjema",
    tags: ["input", "søk", "skjema", "interaktiv"],
    description: "SearchInput er et søkeinputfelt med søkeikon og valgfri label.",
    relatedIds: ["text-input", "autosuggest"],
    preview: <SearchPreview />,
    props: [
        { name: "label", type: "string", required: false, source: "custom", status: "stable", default: '"Søk"', description: "Tilgjengelig label." },
        { name: "placeholder", type: "string", required: false, source: "native", status: "stable", description: "Plassholdertekst." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved endring." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Kontrollert verdi." },
    ],
    subComponents: [
        {
            name: "Search.Button",
            description: "Frittstående søkeknapp som pares med Search-inputfeltet i et skjema. Rendrer en ghost-knapp med søketekst.",
            props: [
                { name: "label", type: "string", required: false, source: "custom", status: "stable", default: '"Søk"', description: "Tekst i knappen." },
                { name: "type", type: '"button" | "submit" | "reset"', required: false, source: "native", status: "stable", default: '"button"', description: "HTML-type-attributtet." },
                { name: "onClick", type: "React.MouseEventHandler<HTMLButtonElement>", required: false, source: "react", status: "stable", description: "Klikk-handler." },
            ],
        },
    ],
    examples: [
        {
            title: "Søkefelt med knapp",
            description: "Standard bruk: Search og Search.Button side om side i et skjema.",
            code: `<Search label="Søk" placeholder="Søk etter forsikring..." name="q">
  <Search.Button label="Søk" type="submit" />
</Search>`,
            preview: (
                <Search label="Søk" placeholder="Søk etter forsikring..." name="q">
                    <Search.Button label="Søk" type="submit" />
                </Search>
            ),
        },
        {
            title: "Uten synlig label",
            description: "Søkefelt med aria-label for kompakte flater.",
            code: `<Search aria-label="Søk i dokumenter" placeholder="Søk i dokumenter..." />`,
            preview: <Search aria-label="Søk i dokumenter" placeholder="Søk i dokumenter..." />,
        },
    ],
};

export default doc;
