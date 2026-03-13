import React from "react";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Checkbox } from "@fremtind/jokul/checkbox";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "field-group",
    name: "FieldGroup",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    tags: ["skjema", "skjemabygging", "tilgjengelighet", "validering"],
    description: "FieldGroup grupperer relaterte skjemaelementer under en felles legend.",
    notes: "Alltid bruk FieldGroup rundt grupper av avkrysningsbokser og radioknapper for tilgjengelighet.",
    relatedIds: ["checkbox", "radio-button"],
    props: [
        { name: "legend", type: "string", required: true, description: "Overskrift for gruppen." },
        { name: "children", type: "React.ReactNode", required: true, description: "Skjemaelementer i gruppen." },
        { name: "errorLabel", type: "string", required: false, description: "Feilmelding for hele gruppen." },
        { name: "helpLabel", type: "string", required: false, description: "Hjelpetekst for hele gruppen." },
    ],
    examples: [
        {
            title: "Gruppe av avkrysningsbokser",
            description: "FieldGroup gir semantisk gruppering og felles legend.",
            code: `<FieldGroup legend="Hva ønsker du å forsikre?">
  <Checkbox name="product" value="car">Bil</Checkbox>
  <Checkbox name="product" value="home">Bolig</Checkbox>
  <Checkbox name="product" value="travel">Reise</Checkbox>
</FieldGroup>`,
            tags: ["accessibility"],
            preview: (
                <FieldGroup legend="Hva ønsker du å forsikre?">
                    <Checkbox name="product" value="car">Bil</Checkbox>
                    <Checkbox name="product" value="home">Bolig</Checkbox>
                    <Checkbox name="product" value="travel">Reise</Checkbox>
                </FieldGroup>
            ),
        },
        {
            title: "Med feilmelding",
            description: "FieldGroup viser en felles feilmelding for hele gruppen.",
            code: `<FieldGroup
  legend="Hva ønsker du å forsikre?"
  errorLabel="Velg minst ett alternativ"
>
  <Checkbox name="product2" value="car">Bil</Checkbox>
  <Checkbox name="product2" value="home">Bolig</Checkbox>
  <Checkbox name="product2" value="travel">Reise</Checkbox>
</FieldGroup>`,
            tags: ["error-state"],
            preview: (
                <FieldGroup legend="Hva ønsker du å forsikre?" errorLabel="Velg minst ett alternativ">
                    <Checkbox name="product2" value="car">Bil</Checkbox>
                    <Checkbox name="product2" value="home">Bolig</Checkbox>
                    <Checkbox name="product2" value="travel">Reise</Checkbox>
                </FieldGroup>
            ),
        },
        {
            title: "Med hjelpetekst",
            description: "FieldGroup med hjelpetekst som gir ekstra kontekst til valgene.",
            code: `<FieldGroup
  legend="Betalingsfrekvens"
  helpLabel="Velg hvor ofte du ønsker å betale forsikringen."
>
  <Checkbox name="frequency" value="monthly">Månedlig</Checkbox>
  <Checkbox name="frequency" value="quarterly">Kvartalsvis</Checkbox>
  <Checkbox name="frequency" value="yearly">Årlig</Checkbox>
</FieldGroup>`,
            preview: (
                <FieldGroup
                    legend="Betalingsfrekvens"
                    helpLabel="Velg hvor ofte du ønsker å betale forsikringen."
                >
                    <Checkbox name="frequency" value="monthly">Månedlig</Checkbox>
                    <Checkbox name="frequency" value="quarterly">Kvartalsvis</Checkbox>
                    <Checkbox name="frequency" value="yearly">Årlig</Checkbox>
                </FieldGroup>
            ),
        },
    ],
};

export default doc;
