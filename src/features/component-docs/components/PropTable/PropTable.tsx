"use client";
import { useState } from "react";
import { DataTable } from "@fremtind/jokul/table";
import { PopupTip } from "@fremtind/jokul/tooltip";
import { Flex } from "@fremtind/jokul/flex";
import type { PropDef, PropStatus, PropSource, Migration } from "@/features/component-docs/data";
import { ChipFilterList } from "@/features/component-docs/components/ChipFilterList";

interface PropTableProps {
    props: PropDef[];
    migrations?: Migration[];
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

function PropNameCell({ name, status, statusDescription, migrationAnchor }: Pick<PropDef, "name" | "status" | "statusDescription"> & { migrationAnchor?: string }) {
    return (
        <span style={{ display: "inline-flex", flexDirection: "column", gap: "var(--jkl-spacing-3xs)" }}>
            {migrationAnchor && status === "deprecated" ? (
                <a href={migrationAnchor}><code>{name}</code></a>
            ) : (
                <code>{name}</code>
            )}
            {status && status !== "stable" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--jkl-spacing-2xs)", fontSize: "var(--jkl-font-size-s)", color: STATUS_COLOR[status] }}>
                    {STATUS_LABEL[status]}
                    {statusDescription && <PopupTip content={statusDescription} placement="top" />}
                </span>
            )}
        </span>
    );
}

function buildRows(props: PropDef[], migrationMap: Map<string, string>): React.ReactNode[][] {
    return props.map((prop) => [
        <PropNameCell
            key="name"
            name={prop.name}
            status={prop.status}
            statusDescription={prop.statusDescription}
            migrationAnchor={migrationMap.get(prop.name)}
        />,
        <code key="type">{prop.type}</code>,
        <span key="req">{prop.required ? "Ja" : "Nei"}</span>,
        prop.default ? <code key="default">{prop.default}</code> : "—",
        <span key="desc">{prop.description}</span>,
    ]);
}

export function PropTable({ props, migrations }: PropTableProps) {
    const [sourceFilter, setSourceFilter] = useState<PropSource | null>(null);

    const hasSourceInfo = props.some((p) => p.source != null);

    const migrationMap = new Map<string, string>(
        (migrations ?? []).map((m) => [m.deprecates.name, `#migration-${m.deprecates.name}`])
    );

    const sorted = [...props].sort((a, b) => {
        const order: Record<PropStatus, number> = { stable: 0, experimental: 1, deprecated: 2 };
        return order[a.status] - order[b.status];
    });

    const visible = sorted.filter((p) => !sourceFilter || p.source === sourceFilter);
    const rows = buildRows(visible, migrationMap);

    return (
        <Flex direction="column" gap="m">
            {hasSourceInfo && (
                <ChipFilterList
                    items={ALL_SOURCES.filter((src) => props.some((p) => p.source === src))}
                    selected={sourceFilter}
                    onChange={(v) => setSourceFilter(v as PropSource | null)}
                    getLabel={(src) => SOURCE_LABEL[src as PropSource]}
                />
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
