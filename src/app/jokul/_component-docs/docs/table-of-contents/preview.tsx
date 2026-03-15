"use client";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";

export function TableOfContentsLinkPreview() { return <TableOfContentsPreview />; }

export function TableOfContentsPreview() {
    return (
        <TableOfContents label="Innhold">
            <TableOfContents.Link href="#intro">Introduksjon</TableOfContents.Link>
            <TableOfContents.Link href="#usage">Bruk</TableOfContents.Link>
            <TableOfContents.Link href="#props">Props</TableOfContents.Link>
            <TableOfContents.Link href="#examples">Eksempler</TableOfContents.Link>
        </TableOfContents>
    );
}
