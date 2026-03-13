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
        { name: "children", type: "React.ReactNode", required: true, source: "custom", description: "DescriptionTerm og DescriptionDetail-elementer." },
        { name: "separators", type: "boolean", required: false, source: "custom", default: "false", description: "Viser skillelinjer mellom par." },
        { name: "alignment", type: '"horizontal" | "vertical" | "justified"', required: false, source: "custom", default: '"vertical"', description: "Layoutretning for nøkkel-verdi-par." },
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
            title: "Horisontal layout",
            description: 'alignment="horizontal" plasserer nøkkel og verdi side om side på samme rad.',
            code: `<DescriptionList alignment="horizontal">
  <DescriptionTerm>Forsikringsnummer</DescriptionTerm>
  <DescriptionDetail>FO-2024-12345</DescriptionDetail>
  <DescriptionTerm>Produkt</DescriptionTerm>
  <DescriptionDetail>Innboforsikring</DescriptionDetail>
  <DescriptionTerm>Forsikringstaker</DescriptionTerm>
  <DescriptionDetail>Kari Nordmann</DescriptionDetail>
  <DescriptionTerm>Startdato</DescriptionTerm>
  <DescriptionDetail>01.01.2024</DescriptionDetail>
</DescriptionList>`,
            preview: (
                <DescriptionList alignment="horizontal">
                    <DescriptionTerm>Forsikringsnummer</DescriptionTerm>
                    <DescriptionDetail>FO-2024-12345</DescriptionDetail>
                    <DescriptionTerm>Produkt</DescriptionTerm>
                    <DescriptionDetail>Innboforsikring</DescriptionDetail>
                    <DescriptionTerm>Forsikringstaker</DescriptionTerm>
                    <DescriptionDetail>Kari Nordmann</DescriptionDetail>
                    <DescriptionTerm>Startdato</DescriptionTerm>
                    <DescriptionDetail>01.01.2024</DescriptionDetail>
                </DescriptionList>
            ),
        },
        {
            title: "Justified layout",
            description: 'alignment="justified" skyver nøkkel til venstre og verdi til høyre – nyttig i oppsummeringer og kvitteringer.',
            code: `<DescriptionList alignment="justified" separators>
  <DescriptionTerm>Dekning</DescriptionTerm>
  <DescriptionDetail>Kasko</DescriptionDetail>
  <DescriptionTerm>Egenandel</DescriptionTerm>
  <DescriptionDetail>4 000 kr</DescriptionDetail>
  <DescriptionTerm>Årspremie</DescriptionTerm>
  <DescriptionDetail>8 400 kr</DescriptionDetail>
</DescriptionList>`,
            preview: (
                <DescriptionList alignment="justified" separators>
                    <DescriptionTerm>Dekning</DescriptionTerm>
                    <DescriptionDetail>Kasko</DescriptionDetail>
                    <DescriptionTerm>Egenandel</DescriptionTerm>
                    <DescriptionDetail>4 000 kr</DescriptionDetail>
                    <DescriptionTerm>Årspremie</DescriptionTerm>
                    <DescriptionDetail>8 400 kr</DescriptionDetail>
                </DescriptionList>
            ),
        },
        {
            title: "Flere detaljer per term",
            description: "En term kan ha flere DescriptionDetail-elementer, f.eks. for en adresse med flere linjer.",
            code: `<DescriptionList separators>
  <DescriptionTerm>Faktureringsadresse</DescriptionTerm>
  <DescriptionDetail>Storgata 1</DescriptionDetail>
  <DescriptionDetail>0155 Oslo</DescriptionDetail>
  <DescriptionDetail>Norge</DescriptionDetail>
  <DescriptionTerm>Kontaktperson</DescriptionTerm>
  <DescriptionDetail>Ola Nordmann</DescriptionDetail>
</DescriptionList>`,
            preview: (
                <DescriptionList separators>
                    <DescriptionTerm>Faktureringsadresse</DescriptionTerm>
                    <DescriptionDetail>Storgata 1</DescriptionDetail>
                    <DescriptionDetail>0155 Oslo</DescriptionDetail>
                    <DescriptionDetail>Norge</DescriptionDetail>
                    <DescriptionTerm>Kontaktperson</DescriptionTerm>
                    <DescriptionDetail>Ola Nordmann</DescriptionDetail>
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
