"use client";
import { useState, useEffect } from "react";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Tag } from "@fremtind/jokul/tag";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function CardPreview() {
    const isHovered = usePreviewHovered();
    const [selected, setSelected] = useState(false);
    useEffect(() => { setSelected(isHovered); }, [isHovered]);
    return (
        <Card padding="m" style={{ maxWidth: "280px" }}>
            <Flex direction="column" gap="s">
                <p style={{ margin: 0, fontWeight: "bold" }}>Bilforsikring kasko</p>
                <p style={{ margin: 0 }}>Månedspremie: 542 kr</p>
                {selected && <Tag>Valgt</Tag>}
                <Button variant="secondary" onClick={() => setSelected(s => !s)}>
                    {selected ? "Fjern valg" : "Velg"}
                </Button>
            </Flex>
        </Card>
    );
}
