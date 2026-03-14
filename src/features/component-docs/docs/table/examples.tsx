import { useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableCaption, useSortableTableHeader } from "@fremtind/jokul/table";
import type { ComponentExample } from "../types";


type SortKey = "produkt" | "status" | "forfall" | "premie";
type SortDirection = "asc" | "desc" | "none";

const ROWS = [
    { produkt: "Bilforsikring kasko", nummer: "34567890", status: "Aktiv", forfall: "01.01.2026", premie: 542 },
    { produkt: "Innboforsikring", nummer: "12345678", status: "Aktiv", forfall: "15.06.2025", premie: 189 },
    { produkt: "Reiseforsikring", nummer: "98765432", status: "Utløpt", forfall: "01.03.2024", premie: 89 },
    { produkt: "Helseforsikring", nummer: "56781234", status: "Aktiv", forfall: "30.11.2025", premie: 650 },
];


export function TableBasicPreview() {
    return (
        <Table caption={<TableCaption srOnly>Aktive forsikringsavtaler</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader scope="col">Produkt</TableHeader>
                    <TableHeader scope="col">Forsikringsnummer</TableHeader>
                    <TableHeader scope="col">Status</TableHeader>
                    <TableHeader scope="col">Forfall</TableHeader>
                    <TableHeader scope="col" align="right">Månedspremie</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {ROWS.map((row) => (
                    <TableRow key={row.nummer}>
                        <TableHeader scope="row">{row.produkt}</TableHeader>
                        <TableCell>{row.nummer}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.forfall}</TableCell>
                        <TableCell align="right">{row.premie} kr</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

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


export const examples: ComponentExample[] = [
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
            }
];
