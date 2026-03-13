"use client";

import React, {useEffect, useState} from "react";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";
import {Tag} from "@fremtind/jokul/tag";
import type {ComponentDoc} from "@/lib/docs/types";

interface ComponentCardProps {
    doc: ComponentDoc;
}

export function ComponentCard({doc}: ComponentCardProps) {
    const preview = doc.examples[0]?.preview;
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <Card clickable padding="s" style={{position: "relative"}}>
            {/* Stretched link covers the whole card — no interactive content inside it */}
            <a
                href={`/component/${doc.id}`}
                aria-label={doc.name}
                style={{position: "absolute", inset: 0}}
            />
            {preview && (
                <div style={{
                    alignItems: "center",
                    borderBottom: "1px solid var(--jkl-color-border-subdued)",
                    display: "flex",
                    height: "10rem",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: "var(--jkl-spacing-xl)",
                    pointerEvents: "none",
                    userSelect: "none",
                    background: mounted ? undefined : "var(--jkl-color-background-subsurface)",
                    transition: "background 0.2s",
                }}>
                    {mounted && (
                        <div inert style={{
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                            zoom: 0.72,
                        }}>
                            {preview}
                        </div>
                    )}
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
                <p className="muted"
                   style={{fontSize: "var(--jkl-font-size-1)", margin: 0}}>{doc.category} · {doc.props.length} props
                    · {doc.examples.length} eksempler</p>
                {doc.tags.length > 0 && <p className="muted" style={{
                    fontSize: "var(--jkl-font-size-1)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>{doc.tags.join(", ")}</p>}
            </Flex>
        </Card>
    );
}
