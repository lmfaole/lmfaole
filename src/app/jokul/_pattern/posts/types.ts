import type React from "react";
import type { ComponentId } from "@/app/jokul/_component-docs/docs/types";
import type { TokenPost } from "@/app/jokul/_token/posts/types";
import type { PatternId } from "./ids";

export interface PatternPost {
    id: PatternId;
    title: string;
    excerpt: string;
    illustration?: React.ReactNode;

    relatedComponents?: ComponentId[];
    relatedTokens?: Array<TokenPost["id"]>;

    /**
     * MDX content module loader.
     * Kept as a function so index pages don't pull full article content into the bundle.
     */
    content: () => Promise<{ default: React.ComponentType }>;
}

