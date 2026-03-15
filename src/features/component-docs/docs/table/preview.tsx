"use client";
import { useState, useEffect } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableCaption } from "@fremtind/jokul/table";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function TablePreview() {
    const isHovered = usePreviewHovered();
    const [highlightRow, setHighlightRow] = useState(-1);
    useEffect(() => {
        if (!isHovered) { setHighlightRow(-1); return; }
        let i = -1;
        const id = setInterval(() => { i = (i + 1) % 3; setHighlightRow(i); }, 600);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Table caption={<TableCaption>Forsikringsoversikt</TableCaption>}>
            <TableHead>
                <TableRow><TableHeader scope="col">Type</TableHeader><TableHeader scope="col">Status</TableHeader></TableRow>
            </TableHead>
            <TableBody>
                {[["Bilforsikring","Aktiv"],["Reiseforsikring","Aktiv"],["Innboforsikring","Utløpt"]].map(([type, status], idx) => (
                    <TableRow key={type} style={{ background: highlightRow === idx ? "var(--jkl-color-background-focus)" : undefined }}>
                        <TableCell>{type}</TableCell>
                        <TableCell>{status}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
