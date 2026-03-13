import React from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@fremtind/jokul/table";
import type { ComponentDoc } from "./types";

export function TableBasicPreview() {
    return (
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
    );
}

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
        { name: "caption", type: "React.ReactNode", required: true, source: "custom", status: "stable", description: "Tabellbeskrivelse." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableHead og TableBody." },
        { name: "collapseToList", type: "boolean", required: false, source: "react", status: "stable", default: "false", description: "Kollapser til liste på mobil." },
        { name: "fullWidth", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Strekker tabellen til full bredde." },
    ],
    subComponents: [
        {
            name: "TableHead",
            description: "Wrapper for overskriftsraden i tabellen.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableRow-elementer." },
            ],
        },
        {
            name: "TableBody",
            description: "Wrapper for dataradene i tabellen.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableRow-elementer." },
            ],
        },
        {
            name: "TableRow",
            description: "En rad i tabellen.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableHeader og TableCell-elementer." },
            ],
        },
        {
            name: "TableHeader",
            description: "En overskriftscelle i tabellen.",
            props: [
                { name: "scope", type: '"col" | "row"', required: false, source: "native", status: "stable", description: "Angir om cellen er overskrift for kolonne eller rad." },
                { name: "align", type: '"left" | "right" | "center"', required: false, source: "custom", status: "stable", default: '"left"', description: "Horisontal tekstjustering." },
                { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Innholdet i cellen." },
            ],
        },
        {
            name: "TableCell",
            description: "En datacelle i tabellen.",
            props: [
                { name: "align", type: '"left" | "right" | "center"', required: false, source: "custom", status: "stable", default: '"left"', description: "Horisontal tekstjustering." },
                { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Innholdet i cellen." },
            ],
        },
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
            preview: <TableBasicPreview />,
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
