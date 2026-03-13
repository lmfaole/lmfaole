import React, { useState } from "react";
import { Combobox } from "@fremtind/jokul/combobox";
import type { ComponentDoc } from "./types";

const LANGUAGE_ITEMS = [
    { value: "no", label: "Norsk" },
    { value: "en", label: "Engelsk" },
    { value: "de", label: "Tysk" },
    { value: "fr", label: "Fransk" },
    { value: "es", label: "Spansk" },
];

function ComboboxBasicPreview() {
    const [selected, setSelected] = useState<Array<{ value: string; label: string }>>([]);

    return (
        <Combobox
            label="Språk"
            name="languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
        />
    );
}

function ComboboxHelpPreview() {
    const [selected, setSelected] = useState<Array<{ value: string; label: string }>>([]);

    return (
        <Combobox
            label="Foretrukne språk"
            name="preferred-languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
            helpLabel="Du kan velge flere språk"
        />
    );
}

function ComboboxErrorPreview() {
    const [selected, setSelected] = useState<Array<{ value: string; label: string }>>([]);

    return (
        <Combobox
            label="Påkrevde språk"
            name="required-languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
            errorLabel="Du må velge minst ett språk"
        />
    );
}

const doc: ComponentDoc = {
    id: "combobox",
    name: "Combobox",
    package: "@fremtind/jokul/combobox",
    category: "Skjema",
    tags: ["multi-select", "chips", "søk", "input", "skjema", "kontrollert"],
    status: "stable",
    description:
        "Combobox er et flervalg-skjemaelement med søkefunksjon. Valgte elementer vises som chips og kan fjernes enkeltvis.",
    relatedIds: ["select", "autosuggest"],
    props: [
        {
            name: "label",
            type: "string",
            required: true,
            source: "custom",
            description: "Synlig label over feltet.",
        },
        {
            name: "name",
            type: "string",
            required: true,
            source: "native",
            description: "Skjemafeltets navn.",
        },
        {
            name: "items",
            type: "Array<{ value: string; label: string }>",
            required: true,
            source: "custom",
            description: "Liste over tilgjengelige alternativer.",
        },
        {
            name: "onChange",
            type: '(event: { type: "change" | "blur", target: { name: string, value: string, selectedOptions: Array<{value: string, label: string}> } }) => void',
            required: true,
            source: "react",
            description:
                "Kalles ved endring. Bruk event.target.selectedOptions for å hente valgte elementer.",
        },
        {
            name: "value",
            type: "Array<{ value: string; label: string }>",
            required: false,
            source: "custom",
            description: "Kontrollert liste over valgte elementer. Merk: i motsetning til det native HTML value-attributtet (en streng), bruker Combobox et Jøkul-spesifikt objekt-array for å representere valgte alternativer med både verdi og visningsnavn.",
        },
        {
            name: "placeholder",
            type: "string",
            required: false,
            source: "native",
            description: "Plassholdertekst i søkefeltet.",
        },
        {
            name: "helpLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Hjelpetekst under feltet.",
        },
        {
            name: "errorLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Feilmelding som vises under feltet.",
        },
        {
            name: "noMatchingOption",
            type: "string",
            required: false,
            source: "custom",
            default: '"Ingen treff"',
            description: "Tekst som vises når søket ikke gir treff.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende flervalg",
            description: "Combobox med enkel liste over valg.",
            code: `import { useState } from "react";
import { Combobox } from "@fremtind/jokul/combobox";

const LANGUAGE_ITEMS = [
    { value: "no", label: "Norsk" },
    { value: "en", label: "Engelsk" },
    { value: "de", label: "Tysk" },
    { value: "fr", label: "Fransk" },
    { value: "es", label: "Spansk" },
];

function ComboboxExample() {
    const [selected, setSelected] = useState([]);

    return (
        <Combobox
            label="Språk"
            name="languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
        />
    );
}`,
            preview: <ComboboxBasicPreview />,
        },
        {
            title: "Med hjelpetekst",
            description: "helpLabel gir brukeren ekstra kontekst.",
            code: `import { useState } from "react";
import { Combobox } from "@fremtind/jokul/combobox";

function ComboboxWithHelp() {
    const [selected, setSelected] = useState([]);

    return (
        <Combobox
            label="Foretrukne språk"
            name="preferred-languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
            helpLabel="Du kan velge flere språk"
        />
    );
}`,
            preview: <ComboboxHelpPreview />,
        },
        {
            title: "Med feilmelding",
            description: "errorLabel vises når validering feiler.",
            tags: ["error-state"],
            code: `import { useState } from "react";
import { Combobox } from "@fremtind/jokul/combobox";

function ComboboxWithError() {
    const [selected, setSelected] = useState([]);

    return (
        <Combobox
            label="Påkrevde språk"
            name="required-languages"
            items={LANGUAGE_ITEMS}
            value={selected}
            onChange={(e) => setSelected(e.target.selectedOptions)}
            errorLabel="Du må velge minst ett språk"
        />
    );
}`,
            preview: <ComboboxErrorPreview />,
        },
    ],
};

export default doc;
