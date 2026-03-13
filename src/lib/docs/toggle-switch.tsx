import { useState, useEffect } from "react";
import { ToggleSwitch } from "@fremtind/jokul/toggle-switch";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function ToggleSwitchPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 4), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    // step 0: both off, step 1: first on, step 2: both on, step 3: second off
    const first = step === 1 || step === 2;
    const second = step === 2;

    return (
        <Flex direction="column" gap="xs">
            <ToggleSwitch aria-pressed={first} name="ts-preview" value="notifications" onChange={() => {}}>Varsler</ToggleSwitch>
            <ToggleSwitch aria-pressed={second} name="ts-preview2" value="email" onChange={() => {}}>E-postvarsler</ToggleSwitch>
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "toggle-switch",
    name: "ToggleSwitch",
    package: "@fremtind/jokul/toggle-switch",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "tilstandsstyring"],
    description: "ToggleSwitch er et binært vippebryter-element for innstillinger som skal tre i kraft umiddelbart. Forskjellen fra en checkbox er viktig: en checkbox er en del av et skjema som sendes inn, mens ToggleSwitch utløser en umiddelbar handling. Bruk ToggleSwitch for innstillinger som «Slå på varsler», og checkbox for «Godta vilkårene».",
    warnings: "Bruk Checkbox i stedet hvis valget ikke trer i kraft umiddelbart — ToggleSwitch impliserer øyeblikkelig effekt.",
    relatedIds: ["button"],
    preview: <ToggleSwitchPreview />,
    props: [
        {
            name: "children",
            type: "React.ReactNode",
            required: true,
            source: "react",
            status: "stable",
            description: "Label-teksten. Beskriv tilstanden som er på, f.eks. «Mørkt tema» eller «Varsler aktivert».",
        },
        {
            name: "checked",
            type: "boolean",
            required: false,
            source: "native",
            status: "stable",
            description: "Kontrollert av/på-tilstand.",
        },
        {
            name: "defaultChecked",
            type: "boolean",
            required: false,
            source: "native",
            status: "stable",
            default: "false",
            description: "Initiell tilstand for ukontrollert bruk.",
        },
        {
            name: "onChange",
            type: "React.ChangeEventHandler<HTMLInputElement>",
            required: false,
            source: "react",
            status: "stable",
            description: "Kalles umiddelbart når brukeren veksler bryteren. Utfør handlingen direkte her.",
        },
        {
            name: "disabled",
            type: "boolean",
            required: false,
            source: "native",
            status: "stable",
            default: "false",
            description: "Deaktiverer bryteren. Forklar alltid for brukeren hvorfor den er deaktivert.",
        },
        {
            name: "className",
            type: "string",
            required: false,
            source: "react",
            status: "stable",
            description: "Egendefinerte CSS-klasser.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende bruk",
            description: "Et ukontrollert eksempel. I produksjon vil du typisk bruke checked + onChange fra React-state.",
            code: `<ToggleSwitch defaultChecked>
  Aktiver varsler
</ToggleSwitch>`,
            preview: (
                <ToggleSwitch defaultChecked>
                    Aktiver varsler
                </ToggleSwitch>
            ),
        },
        {
            title: "Gruppe av innstillinger",
            description: "Grupper relaterte bryterinnstillinger i en Flex-kolonne med konsistent gap.",
            code: `<Flex direction="column" gap="s">
  <ToggleSwitch defaultChecked>
    E-postvarsler
  </ToggleSwitch>
  <ToggleSwitch>
    SMS-varsler
  </ToggleSwitch>
  <ToggleSwitch defaultChecked>
    Push-varsler
  </ToggleSwitch>
</Flex>`,
            preview: (
                <Flex direction="column" gap="s">
                    <ToggleSwitch defaultChecked>E-postvarsler</ToggleSwitch>
                    <ToggleSwitch>SMS-varsler</ToggleSwitch>
                    <ToggleSwitch defaultChecked>Push-varsler</ToggleSwitch>
                </Flex>
            ),
        },
    ],
};

export default doc;
