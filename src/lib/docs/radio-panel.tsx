import { useState, useEffect } from "react";
import { RadioPanel } from "@fremtind/jokul/radio-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";


function RadioPanelPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <FieldGroup legend="Velg forsikring">
            <Flex direction="column" gap="xs">
                <RadioPanel name="rp-preview" value="bil" label="Bilforsikring" checked={step === 0} onChange={() => {}} />
                <RadioPanel name="rp-preview" value="reise" label="Reiseforsikring" checked={step === 1} onChange={() => {}} />
                <RadioPanel name="rp-preview" value="hjem" label="Innboforsikring" checked={step === 2} onChange={() => {}} />
            </Flex>
        </FieldGroup>
    );
}

const doc: ComponentDoc = {
    id: "radio-panel",
    name: "RadioPanel",
    package: "@fremtind/jokul/radio-panel",
    category: "Skjema",
    tags: ["input", "skjema", "panel", "interaktiv", "pris"],
    description: "RadioPanel er et panelbasert envalgsalternativ.",
    warnings: "Grupper RadioPanel-er i FieldGroup med legend — uten det mangler skjermlesere kontekst for gruppen.",
    relatedIds: ["radio-button", "checkbox-panel"],
    preview: <RadioPanelPreview />,
    props: [
        { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien som sendes ved innsending." },
        { name: "name", type: "string", required: true, source: "native", status: "stable", description: "Skjemafeltets navn (felles for gruppen)." },
        { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Innhold i panelet." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved valg." },
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
                    <RadioPanel name="coverage" value="basic" label="Grunnpakke" />
                    <RadioPanel name="coverage" value="standard" label="Standardpakke" />
                    <RadioPanel name="coverage" value="premium" label="Premiumpakke" />
                </Flex>
            ),
        },
        {
            title: "Med beskrivelse og pris",
            description: "RadioPanel med utvidet informasjon og prisvisning.",
            code: `<FieldGroup legend="Velg forsikringspakke">
  <RadioPanel
    name="plan"
    value="basis"
    label="Basis"
    amount="189 kr/mnd"
    description="Grunnleggende dekning for deg som kjører lite."
  />
  <RadioPanel
    name="plan"
    value="pluss"
    label="Pluss"
    amount="299 kr/mnd"
    description="Utvidet dekning med veihjelp inkludert."
  />
  <RadioPanel
    name="plan"
    value="premium"
    label="Premium"
    amount="449 kr/mnd"
    description="Full dekning med leiebil og glassforsikring."
  />
</FieldGroup>`,
            tags: ["price"],
            preview: (
                <FieldGroup legend="Velg forsikringspakke">
                    <RadioPanel name="plan" value="basis" label="Basis" amount="189 kr/mnd" description="Grunnleggende dekning for deg som kjører lite." />
                    <RadioPanel name="plan" value="pluss" label="Pluss" amount="299 kr/mnd" description="Utvidet dekning med veihjelp inkludert." />
                    <RadioPanel name="plan" value="premium" label="Premium" amount="449 kr/mnd" description="Full dekning med leiebil og glassforsikring." />
                </FieldGroup>
            ),
        },
        {
            title: "Med feilmelding",
            description: "FieldGroup rundt RadioPanel-er viser feilmelding for hele gruppen.",
            code: `<FieldGroup legend="Velg betalingsmetode" errorLabel="Du må velge en betalingsmetode">
  <RadioPanel name="payment" value="card" label="Bankkort" />
  <RadioPanel name="payment" value="invoice" label="Faktura" />
  <RadioPanel name="payment" value="avtalegiro" label="AvtaleGiro" />
</FieldGroup>`,
            tags: ["error-state"],
            preview: (
                <FieldGroup legend="Velg betalingsmetode" errorLabel="Du må velge en betalingsmetode">
                    <RadioPanel name="payment" value="card" label="Bankkort" />
                    <RadioPanel name="payment" value="invoice" label="Faktura" />
                    <RadioPanel name="payment" value="avtalegiro" label="AvtaleGiro" />
                </FieldGroup>
            ),
        },
    ],
};

export default doc;
