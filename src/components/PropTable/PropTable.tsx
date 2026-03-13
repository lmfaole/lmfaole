"use client";
import React, { useState } from "react";
import { DataTable } from "@fremtind/jokul/table";
import { PopupTip } from "@fremtind/jokul/tooltip";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import type { PropDef, PropStatus, PropSource } from "@/lib/componentDocs";

interface PropTableProps {
    props: PropDef[];
}

const COLUMNS = ["Prop", "Type", "Påkrevd", "Standard", "Beskrivelse"];

const STATUS_LABEL: Record<PropStatus, string> = {
    stable: "Stabil",
    deprecated: "Utfaset",
    experimental: "Eksperimentell",
};

const STATUS_COLOR: Record<PropStatus, string> = {
    stable: "var(--jkl-color-text-subdued)",
    deprecated: "var(--jkl-color-text-negative)",
    experimental: "var(--jkl-color-text-warning)",
};

const SOURCE_LABEL: Record<PropSource, string> = {
    custom: "Egendefinert",
    native: "Native HTML",
    aria: "ARIA",
    react: "React",
};

const ALL_SOURCES: PropSource[] = ["custom", "native", "react", "aria"];

function PropNameCell({ name, status, statusDescription, source }: Pick<PropDef, "name" | "status" | "statusDescription"> & { source?: PropSource }) {
    const hasStatus = status && status !== "stable";

    return (
        <span style={{ display: "inline-flex", flexDirection: "column", gap: "var(--jkl-spacing-3xs)" }}>
            <code>{name}</code>
            {source && (
                <span style={{ fontSize: "var(--jkl-font-size-s)", color: "var(--jkl-color-text-subdued)" }}>
                    {SOURCE_LABEL[source]}
                </span>
            )}
            {hasStatus && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--jkl-spacing-2xs)", fontSize: "var(--jkl-font-size-s)", color: STATUS_COLOR[status] }}>
                    {STATUS_LABEL[status]}
                    {statusDescription && <PopupTip content={statusDescription} placement="top" />}
                </span>
            )}
        </span>
    );
}

export function PropTable({ props }: PropTableProps) {
    const [sourceFilter, setSourceFilter] = useState<PropSource | null>(null);

    const hasSourceInfo = props.some((p) => p.source != null);
    const visible = sourceFilter ? props.filter((p) => p.source === sourceFilter) : props;

    const rows: React.ReactNode[][] = visible.map((prop) => [
        <PropNameCell key="name" name={prop.name} status={prop.status} statusDescription={prop.statusDescription} source={hasSourceInfo ? prop.source : undefined} />,
        <code key="type">{prop.type}</code>,
        prop.required ? "Ja" : "Nei",
        prop.default ? <code key="default">{prop.default}</code> : "—",
        prop.description,
    ]);

    return (
        <Flex direction="column" gap="s">
            {hasSourceInfo && (
                <Flex gap="xs" wrap="wrap">
                    {ALL_SOURCES.filter((src) => props.some((p) => p.source === src)).map((src) => (
                        <Chip
                            key={src}
                            variant="filter"
                            selected={sourceFilter === src}
                            onClick={() => setSourceFilter(sourceFilter === src ? null : src)}
                        >
                            {SOURCE_LABEL[src]}
                        </Chip>
                    ))}
                </Flex>
            )}
            {rows.length === 0 ? (
                <p className="muted">Ingen props samsvarer med filteret.</p>
            ) : (
                <DataTable
                    caption="Props"
                    columns={COLUMNS}
                    rows={rows}
                    collapseToList
                />
            )}
        </Flex>
    );
}
