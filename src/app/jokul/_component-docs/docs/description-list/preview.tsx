"use client";
import { useState, useEffect } from "react";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const addresses = ["Storgata 1, 0001 Oslo", "Trondheimsveien 2, 0560 Oslo"];

export function DescriptionTermPreview() { return <DescriptionListPreview />; }
export function DescriptionDetailPreview() { return <DescriptionListPreview />; }

export function DescriptionListPreview() {
    const isHovered = usePreviewHovered();
    const [addrIdx, setAddrIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setAddrIdx(0); return; }
        const id = setInterval(() => setAddrIdx(i => (i + 1) % addresses.length), 1500);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <DescriptionList>
            <DescriptionTerm>Navn</DescriptionTerm>
            <DescriptionDetail>Ola Nordmann</DescriptionDetail>
            <DescriptionTerm>Adresse</DescriptionTerm>
            <DescriptionDetail>{addresses[addrIdx]}</DescriptionDetail>
        </DescriptionList>
    );
}
