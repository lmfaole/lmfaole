import type React from "react";

export interface FoundationalResource {
  title: string;
  url: string;
  description?: string;
}

export interface TokenTable {
  /** Optional h3 heading rendered above this table */
  heading?: string;
  /** Short description shown between the heading and the table */
  description?: string;
  caption: string;
  columns: string[];
  rows: React.ReactNode[][];
}

export interface ScssMixin {
  /** Mixin or function name, e.g. "text-style" */
  name: string;
  /** One-line description of what it does */
  description: string;
  /** SCSS usage example shown in a code block */
  example: string;
}

export interface FoundationalPost {
  id: number;
  title: string;
  excerpt: string;
  content: React.ReactNode;
  /** Structured token reference tables rendered after the header, before content */
  tokenOverview?: TokenTable[];
  /** SCSS mixins relevant to this foundation area */
  scssSection?: ScssMixin[];
  /** Optional inline illustration rendered as the card hero. Replaces image URL. */
  illustration?: React.ReactNode;
  /** IDs of component docs directly related to this foundational area */
  relatedComponents?: string[];
  resources?: FoundationalResource[];
}
