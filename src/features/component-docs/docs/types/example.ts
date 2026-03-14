import type React from "react";

/**
 * A self-contained usage example for a component.
 * Each example should demonstrate one concept clearly.
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
     */
    code: string;

    /**
     * Live React element rendered as a visual preview next to the code block.
     * Should be a function component call so it re-renders in the browser,
     * e.g. `<MyPreviewComponent />`. Keep previews self-contained and side-effect-free.
     */
    preview?: React.ReactNode;

    /**
     * Short keyword tags for filtering or search, e.g. `["error", "validation"]`.
     * Use lowercase, no spaces. Omit if the example has no special filter context.
     */
    tags?: string[];

    /**
     * IDs of other Jøkul components composed inside this example.
     * Each value must match a {@link ComponentDoc.id}, e.g. `["button", "icon"]`.
     * Used to show composition context in the UI and cross-link documentation.
     */
    uses?: string[];
}
