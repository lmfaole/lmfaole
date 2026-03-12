import React from "react";
import { DataTable } from "@fremtind/jokul/table";
import type { PropDef } from "@/lib/componentDocs";

interface PropTableProps {
    props: PropDef[];
}

const COLUMNS = ["Prop", "Type", "Påkrevd", "Standard", "Beskrivelse"];

export function PropTable({ props }: PropTableProps) {
    const rows: React.ReactNode[][] = props.map((prop) => [
        <code key="name">{prop.name}</code>,
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
