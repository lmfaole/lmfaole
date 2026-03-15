import type { ComponentDoc } from "../types";
import { props } from "./props";
import { TablePreview } from "./preview";

const doc: ComponentDoc = {
    id: "table",
    name: "Table",
    package: "@fremtind/jokul/table",
    category: "Visning",
    description: "Table rendrer en tilgjengelig HTML-tabell med Jøkuls stilsett. Støtter sortering via useSortableTableHeader-hooken og responsiv listevisning med collapseToList.",
    warnings: "Alltid inkluder caption for tilgjengelighet. Bruk srOnly på TableCaption når den visuelle konteksten allerede gir tabellen et tydelig navn.",
    relationships: {
        related: [{ id: "summary-table", description: "Bruk SummaryTable for tokolonnet nøkkel-verdi-sammendrag med en totalsfoter i stedet for fullstendige tabelldata." }],
        subcomponents: [
            { id: "table-caption", description: "Tilgjengelig tabellbeskrivelse." },
            { id: "table-header", description: "En overskriftscelle i tabellen." },
            { id: "table-cell", description: "En datacelle i tabellen." },
            { id: "table-head", description: "Wrapper for overskriftsraden i tabellen." },
            { id: "table-body", description: "Wrapper for dataradene i tabellen." },
            { id: "table-row", description: "En rad i tabellen." },
        ],
    },
    preview: <TablePreview />,

    props,
};

export default doc;
