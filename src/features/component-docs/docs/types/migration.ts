import type React from "react";

/**
 * A single deprecated or replacement item in a {@link Migration}.
 * Distinguishes between props (attributes on a component) and components
 * (JSX elements or named exports that are being retired).
 */
export interface MigrationItem {
    /** The exact name as it appears in JSX or an import statement. */
    name: string;

    /**
     * Whether this item is a JSX component/named export or a prop on a component.
     * - `"component"` — a named export / JSX element, e.g. `InfoSystemMessage`
     * - `"prop"` — an attribute on a component, e.g. `iconLeft`
     */
    kind: "component" | "prop";
}

/**
 * A self-contained migration guide for a single deprecated API pattern.
 * Describes what changed, why, and shows a before/after code comparison.
 *
 * Each migration must describe exactly one deprecated prop or component.
 * Split unrelated deprecations into separate Migration entries.
 */
export interface Migration {
    /** The prop or component name used as the heading, e.g. `"iconLeft"` or `"InfoSystemMessage"`. */
    title: string;

    /**
     * One or two sentences explaining *why* this was deprecated —
     * the reasoning or design decision behind the change.
     * The before/after code shows *how* to migrate; this explains *why*.
     * Omit if no meaningful context exists beyond the code itself.
     */
    description?: string;

    /**
     * The single prop or component being deprecated.
     * e.g. `{ name: "iconLeft", kind: "prop" }`
     *   or `{ name: "InfoSystemMessage", kind: "component" }`
     */
    deprecates: MigrationItem;

    /**
     * The props or components that replace the deprecated one.
     * Omit entirely when the deprecated item is simply removed with no replacement.
     * e.g. `[{ name: "icon", kind: "prop" }, { name: "iconPosition", kind: "prop" }]`
     */
    replacedBy?: MigrationItem[];

    /**
     * The deprecated code snippet ("before").
     * Write as valid JSX, imports excluded. Use 4-space indentation.
     */
    before: string;

    /**
     * The replacement code snippet ("after").
     * Write as valid JSX, imports excluded. Use 4-space indentation.
     */
    after: string;

    /**
     * Live React element previewing the updated ("after") usage.
     * Omit when no meaningful visual difference exists.
     */
    preview?: React.ReactNode;

    /**
     * IDs of other Jøkul components composed inside this migration example.
     * Used to show composition context in the UI and cross-link documentation.
     */
    uses?: string[];
}
