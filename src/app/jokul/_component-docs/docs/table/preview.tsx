"use client";
import { useState, useEffect } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableCaption } from "@fremtind/jokul/table";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const statusCycles = [
    ["Aktiv", "Aktiv", "Utløpt"],
    ["Aktiv", "Utløpt", "Aktiv"],
    ["Utløpt", "Aktiv", "Aktiv"],
];

export function TableHeadPreview() { return <TablePreview />; }
export function TableBodyPreview() { return <TablePreview />; }
export function TableCaptionPreview() { return <TablePreview />; }
export function TableRowPreview() { return <TablePreview />; }
export function TableHeaderPreview() { return <TablePreview />; }
export function TableCellPreview() { return <TablePreview />; }

export function TablePreview() {
    const isHovered = usePreviewHovered();
    const [cycleIdx, setCycleIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setCycleIdx(0); return; }
        const id = setInterval(() => setCycleIdx(i => (i + 1) % statusCycles.length), 1000);
        return () => clearInterval(id);
    }, [isHovered]);

    const types = ["Bilforsikring", "Reiseforsikring", "Innboforsikring"];
    const statuses = statusCycles[cycleIdx];

    return (
        <Table caption={<TableCaption>Forsikringsoversikt</TableCaption>}>
            <TableHead>
                <TableRow><TableHeader scope="col">Type</TableHeader><TableHeader scope="col">Status</TableHeader></TableRow>
            </TableHead>
            <TableBody>
                {types.map((type, idx) => (
                    <TableRow key={type}>
                        <TableCell>{type}</TableCell>
                        <TableCell>{statuses[idx]}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
