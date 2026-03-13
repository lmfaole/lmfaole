import React, { useState, useEffect } from "react";
import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const radioValues = ["bil", "reise", "hjem"];

function RadioButtonPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!isHovered) {
            setStep(0);
            return;
        }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % radioValues.length), 1200);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <RadioButtonGroup legend="Velg forsikringstype" name="radio-preview" value={radioValues[step]} onChange={() => {}}>
            <RadioButton value="bil">Bilforsikring</RadioButton>
            <RadioButton value="reise">Reiseforsikring</RadioButton>
            <RadioButton value="hjem">Innboforsikring</RadioButton>
        </RadioButtonGroup>
    );
}

const doc: ComponentDoc = {
    id: "radio-button",
    name: "RadioButton",
    package: "@fremtind/jokul/radio-button",
    category: "Skjema",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "tilgjengelighet"],
    description: "RadioButton og RadioButtonGroup brukes for enovalgslister.",
    warnings: "Aldri bruk RadioButton uten RadioButtonGroup — den er ikke tilgjengelig uten riktig name og grouping.",
    relatedIds: ["checkbox", "radio-panel"],
    preview: <RadioButtonPreview />,
    props: [
        { name: "legend", type: "string", required: true, source: "custom", status: "stable", description: "Overskrift for gruppen (på RadioButtonGroup)." },
        { name: "name", type: "string", required: false, source: "native", status: "stable", description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: false, source: "native", status: "stable", description: "Valgt verdi." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved valg." },
        { name: "errorLabel", type: "string", required: false, source: "custom", status: "stable", description: "Feilmelding." },
        { name: "inline", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Viser radioknappene på én linje." },
        { name: "label", type: "React.ReactNode", required: false, source: "custom", status: "deprecated", statusDescription: "Bruk children i stedet.", description: "Label for en enkelt radioknapp (gammel API)." },
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
        {
            title: "Radioknapp-tekst sendes nå som children",
            description: "label-propen på RadioButton er utfaset. Bruk children (tekst som barn av komponenten) i stedet.",
            migrationBefore: `<RadioButton value="basic" label="Basis" />`,
            code: `<RadioButton value="basic">Basis</RadioButton>`,
            preview: (
                <RadioButtonGroup legend="Forsikringstype" name="migration-radio">
                    <RadioButton value="basic">Basis</RadioButton>
                    <RadioButton value="plus">Pluss</RadioButton>
                </RadioButtonGroup>
            ),
        },
    ],
};

export default doc;
