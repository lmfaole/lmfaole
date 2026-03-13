import React, { useState, useEffect } from "react";
import { Select } from "@fremtind/jokul/select";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const STABLE_OPTIONS = ["Bilforsikring", "Reiseforsikring", "Innboforsikring"];

function SelectStablePreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Select
            label="Velg forsikring"
            name="insurance-preview"
            items={STABLE_OPTIONS}
            value={STABLE_OPTIONS[step]}
            onChange={() => {}}
        />
    );
}

function SelectControlledExample() {
    const [value, setValue] = useState("");
    return (
        <Select
            label="Fylke"
            name="county"
            items={["Oslo", "Viken", "Innlandet", "Agder"]}
            value={value}
            onChange={({ target }) => setValue(target.value)}
        />
    );
}

function SelectValuePairExample() {
    const [value, setValue] = useState("");
    return (
        <Select
            label="Rolle"
            name="role"
            items={[
                { value: "dev", label: "Utvikler" },
                { value: "design", label: "Designer" },
                { value: "po", label: "Produkteier" },
            ]}
            value={value}
            onChange={({ target }) => setValue(target.value)}
            helpLabel="Velg rollen som best beskriver deg"
        />
    );
}

const doc: ComponentDoc = {
    id: "select-stable",
    name: "Select",
    package: "@fremtind/jokul/select",
    category: "Skjema",
    status: "stable",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "nedtrekksmeny"],
    description: "Select er nedtrekksmenyen med egendefinert dropdown-grensesnitt. Den tar en items-array og har sin egen SelectChangeEventHandler. En ny, forenklet variant — BETA_Select — er under utvikling og vil erstatte denne over tid.",
    relatedIds: ["select", "radio-button", "autosuggest"],
    warnings: [
        "BETA_Select er den anbefalte veien videre. Se migreringsveiledningen nedenfor for å komme i gang.",
    ],
    preview: <SelectStablePreview />,
    props: [
        { name: "label", type: "string", required: true, source: "custom", status: "stable", description: "Synlig label over nedtrekksmenyen." },
        { name: "name", type: "string", required: true, source: "custom", status: "stable", description: "Skjemafeltets navn — brukes av react-hook-form og native form submit." },
        { name: "items", type: "Array<string | ValuePair>", required: true, source: "custom", status: "stable", description: "Liste over valgmuligheter. Bruk ValuePair ({ value, label }) for å skille mellom verdi og visningsnavn." },
        { name: "value", type: "string", required: false, source: "custom", status: "stable", description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "SelectChangeEventHandler", required: false, source: "custom", status: "stable", description: "Kalles med { type: 'change', target: { name, value } } ved valg. Kompatibel med react-hook-form." },
        { name: "onBlur", type: "SelectChangeEventHandler", required: false, source: "custom", status: "stable", description: "Kalles med { type: 'blur', target: { name, value } } når feltet mister fokus." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "stable", description: "Feilmelding vist under feltet." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst vist under feltet." },
        { name: "defaultPrompt", type: "string", required: false, source: "custom", status: "stable", default: '"Velg"', description: "Plassholdertekst som vises når ingenting er valgt." },
        { name: "searchable", type: "boolean | ((searchValue: string, item: string | ValuePair) => boolean)", required: false, source: "custom", status: "stable", default: "false", description: "Aktiverer søk i listen. Kan ta en egendefinert filtreringsfunksjon." },
        { name: "maxShownOptions", type: "number", required: false, source: "custom", status: "stable", default: "5", description: "Antall valg synlig i listen før den scroller." },
        { name: "inline", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Viser label og nedtrekksmeny på samme linje." },
        { name: "width", type: "string", required: false, source: "custom", status: "stable", description: "Setter bredden på nedtrekksmenyen (CSS-verdi)." },
        { name: "disabled", type: "boolean", required: false, source: "native", status: "stable", description: "Deaktiverer feltet." },
    ],
    examples: [
        {
            title: "Grunnleggende nedtrekksmeny",
            code: `const [value, setValue] = useState("");

<Select
    label="Fylke"
    name="county"
    items={["Oslo", "Viken", "Innlandet", "Agder"]}
    value={value}
    onChange={({ target }) => setValue(target.value)}
/>`,
            preview: <SelectControlledExample />,
        },
        {
            title: "Med ValuePair og hjelpetekst",
            description: "Bruk ValuePair-objekter når verdien og visningsnavnet skal være forskjellige.",
            code: `const [value, setValue] = useState("");

<Select
    label="Rolle"
    name="role"
    items={[
        { value: "dev", label: "Utvikler" },
        { value: "design", label: "Designer" },
        { value: "po", label: "Produkteier" },
    ]}
    value={value}
    onChange={({ target }) => setValue(target.value)}
    helpLabel="Velg rollen som best beskriver deg"
/>`,
            preview: <SelectValuePairExample />,
        },
        {
            title: "Migrer fra Select til BETA_Select",
            description: "BETA_Select bruker native <option>-elementer som children i stedet for en items-array, og standard React onChange i stedet for SelectChangeEventHandler.",
            migrationBefore: `import { Select } from "@fremtind/jokul/select";

<Select
    label="Fylke"
    name="county"
    items={["Oslo", "Viken", "Innlandet", "Agder"]}
    value={value}
    onChange={({ target }) => setValue(target.value)}
/>`,
            migrationSteps: [
                'Endre importen fra Select til BETA_Select: import { BETA_Select as Select } from "@fremtind/jokul/select"',
                "Fjern items-propen.",
                "Legg til <option>-elementer som children. Bruk value-attributtet for å sette verdien.",
                "Endre onChange til å bruke standard React ChangeEvent: onChange={(e) => setValue(e.target.value)}",
                "Gi nytt navn til defaultPrompt → placeholder om du brukte det.",
                "Merk: searchable og maxShownOptions er ikke tilgjengelig i BETA_Select ennå.",
            ],
            code: `import { BETA_Select as Select } from "@fremtind/jokul/select";

<Select
    label="Fylke"
    name="county"
    value={value}
    onChange={(e) => setValue(e.target.value)}
>
    <option value="oslo">Oslo</option>
    <option value="viken">Viken</option>
    <option value="innlandet">Innlandet</option>
    <option value="agder">Agder</option>
</Select>`,
        },
    ],
};

export default doc;
