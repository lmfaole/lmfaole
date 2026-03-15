import { useState, useEffect } from "react";
import { Select } from "@fremtind/jokul/select";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";

function SelectStablePreview() {
    const [val, setVal] = useState("");
    return (
        <Select
            label="Velg fylke"
            name="county-preview"
            items={["Oslo", "Viken", "Agder"]}
            value={val}
            onChange={({ target }) => setVal(target.value)}
        />
    );
}

const doc: ComponentDoc = {
    id: "select-stable",
    name: "Select",
    package: "@fremtind/jokul/select",
    category: "Skjema",
    status: "stable",
    description: "Select er nedtrekksmenyen med egendefinert dropdown-grensesnitt. Den tar en items-array og har sin egen SelectChangeEventHandler. En ny, forenklet variant — BETA_Select — er under utvikling og vil erstatte denne over tid.",
    relationships: {
        alternatives: [{ id: "select", description: "Select (BETA) er den anbefalte etterfølgeren med forbedret API; migrer når den er stabil." }],
        related: [{ id: "radio-button", description: "Bruk RadioButton når det er få alternativer og du vil at de alltid skal være synlige." }, { id: "autosuggest", description: "Kombiner med Autosuggest når brukeren trenger å søke og filtrere en lang liste med alternativer ved å skrive." }],
    },
    warnings: [
        "BETA_Select er den anbefalte veien videre. Se migreringsveiledningen nedenfor for å komme i gang.",
    ],

    preview: <SelectStablePreview />,
    props,
    migrations,
};

export default doc;
