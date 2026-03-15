import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";
import { TextInputPreview } from "./preview";

const doc: ComponentDoc = {
    id: "text-input",
    name: "Text Input",
    package: "@fremtind/jokul/text-input",
    category: "Skjema",
    description: "TextInput er en enkeltlinjers tekstinndatafelt. Komponenten inkluderer label, feilmelding og hjelpetekst i ett og håndterer tilgjengelighet automatisk — label er koblet til input via htmlFor/id. Alle skjema-primitiver i Jøkul følger samme API-mønster.",
    relationships: {
        related: [{ id: "button", description: "Plasser Button ved siden av TextInput for å lage et søkefelt eller en innebygd skjemahandling." }],
    },
    preview: <TextInputPreview />,

    props,
    migrations
};

export default doc;
