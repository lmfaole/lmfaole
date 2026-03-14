import { useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableCaption, useSortableTableHeader } from "@fremtind/jokul/table";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import summaryTableDoc from "../summary-table";

const doc: ComponentDoc = {
    id: "table",
    name: "Table",
    package: "@fremtind/jokul/table",
    category: "Visning",
    tags: ["tabell", "datavisning", "sortering"],
    description: "Table rendrer en tilgjengelig HTML-tabell med Jøkuls stilsett. Støtter sortering via useSortableTableHeader-hooken og responsiv listevisning med collapseToList.",
    warnings: "Alltid inkluder caption for tilgjengelighet. Bruk srOnly på TableCaption når den visuelle konteksten allerede gir tabellen et tydelig navn.",
    relatedIds: [summaryTableDoc.id],
    preview: (
        <Table caption={<TableCaption>Forsikringsoversikt</TableCaption>}>
            <TableHead>
                <TableRow>
                    <TableHeader scope="col">Type</TableHeader>
                    <TableHeader scope="col">Status</TableHeader>
                    <TableHeader scope="col">Beløp</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Bilforsikring</TableCell>
                    <TableCell>Aktiv</TableCell>
                    <TableCell>3 200 kr</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Reiseforsikring</TableCell>
                    <TableCell>Aktiv</TableCell>
                    <TableCell>890 kr</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    ),

    props,
    subComponents: [
        {
            name: "TableCaption",
            description: "Tilgjengelig tabellbeskrivelse. Bruk srOnly for å skjule den visuelt når konteksten allerede navngir tabellen.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Beskrivelsesteksten." },
                { name: "srOnly", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Skjuler caption visuelt, men beholder den for skjermlesere." },
            ],
        },
        {
            name: "TableHeader",
            description: "En overskriftscelle i tabellen.",
            props: [
                { name: "scope", type: '"col" | "row"', required: false, source: "native", status: "stable", description: "Angir om cellen er overskrift for kolonne eller rad." },
                { name: "align", type: '"left" | "right" | "center"', required: false, source: "custom", status: "stable", default: '"left"', description: "Horisontal tekstjustering." },
                { name: "sortable", type: "TableSortProps", required: false, source: "custom", status: "stable", description: "Aktiverer sortering. Bruk getSortProps() fra useSortableTableHeader." },
                { name: "srOnly", type: "boolean", required: false, source: "custom", status: "stable", description: "Skjuler header visuelt." },
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
    ],
    examples,
};

export default doc;
