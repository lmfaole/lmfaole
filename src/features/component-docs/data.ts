import { componentDocs } from "./docs";
import type { ComponentDoc, ComponentRelationship, PropDef, PropStatus, PropSource, Migration } from "./docs/types";

export type { ComponentDoc, ComponentRelationship, PropDef, PropStatus, PropSource, Migration };
export { componentDocs };

export interface ResolvedRelationship {
    doc: ComponentDoc;
    description: string;
}

export function getComponentDoc(id: string): ComponentDoc | undefined {
    return componentDocs.find((doc) => doc.id === id);
}

function resolveRelationships(entries: ComponentRelationship[] = []): ResolvedRelationship[] {
    return entries.flatMap((entry) => {
        const doc = getComponentDoc(entry.id);
        return doc ? [{ doc, description: entry.description }] : [];
    });
}

export function getRelationships(id: string): {
    alternatives: ResolvedRelationship[];
    subcomponents: ResolvedRelationship[];
    related: ResolvedRelationship[];
} {
    const doc = getComponentDoc(id);
    return {
        alternatives: resolveRelationships(doc?.relationships?.alternatives),
        subcomponents: resolveRelationships(doc?.relationships?.subcomponents),
        related: resolveRelationships(doc?.relationships?.related),
    };
}

/** @deprecated use getRelationships(id).related */
export function getRelatedDocs(id: string): ComponentDoc[] {
    return getRelationships(id).related.map(({ doc }) => doc);
}
