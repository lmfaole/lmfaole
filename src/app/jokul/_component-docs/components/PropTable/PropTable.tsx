"use client";
import React, { useState } from "react";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableCaption } from "@fremtind/jokul/table";
import { useSortableTableHeader } from "@fremtind/jokul/table";
import { PopupTip } from "@fremtind/jokul/tooltip";
import { Flex } from "@fremtind/jokul/flex";
import { Link } from "@fremtind/jokul/link";
import type { PropDef, PropStatus, PropSource, Migration } from "@/app/jokul/_component-docs/data";
import { ChipFilterList } from "@/app/jokul/_component-docs/components/ChipFilterList";

interface PropTableProps {
    props: PropDef[];
    migrations?: Migration[];
}

const COLUMNS = ["Prop", "Type", "Påkrevd", "Standard", "Status", "Beskrivelse"];
const SORTABLE_COLS = ["Prop", "Påkrevd", "Status"] as const;
type SortKey = typeof SORTABLE_COLS[number];

const STATUS_LABEL: Record<PropStatus, string> = {
    stable: "stable",
    deprecated: "deprecated",
    experimental: "beta",
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

function PropNameCell({ name, status, migrationAnchor }: Pick<PropDef, "name" | "status"> & { migrationAnchor?: string }) {
    return migrationAnchor && status === "deprecated" ? (
        <Link href={migrationAnchor}><code>{name}</code></Link>
    ) : (
        <code>{name}</code>
    );
}

function PropStatusCell({ status, statusDescription }: Pick<PropDef, "status" | "statusDescription">) {
    if (status === "stable") return <span style={{ color: "var(--jkl-color-text-subdued)" }}>—</span>;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--jkl-spacing-2xs)", color: STATUS_COLOR[status] }}>
            {STATUS_LABEL[status]}
            {statusDescription && <PopupTip content={statusDescription} placement="top" />}
        </span>
    );
}

function buildRows(props: PropDef[], migrationMap: Map<string, string>): React.ReactNode[][] {
    return props.map((prop) => [
        <PropNameCell key="name" name={prop.name} status={prop.status} migrationAnchor={migrationMap.get(prop.name)} />,
        <code key="type" style={{ display: "block", maxWidth: "20ch", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={prop.type}>{prop.type}</code>,
        <span key="req">{prop.required ? "Ja" : "Nei"}</span>,
        prop.default ? <code key="default">{prop.default}</code> : "—",
        <PropStatusCell key="status" status={prop.status} statusDescription={prop.statusDescription} />,
        <span key="desc">{prop.description}</span>,
    ]);
}

const STATUS_ORDER: Record<PropStatus, number> = { stable: 0, experimental: 1, deprecated: 2 };

function sortProps(props: PropDef[], key: SortKey, direction: "asc" | "desc" | "none"): PropDef[] {
    if (direction === "none") return props;
    const factor = direction === "asc" ? 1 : -1;
    return [...props].sort((a, b) => {
        if (key === "Prop") return factor * a.name.localeCompare(b.name);
        if (key === "Påkrevd") return factor * (Number(a.required) - Number(b.required));
        if (key === "Status") return factor * (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
        return 0;
    });
}

export function PropTable({ props, migrations }: PropTableProps) {
    const [sourceFilter, setSourceFilter] = useState<PropSource | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>("Status");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | "none">("asc");

    const { getSortProps } = useSortableTableHeader(sortKey, sortDirection, (newKey, newDir) => {
        setSortKey(newKey as SortKey);
        setSortDirection(newDir);
    });

    const hasSourceInfo = props.some((p) => p.source != null);

    const migrationMap = new Map<string, string>(
        (migrations ?? []).map((m) => [m.deprecates.name, `#migration-${m.deprecates.name}`])
    );

    const sorted = sortProps(props, sortKey, sortDirection);
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
                <Table caption={<TableCaption srOnly>Props</TableCaption>} collapseToList>
                    <TableHead>
                        <TableRow>
                            {COLUMNS.map((col) => (
                                <TableHeader key={col} {...(SORTABLE_COLS.includes(col as SortKey) ? getSortProps(col) : {})}>
                                    {col}
                                </TableHeader>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((cells, i) => (
                            <TableRow key={i}>
                                {cells.map((cell, j) => (
                                    <TableCell key={j} data-th={COLUMNS[j]}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Flex>
    );
}

