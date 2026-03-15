"use client";
import { useState, useEffect } from "react";
import { LinkList } from "@fremtind/jokul/link-list";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const labels = ["Forsikringer", "Produkter"];

export function LinkListLinkPreview() { return <LinkListPreview />; }

export function LinkListPreview() {
    const isHovered = usePreviewHovered();
    const [labelIdx, setLabelIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setLabelIdx(0); return; }
        const id = setInterval(() => setLabelIdx(i => (i + 1) % labels.length), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <LinkList label={labels[labelIdx]}>
            <LinkList.Link href="#">Bilforsikring</LinkList.Link>
            <LinkList.Link href="#">Reiseforsikring</LinkList.Link>
            <LinkList.Link href="#">Innboforsikring</LinkList.Link>
        </LinkList>
    );
}
