import React from "react";
import {Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableCaption} from "@fremtind/jokul/table";
import {Link} from "@fremtind/jokul/link";
import type {ResolvedRelationship} from "@/app/jokul/_component-docs/data";

interface RelatedComponentsTableProps {
    items: ResolvedRelationship[];
}

export function RelatedComponentsTable({items}: RelatedComponentsTableProps) {
    return (
        <Table caption={<TableCaption srOnly>Relaterte komponenter</TableCaption>} collapseToList fullWidth>
            <TableHead>
                <TableRow>
                    <TableHeader>Komponent</TableHeader>
                    <TableHeader>Beskrivelse</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {items.map(({doc, description}) => (
                    <TableRow key={doc.id}>
                        <TableCell data-th="Komponent">
                            <Link href={`/jokul/component/${doc.id}`}>{doc.name}</Link>
                        </TableCell>
                        <TableCell data-th="Beskrivelse">{description}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
