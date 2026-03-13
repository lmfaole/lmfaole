"use client";
import React from "react";
import { DataTable } from "@fremtind/jokul/table";
import { PopupTip } from "@fremtind/jokul/tooltip";
import type { PropDef, PropStatus } from "@/lib/componentDocs";

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

function PropNameCell({ name, status, statusDescription }: Pick<PropDef, "name" | "status" | "statusDescription">) {
    const hasStatus = status && status !== "stable";

    return (
        <span style={{ display: "inline-flex", flexDirection: "column", gap: "var(--jkl-spacing-3xs)" }}>
            <code>{name}</code>
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
    const rows: React.ReactNode[][] = props.map((prop) => [
        <PropNameCell key="name" name={prop.name} status={prop.status} statusDescription={prop.statusDescription} />,
        <code key="type">{prop.type}</code>,
        prop.required ? "Ja" : "Nei",
        prop.default ? <code key="default">{prop.default}</code> : "—",
        prop.description,
    ]);

    return (
        <DataTable
            caption="Props"
            columns={COLUMNS}
            rows={rows}
            collapseToList
        />
    );
}


