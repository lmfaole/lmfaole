import React from "react";
import {ListItem, OrderedList} from "@fremtind/jokul/list";
import {Link} from "@fremtind/jokul/link";
import type {ResolvedRelationship} from "@/features/component-docs/data";

interface SubcomponentsListProps {
    items: ResolvedRelationship[];
}

export function SubcomponentsList({items}: SubcomponentsListProps) {
    return (
        <OrderedList>
            {items.map(({doc, description}) => (
                <ListItem key={doc.id}>
                    <Link href={`/jokul/component/${doc.id}`}>{doc.name}</Link>
                    {" — "}{description}
                </ListItem>
            ))}
        </OrderedList>
    );
}
