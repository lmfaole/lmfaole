import { useState, useEffect } from "react";
import { CheckboxPanel } from "@fremtind/jokul/checkbox-panel";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

function CheckboxPanelPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 4), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    // step 0: none, step 1: first, step 2: both, step 3: none
    const firstChecked = step === 1 || step === 2;
    const secondChecked = step === 2;

    return (
        <Flex direction="column" gap="xs">
            <CheckboxPanel name="panel" value="a" label="Reiseforsikring" checked={firstChecked} onChange={() => {}} />
            <CheckboxPanel name="panel" value="b" label="Bilforsikring" checked={secondChecked} onChange={() => {}} />
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "checkbox-panel",
    name: "CheckboxPanel",
    package: "@fremtind/jokul/checkbox-panel",
    category: "Skjema",
    tags: ["input", "skjema", "panel", "interaktiv", "pris"],
    description: "CheckboxPanel er en utvidet avkrysningsboks med et synlig paneldesign.",
    relatedIds: ["checkbox", "radio-panel"],
    preview: <CheckboxPanelPreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innhold i panelet." },
        { name: "name", type: "string", required: true, source: "native", status: "stable", description: "Skjemafeltets navn." },
        { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien ved innsending." },
        { name: "checked", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Kontrollert tilstand." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles ved endring." },
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
