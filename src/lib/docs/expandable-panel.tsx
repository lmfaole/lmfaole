import React from "react";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionListContactPreview } from "./description-list";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "expandable-panel",
    name: "ExpandablePanel",
    package: "@fremtind/jokul/expander",
    category: "Visning",
    tags: ["panel", "interaktiv", "animasjon", "tilgjengelighet"],
    description: "ExpandablePanel er et utviddbart panel med header og innhold.",
    notes: "Bruk ExpandablePanel.Header for tittelområdet og ExpandablePanel.Content for innholdet.",
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innhold med Header og Content sub-komponenter." },
        { name: "variant", type: '"fill" | "stroke"', required: false, source: "react", status: "stable", default: '"fill"', description: "Visuell stil." },
        { name: "open", type: "boolean", required: false, source: "custom", status: "stable", description: "Kontrollert åpen-tilstand." },
        { name: "defaultOpen", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Initialt åpen." },
        { name: "onOpenChange", type: "(open: boolean) => void", required: false, source: "react", status: "stable", description: "Kalles ved åpning/lukking." },
    ],
    examples: [
        {
            title: "Grunnleggende panel",
            description: "Et utviddbart panel med header og innhold.",
            code: `<ExpandablePanel>
  <ExpandablePanel.Header>Hva er inkludert i forsikringen?</ExpandablePanel.Header>
  <ExpandablePanel.Content>
    <p>Forsikringen dekker skader på kjøretøy, ansvar overfor tredjeparter og rettshjelp.</p>
  </ExpandablePanel.Content>
</ExpandablePanel>`,
            preview: (
                <ExpandablePanel>
                    <ExpandablePanel.Header>Hva er inkludert i forsikringen?</ExpandablePanel.Header>
                    <ExpandablePanel.Content>
                        <p>Forsikringen dekker skader på kjøretøy, ansvar overfor tredjeparter og rettshjelp.</p>
                    </ExpandablePanel.Content>
                </ExpandablePanel>
            ),
        },
        {
            title: "Åpent som standard",
            description: "Bruk defaultOpen for å vise innholdet åpent ved første render.",
            code: `<ExpandablePanel defaultOpen>
  <ExpandablePanel.Header>Viktig informasjon</ExpandablePanel.Header>
  <ExpandablePanel.Content>
    <p>Les dette nøye før du fortsetter med bestillingen.</p>
  </ExpandablePanel.Content>
</ExpandablePanel>`,
            preview: (
                <ExpandablePanel defaultOpen>
                    <ExpandablePanel.Header>Viktig informasjon</ExpandablePanel.Header>
                    <ExpandablePanel.Content>
                        <p>Les dette nøye før du fortsetter med bestillingen.</p>
                    </ExpandablePanel.Content>
                </ExpandablePanel>
            ),
        },
        {
            title: "Panel med detaljinnhold",
            description: "ExpandablePanel kan wrappe enhver komponent — her DescriptionList for å vise kontaktdetaljer.",
            uses: ["description-list"],
            code: `<ExpandablePanel defaultOpen>
  <ExpandablePanel.Header>Kontaktinformasjon</ExpandablePanel.Header>
  <ExpandablePanel.Content>
    <DescriptionList>
      <DescriptionTerm>Navn</DescriptionTerm>
      <DescriptionDetail>Ola Nordmann</DescriptionDetail>
      <DescriptionTerm>E-post</DescriptionTerm>
      <DescriptionDetail>ola@nordmann.no</DescriptionDetail>
      <DescriptionTerm>Telefon</DescriptionTerm>
      <DescriptionDetail>+47 900 00 000</DescriptionDetail>
    </DescriptionList>
  </ExpandablePanel.Content>
</ExpandablePanel>`,
            preview: (
                <ExpandablePanel defaultOpen>
                    <ExpandablePanel.Header>Kontaktinformasjon</ExpandablePanel.Header>
                    <ExpandablePanel.Content>
                        <DescriptionListContactPreview />
                    </ExpandablePanel.Content>
                </ExpandablePanel>
            ),
        },
    ],
};

export default doc;
