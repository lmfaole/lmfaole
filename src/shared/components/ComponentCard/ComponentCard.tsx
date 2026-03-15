"use client";

import React, {useState} from "react";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";
import {Tag} from "@fremtind/jokul/tag";
import type {ComponentDoc} from "@/app/jokul/_component-docs/docs/types";
import {PreviewHoverContext} from "@/app/jokul/_component-docs/components/PreviewHoverContext";
import "./component-card.scss";

interface ComponentCardProps {
    doc: ComponentDoc;
}

export function ComponentCard({doc}: ComponentCardProps) {
    const preview = doc.preview;
    const [hovered, setHovered] = useState(false);

    return (
        <Card
            clickable
            padding="s"
            variant="outlined"
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
                <Flex alignItems="center" justifyContent="center" className="component-card-preview">
                    <PreviewHoverContext value={hovered}>
                        <div className="component-card-preview__inner">
                            {preview}
                        </div>
                    </PreviewHoverContext>
                </Flex>
            )}
            <Flex direction="column" gap="xs" style={{padding: "var(--jkl-spacing-s)"}}>
                <Flex gap="xs" alignItems="center">
                    <strong>{doc.name}</strong>
                    {doc.status === "deprecated" && <Tag variant="warning">Deprecated</Tag>}
                    {doc.status === "beta" && <Tag variant="info">Beta</Tag>}
                </Flex>
                <p className="jkl-small muted">{doc.description.split(".")[0]}.</p>
            </Flex>
        </Card>
    );
}
