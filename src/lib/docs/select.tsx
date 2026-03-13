import React, { useState, useEffect } from "react";
import { BETA_Select as Select } from "@fremtind/jokul/select";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const SELECT_OPTIONS = ["bil", "reise", "hjem"];

function SelectPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Select label="Velg forsikring" name="insurance-beta-preview" value={SELECT_OPTIONS[step]} onChange={() => {}}>
            <option value="bil">Bilforsikring</option>
            <option value="reise">Reiseforsikring</option>
            <option value="hjem">Innboforsikring</option>
        </Select>
    );
}

const doc: ComponentDoc = {
    id: "select",
    name: "Select (beta)",
    package: "@fremtind/jokul/select",
    category: "Skjema",
    status: "beta",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "nedtrekksmeny"],
    description: "BETA_Select er en ny, forenklet variant av Select som wrapper det native <select>-elementet med Jøkul-styling. Den bruker children i stedet for en items-array og standard React onChange — i motsetning til den stabile Select som har et egendefinert dropdown-grensesnitt. Planen er at BETA_Select erstatter den stabile varianten.",
    relatedIds: ["select-stable", "radio-button", "autosuggest"],
    warnings: [
        "BETA_Select er ikke ferdigstilt og API-en kan endre seg. Den mangler searchable, maxShownOptions og den egendefinerte SelectChangeEventHandler fra stabil Select.",
    ],
    preview: <SelectPreview />,
    props: [
        { name: "children", type: "ReactNode | ReactNode[]", required: true, source: "custom", status: "experimental", description: "Innholdet i nedtrekksmenyen — typisk <option>-elementer." },
        { name: "label", type: "string", required: true, source: "custom", status: "experimental", description: "Synlig label over nedtrekksmenyen." },
        { name: "placeholder", type: "string", required: false, source: "custom", status: "experimental", default: '"Velg"', description: "Plassholdertekst som vises når ingenting er valgt." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "experimental", description: "Feilmelding vist under feltet." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "experimental", description: "Hjelpetekst vist under feltet." },
        { name: "value", type: "string", required: false, source: "native", status: "experimental", description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "ChangeEvent<HTMLSelectElement>", required: false, source: "react", status: "experimental", description: "Standard React onChange — merk: ikke SelectChangeEventHandler som i stabil Select." },
        { name: "name", type: "string", required: false, source: "native", status: "experimental", description: "Skjemafeltets navn." },
        { name: "disabled", type: "boolean", required: false, source: "native", status: "experimental", description: "Deaktiverer feltet." },
    ],
    examples: [
        {
            title: "Grunnleggende nedtrekksmeny",
            description: "BETA_Select med <option>-elementer som children — ingen items-array.",
            code: `<Select label="Fylke" name="county">
    <option value="oslo">Oslo</option>
    <option value="viken">Viken</option>
    <option value="innlandet">Innlandet</option>
    <option value="agder">Agder</option>
</Select>`,
            preview: (
                <Select label="Fylke" name="county">
                    <option value="oslo">Oslo</option>
                    <option value="viken">Viken</option>
                    <option value="innlandet">Innlandet</option>
                    <option value="agder">Agder</option>
                </Select>
            ),
        },
        {
            title: "Med grupperte valg",
            description: "Native <optgroup> fungerer direkte siden BETA_Select wrapper den native select.",
            code: `<Select label="Region" name="region">
    <optgroup label="Østlandet">
        <option value="oslo">Oslo</option>
        <option value="viken">Viken</option>
    </optgroup>
    <optgroup label="Vestlandet">
        <option value="vestland">Vestland</option>
        <option value="rogaland">Rogaland</option>
    </optgroup>
</Select>`,
            preview: (
                <Select label="Region" name="region">
                    <optgroup label="Østlandet">
                        <option value="oslo">Oslo</option>
                        <option value="viken">Viken</option>
                    </optgroup>
                    <optgroup label="Vestlandet">
                        <option value="vestland">Vestland</option>
                        <option value="rogaland">Rogaland</option>
                    </optgroup>
                </Select>
            ),
        },
        {
            title: "Med hjelpetekst og feilmelding",
            code: `<Select
    label="Rolle"
    name="role"
    helpLabel="Velg rollen som best beskriver deg"
    errorLabel="Du må velge en rolle"
>
    <option value="dev">Utvikler</option>
    <option value="design">Designer</option>
    <option value="po">Produkteier</option>
</Select>`,
            preview: (
                <Select
                    label="Rolle"
                    name="role"
                    helpLabel="Velg rollen som best beskriver deg"
                    errorLabel="Du må velge en rolle"
                >
                    <option value="dev">Utvikler</option>
                    <option value="design">Designer</option>
                    <option value="po">Produkteier</option>
                </Select>
            ),
        },
    ],
};

export default doc;
