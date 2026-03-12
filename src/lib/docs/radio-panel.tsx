import React from "react";
import { RadioPanel } from "@fremtind/jokul/radio-panel";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "radio-panel",
    name: "RadioPanel",
    package: "@fremtind/jokul/radio-panel",
    category: "Skjema",
    description: "RadioPanel er et panelbasert envalgsalternativ.",
    notes: "Grupper RadioPanel-er i FieldGroup med legend for tilgjengelighet.",
    relatedIds: ["radio-button", "checkbox-panel"],
    props: [
        { name: "value", type: "string", required: true, description: "Verdien som sendes ved innsending." },
        { name: "name", type: "string", required: true, description: "Skjemafeltets navn (felles for gruppen)." },
        { name: "children", type: "React.ReactNode", required: false, description: "Innhold i panelet." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, description: "Kalles ved valg." },
    ],
    examples: [
        {
            title: "Gruppe av panelvalg",
            description: "RadioPanel-er for å velge forsikringstype.",
            code: `<Flex direction="column" gap="xs">
  <RadioPanel name="coverage" value="basic">
    Grunnpakke
  </RadioPanel>
  <RadioPanel name="coverage" value="standard">
    Standardpakke
  </RadioPanel>
  <RadioPanel name="coverage" value="premium">
    Premiumpakke
  </RadioPanel>
</Flex>`,
            preview: (
                <Flex direction="column" gap="xs">
                    <RadioPanel name="coverage" value="basic" label="Grunnpakke">Grunnpakke</RadioPanel>
                    <RadioPanel name="coverage" value="standard" label="Standardpakke">Standardpakke</RadioPanel>
                    <RadioPanel name="coverage" value="premium" label="Premiumpakke">Premiumpakke</RadioPanel>
                </Flex>
            ),
        },
    ],
};

export default doc;
