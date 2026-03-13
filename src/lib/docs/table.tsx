import React from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@fremtind/jokul/table";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "table",
    name: "Table",
    package: "@fremtind/jokul/table",
    category: "Visning",
    tags: ["tabell", "datavisning"],
    description: "Table rendrer en tilgjengelig HTML-tabell med Jøkuls stilsett.",
    notes: "Alltid inkluder caption for tilgjengelighet.",
    relatedIds: ["summary-table"],
    props: [
        { name: "caption", type: "React.ReactNode", required: true, description: "Tabellbeskrivelse." },
        { name: "children", type: "React.ReactNode", required: true, description: "TableHead og TableBody." },
        { name: "collapseToList", type: "boolean", required: false, default: "false", description: "Kollapser til liste på mobil." },
        { name: "fullWidth", type: "boolean", required: false, default: "false", description: "Strekker tabellen til full bredde." },
    ],
    examples: [
        {
            title: "Enkel tabell",
            description: "Minimal tabell med to kolonner og to rader.",
            code: `<Table caption="Avtaler">
  <TableHead>
    <TableRow>
      <TableHeader scope="col">Type</TableHeader>
      <TableHeader scope="col">Status</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Bilforsikring</TableCell>
      <TableCell>Aktiv</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
            preview: (
                <Table caption="Avtaler">
                    <TableHead>
                        <TableRow>
                            <TableHeader scope="col">Type</TableHeader>
                            <TableHeader scope="col">Status</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Bilforsikring</TableCell>
                            <TableCell>Aktiv</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            ),
            tags: [],
        },
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
        {
            title: "Full bredde med radoverskrifter",
            description: "fullWidth strekker tabellen, og TableHeader med scope=\"row\" markerer radoverskrifter tilgjengelig.",
            code: `<Table caption="Månedlige premier" fullWidth>
  <TableHead>
    <TableRow>
      <TableHeader scope="col">Produkt</TableHeader>
      <TableHeader scope="col" align="right">Månedspremie</TableHeader>
      <TableHeader scope="col" align="right">Årspremie</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableHeader scope="row">Bilforsikring Kasko</TableHeader>
      <TableCell align="right">542 kr</TableCell>
      <TableCell align="right">6 504 kr</TableCell>
    </TableRow>
    <TableRow>
      <TableHeader scope="row">Innboforsikring</TableHeader>
      <TableCell align="right">189 kr</TableCell>
      <TableCell align="right">2 268 kr</TableCell>
    </TableRow>
    <TableRow>
      <TableHeader scope="row">Reiseforsikring</TableHeader>
      <TableCell align="right">98 kr</TableCell>
      <TableCell align="right">1 176 kr</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
            preview: (
                <Table caption="Månedlige premier" fullWidth>
                    <TableHead>
                        <TableRow>
                            <TableHeader scope="col">Produkt</TableHeader>
                            <TableHeader scope="col" align="right">Månedspremie</TableHeader>
                            <TableHeader scope="col" align="right">Årspremie</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableHeader scope="row">Bilforsikring Kasko</TableHeader>
                            <TableCell align="right">542 kr</TableCell>
                            <TableCell align="right">6 504 kr</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableHeader scope="row">Innboforsikring</TableHeader>
                            <TableCell align="right">189 kr</TableCell>
                            <TableCell align="right">2 268 kr</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableHeader scope="row">Reiseforsikring</TableHeader>
                            <TableCell align="right">98 kr</TableCell>
                            <TableCell align="right">1 176 kr</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            ),
        },
    ],
};

export default doc;
