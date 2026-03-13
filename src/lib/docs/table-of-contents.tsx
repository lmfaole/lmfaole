import React from "react";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "table-of-contents",
    name: "TableOfContents",
    package: "@fremtind/jokul/table-of-contents",
    category: "Navigasjon",
    tags: ["navigasjon", "layout"],
    description: "TableOfContents viser en navigerbar innholdsfortegnelse for siden.",
    notes: "Bruk TableOfContents.Link for hvert element i innholdsfortegnelsen.",
    props: [
        { name: "label", type: "string", required: true, source: "custom", description: "Overskrift for innholdsfortegnelsen." },
        { name: "children", type: "React.ReactNode", required: false, source: "native", description: "TableOfContents.Link-elementer." },
    ],
    examples: [
        {
            title: "Innholdsfortegnelse",
            description: "Minimal innholdsfortegnelse.",
            code: `<TableOfContents label="Innhold">
  <TableOfContents.Link href="#intro">Introduksjon</TableOfContents.Link>
  <TableOfContents.Link href="#bruk">Grunnleggende bruk</TableOfContents.Link>
</TableOfContents>`,
            preview: (
                <TableOfContents label="Innhold">
                    <TableOfContents.Link href="#intro">Introduksjon</TableOfContents.Link>
                    <TableOfContents.Link href="#bruk">Grunnleggende bruk</TableOfContents.Link>
                </TableOfContents>
            ),
            tags: [],
        },
        {
            title: "Innholdsfortegnelse",
            description: "Typisk innholdsfortegnelse for en artikkelside.",
            code: `<TableOfContents label="Innhold">
  <TableOfContents.Link href="#introduksjon">Introduksjon</TableOfContents.Link>
  <TableOfContents.Link href="#fordeler">Fordeler</TableOfContents.Link>
  <TableOfContents.Link href="#priser">Priser</TableOfContents.Link>
  <TableOfContents.Link href="#faq">Spørsmål og svar</TableOfContents.Link>
</TableOfContents>`,
            preview: (
                <TableOfContents label="Innhold">
                    <TableOfContents.Link href="#introduksjon">Introduksjon</TableOfContents.Link>
                    <TableOfContents.Link href="#fordeler">Fordeler</TableOfContents.Link>
                    <TableOfContents.Link href="#priser">Priser</TableOfContents.Link>
                    <TableOfContents.Link href="#faq">Spørsmål og svar</TableOfContents.Link>
                </TableOfContents>
            ),
        },
        {
            title: "Utvidet innholdsfortegnelse",
            description: "Innholdsfortegnelse med flere seksjoner for lengre artikler.",
            code: `<TableOfContents label="På denne siden">
  <TableOfContents.Link href="#om-forsikringen">Om forsikringen</TableOfContents.Link>
  <TableOfContents.Link href="#hva-dekkes">Hva dekkes</TableOfContents.Link>
  <TableOfContents.Link href="#hva-dekkes-ikke">Hva dekkes ikke</TableOfContents.Link>
  <TableOfContents.Link href="#pris">Pris og betaling</TableOfContents.Link>
  <TableOfContents.Link href="#melde-skade">Melde skade</TableOfContents.Link>
  <TableOfContents.Link href="#si-opp">Si opp forsikringen</TableOfContents.Link>
</TableOfContents>`,
            preview: (
                <TableOfContents label="På denne siden">
                    <TableOfContents.Link href="#om-forsikringen">Om forsikringen</TableOfContents.Link>
                    <TableOfContents.Link href="#hva-dekkes">Hva dekkes</TableOfContents.Link>
                    <TableOfContents.Link href="#hva-dekkes-ikke">Hva dekkes ikke</TableOfContents.Link>
                    <TableOfContents.Link href="#pris">Pris og betaling</TableOfContents.Link>
                    <TableOfContents.Link href="#melde-skade">Melde skade</TableOfContents.Link>
                    <TableOfContents.Link href="#si-opp">Si opp forsikringen</TableOfContents.Link>
                </TableOfContents>
            ),
        },
        {
            title: "Vilkårsoversikt",
            description: "Innholdsfortegnelse for forsikringsvilkår med mange kapitler.",
            code: `<TableOfContents label="Vilkår – innhold">
  <TableOfContents.Link href="#definisjoner">Definisjoner</TableOfContents.Link>
  <TableOfContents.Link href="#dekning">Dekning</TableOfContents.Link>
  <TableOfContents.Link href="#unntak">Unntak og begrensninger</TableOfContents.Link>
  <TableOfContents.Link href="#egenandel">Egenandel</TableOfContents.Link>
  <TableOfContents.Link href="#skadeoppgjor">Skadeoppgjør</TableOfContents.Link>
</TableOfContents>`,
            preview: (
                <TableOfContents label="Vilkår – innhold">
                    <TableOfContents.Link href="#definisjoner">Definisjoner</TableOfContents.Link>
                    <TableOfContents.Link href="#dekning">Dekning</TableOfContents.Link>
                    <TableOfContents.Link href="#unntak">Unntak og begrensninger</TableOfContents.Link>
                    <TableOfContents.Link href="#egenandel">Egenandel</TableOfContents.Link>
                    <TableOfContents.Link href="#skadeoppgjor">Skadeoppgjør</TableOfContents.Link>
                </TableOfContents>
            ),
        },
    ],
};

export default doc;
