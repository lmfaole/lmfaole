import React, { useState, useEffect } from "react";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function CheckboxPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!isHovered) {
            setStep(0);
            return;
        }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 1200);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Flex direction="column" gap="xs">
            <Checkbox name="demo-preview" value="a" checked={step === 1} indeterminate={step === 2} onChange={() => {}}>Reiseforsikring</Checkbox>
            <Checkbox name="demo-preview" value="b" checked={step === 0} onChange={() => {}}>Bilforsikring</Checkbox>
            <Checkbox name="demo-preview" value="c" checked={step !== 1} indeterminate={step === 2} onChange={() => {}}>Innboforsikring</Checkbox>
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "checkbox",
    name: "Checkbox",
    package: "@fremtind/jokul/checkbox",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "tilgjengelighet"],
    description: "Checkbox brukes for binære valg i skjemaer, typisk for samtykke eller flervalgslister.",
    warnings: "Bruk ToggleSwitch for innstillinger som trer i kraft umiddelbart — Checkbox er for skjemainnsending.",
    relatedIds: ["toggle-switch", "checkbox-panel"],
    preview: <CheckboxPreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Label-tekst." },
        { name: "name", type: "string", required: true, source: "native", status: "stable", description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien som sendes ved innsending." },
        { name: "checked", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Kontrollert avkrysset-tilstand." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved endring." },
        { name: "invalid", type: "boolean", required: false, source: "react", status: "stable", default: "false", description: "Markerer feltet som ugyldig." },
        { name: "indeterminate", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Viser delvis-valgt tilstand." },
    ],
    examples: [
        {
            title: "Gruppe av avkrysningsbokser",
            description: "Typisk mønster med en gruppe relaterte valg.",
            code: `<Flex direction="column" gap="xs">
  <Checkbox name="consent" value="terms" defaultChecked>
    Jeg godtar vilkårene
  </Checkbox>
  <Checkbox name="consent" value="newsletter">
    Jeg vil motta nyhetsbrev
  </Checkbox>
  <Checkbox name="consent" value="data">
    Jeg godtar lagring av data
  </Checkbox>
</Flex>`,
            preview: (
                <Flex direction="column" gap="xs">
                    <Checkbox name="consent" value="terms" defaultChecked>Jeg godtar vilkårene</Checkbox>
                    <Checkbox name="consent" value="newsletter">Jeg vil motta nyhetsbrev</Checkbox>
                    <Checkbox name="consent" value="data">Jeg godtar lagring av data</Checkbox>
                </Flex>
            ),
        },
        {
            title: "Ugyldig tilstand",
            description: "Bruk invalid når brukeren prøver å sende skjema uten å ha krysset av et påkrevd felt.",
            code: `<Checkbox name="required" value="terms" invalid>
  Jeg godtar vilkårene (påkrevd)
</Checkbox>`,
            tags: ["error-state"],
            preview: (
                <Checkbox name="required" value="terms" invalid>
                    Jeg godtar vilkårene (påkrevd)
                </Checkbox>
            ),
        },
        {
            title: "Indeterminate",
            description: "Indeterminate brukes typisk for en «velg alle»-avkrysningsboks når kun noen rader er valgt.",
            code: `<Flex direction="column" gap="xs">
  <Checkbox name="all" value="all" indeterminate>
    Velg alle (delvis valgt)
  </Checkbox>
  <Checkbox name="item" value="a" defaultChecked>Alternativ A</Checkbox>
  <Checkbox name="item" value="b">Alternativ B</Checkbox>
  <Checkbox name="item" value="c" defaultChecked>Alternativ C</Checkbox>
</Flex>`,
            preview: (
                <Flex direction="column" gap="xs">
                    <Checkbox name="all" value="all" indeterminate>Velg alle (delvis valgt)</Checkbox>
                    <Checkbox name="item" value="a" defaultChecked>Alternativ A</Checkbox>
                    <Checkbox name="item" value="b">Alternativ B</Checkbox>
                    <Checkbox name="item" value="c" defaultChecked>Alternativ C</Checkbox>
                </Flex>
            ),
        },
    ],
};

export default doc;
