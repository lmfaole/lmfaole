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
    preview: (
        <TableOfContents label="Innhold">
            <TableOfContents.Link href="#intro">Introduksjon</TableOfContents.Link>
            <TableOfContents.Link href="#usage">Bruk</TableOfContents.Link>
            <TableOfContents.Link href="#props">Props</TableOfContents.Link>
            <TableOfContents.Link href="#examples">Eksempler</TableOfContents.Link>
        </TableOfContents>
    ),
    props: [
        { name: "label", type: "string", required: true, source: "custom", status: "stable", description: "Overskrift for innholdsfortegnelsen." },
        { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "TableOfContents.Link-elementer." },
    ],
    subComponents: [
        {
            name: "TableOfContents.Link",
            description: "En lenke i innholdsfortegnelsen. Rendres som en <a> som standard, men kan byttes med as-prop.",
            props: [
                { name: "href", type: "string", required: true, source: "native", status: "stable", description: "Anker-ID for seksjonen lenken peker til, f.eks. #intro." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Lenketeksten." },
                { name: "as", type: "React.ElementType", required: false, source: "custom", status: "stable", description: "Bytt ut underliggende element, f.eks. Next.js Link." },
            ],
        },
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
