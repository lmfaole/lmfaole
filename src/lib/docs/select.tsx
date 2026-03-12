import React from "react";
import { Select } from "@fremtind/jokul/select";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "select",
    name: "Select",
    package: "@fremtind/jokul/select",
    category: "Skjema",
    description: "Select er et nedtrekksmeny-skjemaelement for å velge ett alternativ fra en liste.",
    notes: "Bruk Select når listen har 5+ alternativer.",
    relatedIds: ["radio-button", "autosuggest"],
    props: [
        { name: "name", type: "string", required: true, description: "Skjemafeltets navn." },
        { name: "label", type: "string", required: true, description: "Synlig label over nedtrekksmenyen." },
        { name: "items", type: "Array<string | { value: string; label: string }>", required: true, description: "Liste over alternativer." },
        { name: "value", type: "string", required: false, description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "(value: string | undefined) => void", required: false, description: "Kalles ved valg." },
        { name: "defaultPrompt", type: "string", required: false, default: '"Velg"', description: "Plassholdertekst som standard valg." },
        { name: "errorLabel", type: "string", required: false, description: "Feilmelding." },
        { name: "helpLabel", type: "string", required: false, description: "Hjelpetekst." },
        { name: "searchable", type: "boolean", required: false, description: "Gjør nedtrekksmenyen søkbar." },
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
    ],
};

export default doc;
