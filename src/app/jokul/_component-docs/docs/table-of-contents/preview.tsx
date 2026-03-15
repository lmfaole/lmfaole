"use client";
import { useState, useEffect } from "react";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const tocLinks = [
    { href: "#intro", label: "Introduksjon" },
    { href: "#usage", label: "Bruk" },
    { href: "#props", label: "Props" },
    { href: "#examples", label: "Eksempler" },
];

export function TableOfContentsLinkPreview() { return <TableOfContentsPreview />; }

export function TableOfContentsPreview() {
    const isHovered = usePreviewHovered();
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setActiveIdx(0); return; }
        const id = setInterval(() => setActiveIdx(i => (i + 1) % tocLinks.length), 1000);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <TableOfContents label="Innhold">
            {tocLinks.map((link, idx) => (
                <TableOfContents.Link
                    key={link.href}
                    href={link.href}
                    style={idx === activeIdx ? { fontWeight: "bold", color: "var(--jkl-color-text-default)" } : undefined}
                >
                    {link.label}
                </TableOfContents.Link>
            ))}
        </TableOfContents>
    );
}
