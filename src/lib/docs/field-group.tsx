import React, { useState, useEffect } from "react";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function FieldGroupPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    // step 0: none, step 1: first, step 2: first+second
    return (
        <FieldGroup legend="Velg forsikringer">
            <Checkbox name="fg" value="reise" checked={step >= 1} onChange={() => {}}>Reiseforsikring</Checkbox>
            <Checkbox name="fg" value="bil" checked={step >= 2} onChange={() => {}}>Bilforsikring</Checkbox>
            <Checkbox name="fg" value="hjem" checked={false} onChange={() => {}}>Innboforsikring</Checkbox>
        </FieldGroup>
    );
}

const doc: ComponentDoc = {
    id: "field-group",
    name: "FieldGroup",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    tags: ["skjema", "skjemabygging", "tilgjengelighet", "validering"],
    description: "FieldGroup grupperer relaterte skjemaelementer under en felles legend.",
    warnings: "Grupper alltid Checkbox og RadioButton innenfor FieldGroup — uten det mangler skjermlesere kontekst for hva gruppen handler om.",
    relatedIds: ["checkbox", "radio-button"],
    preview: <FieldGroupPreview />,
    props: [
        { name: "legend", type: "string", required: true, source: "custom", status: "stable", description: "Overskrift for gruppen." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Skjemaelementer i gruppen." },
        { name: "errorLabel", type: "string", required: false, source: "react", status: "stable", description: "Feilmelding for hele gruppen." },
        { name: "helpLabel", type: "string", required: false, source: "custom", status: "stable", description: "Hjelpetekst for hele gruppen." },
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
