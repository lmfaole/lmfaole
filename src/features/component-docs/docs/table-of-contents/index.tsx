import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "table-of-contents",
    name: "Table Of Contents",
    package: "@fremtind/jokul/table-of-contents",
    category: "Navigasjon",
    description: "TableOfContents viser en navigerbar innholdsfortegnelse for siden.",
    preview: (
        <TableOfContents label="Innhold">
            <TableOfContents.Link href="#intro">Introduksjon</TableOfContents.Link>
            <TableOfContents.Link href="#usage">Bruk</TableOfContents.Link>
            <TableOfContents.Link href="#props">Props</TableOfContents.Link>
            <TableOfContents.Link href="#examples">Eksempler</TableOfContents.Link>
        </TableOfContents>
    ),

    props,
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
    examples,
};

export default doc;
