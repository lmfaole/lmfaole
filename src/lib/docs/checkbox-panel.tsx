import React from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "checkbox-panel",
    name: "CheckboxPanel",
    package: "@fremtind/jokul/checkbox-panel",
    category: "Skjema",
    tags: ["input", "skjema", "panel", "interaktiv", "pris"],
    description: "CheckboxPanel er en utvidet avkrysningsboks med et synlig paneldesign.",
    notes: "Bruk CheckboxPanel når valgene er komplekse nok til å trenge panelvisning.",
    relatedIds: ["checkbox", "radio-panel"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "Innhold i panelet." },
        { name: "name", type: "string", required: true, description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: true, description: "Verdien ved innsending." },
        { name: "checked", type: "boolean", required: false, description: "Kontrollert tilstand." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, description: "Kalles ved endring." },
    ],
    examples: [
        {
            title: "Gruppe av panel-valg",
            description: "CheckboxPanel for valg der hvert alternativ trenger mer visuell plass.",
            code: `<Flex direction="column" gap="xs">
  <CheckboxPanel name="plan" value="basic">
    Grunnpakke
  </CheckboxPanel>
  <CheckboxPanel name="plan" value="premium">
    Premiumpakke
  </CheckboxPanel>
</Flex>`,
            preview: (
                <Flex direction="column" gap="xs">
                    <CheckboxPanel name="plan" value="basic" label="Grunnpakke" />
                    <CheckboxPanel name="plan" value="premium" label="Premiumpakke" />
                </Flex>
            ),
        },
        {
            title: "Forhåndsvalgt panel",
            description: "Panel der ett alternativ er forhåndsvalgt ved innlasting.",
            code: `<Flex direction="column" gap="xs">
  <CheckboxPanel name="extras" value="roadside" label="Veihjelp" defaultChecked>
    Veihjelp
  </CheckboxPanel>
  <CheckboxPanel name="extras" value="glass" label="Glassdekning">
    Glassdekning
  </CheckboxPanel>
</Flex>`,
            preview: (
                <Flex direction="column" gap="xs">
                    <CheckboxPanel name="extras" value="roadside" label="Veihjelp" defaultChecked />
                    <CheckboxPanel name="extras" value="glass" label="Glassdekning" />
                </Flex>
            ),
        },
        {
            title: "Med beskrivelse og pris",
            description: "Paneler med utvidet beskrivelse og prisvisning til høyre.",
            code: `<Flex direction="column" gap="xs">
  <CheckboxPanel
    name="coverage"
    value="comprehensive"
    label="Kaskoforsikring"
    amount="349 kr/mnd"
    description="Dekker skader på din egen bil, uavhengig av hvem som er skyld."
  />
  <CheckboxPanel
    name="coverage"
    value="liability"
    label="Ansvarsforsikring"
    amount="189 kr/mnd"
    description="Lovpålagt forsikring som dekker skader du påfører andre."
  />
</Flex>`,
            tags: ["price"],
            preview: (
                <Flex direction="column" gap="xs">
                    <CheckboxPanel
                        name="coverage"
                        value="comprehensive"
                        label="Kaskoforsikring"
                        amount="349 kr/mnd"
                        description="Dekker skader på din egen bil, uavhengig av hvem som er skyld."
                    />
                    <CheckboxPanel
                        name="coverage"
                        value="liability"
                        label="Ansvarsforsikring"
                        amount="189 kr/mnd"
                        description="Lovpålagt forsikring som dekker skader du påfører andre."
                    />
                </Flex>
            ),
        },
    ],
};

export default doc;
