import type React from "react";

export type PropStatus = "stable" | "deprecated" | "experimental";
export type PropSource = "custom" | "native" | "aria" | "react";

export interface PropDef {
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
    /** Whether this prop is a custom component prop or a native HTML attribute pass-through */
    source: PropSource;
    /** Status for this specific prop */
    status: PropStatus;
    /** Reason shown in a tooltip next to the status badge */
    statusDescription?: string;
}

export interface ComponentExample {
    title: string;
    description?: string;
    code: string;
    /** If set, this example is a migration guide. This field holds the deprecated "before" code, and `code` holds the replacement "after" code. */
    migrationBefore?: string;
    preview?: React.ReactNode;
    tags?: string[];
    /** IDs of other Jøkul components used in this example, for showing composition context */
    uses?: string[];
}

export interface SubComponentDoc {
    name: string;
    description?: string;
    props: PropDef[];
}

export interface ComponentDoc {
    id: string;
    name: string;
    package: string;
    category: "Layout" | "Skjema" | "Tilbakemelding" | "Navigasjon" | "Visning";
    status?: "stable" | "beta" | "deprecated";
    tags: string[];
    description: string;
    notes?: string;
    props: PropDef[];
    subComponents?: SubComponentDoc[];
    examples: ComponentExample[];
    relatedIds?: string[];
}
