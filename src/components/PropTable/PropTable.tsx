"use client";
import { useState } from "react";
import { DataTable } from "@fremtind/jokul/table";
import { PopupTip } from "@fremtind/jokul/tooltip";
import { Flex } from "@fremtind/jokul/flex";
import type { PropDef, PropStatus, PropSource } from "@/lib/componentDocs";
import { ChipFilterList } from "@/components/ChipFilterList";

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
    return (
        <span style={{ display: "inline-flex", flexDirection: "column", gap: "var(--jkl-spacing-3xs)" }}>
            <code style={status === "deprecated" ? { textDecoration: "line-through", opacity: 0.6 } : undefined}>{name}</code>
            {source && (
                <span style={{ fontSize: "var(--jkl-font-size-s)", color: "var(--jkl-color-text-subdued)" }}>
                    {SOURCE_LABEL[source]}
                </span>
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

function buildRows(props: PropDef[], hasSourceInfo: boolean): React.ReactNode[][] {
    return props.map((prop) => [
        <PropNameCell key="name" name={prop.name} status={prop.status} statusDescription={prop.statusDescription} source={hasSourceInfo ? prop.source : undefined} />,
        <code key="type">{prop.type}</code>,
        <span key="req">{prop.required ? "Ja" : "Nei"}</span>,
        prop.default ? <code key="default">{prop.default}</code> : "—",
        <span key="desc">{prop.description}</span>,
    ]);
}

export function PropTable({ props }: PropTableProps) {
    const [sourceFilter, setSourceFilter] = useState<PropSource | null>(null);

    const activeProps = props.filter((p) => p.status !== "deprecated");
    const deprecatedProps = props.filter((p) => p.status === "deprecated");

    const hasSourceInfo = props.some((p) => p.source != null);

    // Stable first, then experimental
    const sortedActive = [...activeProps].sort((a, b) => {
        const order: Record<PropStatus, number> = { stable: 0, experimental: 1, deprecated: 2 };
        return order[a.status] - order[b.status];
    });

    const visibleActive = sortedActive.filter((p) => !sourceFilter || p.source === sourceFilter);
    const visibleDeprecated = deprecatedProps.filter((p) => !sourceFilter || p.source === sourceFilter);

    const activeRows = buildRows(visibleActive, hasSourceInfo);
    const deprecatedRows = buildRows(visibleDeprecated, hasSourceInfo);

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

            {activeRows.length === 0 ? (
                <p className="muted">Ingen props samsvarer med filteret.</p>
            ) : (
                <DataTable
                    caption="Props"
                    columns={COLUMNS}
                    rows={activeRows}
                    collapseToList
                />
            )}

            {deprecatedProps.length > 0 && (
                <Flex direction="column" gap="s">
                    <h3 style={{ color: "var(--jkl-color-text-subdued)", fontSize: "var(--jkl-font-size-s)", fontWeight: "normal", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Utfasede props
                    </h3>
                    {deprecatedRows.length === 0 ? (
                        <p className="muted">Ingen utfasede props samsvarer med filteret.</p>
                    ) : (
                        <DataTable
                            caption="Utfasede props"
                            columns={COLUMNS}
                            rows={deprecatedRows}
                            collapseToList
                        />
                    )}
                </Flex>
            )}
        </Flex>
    );
}
