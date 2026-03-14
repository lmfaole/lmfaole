import type React from "react";
import type { MigrationGuide } from "./migration";

/**
 * A self-contained usage example for a component.
 * Each example should demonstrate one concept clearly.
 *
 * To document an API migration, set `migration` and use `code` as the
 * replacement ("after") snippet. The renderer will display a before/after diff.
 */
export interface ComponentExample {
    /** Short title displayed as a heading above the example, e.g. `"Med feilmelding"`. */
    title: string;

    /**
     * One or two sentences explaining what this example demonstrates and
     * when you would reach for this pattern. Omit if the title is self-explanatory.
     */
    description?: string;

    /**
     * The primary code snippet shown in the code block.
     * Write as valid JSX, imports excluded. Use 4-space indentation.
     * When `migration` is set, this is the updated "after" replacement code.
     */
    code: string;

    /**
     * When set, this example documents an API migration.
     * `migration.before` holds the deprecated code; `code` holds the replacement.
     * See {@link MigrationGuide}.
     */
    migration?: MigrationGuide;

    /**
     * Live React element rendered as a visual preview next to the code block.
     * Should be a function component call so it re-renders in the browser,
     * e.g. `<MyPreviewComponent />`. Keep previews self-contained and side-effect-free.
     * Omit for migration examples or when a visual preview adds no value.
     */
    preview?: React.ReactNode;

    /**
     * Short keyword tags for filtering or search, e.g. `["error", "validation"]`.
     * Use lowercase, no spaces. Omit if the example has no special filter context.
     */
    tags?: string[];

    /**
     * IDs of other Jøkul components composed inside this example, e.g. `["button", "icon"]`.
     * Used to show composition context in the UI and cross-link documentation.
     */
    uses?: string[];
}
