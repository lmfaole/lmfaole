import React from "react";
import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "radio-button",
    name: "RadioButton",
    package: "@fremtind/jokul/radio-button",
    category: "Skjema",
    description: "RadioButton og RadioButtonGroup brukes for enovalgslister.",
    notes: "Bruk alltid RadioButtonGroup som wrapper for tilgjengelighet.",
    relatedIds: ["checkbox", "radio-panel"],
    props: [
        { name: "legend", type: "string", required: true, description: "Overskrift for gruppen (på RadioButtonGroup)." },
        { name: "name", type: "string", required: false, description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: false, description: "Valgt verdi." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, description: "Kalles ved valg." },
        { name: "errorLabel", type: "string", required: false, description: "Feilmelding." },
        { name: "inline", type: "boolean", required: false, description: "Viser radioknappene på én linje." },
    ],
    examples: [
        {
            title: "Grunnleggende radioknapper",
            description: "RadioButtonGroup med tre alternativer.",
            code: `<RadioButtonGroup legend="Velg betalingsmetode" name="payment">
  <RadioButton value="card">Bankkort</RadioButton>
  <RadioButton value="invoice">Faktura</RadioButton>
  <RadioButton value="vipps">Vipps</RadioButton>
</RadioButtonGroup>`,
            preview: (
                <RadioButtonGroup legend="Velg betalingsmetode" name="payment">
                    <RadioButton value="card">Bankkort</RadioButton>
                    <RadioButton value="invoice">Faktura</RadioButton>
                    <RadioButton value="vipps">Vipps</RadioButton>
                </RadioButtonGroup>
            ),
        },
    ],
};

export default doc;
