import { useState, useEffect } from "react";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionListContactPreview } from "../description-list/examples";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
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
            }
];
