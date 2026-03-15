import type { ComponentDoc } from "../types";
import { props } from "./props";
import { SearchPreview } from "./preview";

const doc: ComponentDoc = {
    id: "search",
    name: "Search Input",
    package: "@fremtind/jokul/search",
    category: "Skjema",
    description: "SearchInput er et søkeinputfelt med søkeikon og valgfri label.",
    relationships: {
        related: [{ id: "text-input", description: "Search utvider TextInput med en dedikert søkerolle og en valgfri innsendingsknapp." }, { id: "autosuggest", description: "Kombiner Search med Autosuggest for å vise direkteforslag mens brukeren skriver et søk." }],
    },
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
};

export default doc;
