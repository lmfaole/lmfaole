import type React from "react";

export interface PropDef {
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
}

export interface ComponentExample {
    title: string;
    description?: string;
    code: string;
    preview?: React.ReactNode;
    tags?: string[];
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
    examples: ComponentExample[];
    relatedIds?: string[];
}
