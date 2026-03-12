import React from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@fremtind/jokul/table";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "table",
    name: "Table",
    package: "@fremtind/jokul/table",
    category: "Visning",
    description: "Table rendrer en tilgjengelig HTML-tabell med Jøkuls stilsett.",
    notes: "Alltid inkluder caption for tilgjengelighet.",
    relatedIds: ["summary-table"],
    props: [
        { name: "caption", type: "React.ReactNode", required: true, description: "Tabellbeskrivelse." },
        { name: "children", type: "React.ReactNode", required: true, description: "TableHead og TableBody." },
        { name: "collapseToList", type: "boolean", required: false, description: "Kollapser til liste på mobil." },
        { name: "fullWidth", type: "boolean", required: false, description: "Strekker tabellen til full bredde." },
    ],
    examples: [
        {
            title: "Grunnleggende tabell",
            description: "Tabell med tre kolonner og to rader.",
            code: `<Table caption="Forsikringsavtaler">
  <TableHead>
    <TableRow>
      <TableHeader scope="col">Type</TableHeader>
      <TableHeader scope="col">Status</TableHeader>
      <TableHeader scope="col">Forfall</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Bilforsikring</TableCell>
      <TableCell>Aktiv</TableCell>
      <TableCell>31.12.2025</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Hjemforsikring</TableCell>
      <TableCell>Aktiv</TableCell>
      <TableCell>01.06.2026</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
            preview: (
                <Table caption="Forsikringsavtaler">
                    <TableHead>
                        <TableRow>
                            <TableHeader scope="col">Type</TableHeader>
                            <TableHeader scope="col">Status</TableHeader>
                            <TableHeader scope="col">Forfall</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Bilforsikring</TableCell>
                            <TableCell>Aktiv</TableCell>
                            <TableCell>31.12.2025</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Hjemforsikring</TableCell>
                            <TableCell>Aktiv</TableCell>
                            <TableCell>01.06.2026</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            ),
        },
    ],
};

export default doc;
