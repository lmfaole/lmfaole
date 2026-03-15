"use client";
import { LinkList } from "@fremtind/jokul/link-list";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function LinkListPreview() {
    const isHovered = usePreviewHovered();
    const [activeIdx, setActiveIdx] = useState(-1);
    useEffect(() => { setActiveIdx(isHovered ? 0 : -1); }, [isHovered]);
    return (
        <LinkList label="Forsikringer">
            <LinkList.Link href="#" style={{ fontWeight: activeIdx === 0 ? "bold" : "normal" }}>Bilforsikring</LinkList.Link>
            <LinkList.Link href="#">Reiseforsikring</LinkList.Link>
            <LinkList.Link href="#">Innboforsikring</LinkList.Link>
        </LinkList>
    );
}
