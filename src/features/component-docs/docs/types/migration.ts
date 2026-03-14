/**
 * A single deprecated or replacement item in a {@link MigrationGuide}.
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
 * Documents a before/after migration for a deprecated API pattern.
 * Used together with {@link ComponentExample.code} which holds the "after" code.
 */
export interface MigrationGuide {
    /**
     * The props or components being deprecated.
     * Each entry must declare its {@link MigrationItem.kind} so the UI can clearly
     * communicate whether a whole component or just a prop is going away.
     * e.g. `[{ name: "InfoSystemMessage", kind: "component" }]`
     * or   `[{ name: "iconLeft", kind: "prop" }, { name: "iconRight", kind: "prop" }]`
     */
    deprecates: MigrationItem[];

    /**
     * The props or components that replace the deprecated ones.
     * Omit entirely when the deprecated item is simply removed with no replacement.
     * e.g. `[{ name: "SystemMessage", kind: "component" }, { name: "variant", kind: "prop" }]`
     * or   `[{ name: "icon", kind: "prop" }, { name: "iconPosition", kind: "prop" }]`
     */
    replacedBy?: MigrationItem[];

    /**
     * The deprecated code snippet users should find and remove.
     * Write as valid JSX, imports excluded. Use 4-space indentation.
     */
    before: string;
}
