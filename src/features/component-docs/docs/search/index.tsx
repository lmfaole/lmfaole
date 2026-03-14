import { useEffect, useRef } from "react";
import { Search } from "@fremtind/jokul/search";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function SearchPreview() {
    const isHovered = usePreviewHovered();
    const inputRef = useRef<HTMLInputElement>(null);
    const text = "bilforsikring";
    useEffect(() => {
        if (!isHovered) {
            if (inputRef.current) inputRef.current.value = "";
            return;
        }
        const input = inputRef.current;
        let i = 0;
        const id = setInterval(() => {
            if (input) input.value = text.slice(0, ++i);
            if (i >= text.length) clearInterval(id);
        }, 120);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Search label="Søk" name="q" ref={inputRef as React.RefObject<HTMLInputElement>}>
            <Search.Button label="Søk" />
        </Search>
    );
}

const doc: ComponentDoc = {
    id: "search",
    name: "Search Input",
    package: "@fremtind/jokul/search",
    category: "Skjema",
    tags: ["input", "søk", "skjema", "interaktiv"],
    description: "SearchInput er et søkeinputfelt med søkeikon og valgfri label.",
    relatedIds: ["text-input", "autosuggest"],
    preview: <SearchPreview />,

    props,
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
    examples,
};

export default doc;
