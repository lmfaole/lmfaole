"use client";
import React from "react";
import { DataTable } from "@fremtind/jokul/table";
import { PopupTip } from "@fremtind/jokul/tooltip";
import type { PropDef, PropStatus } from "@/lib/componentDocs";

interface PropTableProps {
    props: PropDef[];
}

const COLUMNS = ["Prop", "Type", "Påkrevd", "Standard", "Status", "Beskrivelse"];

const STATUS_LABEL: Record<PropStatus, string> = {
    stable: "Stabil",
    deprecated: "Utfaset",
    experimental: "Eksperimentell",
};

const STATUS_STYLE: Record<PropStatus, React.CSSProperties> = {
    stable: { color: "var(--jkl-color-text-subdued)" },
    deprecated: { color: "var(--jkl-color-text-negative)" },
    experimental: { color: "var(--jkl-color-text-warning)" },
};

function PropStatusCell({ status, statusDescription }: Pick<PropDef, "status" | "statusDescription">) {
    if (!status || status === "stable") return <>—</>;

    const label = STATUS_LABEL[status];
    const style = STATUS_STYLE[status];

    if (statusDescription) {
        return (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--jkl-spacing-2xs)", ...style }}>
                {label}
                <PopupTip content={statusDescription} placement="top" />
            </span>
        );
    }

    return <span style={style}>{label}</span>;
}

export function PropTable({ props }: PropTableProps) {
    const rows: React.ReactNode[][] = props.map((prop) => [
        <code key="name">{prop.name}</code>,
        <code key="type">{prop.type}</code>,
        prop.required ? "Ja" : "Nei",
        prop.default ? <code key="default">{prop.default}</code> : "—",
        <PropStatusCell key="status" status={prop.status} statusDescription={prop.statusDescription} />,
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
