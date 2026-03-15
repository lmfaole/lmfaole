import type {ResolvedRelationship} from "@/app/jokul/_component-docs/data";
import {Grid} from "@/shared/components/Grid";
import {RelatedComponentCard} from "@/shared/components/RelatedComponentCard";

interface RelatedComponentsTableProps {
    items: ResolvedRelationship[];
}

export function RelatedComponentsTable({items}: RelatedComponentsTableProps) {
    return (
        <Grid columns={4}>
            {items.map(({doc, description}) => (
                <RelatedComponentCard key={doc.id} doc={doc} description={description}/>
            ))}
        </Grid>
    );
}
