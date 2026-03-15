import React from "react";
import {DataTable} from "@fremtind/jokul/table";
import {Link} from "@fremtind/jokul/link";
import type {ResolvedRelationship} from "@/features/component-docs/data";

const COLUMNS = ["Komponent", "Beskrivelse"];

interface RelatedComponentsTableProps {
    items: ResolvedRelationship[];
}

export function RelatedComponentsTable({items}: RelatedComponentsTableProps) {
    const rows: React.ReactNode[][] = items.map(({doc, description}) => [
        <Link key="name" href={`/jokul/component/${doc.id}`}>{doc.name}</Link>,
        <span key="desc">{description}</span>,
    ]);

    return <DataTable caption="Relaterte komponenter" columns={COLUMNS} rows={rows}/>;
}
