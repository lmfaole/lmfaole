import React from "react";
import {ListItem, UnorderedList} from "@fremtind/jokul/list";
import {Link} from "@fremtind/jokul/link";
import type {ResolvedRelationship} from "@/app/jokul/_component-docs/data";

interface AlternativesListProps {
    items: ResolvedRelationship[];
}

export function AlternativesList({items}: AlternativesListProps) {
    return (
        <UnorderedList>
            {items.map(({doc, description}) => (
                <ListItem key={doc.id}>
                    <Link href={`/jokul/component/${doc.id}`}>{doc.name}</Link>
                    {" — "}{description}
                </ListItem>
            ))}
        </UnorderedList>
    );
}
