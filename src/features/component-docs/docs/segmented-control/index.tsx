import { useState, useEffect } from "react";
import { SegmentedControl, SegmentedControlButton } from "@fremtind/jokul/segmented-control";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function SegmentedControlPreview() {
    const [value, setValue] = useState("dag");
    return (
        <SegmentedControl legend="Velg periode" name="period-preview">
            <SegmentedControlButton value="dag" checked={value === "dag"} onChange={() => setValue("dag")}>Dag</SegmentedControlButton>
            <SegmentedControlButton value="uke" checked={value === "uke"} onChange={() => setValue("uke")}>Uke</SegmentedControlButton>
            <SegmentedControlButton value="maned" checked={value === "maned"} onChange={() => setValue("maned")}>Måned</SegmentedControlButton>
        </SegmentedControl>
    );
}

const doc: ComponentDoc = {
    id: "segmented-control",
    name: "Segmented Control",
    package: "@fremtind/jokul/segmented-control",
    category: "Handling",
    description: "SegmentedControl er en gruppe av knapper der kun ett alternativ kan velges om gangen.",
    relationships: {
        related: [{ id: "radio-button", description: "Bruk RadioButton når alternativene trenger en vertikal stablet listevisning i stedet for en horisontal knappegruppe." }],
    },

    preview: <SegmentedControlPreview />,
    props,
    subComponents: [
        {
            name: "SegmentedControlButton",
            description: "Et enkelt alternativ i SegmentedControl.",
            props: [
                { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien som sendes ved valg." },
                { name: "checked", type: "boolean", required: false, source: "native", status: "stable", description: "Om dette alternativet er valgt (kontrollert)." },
                { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles når alternativet velges." },
                { name: "disabled", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Deaktiverer alternativet." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold i knappen." },
            ],
        },
    ],
};

export default doc;
