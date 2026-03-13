import React from "react";
import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "radio-button",
    name: "RadioButton",
    package: "@fremtind/jokul/radio-button",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "tilgjengelighet"],
    description: "RadioButton og RadioButtonGroup brukes for enovalgslister.",
    notes: "Bruk alltid RadioButtonGroup som wrapper for tilgjengelighet.",
    relatedIds: ["checkbox", "radio-panel"],
    props: [
        { name: "legend", type: "string", required: true, source: "custom", description: "Overskrift for gruppen (på RadioButtonGroup)." },
        { name: "name", type: "string", required: false, source: "native", description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: false, source: "native", description: "Valgt verdi." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "native", description: "Kalles ved valg." },
        { name: "errorLabel", type: "string", required: false, source: "custom", description: "Feilmelding." },
        { name: "inline", type: "boolean", required: false, source: "custom", default: "false", description: "Viser radioknappene på én linje." },
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
        {
            title: "Inline-variant",
            description: "Bruk inline når du har få, korte alternativer og nok horisontal plass.",
            code: `<RadioButtonGroup legend="Kjønn" name="gender" inline>
  <RadioButton value="male">Mann</RadioButton>
  <RadioButton value="female">Kvinne</RadioButton>
  <RadioButton value="other">Annet</RadioButton>
</RadioButtonGroup>`,
            preview: (
                <RadioButtonGroup legend="Kjønn" name="gender" inline>
                    <RadioButton value="male">Mann</RadioButton>
                    <RadioButton value="female">Kvinne</RadioButton>
                    <RadioButton value="other">Annet</RadioButton>
                </RadioButtonGroup>
            ),
        },
        {
            title: "Med feilmelding",
            description: "Vis errorLabel på RadioButtonGroup når ingen verdi er valgt ved innsending.",
            code: `<RadioButtonGroup
  legend="Velg forsikringstype"
  name="insurance"
  errorLabel="Du må velge en forsikringstype for å gå videre"
>
  <RadioButton value="basic">Basis</RadioButton>
  <RadioButton value="plus">Pluss</RadioButton>
  <RadioButton value="premium">Premium</RadioButton>
</RadioButtonGroup>`,
            tags: ["error-state"],
            preview: (
                <RadioButtonGroup
                    legend="Velg forsikringstype"
                    name="insurance"
                    errorLabel="Du må velge en forsikringstype for å gå videre"
                >
                    <RadioButton value="basic">Basis</RadioButton>
                    <RadioButton value="plus">Pluss</RadioButton>
                    <RadioButton value="premium">Premium</RadioButton>
                </RadioButtonGroup>
            ),
        },
    ],
};

export default doc;
