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
}

export interface ComponentDoc {
    id: string;
    name: string;
    package: string;
    category: "Layout" | "Skjema" | "Tilbakemelding" | "Navigasjon" | "Visning";
    description: string;
    notes?: string;
    props: PropDef[];
    examples: ComponentExample[];
    relatedIds?: string[];
}
