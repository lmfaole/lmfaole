"use client";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableCaption } from "@fremtind/jokul/table";

export function TableHeadPreview() { return <TablePreview />; }
export function TableBodyPreview() { return <TablePreview />; }
export function TableCaptionPreview() { return <TablePreview />; }
export function TableRowPreview() { return <TablePreview />; }
export function TableHeaderPreview() { return <TablePreview />; }
export function TableCellPreview() { return <TablePreview />; }

export function TablePreview() {
    return (
        <Table caption={<TableCaption>Forsikringsoversikt</TableCaption>}>
            <TableHead>
                <TableRow><TableHeader scope="col">Type</TableHeader><TableHeader scope="col">Status</TableHeader></TableRow>
            </TableHead>
            <TableBody>
                {[["Bilforsikring","Aktiv"],["Reiseforsikring","Aktiv"],["Innboforsikring","Utløpt"]].map(([type, status]) => (
                    <TableRow key={type}>
                        <TableCell>{type}</TableCell>
                        <TableCell>{status}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
