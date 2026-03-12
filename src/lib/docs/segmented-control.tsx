import React from "react";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "segmented-control",
    name: "SegmentedControl",
    package: "@fremtind/jokul/segmented-control",
    category: "Skjema",
    description: "SegmentedControl er en gruppe av knapper der kun ett alternativ kan velges om gangen.",
    notes: "Bruk SegmentedControl for 2–5 gjensidig utelukkende valg.",
    relatedIds: ["radio-button"],
    props: [
        { name: "legend", type: "string", required: true, description: "Tilgjengelig gruppenavn." },
        { name: "children", type: "React.ReactNode", required: true, description: "SegmentedControlButton-elementer." },
        { name: "value", type: "string", required: false, description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, description: "Kalles ved valg." },
    ],
    examples: [
        {
            title: "Visningsvalg",
            description: "SegmentedControl for å velge mellom visningsmoduser.",
            code: `const [view, setView] = React.useState("list");

<SegmentedControl
    legend="Velg visning"
    value={view}
    onChange={(e) => setView(e.target.value)}
>
    <SegmentedControlButton value="list">Liste</SegmentedControlButton>
    <SegmentedControlButton value="grid">Rutenett</SegmentedControlButton>
    <SegmentedControlButton value="map">Kart</SegmentedControlButton>
</SegmentedControl>`,
        },
    ],
};

export default doc;
