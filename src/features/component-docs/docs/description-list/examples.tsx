import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import type { ComponentExample } from "../types";


export function DescriptionListContactPreview() {
    return (
        <DescriptionList>
            <DescriptionTerm>Navn</DescriptionTerm>
            <DescriptionDetail>Ola Nordmann</DescriptionDetail>
            <DescriptionTerm>E-post</DescriptionTerm>
            <DescriptionDetail>ola@nordmann.no</DescriptionDetail>
            <DescriptionTerm>Telefon</DescriptionTerm>
            <DescriptionDetail>+47 900 00 000</DescriptionDetail>
        </DescriptionList>
    );
}


export const examples: ComponentExample[] = [
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
                preview: <DescriptionListContactPreview />,
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
            }
];
