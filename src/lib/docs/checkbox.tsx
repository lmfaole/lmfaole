import React from "react";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "checkbox",
    name: "Checkbox",
    package: "@fremtind/jokul/checkbox",
    category: "Skjema",
    description: "Checkbox brukes for binære valg i skjemaer, typisk for samtykke eller flervalgslister.",
    notes: "Bruk Checkbox for skjemainnsending, ikke ToggleSwitch.",
    relatedIds: ["toggle-switch", "checkbox-panel"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "Label-tekst." },
        { name: "name", type: "string", required: true, description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: true, description: "Verdien som sendes ved innsending." },
        { name: "checked", type: "boolean", required: false, description: "Kontrollert avkrysset-tilstand." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, description: "Kalles ved endring." },
        { name: "invalid", type: "boolean", required: false, description: "Markerer feltet som ugyldig." },
        { name: "indeterminate", type: "boolean", required: false, description: "Viser delvis-valgt tilstand." },
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
    ],
};

export default doc;
