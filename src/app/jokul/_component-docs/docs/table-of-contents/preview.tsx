"use client";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function TableOfContentsPreview() {
    const isHovered = usePreviewHovered();
    const [activeIdx, setActiveIdx] = useState(-1);
    useEffect(() => {
        if (!isHovered) { setActiveIdx(-1); return; }
        let i = -1;
        const id = setInterval(() => { i = (i + 1) % 4; setActiveIdx(i); }, 600);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <TableOfContents label="Innhold">
            <TableOfContents.Link href="#intro" style={{ fontWeight: activeIdx === 0 ? "bold" : "normal" }}>Introduksjon</TableOfContents.Link>
            <TableOfContents.Link href="#usage" style={{ fontWeight: activeIdx === 1 ? "bold" : "normal" }}>Bruk</TableOfContents.Link>
            <TableOfContents.Link href="#props" style={{ fontWeight: activeIdx === 2 ? "bold" : "normal" }}>Props</TableOfContents.Link>
            <TableOfContents.Link href="#examples" style={{ fontWeight: activeIdx === 3 ? "bold" : "normal" }}>Eksempler</TableOfContents.Link>
        </TableOfContents>
    );
}
