import { componentDocs } from "./docs";
import type { ComponentDoc, ComponentRelationship, PropDef, PropStatus, PropSource, Migration } from "./docs/types";

export type { ComponentDoc, ComponentRelationship, PropDef, PropStatus, PropSource, Migration };
export { componentDocs };

function countWords(text: string): number {
    return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu) || []).length;
}

function startsWithCapitalLetter(text: string): boolean {
    const trimmed = text.trimStart();
    if (!trimmed) return false;
    const first = [...trimmed][0];
    const upper = first.toLocaleUpperCase("nb-NO");
    const lower = first.toLocaleLowerCase("nb-NO");
    const hasCase = upper !== lower;
    return !hasCase || first === upper;
}

function validateShortDescriptions(docs: ComponentDoc[]) {
    const violations = docs
        .map((doc) => {
            const short = doc.description.short.trim();
            const long = doc.description.long.trim();
            const words = countWords(short);
            return {
                id: doc.id,
                short,
                long,
                words,
                shortCapitalized: startsWithCapitalLetter(short),
                longCapitalized: startsWithCapitalLetter(long),
            };
        })
        .filter((v) => v.words > 10 || !v.shortCapitalized || !v.longCapitalized);

    if (violations.length > 0) {
        const details = violations
            .slice(0, 20)
            .map((v) => {
                const flags = [
                    v.words > 10 ? `>10 words (${v.words})` : null,
                    !v.shortCapitalized ? "short not capitalized" : null,
                    !v.longCapitalized ? "long not capitalized" : null,
                ].filter(Boolean).join(", ");
                return `${v.id}: ${flags} -> "${v.short}"`;
            })
            .join("\n");
        throw new Error(`Invalid ComponentDoc description:\n${details}`);
    }
}

if (process.env.NODE_ENV !== "production") {
    validateShortDescriptions(componentDocs);
}

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
    requires: ResolvedRelationship[];
    alternatives: ResolvedRelationship[];
    subcomponents: ResolvedRelationship[];
    related: ResolvedRelationship[];
} {
    const doc = getComponentDoc(id);
    return {
        requires: resolveRelationships(doc?.relationships?.requires),
        alternatives: resolveRelationships(doc?.relationships?.alternatives),
        subcomponents: resolveRelationships(doc?.relationships?.subcomponents),
        related: resolveRelationships(doc?.relationships?.related),
    };
}

export function getParentAndSiblings(id: string): {
    parent?: ComponentDoc;
    siblings: ResolvedRelationship[];
    kind?: "subcomponents" | "requires";
} {
    const parent = componentDocs.find((doc) =>
        doc.relationships?.subcomponents?.some((sub) => sub.id === id),
    );

    if (!parent) {
        const doc = getComponentDoc(id);
        const requiredParentId = doc?.relationships?.requires?.[0]?.id;
        const requiredParent = requiredParentId ? getComponentDoc(requiredParentId) : undefined;

        if (!requiredParent) {
            return {siblings: []};
        }

        const siblings = componentDocs
            .filter((d) => d.id !== id)
            .filter((d) => d.relationships?.requires?.some((req) => req.id === requiredParent.id))
            .map((d) => ({doc: d, description: d.description.short}));

        return {parent: requiredParent, siblings, kind: "requires"};
    }

    const siblings = resolveRelationships(
        parent.relationships?.subcomponents?.filter((sub) => sub.id !== id),
    );

    return {parent, siblings, kind: "subcomponents"};
}

/** @deprecated use getRelationships(id).related */
export function getRelatedDocs(id: string): ComponentDoc[] {
    return getRelationships(id).related.map(({ doc }) => doc);
}
