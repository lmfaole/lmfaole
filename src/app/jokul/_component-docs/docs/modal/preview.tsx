"use client";
import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const titles = ["Bekreft handling", "Slett forsikring"];

export function ModalPreview() {
    const isHovered = usePreviewHovered();
    const [titleIdx, setTitleIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setTitleIdx(0); return; }
        const id = setInterval(() => setTitleIdx(i => (i + 1) % titles.length), 1500);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <div style={{ border: "1px solid var(--jkl-color-border-default, #ccc)", borderRadius: 4, padding: "16px", maxWidth: 280, width: "100%" }}>
            <Flex direction="column" gap="s">
                <strong>{titles[titleIdx]}</strong>
                <p style={{ margin: 0, fontSize: "0.9em" }}>Er du sikker på at du vil fortsette?</p>
                <Flex gap="xs">
                    <Button>Bekreft</Button>
                    <Button variant="secondary">Avbryt</Button>
                </Flex>
            </Flex>
        </div>
    );
}
