"use client";

import React, {useState} from "react";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";
import {Tag} from "@fremtind/jokul/tag";
import type {ComponentDoc} from "@/lib/docs/types";
import {PreviewHoverContext} from "@/components/PreviewHoverContext";
import "./component-card.scss";

interface ComponentCardProps {
    doc: ComponentDoc;
}

export function ComponentCard({doc}: ComponentCardProps) {
    const preview = doc.preview ?? doc.examples[0]?.preview;
    const [hovered, setHovered] = useState(false);

    return (
        <Card
            clickable
            padding="s"
            style={{position: "relative"}}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <a
                href={`/jokul/component/${doc.id}`}
                aria-label={doc.name}
                style={{position: "absolute", inset: 0}}
            />
            {preview && (
                <div className="component-card-preview">
                    <PreviewHoverContext value={hovered}>
                        <div className="component-card-preview__inner">
                            {preview}
                        </div>
                    </PreviewHoverContext>
                </div>
            )}
            <Flex direction="column" gap="xs" style={{padding: "var(--jkl-spacing-s)"}}>
                <Flex gap="xs" alignItems="center">
                    <strong>{doc.name}</strong>
                    {doc.status === "deprecated" && <Tag variant="warning">Deprecated</Tag>}
                    {doc.status === "beta" && <Tag variant="info">Beta</Tag>}
                </Flex>
                <p className="muted"
                   style={{fontSize: "var(--jkl-font-size-2)", margin: 0}}>{doc.description.split(".")[0]}.</p>
            </Flex>
        </Card>
    );
}
