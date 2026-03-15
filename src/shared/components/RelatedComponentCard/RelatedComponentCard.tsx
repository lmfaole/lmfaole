"use client";

import React, {useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import type {ComponentDoc} from "@/app/jokul/_component-docs/docs/types";
import {PreviewHoverContext} from "@/app/jokul/_component-docs/components/PreviewHoverContext";
import {Card} from "@fremtind/jokul/card";
import Link from "next/link";
import "./related-component-card.scss";

interface RelatedComponentCardProps {
    doc: ComponentDoc;
    description: string;
}

export function RelatedComponentCard({doc, description}: RelatedComponentCardProps) {
    const preview = doc.preview;
    const [hovered, setHovered] = useState(false);

    return (
        <Card
            clickable
            as={Link}
            href={`/jokul/component/${doc.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            padding="s"
            variant="outlined"
        >
            {preview && (
                <Flex alignItems="center" justifyContent="center" className="related-component-card__preview">
                    <PreviewHoverContext value={hovered}>
                        <div className="related-component-card__preview-inner">
                            {preview}
                        </div>
                    </PreviewHoverContext>
                </Flex>
            )}
            <Flex direction="column" gap="xs" style={{padding: "var(--jkl-spacing-s)"}}>
                <p className="h5">{doc.name}</p>
                <p className="related-component-card__description">{description}</p>
            </Flex>
        </Card>
    );
}
