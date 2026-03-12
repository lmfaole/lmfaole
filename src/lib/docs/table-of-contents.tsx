import React from "react";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "table-of-contents",
    name: "TableOfContents",
    package: "@fremtind/jokul/table-of-contents",
    category: "Navigasjon",
    description: "TableOfContents viser en navigerbar innholdsfortegnelse for siden.",
    notes: "Bruk TableOfContents.Link for hvert element i innholdsfortegnelsen.",
    props: [
        { name: "label", type: "string", required: true, description: "Overskrift for innholdsfortegnelsen." },
        { name: "children", type: "React.ReactNode", required: false, description: "TableOfContents.Link-elementer." },
    ],
    examples: [
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
    ],
};

export default doc;
