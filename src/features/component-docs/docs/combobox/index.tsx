import { useState, useEffect } from "react";
import { Combobox } from "@fremtind/jokul/combobox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function ComboboxBasicPreview() {
    const isHovered = usePreviewHovered();
    const [selected, setSelected] = useState<string[]>([]);
    const items = [
        { value: "bil", label: "Bilforsikring" },
        { value: "bat", label: "Båtforsikring" },
        { value: "hjem", label: "Hjemforsikring" },
        { value: "reise", label: "Reiseforsikring" },
    ];
    useEffect(() => { if (!isHovered) setSelected([]); }, [isHovered]);
    return (
        <Combobox
            label="Velg forsikringer"
            name="forsikringer"
            items={items}
            onChange={e => setSelected(e.target.selectedOptions.map(o => o.value))}
        />
    );
}

const doc: ComponentDoc = {
    id: "combobox",
    name: "Combobox",
    package: "@fremtind/jokul/combobox",
    category: "Skjema",
    status: "stable",
    description:
        "Combobox er et flervalg-skjemaelement med søkefunksjon. Valgte elementer vises som chips og kan fjernes enkeltvis.",
    relationships: {
        related: [{ id: "select", description: "Bruk Select når ingen fritekstinntasting er nødvendig og listen er liten nok til å bla gjennom." }, { id: "autosuggest", description: "Autosuggest ligner, men støtter ikke flervalg; bruk Combobox når flere verdier må velges." }],
    },
    preview: <ComboboxBasicPreview />,

    props,
};

export default doc;
