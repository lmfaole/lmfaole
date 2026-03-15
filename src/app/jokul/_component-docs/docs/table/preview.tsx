"use client";
import {useEffect, useMemo, useState} from "react";
import {
    ExpandableTableRow,
    ExpandableTableRowController,
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableColumn,
    TableColumnGroup,
    TableFooter,
    TableHead,
    TableHeader,
    TablePagination,
    TableRow,
    DataTable
} from "@fremtind/jokul/table";
import {usePreviewHovered} from "@/app/jokul/_component-docs/components/PreviewHoverContext";

type PolicyStatus = "Aktiv" | "Utløpt" | "Stoppet";

const statusCycles: PolicyStatus[][] = [
    ["Aktiv", "Aktiv", "Utløpt"],
    ["Aktiv", "Utløpt", "Aktiv"],
    ["Stoppet", "Aktiv", "Aktiv"],
];

const products = ["Bilforsikring", "Reiseforsikring", "Innboforsikring"] as const;

function StatusPill({status}: { status: PolicyStatus }) {
    const colors: Record<PolicyStatus, string> = {
        Aktiv: "var(--jkl-color-malachite-green-600)",
        Utløpt: "var(--jkl-color-red-500)",
        Stoppet: "var(--jkl-color-orange-500)",
    };
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4em",
                padding: "0.2em 0.6em",
                borderRadius: "999px",
                background: "var(--jkl-color-sand-25)",
                color: colors[status],
                fontWeight: 600,
                fontSize: "0.9em",
            }}
        >
            <span
                aria-hidden
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: colors[status],
                }}
            />
            {status}
        </span>
    );
}

export function TableHeadPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Table caption={<TableCaption>Head med sortering</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader scope="col">Kolonne</TableHeader>
                    <TableHeader scope="col" align="right" aria-sort={isHovered ? "ascending" : "none"}>
                        Beløp {isHovered ? "▲" : ""}
                    </TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Linje 1</TableCell>
                    <TableCell align="right">1 200</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

export function TableBodyPreview() {
    return (
        <Table caption={<TableCaption>Body</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Navn</TableHeader>
                    <TableHeader>Verdi</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {["Første", "Andre", "Tredje"].map((label, i) => (
                    <TableRow key={label}>
                        <TableCell>{label}</TableCell>
                        <TableCell>{(i + 1) * 10} stk</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export function TableCaptionPreview() {
    return (
        <Table caption={<TableCaption>Beskrivende caption for skjermleser</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Felt</TableHeader>
                    <TableHeader>Verdi</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Eksempel</TableCell>
                    <TableCell>Data</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

export function TableRowPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Table caption={<TableCaption>Rader med hover</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Navn</TableHeader>
                    <TableHeader>Pris</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow style={isHovered ? {background: "var(--jkl-color-ice-25)"} : undefined}>
                    <TableCell>Produkt</TableCell>
                    <TableCell>99,-</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Produkt</TableCell>
                    <TableCell>149,-</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

export function TableHeaderPreview() {
    return (
        <Table caption={<TableCaption>Header med justering</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader align="left">Venstre</TableHeader>
                    <TableHeader align="center">Senter</TableHeader>
                    <TableHeader align="right">Høyre</TableHeader>
                </TableRow>
            </TableHead>
        </Table>
    );
}

export function TableCellPreview() {
    return (
        <Table caption={<TableCaption>Cellers justering</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Navn</TableHeader>
                    <TableHeader align="right">Pris</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell data-th="Navn">Ananas</TableCell>
                    <TableCell data-th="Pris" align="right">24,90</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell data-th="Navn">Sitron</TableCell>
                    <TableCell data-th="Pris" align="right">9,90</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

export function ExpandableTableRowPreview() {
    const [open, setOpen] = useState(false);
    return (
        <Table caption={<TableCaption>Utvidbar rad</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Produkt</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader srOnly>Detaljer</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <ExpandableTableRow
                    isOpen={open}
                    onToggle={setOpen}
                    expandedChildren={<div style={{padding: "var(--jkl-spacing-s)"}}>Detaljert beskrivelse her.</div>}
                    colSpan={3}
                    style={{outline: "2px solid var(--jkl-color-ice-300)"}}
                >
                    <TableCell>Bilforsikring</TableCell>
                    <TableCell><StatusPill status="Aktiv"/></TableCell>
                    <ExpandableTableRowController data-th="Detaljer"/>
                </ExpandableTableRow>
                <TableRow>
                    <TableCell>Reiseforsikring</TableCell>
                    <TableCell><StatusPill status="Utløpt"/></TableCell>
                    <TableCell/>
                </TableRow>
            </TableBody>
        </Table>
    );
}

export function ExpandableTableRowControllerPreview() {
    const [open, setOpen] = useState(true);
    return (
        <Table caption={<TableCaption>Controller</TableCaption>} fullWidth>
            <TableBody>
                <ExpandableTableRow
                    isOpen={open}
                    onToggle={setOpen}
                    expandedChildren={<div style={{padding: "var(--jkl-spacing-s)"}}>Controller styrer denne.</div>}
                    colSpan={2}
                >
                    <TableCell>Trykk</TableCell>
                    <ExpandableTableRowController data-th="Åpne/lukke"/>
                </ExpandableTableRow>
            </TableBody>
        </Table>
    );
}

export function TableColumnPreview() {
    return <ColumnPreview/>;
}

export function TableColumnGroupPreview() {
    return <ColumnPreview grouped />;
}

export function TableFooterPreview() {
    return <FooterPreview/>;
}

export function TablePaginationPreview() {
    return <PaginationPreview/>;
}

export function DataTablePreview() {
    const isHovered = usePreviewHovered();
    const statuses = isHovered ? ["Aktiv", "Utløpt", "Aktiv"] : ["Aktiv", "Aktiv", "Utløpt"];
    const rows = [
        ["Bilforsikring", <StatusPill status={statuses[0] as PolicyStatus} key="status-0"/>, "12 345 kr"],
        ["Reiseforsikring", <StatusPill status={statuses[1] as PolicyStatus} key="status-1"/>, "3 210 kr"],
        ["Innboforsikring", <StatusPill status={statuses[2] as PolicyStatus} key="status-2"/>, "5 600 kr"],
    ];
    return (
        <div style={{maxWidth: isHovered ? 360 : 720, transition: "max-width 300ms ease"}}>
            <DataTable
                caption="Forsikringer"
                columns={["Type", "Status", "Sum"]}
                rows={rows.map((r) => r.map((cell, i) => <span key={i}>{cell}</span>))}
                collapseToList
                verticalAlign="top"
            />
        </div>
    );
}

export function TablePreview() {
    const isHovered = usePreviewHovered();
    const [cycleIdx, setCycleIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) {
            setCycleIdx(0);
            return;
        }
        const id = setInterval(() => {
            setCycleIdx(i => (i + 1) % statusCycles.length);
        }, 2000);
        return () => clearInterval(id);
    }, [isHovered]);

    const statuses = statusCycles[cycleIdx];

    const rows = useMemo(
        () =>
            products.map((type, idx) => ({
                type,
                status: statuses[idx],
                price: `${(idx + 2) * 4200} kr`,
            })),
        [statuses],
    );

    return (
        <Table caption={<TableCaption>Forsikringsoversikt</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader scope="col">Produkt</TableHeader>
                    <TableHeader scope="col" align="center">Status</TableHeader>
                    <TableHeader scope="col" align="right">Årspremie</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.type}>
                        <TableCell data-th="Produkt">{row.type}</TableCell>
                        <TableCell data-th="Status" align="center"><StatusPill status={row.status}/></TableCell>
                        <TableCell data-th="Årspremie" align="right">{row.price}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function ColumnPreview({grouped = false}: { grouped?: boolean }) {
    const isHovered = usePreviewHovered();
    const narrow = isHovered;
    const widths = grouped ? [narrow ? "18%" : "34%", "36%", "30%"] : [narrow ? "24%" : "48%", "28%", "28%"]; 
    return (
        <Table caption={<TableCaption>Kolonner</TableCaption>} fullWidth>
            {grouped ? (
                <TableColumnGroup>
                    <TableColumn style={{width: widths[0]}}/>
                    <TableColumn style={{width: widths[1]}}/>
                    <TableColumn style={{width: widths[2]}}/>
                </TableColumnGroup>
            ) : (
                <>
                    <TableColumn style={{width: widths[0]}}/>
                    <TableColumn style={{width: widths[1]}}/>
                    <TableColumn style={{width: widths[2]}}/>
                </>
            )}
            <TableHead>
                <TableRow>
                    <TableHeader>Kolonne A</TableHeader>
                    <TableHeader>Kolonne B</TableHeader>
                    <TableHeader>Kolonne C</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Verdi</TableCell>
                    <TableCell>Verdi</TableCell>
                    <TableCell>Verdi</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

function FooterPreview() {
    return (
        <Table caption={<TableCaption>Summer</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Type</TableHeader>
                    <TableHeader align="right">Beløp</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Post 1</TableCell>
                    <TableCell align="right">1 000</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Post 2</TableCell>
                    <TableCell align="right">500</TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableHeader scope="row">Totalt</TableHeader>
                    <TableHeader align="right">1 500</TableHeader>
                </TableRow>
                <TableRow>
                    <TableHeader scope="row">Rabatt</TableHeader>
                    <TableCell align="right">-150</TableCell>
                </TableRow>
                <TableRow>
                    <TableHeader scope="row">Å betale</TableHeader>
                    <TableHeader align="right">1 350</TableHeader>
                </TableRow>
            </TableFooter>
        </Table>
    );
}

function PaginationPreview() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(2);
    const rows = [
        ["Felt 1", "Verdi A"],
        ["Felt 2", "Verdi B"],
        ["Felt 3", "Verdi C"],
        ["Felt 4", "Verdi D"],
    ];
    const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return (
        <Table caption={<TableCaption>Sidevisning</TableCaption>} fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Navn</TableHeader>
                    <TableHeader>Verdi</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {paged.map((row, i) => (
                    <TableRow key={row[0]}>
                        <TableCell data-th="Navn">{row[0]}</TableCell>
                        <TableCell data-th="Verdi">{row[1]}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2}>
                        <TablePagination
                            rowsPerPage={rowsPerPage}
                            rowsPerPageItems={[2, 4]}
                            totalNumberOfRows={rows.length}
                            activePage={page}
                            onChange={(_, to) => setPage(to)}
                            onChangeRowsPerPage={(e) => {
                                const val = Number(e.target.value);
                                setRowsPerPage(val);
                                setPage(0);
                            }}
                            withGoToPage
                            labels={{rowsPerPage: "Rader per side", previous: "Forrige", next: "Neste"}}
                        />
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    );
}
