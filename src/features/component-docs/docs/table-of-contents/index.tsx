import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function TableOfContentsPreview() {
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

const doc: ComponentDoc = {
    id: "table-of-contents",
    name: "Table Of Contents",
    package: "@fremtind/jokul/table-of-contents",
    category: "Navigasjon",
    description: "TableOfContents viser en navigerbar innholdsfortegnelse for siden.",
    preview: <TableOfContentsPreview />,

    props,
    subComponents: [
        {
            name: "TableOfContents.Link",
            description: "En lenke i innholdsfortegnelsen. Rendres som en <a> som standard, men kan byttes med as-prop.",
            props: [
                { name: "href", type: "string", required: true, source: "native", status: "stable", description: "Anker-ID for seksjonen lenken peker til, f.eks. #intro." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Lenketeksten." },
                { name: "as", type: "React.ElementType", required: false, source: "custom", status: "stable", description: "Bytt ut underliggende element, f.eks. Next.js Link." },
            ],
        },
    ],
};

export default doc;
