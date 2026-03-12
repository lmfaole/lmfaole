import React from "react";
import { ToggleSwitch } from "@fremtind/jokul/toggle-switch";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "toggle-switch",
    name: "ToggleSwitch",
    package: "@fremtind/jokul/toggle-switch",
    category: "Skjema",
    description: "ToggleSwitch er et binært vippebryter-element for innstillinger som skal tre i kraft umiddelbart. Forskjellen fra en checkbox er viktig: en checkbox er en del av et skjema som sendes inn, mens ToggleSwitch utløser en umiddelbar handling. Bruk ToggleSwitch for innstillinger som «Slå på varsler», og checkbox for «Godta vilkårene».",
    notes: "Ikke bruk ToggleSwitch i skjemaer som sendes inn med en Submit-knapp. Bruk heller Checkbox i skjema-kontekst. Bekreft alltid at bryteren fungerer uten JavaScript via fallback.",
    relatedIds: ["button"],
    props: [
        {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: "Label-teksten. Beskriv tilstanden som er på, f.eks. «Mørkt tema» eller «Varsler aktivert».",
        },
        {
            name: "checked",
            type: "boolean",
            required: false,
            description: "Kontrollert av/på-tilstand.",
        },
        {
            name: "defaultChecked",
            type: "boolean",
            required: false,
            default: "false",
            description: "Initiell tilstand for ukontrollert bruk.",
        },
        {
            name: "onChange",
            type: "React.ChangeEventHandler<HTMLInputElement>",
            required: false,
            description: "Kalles umiddelbart når brukeren veksler bryteren. Utfør handlingen direkte her.",
        },
        {
            name: "disabled",
            type: "boolean",
            required: false,
            default: "false",
            description: "Deaktiverer bryteren. Forklar alltid for brukeren hvorfor den er deaktivert.",
        },
        {
            name: "className",
            type: "string",
            required: false,
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
