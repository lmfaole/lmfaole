"use client";

import React, {useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import type {ComponentDoc} from "@/app/jokul/_component-docs/docs/types";
import {PreviewHoverContext} from "@/app/jokul/_component-docs/components/PreviewHoverContext";
import {Card} from "@fremtind/jokul/card";
import Link from "next/link";

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
            padding="xl"
        >
            <Flex gap="l" alignItems="center">
                {preview && (
                    <div className="related-component-card__preview">
                        <PreviewHoverContext value={hovered}>
                            {preview}
                        </PreviewHoverContext>
                    </div>
                )}
                <Flex direction="column" gap="xs">
                    <p className="h5">{doc.name}</p>
                    <p className="related-component-card__description">{description}</p>
                </Flex>
            </Flex>
        </Card>
    );
}
