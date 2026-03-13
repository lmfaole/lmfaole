import { useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableCaption, useSortableTableHeader } from "@fremtind/jokul/table";
import type { ComponentDoc } from "./types";

export function TableBasicPreview() {
    return (
        <Table caption={<TableCaption srOnly>Forsikringsavtaler</TableCaption>}>
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

type SortKey = "produkt" | "status" | "forfall" | "premie";
type SortDirection = "asc" | "desc" | "none";

const ROWS: Array<{ produkt: string; nummer: string; status: string; forfall: string; premie: number }> = [
    { produkt: "Bilforsikring Kasko", nummer: "FK-2024-001", status: "Aktiv", forfall: "31.12.2025", premie: 6504 },
    { produkt: "Innboforsikring",     nummer: "FK-2024-002", status: "Aktiv", forfall: "01.06.2026", premie: 2268 },
    { produkt: "Reiseforsikring",     nummer: "FK-2024-003", status: "Aktiv", forfall: "15.03.2026", premie: 1176 },
    { produkt: "Ulykkesforsikring",   nummer: "FK-2024-004", status: "Utløpt", forfall: "01.01.2025", premie: 0 },
    { produkt: "Barneforsikring",     nummer: "FK-2024-005", status: "Aktiv", forfall: "30.09.2026", premie: 3120 },
];

function SortableTablePreview() {
    const [sortKey, setSortKey] = useState<SortKey>("produkt");
    const [sortDir, setSortDir] = useState<SortDirection>("asc");

    const { getSortProps } = useSortableTableHeader(sortKey, sortDir, (key, dir) => {
        setSortKey(key as SortKey);
        setSortDir(dir);
    });

    const sorted = [...ROWS].sort((a, b) => {
        if (sortDir === "none") return 0;
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "premie") return mul * (a.premie - b.premie);
        const av = sortKey === "produkt" ? a.produkt : sortKey === "status" ? a.status : a.forfall;
        const bv = sortKey === "produkt" ? b.produkt : sortKey === "status" ? b.status : b.forfall;
        return mul * av.localeCompare(bv, "nb");
    });

    return (
        <Table caption={<TableCaption srOnly>Aktive forsikringsavtaler</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader scope="col" {...getSortProps("produkt").sortable && { sortable: getSortProps("produkt").sortable }}>Produkt</TableHeader>
                    <TableHeader scope="col">Forsikringsnummer</TableHeader>
                    <TableHeader scope="col" {...getSortProps("status").sortable && { sortable: getSortProps("status").sortable }}>Status</TableHeader>
                    <TableHeader scope="col" {...getSortProps("forfall").sortable && { sortable: getSortProps("forfall").sortable }}>Forfall</TableHeader>
                    <TableHeader scope="col" align="right" {...getSortProps("premie").sortable && { sortable: getSortProps("premie").sortable }}>Årspremie</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {sorted.map((row) => (
                    <TableRow key={row.nummer}>
                        <TableHeader scope="row">{row.produkt}</TableHeader>
                        <TableCell>{row.nummer}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.forfall}</TableCell>
                        <TableCell align="right">{row.premie ? `${row.premie.toLocaleString("nb")} kr` : "—"}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

const doc: ComponentDoc = {
    id: "table",
    name: "Table",
    package: "@fremtind/jokul/table",
    category: "Visning",
    tags: ["tabell", "datavisning", "sortering"],
    description: "Table rendrer en tilgjengelig HTML-tabell med Jøkuls stilsett. Støtter sortering via useSortableTableHeader-hooken og responsiv listevisning med collapseToList.",
    warnings: "Alltid inkluder caption for tilgjengelighet. Bruk srOnly på TableCaption når den visuelle konteksten allerede gir tabellen et tydelig navn.",
    relatedIds: ["summary-table"],
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
    props: [
        { name: "caption", type: "React.ReactNode", required: true, source: "custom", status: "stable", description: "Tabellbeskrivelse — pass TableCaption med srOnly for å skjule den visuelt." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableHead og TableBody." },
        { name: "collapseToList", type: "boolean", required: false, source: "react", status: "stable", default: "false", description: "Kollapser til liste på mobil." },
        { name: "fullWidth", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Strekker tabellen til full bredde." },
    ],
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
    examples: [
        {
            title: "Forsikringsoversikt",
            description: "Typisk bruk med fem rader. TableCaption med srOnly skjuler tittelen visuelt mens den forblir tilgjengelig for skjermlesere.",
            code: `<Table caption={<TableCaption srOnly>Aktive forsikringsavtaler</TableCaption>} fullWidth>
  <TableHead>
    <TableRow>
      <TableHeader scope="col">Produkt</TableHeader>
      <TableHeader scope="col">Forsikringsnummer</TableHeader>
      <TableHeader scope="col">Status</TableHeader>
      <TableHeader scope="col">Forfall</TableHeader>
      <TableHeader scope="col" align="right">Årspremie</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableHeader scope="row">Bilforsikring Kasko</TableHeader>
      <TableCell>FK-2024-001</TableCell>
      <TableCell>Aktiv</TableCell>
      <TableCell>31.12.2025</TableCell>
      <TableCell align="right">6 504 kr</TableCell>
    </TableRow>
    {/* …flere rader */}
  </TableBody>
</Table>`,
            preview: (
                <Table caption={<TableCaption srOnly>Aktive forsikringsavtaler</TableCaption>} fullWidth>
                    <TableHead>
                        <TableRow>
                            <TableHeader scope="col">Produkt</TableHeader>
                            <TableHeader scope="col">Forsikringsnummer</TableHeader>
                            <TableHeader scope="col">Status</TableHeader>
                            <TableHeader scope="col">Forfall</TableHeader>
                            <TableHeader scope="col" align="right">Årspremie</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ROWS.map((row) => (
                            <TableRow key={row.nummer}>
                                <TableHeader scope="row">{row.produkt}</TableHeader>
                                <TableCell>{row.nummer}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>{row.forfall}</TableCell>
                                <TableCell align="right">{row.premie ? `${row.premie.toLocaleString("nb")} kr` : "—"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ),
        },
        {
            title: "Sorterbar tabell",
            description: "Bruk useSortableTableHeader-hooken og sortable-propen på TableHeader for å la brukeren sortere kolonnene.",
            code: `const [sortKey, setSortKey] = useState("produkt");
const [sortDir, setSortDir] = useState("asc");

const { getSortProps } = useSortableTableHeader(sortKey, sortDir, (key, dir) => {
    setSortKey(key);
    setSortDir(dir);
});

// Sorter radene basert på sortKey og sortDir, deretter render:
<Table caption={<TableCaption srOnly>Aktive forsikringsavtaler</TableCaption>} fullWidth>
  <TableHead>
    <TableRow>
      <TableHeader scope="col" sortable={getSortProps("produkt").sortable}>Produkt</TableHeader>
      <TableHeader scope="col">Forsikringsnummer</TableHeader>
      <TableHeader scope="col" sortable={getSortProps("status").sortable}>Status</TableHeader>
      <TableHeader scope="col" sortable={getSortProps("forfall").sortable}>Forfall</TableHeader>
      <TableHeader scope="col" align="right" sortable={getSortProps("premie").sortable}>Årspremie</TableHeader>
    </TableRow>
  </TableHead>
  {/* …rader */}
</Table>`,
            preview: <SortableTablePreview />,
        },
        {
            title: "Responsiv tabell",
            description: "collapseToList kollapser tabellen til en liste på små skjermer.",
            code: `<Table caption={<TableCaption srOnly>Skadehistorikk</TableCaption>} fullWidth collapseToList>
  <TableHead>
    <TableRow>
      <TableHeader scope="col">Dato</TableHeader>
      <TableHeader scope="col">Type skade</TableHeader>
      <TableHeader scope="col">Egenandel</TableHeader>
      <TableHeader scope="col" align="right">Utbetalt</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>12.03.2024</TableCell>
      <TableCell>Kollisjon</TableCell>
      <TableCell>4 000 kr</TableCell>
      <TableCell align="right">18 500 kr</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
            preview: (
                <Table caption={<TableCaption srOnly>Skadehistorikk</TableCaption>} fullWidth collapseToList>
                    <TableHead>
                        <TableRow>
                            <TableHeader scope="col">Dato</TableHeader>
                            <TableHeader scope="col">Type skade</TableHeader>
                            <TableHeader scope="col">Egenandel</TableHeader>
                            <TableHeader scope="col" align="right">Utbetalt</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>12.03.2024</TableCell>
                            <TableCell>Kollisjon</TableCell>
                            <TableCell>4 000 kr</TableCell>
                            <TableCell align="right">18 500 kr</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>07.11.2023</TableCell>
                            <TableCell>Tyveri av bil</TableCell>
                            <TableCell>6 000 kr</TableCell>
                            <TableCell align="right">142 000 kr</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>22.06.2022</TableCell>
                            <TableCell>Vannlekkasje</TableCell>
                            <TableCell>4 000 kr</TableCell>
                            <TableCell align="right">31 200 kr</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            ),
        },
    ],
};

export default doc;
