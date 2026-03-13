import { useState, useEffect } from "react";
import { SegmentedControl, SegmentedControlButton } from "@fremtind/jokul/segmented-control";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const scValues = ["monthly", "yearly", "onetime"];

function SegmentedControlPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!isHovered) {
            setStep(0);
            return;
        }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % scValues.length), 1200);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <SegmentedControl legend="Velg betalingsfrekvens" onChange={() => {}}>
            <SegmentedControlButton value="monthly" checked={step === 0} onChange={() => {}}>Månedlig</SegmentedControlButton>
            <SegmentedControlButton value="yearly" checked={step === 1} onChange={() => {}}>Årlig</SegmentedControlButton>
            <SegmentedControlButton value="onetime" checked={step === 2} onChange={() => {}}>Engangsbetaling</SegmentedControlButton>
        </SegmentedControl>
    );
}

const doc: ComponentDoc = {
    id: "segmented-control",
    name: "SegmentedControl",
    package: "@fremtind/jokul/segmented-control",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "filter"],
    description: "SegmentedControl er en gruppe av knapper der kun ett alternativ kan velges om gangen.",
    relatedIds: ["radio-button"],
    preview: <SegmentedControlPreview />,
    props: [
        { name: "legend", type: "string", required: true, source: "custom", status: "stable", description: "Tilgjengelig gruppenavn." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "SegmentedControlButton-elementer." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Valgt verdi (kontrollert)." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved valg." },
    ],
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
    examples: [
        {
            title: "Visningsvalg",
            description: "SegmentedControl for å velge mellom visningsmoduser.",
            code: `<SegmentedControl legend="Velg visning">
  <SegmentedControlButton value="list">Liste</SegmentedControlButton>
  <SegmentedControlButton value="grid">Rutenett</SegmentedControlButton>
  <SegmentedControlButton value="map">Kart</SegmentedControlButton>
</SegmentedControl>`,
            preview: (
                <SegmentedControl legend="Velg visning">
                    <SegmentedControlButton value="list">Liste</SegmentedControlButton>
                    <SegmentedControlButton value="grid">Rutenett</SegmentedControlButton>
                    <SegmentedControlButton value="map">Kart</SegmentedControlButton>
                </SegmentedControl>
            ),
        },
        {
            title: "Tidsperiode",
            description: "Typisk bruk for å filtrere innhold etter tidsperiode.",
            code: `<SegmentedControl legend="Velg periode">
  <SegmentedControlButton value="day">Dag</SegmentedControlButton>
  <SegmentedControlButton value="week">Uke</SegmentedControlButton>
  <SegmentedControlButton value="month">Måned</SegmentedControlButton>
  <SegmentedControlButton value="year">År</SegmentedControlButton>
</SegmentedControl>`,
            preview: (
                <SegmentedControl legend="Velg periode">
                    <SegmentedControlButton value="day">Dag</SegmentedControlButton>
                    <SegmentedControlButton value="week">Uke</SegmentedControlButton>
                    <SegmentedControlButton value="month">Måned</SegmentedControlButton>
                    <SegmentedControlButton value="year">År</SegmentedControlButton>
                </SegmentedControl>
            ),
        },
    ],
};

export default doc;
