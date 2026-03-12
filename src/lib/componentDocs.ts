import { componentDocs } from "./docs/index";
import type { ComponentDoc, PropDef, ComponentExample } from "./docs/types";

export type { ComponentDoc, PropDef, ComponentExample };
export { componentDocs };

export function getComponentDoc(id: string): ComponentDoc | undefined {
    return componentDocs.find((doc) => doc.id === id);
}

export function getRelatedDocs(id: string): ComponentDoc[] {
    const doc = getComponentDoc(id);
    if (!doc?.relatedIds) return [];
    return doc.relatedIds
        .map((relId) => getComponentDoc(relId))
        .filter((d): d is ComponentDoc => d !== undefined);
}
