import { useState, useEffect } from "react";
import { Select } from "@fremtind/jokul/select";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const STABLE_OPTIONS = ["Bilforsikring", "Reiseforsikring", "Innboforsikring"];


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


export const examples: ComponentExample[] = [
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
            }
];
