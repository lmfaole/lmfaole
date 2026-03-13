import React from "react";
import { Select } from "@fremtind/jokul/select";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "select",
    name: "Select",
    package: "@fremtind/jokul/select",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "søk", "skjemabygging"],
    description: "Select er et nedtrekksmeny-skjemaelement for å velge ett alternativ fra en liste.",
    notes: "Bruk Select når listen har 5+ alternativer.",
    relatedIds: ["radio-button", "autosuggest"],
    props: [
        { name: "name", type: "string", required: true, source: "native", status: "stable", description: "Skjemafeltets navn." },
        { name: "label", type: "string", required: true, source: "custom", status: "stable", description: "Synlig label over nedtrekksmenyen." },
        { name: "items", type: "Array<string | { value: string; label: string }>", required: true, source: "custom", status: "stable", description: "Liste over alternativer." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "(value: string | undefined) => void", required: false, source: "react", status: "stable", description: "Kalles ved valg." },
        { name: "defaultPrompt", type: "string", required: false, source: "custom", status: "stable", default: '"Velg"', description: "Plassholdertekst som standard valg." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "stable", description: "Feilmelding." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst." },
        { name: "searchable", type: "boolean", required: false, source: "custom", status: "stable", description: "Gjør nedtrekksmenyen søkbar." },
    ],
    examples: [
        {
            title: "Grunnleggende nedtrekksmeny",
            description: "Select med enkel streng-liste.",
            code: `<Select
    name="county"
    label="Fylke"
    items={["Oslo", "Viken", "Innlandet", "Vestfold og Telemark", "Agder"]}
/>`,
            preview: (
                <Select
                    name="county"
                    label="Fylke"
                    items={["Oslo", "Viken", "Innlandet", "Vestfold og Telemark", "Agder"]}
                />
            ),
        },
        {
            title: "Med søk aktivert",
            description: "searchable lar brukeren filtrere listealternativene.",
            code: `<Select
    name="country"
    label="Land"
    searchable
    items={[
        { value: "NO", label: "Norge" },
        { value: "SE", label: "Sverige" },
        { value: "DK", label: "Danmark" },
        { value: "FI", label: "Finland" },
    ]}
/>`,
            preview: (
                <Select
                    name="country"
                    label="Land"
                    searchable
                    items={[
                        { value: "NO", label: "Norge" },
                        { value: "SE", label: "Sverige" },
                        { value: "DK", label: "Danmark" },
                        { value: "FI", label: "Finland" },
                    ]}
                />
            ),
        },
        {
            title: "Med hjelpetekst og feilmelding",
            description: "helpLabel gir brukeren kontekst, errorLabel vises ved valideringsfeil.",
            code: `<Select
    name="role"
    label="Rolle"
    helpLabel="Velg rollen som best beskriver deg"
    errorLabel="Du må velge en rolle"
    items={["Utvikler", "Designer", "Produkteier", "Leder"]}
/>`,
            tags: ["error-state"],
            preview: (
                <Select
                    name="role"
                    label="Rolle"
                    helpLabel="Velg rollen som best beskriver deg"
                    errorLabel="Du må velge en rolle"
                    items={["Utvikler", "Designer", "Produkteier", "Leder"]}
                />
            ),
        },
    ],
};

export default doc;
