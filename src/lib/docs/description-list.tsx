import React from "react";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "description-list",
    name: "DescriptionList",
    package: "@fremtind/jokul/description-list",
    category: "Visning",
    tags: ["liste", "datavisning", "tekst"],
    description: "DescriptionList viser nøkkel-verdi-par strukturert som en HTML description list (dl/dt/dd).",
    notes: "Bruk DescriptionTerm for nøkler og DescriptionDetail for verdier.",
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "DescriptionTerm og DescriptionDetail-elementer." },
        { name: "separators", type: "boolean", required: false, description: "Viser skillelinjer mellom par." },
        { name: "alignment", type: '"horizontal" | "vertical" | "justified"', required: false, description: "Layoutretning for nøkkel-verdi-par." },
    ],
    examples: [
        {
            title: "Nøkkelverdi-par",
            description: "Enkelt nøkkelverdi-par.",
            code: `<DescriptionList>
  <DescriptionTerm>Forsikringstype</DescriptionTerm>
  <DescriptionDetail>Kasko</DescriptionDetail>
</DescriptionList>`,
            preview: (
                <DescriptionList>
                    <DescriptionTerm>Forsikringstype</DescriptionTerm>
                    <DescriptionDetail>Kasko</DescriptionDetail>
                </DescriptionList>
            ),
            tags: [],
        },
        {
            title: "Kontaktinformasjon",
            description: "Typisk bruk for å vise detaljer om en entitet.",
            code: `<DescriptionList>
  <DescriptionTerm>Navn</DescriptionTerm>
  <DescriptionDetail>Ola Nordmann</DescriptionDetail>
  <DescriptionTerm>E-post</DescriptionTerm>
  <DescriptionDetail>ola@nordmann.no</DescriptionDetail>
  <DescriptionTerm>Telefon</DescriptionTerm>
  <DescriptionDetail>+47 900 00 000</DescriptionDetail>
</DescriptionList>`,
            preview: (
                <DescriptionList>
                    <DescriptionTerm>Navn</DescriptionTerm>
                    <DescriptionDetail>Ola Nordmann</DescriptionDetail>
                    <DescriptionTerm>E-post</DescriptionTerm>
                    <DescriptionDetail>ola@nordmann.no</DescriptionDetail>
                    <DescriptionTerm>Telefon</DescriptionTerm>
                    <DescriptionDetail>+47 900 00 000</DescriptionDetail>
                </DescriptionList>
            ),
        },
        {
            title: "Med skillelinjer",
            description: "Bruk separators for å skille par visuelt.",
            code: `<DescriptionList separators>
  <DescriptionTerm>Avtalenummer</DescriptionTerm>
  <DescriptionDetail>FO-2024-98765</DescriptionDetail>
  <DescriptionTerm>Status</DescriptionTerm>
  <DescriptionDetail>Aktiv</DescriptionDetail>
</DescriptionList>`,
            preview: (
                <DescriptionList separators>
                    <DescriptionTerm>Avtalenummer</DescriptionTerm>
                    <DescriptionDetail>FO-2024-98765</DescriptionDetail>
                    <DescriptionTerm>Status</DescriptionTerm>
                    <DescriptionDetail>Aktiv</DescriptionDetail>
                </DescriptionList>
            ),
        },
    ],
};

export default doc;
